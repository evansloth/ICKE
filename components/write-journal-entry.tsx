import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera as CameraIcon, Image as ImageIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface WriteJournalEntryProps {
  onClose?: () => void;
  suggestionType?: string;
  suggestionTitle?: string;
}

export default function WriteJournalEntry({ onClose, suggestionType, suggestionTitle }: WriteJournalEntryProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodEmoji, setMoodEmoji] = useState('🙂');
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const cameraRef = React.useRef<any>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);

  const TEXTRACT_API_URL = 'https://2sxyz7gmc1.execute-api.us-east-1.amazonaws.com/ocr/textract';
  const NLP_API_URL = 'https://3fksn86ahf.execute-api.us-east-1.amazonaws.com/NLP';
  const DB_API_URL = "https://0q9swf3cmf.execute-api.us-east-1.amazonaws.com/DB";

  const getSuggestionPrompts = (type?: string) => {
    if (type === 'daily') {
      return [
        "What was the highlight of your day?",
        "What challenged you today?",
        "What are you grateful for?",
        "What did you learn today?",
        "How are you feeling right now?"
      ];
    } else if (type === 'happiness') {
      return [
        "What activities bring you the most joy?",
        "Who are the people that make you happiest?",
        "What accomplishments make you proud?",
        "What simple pleasures do you enjoy?",
        "What dreams and goals excite you?"
      ];
    }
    return [];
  };

  const suggestionPrompts = getSuggestionPrompts(suggestionType);

  async function uploadAndExtractText(uri: string, runNLP: boolean = true) {
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
    let ocrText = json.text ?? json.cleanedText ?? '';

    // Some handlers may prefix the string; keep original if split fails
    if (ocrText.includes(':')) {
      const parts = ocrText.split(':');
      if (parts.length > 1) ocrText = parts.slice(1).join(':').trim();
    }

    // Optional post-processing: send extracted text to an NLP/AI service to clean it up
    // and double-check for readability/formatting. If `runNLP` is true and `NLP_API_URL` is set,
    // we'll POST the OCR result and expect a JSON response with a cleaned text field and optionally an emoji.
    let returnedEmoji: string | undefined = undefined;
    if (runNLP && ocrText) {
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
          const emojiRaw = procJson.emoji ?? procJson.sentimentEmoji ?? procJson.emojiChar ?? '';
          if (emojiRaw) {
            // API returns arrow-delimited values like "label → 😊" — use the part after the arrow, or trim the raw string
            let extractedEmoji = emojiRaw.includes('→') ? emojiRaw.split('→')[1] : emojiRaw;
            extractedEmoji = extractedEmoji.trim();

            // Additional cleanup: extract only the emoji character
            const emojiMatch = extractedEmoji.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
            if (emojiMatch) {
              returnedEmoji = emojiMatch[0];
            } else {
              // Fallback: just take the first character if it looks like an emoji
              returnedEmoji = extractedEmoji.charAt(0);
            }
            console.log(`NLP returned emoji: ${returnedEmoji}`);
          }
          if (cleaned) ocrText = cleaned;
          else console.warn('NLP service returned no cleaned text; falling back to OCR text');
        } else {
          const body = await procRes.text();
          console.warn(`NLP service returned ${procRes.status}: ${body}`);
        }
      } catch (e) {
        console.warn('Error calling NLP post-processing service', e);
      }
    }

    return { text: ocrText, emoji: returnedEmoji } as { text: string; emoji?: string };
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

  // Process a captured or picked image URI: upload, extract text, update content and emoji
  const processCaptured = async (uri: string) => {
    setIsUploadingImage(true);
    setProcessError(null);
    try {
      // perform OCR only; skip NLP until user confirms (Done)
      const extracted = await uploadAndExtractText(uri, false);
      if (extracted && extracted.text) {
        const textToInsert = extracted.text.trim();
        setContent(prevContent => (prevContent ? `${prevContent}\n\n${textToInsert}` : textToInsert));
        Alert.alert('Success', 'Text extracted and added to your journal entry!');
        setCapturedUri(null);
        setCameraVisible(false);
      } else {
        setProcessError('No text extracted from image.');
      }
    } catch (err: any) {
      console.error('Error processing captured image', err);
      const message = err?.message ?? String(err);
      if (message.includes('404')) {
        Alert.alert('Server error', 'OCR endpoint not found (404). Please check the TEXTRACT_API_URL.');
      } else if (message.includes('401') || message.includes('403')) {
        Alert.alert('Authentication error', 'The Textract endpoint rejected the request (401/403). Check API keys / auth headers.');
      } else {
        Alert.alert('OCR error', message);
      }
      setProcessError(message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const take = async () => {
    if (!cameraRef.current) return;
    try {
      setIsUploadingImage(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        setCapturedUri(photo.uri);
        await processCaptured(photo.uri);
      }
    } catch (e) {
      console.error(e);
      setProcessError(String(e));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleOpenImagePicker = async () => {
    try {
      setIsUploadingImage(true);

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
        const extracted = await uploadAndExtractText(uri, false);
        if (extracted && extracted.text) {
          const textToInsert = extracted.text.trim();
          setContent(prevContent => (prevContent ? `${prevContent}\n\n${textToInsert}` : textToInsert));
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
      setIsUploadingImage(false);
    }
  };

  const uploadToDB = async (emoji: any) => {
    if (!title || !content) {
      Alert.alert('Error', 'Title and content are required.');
      return;
    }

    const now = new Date();

    const formatted = now.toLocaleDateString("en-US", {
      weekday: "long",   // e.g. "Saturday"
      year: "numeric",   // e.g. "2025"
      month: "long",     // e.g. "October"
      day: "numeric"     // e.g. "18"
    });

    setIsSubmitting(true);
    try {
      const response = await fetch(`${DB_API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          User_ID: "1",
          Title: title,
          Text: content,
          Date_Added: formatted,
          Icon: emoji
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DB API Error:', response.status, errorText);
        throw new Error(`Failed to upload journal entry: ${response.status} ${errorText}`);
      }

      Alert.alert('Success', 'Journal entry uploaded successfully!');
      try {
        if (typeof onClose === 'function') {
          // call provided onClose callback
          onClose();
        } else {
          // fallback to router.back()
          router.back();
        }
      } catch (e) {
        console.warn('onClose handler threw an error, falling back to router.back():', e);
        try { router.back(); } catch (_) { /* swallow */ }
      }
    } catch (error) {
      console.error('Error uploading journal entry:', error);
      Alert.alert('Error', 'Failed to upload journal entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Run NLP post-processing on the current content, set emoji, and then upload
  const handleDone = async () => {
    if (!content) {
      Alert.alert('Error', 'Please add some content before finishing.');
      return;
    }

    setIsSubmitting(true);
    try {
      let returnedEmoji: string | undefined;
      let cleanedText = content;

      // The API returns emoji info in the form "label → 😊" or raw emoji; take the part after the arrow or trim
      try {
        const procRes = await fetch(NLP_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: content }),
        });

        if (procRes.ok) {
          const procJson = await procRes.json();
          console.log('NLP raw response:', procJson);
          const cleaned = procJson.text ?? procJson.cleanedText ?? procJson.processedText ?? '';
          const emojiRaw = procJson.emoji ?? procJson.sentimentEmoji ?? procJson.emojiChar ?? '';
          if (emojiRaw) {
            // More robust emoji extraction
            let extractedEmoji = emojiRaw.includes('→') ? emojiRaw.split('→')[1] : emojiRaw;
            extractedEmoji = extractedEmoji.trim();

            // Additional cleanup: remove any non-emoji characters that might have slipped through
            // This regex matches most emoji characters
            const emojiMatch = extractedEmoji.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
            if (emojiMatch) {
              returnedEmoji = emojiMatch[0];
            } else {
              // Fallback: just take the first character if it looks like an emoji
              returnedEmoji = extractedEmoji.charAt(0);
            }
            console.log('Parsed returnedEmoji:', returnedEmoji);
          }
          if (cleaned) cleanedText = cleaned;
        } else {
          const body = await procRes.text();
          console.warn(`NLP service returned ${procRes.status}: ${body}`);
        }
      } catch (e) {
        console.warn('Error calling NLP post-processing service', e);
      }

      // Apply NLP results
      if (cleanedText) setContent(cleanedText);
      if (returnedEmoji) setMoodEmoji(returnedEmoji);

      // Now upload with the possibly-updated moodEmoji
      await uploadToDB(returnedEmoji);
    } catch (error) {
      console.error('Error in handleDone:', error);
      Alert.alert('Error', 'Failed to process journal entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Listen for OCR results emitted by the top-level camera
  // (no external ocr events anymore)
  useEffect(() => {
    // no-op
    return () => { };
  }, []);

  return (
    <LinearGradient
      colors={['#ebead6', '#f9eee9']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Journal</Text>
        </View>

        <View style={[styles.journalCard, { backgroundColor: '#E8F0F5' }]}>
          <View style={styles.journalHeader}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateNumber}>17</Text>
              <View style={styles.dateDetails}>
                <Text style={styles.month}>OCTOBER 2025</Text>
                <Text style={styles.time}>2:08 AM</Text>
              </View>
            </View>
            <View style={styles.topActionsContainer}>
              <Text style={styles.emoji}>{moodEmoji}</Text>
              <TouchableOpacity style={styles.topActionButton} onPress={handleOpenCamera} activeOpacity={0.7}>
                <CameraIcon stroke="white" width={16} height={16} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.topActionButton} onPress={handleOpenImagePicker} activeOpacity={0.7}>
                {isUploadingImage ? <ActivityIndicator size="small" color="#fff" /> : <ImageIcon stroke="white" width={16} height={16} />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.journalContent}>
            <View style={styles.journalTitleRow}>
              <TextInput
                style={styles.titleInput}
                placeholder="Title"
                placeholderTextColor="#B9B9B9"
                value={title}
                onChangeText={setTitle}
              />
              <TouchableOpacity onPress={handleDone} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#006AFF" />
                ) : (
                  <Text style={styles.editButton}>Done</Text>
                )}
              </TouchableOpacity>
            </View>

            {suggestionPrompts.length > 0 && (
              <View style={styles.suggestionsSection}>
                <Text style={styles.suggestionHeader}>{suggestionTitle}</Text>
                <Text style={styles.suggestionSubheader}>Here are some prompts to help you get started:</Text>
                {suggestionPrompts.map((prompt, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.suggestionPromptItem}
                    onPress={() => {
                      const newContent = content ? `${content}\n\n${prompt}\n` : `${prompt}\n`;
                      setContent(newContent);
                    }}
                  >
                    <Text style={styles.suggestionBullet}>•</Text>
                    <Text style={styles.suggestionPromptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TextInput
              style={styles.journalText}
              placeholder="Start writing...."
              placeholderTextColor="#B9B9B9"
              multiline
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
            />
          </View>

          {/* NLP Analysis removed for write-journal entry */}
        </View>

        {/* chat input removed for write-journal entry */}
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
                isUploadingImage ? (
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
                isUploadingImage ? (
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
    </LinearGradient>
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
  /* Styles for card-style journal view (copied/adapted from app/view-journal.tsx) */
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 59,
    paddingHorizontal: 18,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  journalCard: {
    width: '92%',
    height: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignSelf: 'center',
    marginTop: 22,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.13)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 2,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  dateNumber: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  dateDetails: {
    marginLeft: 6,
  },
  month: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6725C9',
  },
  time: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  emoji: {
    fontSize: 24,
    marginRight: 5,
  },
  journalContent: {
    paddingHorizontal: 20,
    flex: 1,
  },
  journalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#A7A7A7',
  },
  editButton: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#006AFF',
  },
  journalText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#000',
    lineHeight: 24,
    flex: 1,
  },
  analysisSection: {
    paddingHorizontal: 20,
    paddingTop: 9,
  },
  chatPrompt: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 18,
    gap: 12,
  },
  textInputContainer: {
    flex: 1,
    maxWidth: 280,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  textInput: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  suggestionsSection: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
  },
  suggestionHeader: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
    marginBottom: 8,
  },
  suggestionSubheader: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#8B8B8B',
    marginBottom: 16,
  },
  suggestionPromptItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionBullet: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#A8B5A8',
    marginRight: 8,
    marginTop: 2,
  },
  suggestionPromptText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#4A4A4A',
    flex: 1,
    lineHeight: 20,
  },
});

