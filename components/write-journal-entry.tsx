import ocrEvents from '@/utils/ocrEvents';
import { useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera as CameraIcon, Image as ImageIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface WriteJournalEntryProps {
  onClose?: () => void;
}

export default function WriteJournalEntry({ onClose }: WriteJournalEntryProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);

  // Replace this with your actual API Gateway / Lambda endpoint that runs Textract
  const TEXTRACT_API_URL = 'https://REPLACE_WITH_YOUR_API_GATEWAY_URL/textract';

  async function uploadAndExtractText(uri: string) {
    // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

    // Send to your Textract-backed API
    const res = await fetch(TEXTRACT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64 }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Textract API error: ${res.status} ${text}`);
    }

    const json = await res.json();
    // Expecting the API to return something like: { text: 'extracted text...' }
    return json.text ?? json.extractedText ?? '';
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

    // emit event for top-level camera handler to open the camera immediately
    ocrEvents.emit('openCamera');
  };

  // camera capture is handled by top-level camera; WriteJournalEntry only emits openCamera

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
  useEffect(() => {
    const off = ocrEvents.on('ocrResult', (text: string) => {
      if (text) {
        setContent(prev => prev ? `${prev}\n\n${text}` : text);
        Alert.alert('Success', 'Text extracted and added to your journal entry!');
      }
    });
    return off;
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

