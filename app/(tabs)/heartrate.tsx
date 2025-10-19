import { analyzeVideo, HeartRateAnalysisResult } from '@/services/heartrate-service';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Activity, ArrowLeft, Clock, Heart, RotateCcw, Upload, Video } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

type RecordingState = 'idle' | 'countdown' | 'recording' | 'processing' | 'complete';

export default function HeartRatePage() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [recordingTime, setRecordingTime] = useState(0);
  const [result, setResult] = useState<HeartRateAnalysisResult | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isProcessingInBackground, setIsProcessingInBackground] = useState(false);
  
  const heartScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  // Animated heartbeat effect
  useEffect(() => {
    if (result?.heart_rate) {
      heartScale.value = withRepeat(
        withTiming(1.2, { duration: 500 }),
        -1,
        true
      );
      pulseOpacity.value = withRepeat(
        withTiming(0.6, { duration: 500 }),
        -1,
        true
      );
    }
  }, [result]);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // Handle countdown before recording
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (recordingState === 'countdown') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        startRecording();
      }
    }
    
    return () => clearTimeout(timer);
  }, [recordingState, countdown]);

  // Handle recording timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (recordingState === 'recording') {
      if (recordingTime < 7) {
        timer = setTimeout(() => setRecordingTime(recordingTime + 1), 1000);
      } else {
        stopRecording();
      }
    }
    
    return () => clearTimeout(timer);
  }, [recordingState, recordingTime]);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#E53E3E" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Heart color="#E53E3E" size={64} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need access to your front camera to measure your heart rate
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const startCountdown = () => {
    setRecordingState('countdown');
    setCountdown(3);
    setRecordingTime(0);
    setResult(null);
    setVideoUri(null);
  };

  const startRecording = async () => {
    try {
      setRecordingState('recording');
      if (cameraRef.current) {
        // recordAsync returns a promise that resolves when recording stops
        const video = await cameraRef.current.recordAsync({
          maxDuration: 7,
        });
        
        // Recording completed, now process it in background
        console.log('Recording completed, video URI:', video.uri);
        setVideoUri(video.uri);
        setRecordingState('processing');
        
        // Enable background mode immediately
        setIsProcessingInBackground(true);
        
        // Process the recorded video in background
        analyzeVideo(video.uri).then((analysisResult) => {
          setResult(analysisResult);
          setRecordingState('complete');
          setIsProcessingInBackground(false);
        }).catch((error) => {
          console.error('Error analyzing video:', error);
          setResult({
            status: 'error',
            error: 'Failed to analyze video'
          });
          setRecordingState('complete');
          setIsProcessingInBackground(false);
        });
      }
    } catch (error) {
      console.error('Error during recording:', error);
      Alert.alert('Error', 'Failed to record video');
      setRecordingState('idle');
    }
  };

  const stopRecording = async () => {
    try {
      if (cameraRef.current) {
        // This will trigger the recordAsync promise to resolve
        await cameraRef.current.stopRecording();
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const resetRecording = () => {
    setRecordingState('idle');
    setCountdown(3);
    setRecordingTime(0);
    setResult(null);
    setVideoUri(null);
    setIsProcessingInBackground(false);
    heartScale.value = 1;
    pulseOpacity.value = 0;
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const videoUri = result.assets[0].uri;
        console.log('Selected video:', videoUri);
        
        setVideoUri(videoUri);
        setRecordingState('processing');
        
        // Enable background mode immediately
        setIsProcessingInBackground(true);
        
        // Navigate away immediately to home page
        setTimeout(() => {
          router.push('/');
        }, 100);
        
        // Process the uploaded video in background
        analyzeVideo(videoUri).then((analysisResult) => {
          setResult(analysisResult);
          setRecordingState('complete');
          setIsProcessingInBackground(false);
        }).catch((error) => {
          console.error('Error analyzing video:', error);
          setResult({
            status: 'error',
            error: 'Failed to analyze video'
          });
          setRecordingState('complete');
          setIsProcessingInBackground(false);
        });
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
      setRecordingState('idle');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#2D3748" size={24} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Heart color="#E53E3E" size={28} />
            <Text style={styles.headerTitle}>Heart Rate Monitor</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>Record a 7-second video to measure your heart rate</Text>
      </View>

      {/* Background Processing Banner */}
      {isProcessingInBackground && recordingState === 'processing' && (
        <Animated.View entering={FadeIn} style={styles.processingBanner}>
          <ActivityIndicator size="small" color="#E53E3E" />
          <Text style={styles.processingBannerText}>
            Analyzing your video...
          </Text>
        </Animated.View>
      )}

      <View style={styles.cameraContainer}>
        {recordingState !== 'complete' && (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            mode="video"
          />
        )}

        {/* Countdown Overlay */}
        {recordingState === 'countdown' && (
          <Animated.View 
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.overlayCenter}
          >
            <Text style={styles.countdownText}>{countdown}</Text>
            <Text style={styles.countdownLabel}>Get Ready</Text>
          </Animated.View>
        )}

        {/* White Flash Overlay for Illumination */}
        {recordingState === 'recording' && (
          <Animated.View 
            entering={FadeIn}
            style={styles.whiteFlashOverlay}
          />
        )}

        {/* Recording Overlay */}
        {recordingState === 'recording' && (
          <Animated.View 
            entering={FadeIn}
            style={styles.recordingOverlay}
          >
            <View style={styles.recordingHeader}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording</Text>
              </View>
              <Text style={styles.timerText}>{7 - recordingTime}s</Text>
            </View>
            
            <View style={styles.recordingGuide}>
              <Text style={styles.guideText}>Keep your face in frame</Text>
              <Text style={styles.guideSubtext}>Screen brightness helps detection</Text>
            </View>
          </Animated.View>
        )}

        {/* Processing Overlay - Show initial message then allow navigation */}
        {recordingState === 'processing' && !isProcessingInBackground && (
          <Animated.View 
            entering={FadeIn}
            style={styles.overlayCenter}
          >
            <ActivityIndicator size="large" color="#E53E3E" />
            <Text style={styles.processingText}>Starting analysis...</Text>
            <Text style={styles.processingSubtext}>Processing in background</Text>
          </Animated.View>
        )}
        
        {/* Background Processing Placeholder */}
        {recordingState === 'processing' && isProcessingInBackground && (
          <Animated.View 
            entering={FadeIn}
            style={styles.backgroundProcessingContainer}
          >
            <Clock color="#E53E3E" size={64} />
            <Text style={styles.backgroundProcessingTitle}>Analysis in Progress</Text>
            <ActivityIndicator size="large" color="#E53E3E" style={styles.backgroundLoader} />
            <Text style={styles.backgroundProcessingText}>
              Your video is being analyzed
            </Text>
            <Text style={styles.backgroundProcessingSubtext}>
              This may take a minute or two. Please wait...
            </Text>
          </Animated.View>
        )}

        {/* Results Overlay */}
        {recordingState === 'complete' && result && (
          <Animated.View 
            entering={SlideInDown}
            style={styles.resultsContainer}
          >
            {result.status === 'success' ? (
              <>
                <View style={styles.resultsHeader}>
                  <Animated.View style={heartAnimatedStyle}>
                    <Heart color="#E53E3E" size={64} fill="#E53E3E" />
                  </Animated.View>
                  <Animated.View style={[styles.pulse, pulseAnimatedStyle]} />
                </View>
                
                <Text style={styles.resultLabel}>Your Heart Rate</Text>
                <Text style={styles.heartRateValue}>{result.heart_rate}</Text>
                <Text style={styles.bpmLabel}>BPM</Text>
                
                <View style={styles.confidenceContainer}>
                  <Activity color="#48BB78" size={20} />
                  <Text style={styles.confidenceText}>
                    Confidence: {result.confidence?.toFixed(1)}%
                  </Text>
                </View>

                <View style={styles.heartRateInfo}>
                  <Text style={styles.infoText}>
                    {result.heart_rate && result.heart_rate < 60 
                      ? '🏃 Lower than average - great if you exercise regularly!'
                      : result.heart_rate && result.heart_rate < 100
                      ? '✅ Normal resting heart rate'
                      : '⚡ Elevated - make sure you\'re relaxed'}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.errorIcon}>
                  <Heart color="#E53E3E" size={64} />
                </View>
                <Text style={styles.errorTitle}>Analysis Failed</Text>
                <Text style={styles.errorMessage}>{result.error}</Text>
                <Text style={styles.errorHint}>
                  Make sure you're in a well-lit area and your face is clearly visible
                </Text>
              </>
            )}
          </Animated.View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {recordingState === 'idle' && (
          <Animated.View entering={FadeIn} style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.recordButton}
              onPress={startCountdown}
            >
              <Video color="#FFFFFF" size={28} />
              <Text style={styles.recordButtonText}>Record Video</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={pickVideo}
            >
              <Upload color="#E53E3E" size={24} />
              <Text style={styles.uploadButtonText}>Upload Video</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {recordingState === 'complete' && (
          <Animated.View 
            entering={SlideInDown}
            exiting={SlideOutDown}
            style={styles.buttonContainer}
          >
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetRecording}
            >
              <RotateCcw color="#FFFFFF" size={24} />
              <Text style={styles.resetButtonText}>Analyze Another</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#1A202C',
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    marginTop: 4,
    textAlign: 'center',
  },
  processingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEB2B2',
    gap: 12,
  },
  processingBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#C53030',
    lineHeight: 18,
  },
  backgroundProcessingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
  },
  backgroundProcessingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#1A202C',
    marginTop: 24,
    marginBottom: 8,
  },
  backgroundLoader: {
    marginVertical: 16,
  },
  backgroundProcessingText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  backgroundProcessingSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1A202C',
  },
  camera: {
    flex: 1,
  },
  overlayCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  countdownText: {
    fontSize: 96,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  countdownLabel: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  whiteFlashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    opacity: 0.35,
    zIndex: 1,
  },
  recordingOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 24,
    zIndex: 2,
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 62, 62, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  timerText: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  recordingGuide: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 16,
  },
  guideText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  guideSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#CBD5E0',
    textAlign: 'center',
  },
  processingText: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginTop: 24,
    textAlign: 'center',
  },
  processingSubtext: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#CBD5E0',
    marginTop: 8,
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
  },
  resultsHeader: {
    position: 'relative',
    marginBottom: 32,
  },
  pulse: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 60,
    backgroundColor: '#E53E3E',
  },
  resultLabel: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    marginBottom: 8,
  },
  heartRateValue: {
    fontSize: 72,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#E53E3E',
    lineHeight: 80,
  },
  bpmLabel: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#718096',
    marginBottom: 24,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 24,
  },
  confidenceText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#22543D',
    marginLeft: 8,
  },
  heartRateInfo: {
    backgroundColor: '#EDF2F7',
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#E53E3E',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorHint: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#A0AEC0',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  actionContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  recordButton: {
    flexDirection: 'row',
    backgroundColor: '#E53E3E',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  recordButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E53E3E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#E53E3E',
    marginLeft: 12,
  },
  resetButton: {
    flexDirection: 'row',
    backgroundColor: '#4299E1',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4299E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#1A202C',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#E53E3E',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
});

