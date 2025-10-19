import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
// legacy FileSystem used for readAsStringAsync (local file URIs)
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import { Camera as CameraIcon, Image as ImageIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import '/.env';

interface WriteJournalEntryProps {
  onClose?: () => void;
}

export default function WriteJournalEntry({ onClose }: WriteJournalEntryProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const cameraRef = React.useRef<any>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);

  // Replace this with your actual API Gateway / Lambda endpoint that runs Textract
  const TEXTRACT_API_URL = 'https://2sxyz7gmc1.execute-api.us-east-1.amazonaws.com/ocr/textract';
  const NLP_API_URL = 'https://3fksn86ahf.execute-api.us-east-1.amazonaws.com/NLP';

  async function uploadAndExtractText(uri: string) {
    // Use expo-image-manipulator to optionally resize/compress and return base64 for any URI.
    // This avoids relying on FileSystem.readAsStringAsync and handles local file:// URIs.
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      // you can add resize operations here if you want to cap dimensions
      [],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    const base64 = manipResult.base64 ?? '';
    if (!base64) throw new Error('Failed to convert image to base64');

    // Send to your Textract-backed API
    const res = await fetch(TEXTRACT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: base64,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Textract API error: ${res.status} ${text} (url: ${TEXTRACT_API_URL})`);
    }

    let json: any;
    try {
      json = await res.json();
    } catch (e) {
      // not JSON, surface raw text
      const text = await res.text();
      throw new Error(`Textract API returned non-JSON response: ${text} (url: ${TEXTRACT_API_URL})`);
    }
    // Expecting the API to return something like: { text: 'extracted text...' }
    const ocrText = json.text ?? json.extractedText ?? '';

    // Optional post-processing: send extracted text to an NLP/AI service to clean it up
    // and double-check for readability/formatting. If `NLP_API_URL` is set, we'll POST
    // the OCR result and expect a JSON response with a cleaned text field.
    if (ocrText && typeof NLP_API_URL === 'string' && NLP_API_URL.length > 0) {
      try {
        const procRes = await fetch(NLP_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: ocrText }),
        });

        if (procRes.ok) {
          const procJson = await procRes.json();
          // Accept several possible field names from the NLP service
          const cleaned = procJson.text ?? procJson.cleanedText ?? procJson.processedText ?? '';
          if (cleaned) return cleaned;
          // If NLP returned nothing useful, fall back to OCR
          console.warn('NLP service returned empty cleaned text, falling back to OCR text');
        } else {
          const body = await procRes.text();
          console.warn(`NLP service returned ${procRes.status}: ${body}`);
        }
      } catch (e) {
        console.warn('Error calling NLP post-processing service', e);
      }
    }

    return ocrText;
  }

  const handleOpenCamera = async () => {
    console.log('Camera button clicked');
    console.log(`permission: ${JSON.stringify(permission)}`);

    // If permission is still loading, wait a moment
    if (!permission) {
      Alert.alert('Please wait', 'Camera is initializing...');
      return;
    }

    // Request permission if not granted
    if (!permission.granted) {
      console.log('Requesting camera permission...');
      const result = await requestPermission();
      console.log(`Permission result: ${JSON.stringify(result)}`);

      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to use this feature.');
        return;
      }
    }

    // open local camera modal inside this component
    setProcessError(null);
    setCapturedUri(null);
    setCameraVisible(true);
  };

  // Camera modal + processing logic
  const processCaptured = async (uri: string) => {
    setIsProcessing(true);
    setProcessError(null);
    try {
      const extracted = await uploadAndExtractText(uri);
      if (extracted) {
        setContent(prevContent => {
          const newText = extracted.trim();
          return prevContent ? `${prevContent}\n\n${newText}` : newText;
        });
        Alert.alert('Success', 'Text extracted and added to your journal entry!');
        setCapturedUri(null);
        setCameraVisible(false);
      } else {
        setProcessError('No text extracted from image.');
      }
    } catch (err: any) {
      console.error('Error processing captured image', err);
      const message = err?.message ?? String(err);
      // Provide friendlier guidance for common HTTP errors
      if (message.includes('404')) {
        Alert.alert('Server error', 'OCR endpoint not found (404). Please check the TEXTRACT_API_URL in components/write-journal-entry.tsx — ensure the full API Gateway URL, stage and resource path are correct.');
      } else if (message.includes('401') || message.includes('403')) {
        Alert.alert('Authentication error', 'The Textract endpoint rejected the request (401/403). Check API keys / auth headers.');
      } else {
        Alert.alert('OCR error', message);
      }
      setProcessError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const take = async () => {
    if (!cameraRef.current) return;
    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        setCapturedUri(photo.uri);
        await processCaptured(photo.uri);
      }
    } catch (e) {
      console.error(e);
      setProcessError(String(e));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenImagePicker = async () => {
    try {
      setIsProcessing(true);

      // Check/request media library permission
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== 'granted') {
        const request = await ImagePicker.requestMediaLibraryPermissionsAsync();
        finalStatus = request.status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permission Required', 'Media library permission is required to select a photo.');
        return;
      }

      // Open image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled) return;

      const uri = result.assets && result.assets[0]?.uri ? result.assets[0].uri : undefined;
      if (!uri) {
        Alert.alert('Error', 'Could not get the selected image.');
        return;
      }

      try {
        const extracted = await uploadAndExtractText(uri);
        if (extracted) {
          setContent(prevContent => {
            const newText = extracted.trim();
            return prevContent ? `${prevContent}\n\n${newText}` : newText;
          });
          Alert.alert('Success', 'Text extracted and added to your journal entry!');
        } else {
          Alert.alert('No Text Found', 'Could not detect any text in the selected image.');
        }
      } catch (err) {
        console.error('Error calling Textract API:', err);
        Alert.alert('Error', 'Failed to extract text from the selected image. Please try again.');
      }
    } catch (error) {
      console.error('Error selecting image or performing OCR:', error);
      Alert.alert('Error', 'Failed to extract text from the selected image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Listen for OCR results emitted by the top-level camera
  // (no external ocr events anymore)
  useEffect(() => {
    // no-op
    return () => {};
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.dateContainer}>
            <Text style={styles.dayNumber}>17</Text>
            <Text style={styles.dayName}>Friday</Text>
            <Text style={styles.mood}>🙂</Text>
          </View>
        </View>
        
        <View style={styles.journalContainer}>
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor="#d7d7d7"
            value={title}
            onChangeText={setTitle}
          />
          
          <View style={styles.divider} />
          
          <TextInput
            style={styles.contentInput}
            placeholder="Start writing...."
            placeholderTextColor="#d7d7d7"
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
          />
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleOpenCamera}
            activeOpacity={0.7}
          >
            <CameraIcon stroke="white" width={18} height={18} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonTop]}
            onPress={handleOpenImagePicker}
            activeOpacity={0.7}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ImageIcon stroke="white" width={18} height={18} />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={cameraVisible} animationType="slide" presentationStyle="overFullScreen" transparent statusBarTranslucent>
        <View style={styles.cameraModalWrapper}>
          {capturedUri ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Image source={{ uri: capturedUri! }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
              {processError ? (
                <View style={{ position: 'absolute', top: 80, left: 20, right: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 8 }}>{processError}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          )}

          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.closeButton} onPress={() => { setCameraVisible(false); setCapturedUri(null); setProcessError(null); }}>
              <Text style={{ color: '#fff' }}>Close</Text>
            </TouchableOpacity>

            <View style={styles.captureButtonContainer}>
              {capturedUri ? (
                isProcessing ? (
                  <ActivityIndicator size="large" color="#fff" />
                ) : (
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={() => { setCapturedUri(null); setProcessError(null); }} style={{ paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.12)' }}>
                      <Text style={{ color: '#fff' }}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => capturedUri && processCaptured(capturedUri)} style={{ paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#fff' }}>
                      <Text style={{ color: '#000' }}>Try Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setCapturedUri(null); setProcessError(null); setCameraVisible(false); }} style={{ paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                      <Text style={{ color: '#fff' }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )
              ) : (
                isProcessing ? (
                  <ActivityIndicator size="large" color="#fff" />
                ) : (
                  <TouchableOpacity onPress={take} style={styles.captureButton}>
                    <View style={styles.captureButtonInner} />
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#fff',
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#d7d7d7',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 21,
    paddingTop: 17,
    backgroundColor: '#fff',
  },
  dateContainer: {
    alignItems: 'flex-start',
  },
  dayNumber: {
    fontSize: 48,
    fontFamily: 'Poppins-Medium',
    color: '#000',
    lineHeight: 72,
  },
  dayName: {
    fontSize: 24,
    fontFamily: 'Poppins-Medium',
    color: '#000',
    marginTop: -10,
  },
  mood: {
    fontSize: 24,
    fontFamily: 'Poppins-Medium',
    marginTop: 10,
  },
  doneButton: {
    marginTop: 8,
  },
  doneText: {
    fontSize: 8,
    fontFamily: 'Poppins-Medium',
    color: '#000',
  },
  journalContainer: {
    paddingHorizontal: 21,
    paddingTop: 10,
    flex: 1,
  },
  titleInput: {
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#d7d7d7',
    marginVertical: 8,
  },
  contentInput: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    paddingVertical: 10,
    minHeight: 300,
  },
  actionButtonsContainer: {
    paddingBottom: 30,
    paddingRight: 21,
    alignItems: 'flex-end',
    marginTop: 20,
  },
  actionButton: {
    width: 63,
    height: 63,
    borderRadius: 31.5,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonTop: {
    marginBottom: 0,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraModalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  cameraDebugBox: {
    position: 'absolute',
    top: 60,
    left: 12,
    right: 12,
    maxHeight: 180,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 10,
  },
  cameraDebugTitle: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 6,
  },
  cameraDebugScroll: {
    maxHeight: 140,
  },
  cameraDebugText: {
    color: '#ddd',
    fontSize: 11,
    marginBottom: 4,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginRight: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
});

