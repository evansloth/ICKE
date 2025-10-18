import MlkitOcr, { MlkitOcrResult } from '@react-native-ml-kit/text-recognition';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface WriteJournalEntryProps {
  visible: boolean;
  onClose: () => void;
}

export default function WriteJournalEntry({ visible, onClose }: WriteJournalEntryProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [cameraVisible, setCameraVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleOpenCamera = async () => {
    console.log('Camera button clicked, permission:', permission);
    
    // If permission is still loading, wait a moment
    if (!permission) {
      Alert.alert('Please wait', 'Camera is initializing...');
      return;
    }

    // Request permission if not granted
    if (!permission.granted) {
      console.log('Requesting camera permission...');
      const result = await requestPermission();
      console.log('Permission result:', result);
      
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to use this feature.');
        return;
      }
    }

    console.log('Opening camera...');
    setCameraVisible(true);
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current) {
      return;
    }

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo?.uri) {
        // Perform OCR on the captured image
        const result: MlkitOcrResult = await MlkitOcr.detectFromUri(photo.uri);
        
        if (result && result.text) {
          // Append the extracted text to the existing content
          setContent(prevContent => {
            const newText = result.text.trim();
            return prevContent ? `${prevContent}\n\n${newText}` : newText;
          });
          setCameraVisible(false);
          Alert.alert('Success', 'Text extracted and added to your journal entry!');
        } else {
          Alert.alert('No Text Found', 'Could not detect any text in the image.');
        }
      }
    } catch (error) {
      console.error('Error taking picture or performing OCR:', error);
      Alert.alert('Error', 'Failed to extract text from the image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={visible}
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={styles.dateContainer}>
                <Text style={styles.dayNumber}>17</Text>
                <Text style={styles.dayName}>Friday</Text>
                <Text style={styles.mood}>🙂</Text>
              </View>
              <TouchableOpacity style={styles.doneButton} onPress={onClose}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
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
                <Camera stroke="white" width={18} height={18} />
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, styles.actionButtonTop]}>
                <ImageIcon stroke="white" width={18} height={18} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Camera Modal - Rendered separately to avoid nesting issues */}
      <Modal
        visible={cameraVisible}
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent={false}
        onRequestClose={() => setCameraVisible(false)}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          />
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCameraVisible(false)}
            >
              <X stroke="white" width={24} height={24} />
            </TouchableOpacity>
            
            <View style={styles.captureButtonContainer}>
              {isProcessing ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={handleTakePicture}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
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

