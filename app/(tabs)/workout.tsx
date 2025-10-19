import FloatingActionMenu from '@/components/floating-action-menu';
import { useRouter } from 'expo-router';
import { Circle, Play, TrendingUp, Award, Target, Clock, Zap } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Alert, Image, Animated, Modal } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

interface WorkoutSession {
  id: string;
  date: string;
  duration: number;
  accuracy: number;
  exerciseType: string;
  thumbnail?: string;
}

interface WorkoutStats {
  totalSessions: number;
  averageAccuracy: number;
  totalDuration: number;
  bestAccuracy: number;
  recentSessions: WorkoutSession[];
}

export default function WorkoutPage() {
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats>({
    totalSessions: 0,
    averageAccuracy: 0,
    totalDuration: 0,
    bestAccuracy: 0,
    recentSessions: []
  });
  const [lastAnalysisResult, setLastAnalysisResult] = useState<any>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');

  // Animation values
  const spinValue = new Animated.Value(0);
  const pulseValue = new Animated.Value(1);
  const progressValue = new Animated.Value(0);

  // Server URL - Update based on your testing platform
  const getServerUrl = () => {
    // For iOS Simulator: localhost works
    // For Android Emulator: use 10.0.2.2
    // For Physical Device: use your computer's IP address

    // Uncomment the appropriate line for your setup:
    return 'https://skilled-glowing-squirrel.ngrok-free.app';           // iOS Simulator
    // return 'http://10.0.2.2:5001';        // Android Emulator
    // return 'http://192.168.1.XXX:5001';   // Physical Device (replace XXX with your IP)
  };

  const SERVER_URL = getServerUrl();

  // Load workout data on component mount
  useEffect(() => {
    loadWorkoutData();
  }, []);

  const loadWorkoutData = () => {
    // In a real app, this would load from AsyncStorage or a database
    // For now, we'll simulate some data based on recent analyses
    const mockStats: WorkoutStats = {
      totalSessions: 12,
      averageAccuracy: 78.5,
      totalDuration: 480, // minutes
      bestAccuracy: 94.2,
      recentSessions: [
        {
          id: '1',
          date: 'Today',
          duration: 25,
          accuracy: 87.3,
          exerciseType: 'Push-ups',
        },
        {
          id: '2',
          date: 'Yesterday',
          duration: 30,
          accuracy: 82.1,
          exerciseType: 'Squats',
        }
      ]
    };
    setWorkoutStats(mockStats);
  };

  const updateWorkoutStats = (newResult: any) => {
    // Update stats with new analysis result
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      date: 'Just now',
      duration: Math.round((newResult.total_frames || 60) / 2), // Estimate duration
      accuracy: newResult.accuracy || 0,
      exerciseType: 'Form Analysis',
    };

    setWorkoutStats(prev => ({
      totalSessions: prev.totalSessions + 1,
      averageAccuracy: ((prev.averageAccuracy * prev.totalSessions) + newResult.accuracy) / (prev.totalSessions + 1),
      totalDuration: prev.totalDuration + newSession.duration,
      bestAccuracy: Math.max(prev.bestAccuracy, newResult.accuracy),
      recentSessions: [newSession, ...prev.recentSessions.slice(0, 4)]
    }));

    setLastAnalysisResult(newResult);
  };

  const startLoadingAnimation = () => {
    // Spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopLoadingAnimation = () => {
    spinValue.stopAnimation();
    pulseValue.stopAnimation();
    progressValue.stopAnimation();
    setAnalysisProgress(0);
    setAnalysisStage('');
  };

  const simulateAnalysisProgress = () => {
    setAnalysisStage('Uploading video...');
    setAnalysisProgress(10);

    setTimeout(() => {
      setAnalysisStage('Extracting frames...');
      setAnalysisProgress(30);
    }, 1000);

    setTimeout(() => {
      setAnalysisStage('Analyzing form...');
      setAnalysisProgress(60);
    }, 2000);

    setTimeout(() => {
      setAnalysisStage('Generating insights...');
      setAnalysisProgress(90);
    }, 4000);
  };

  const uploadVideoToServer = async (videoUri: string) => {
    try {
      setIsAnalyzing(true);
      startLoadingAnimation();
      simulateAnalysisProgress();

      console.log('Attempting to connect to:', SERVER_URL);
      console.log('Video URI:', videoUri);

      // First, test if server is reachable
      try {
        const healthResponse = await fetch(`${SERVER_URL}/health`, {
          method: 'GET',
        });
        console.log('Health check response:', healthResponse.status);
      } catch (healthError) {
        console.error('Health check failed:', healthError);
        Alert.alert(
          'Connection Error',
          `Cannot reach server at ${SERVER_URL}\n\nTroubleshooting:\n• Make sure server is running\n• Check if you're using the right URL for your platform\n• iOS Simulator: localhost\n• Android Emulator: 10.0.2.2\n• Physical Device: Your computer's IP`
        );
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('video', {
        uri: videoUri,
        type: 'video/mp4',
        name: 'workout_video.mp4',
      } as any);

      console.log('Sending video for analysis...');
      const response = await fetch(`${SERVER_URL}/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Analysis result:', result);

      if (result.success) {
        // Update workout stats with new result
        updateWorkoutStats(result);

        Alert.alert(
          'Analysis Complete!',
          `Form accuracy: ${result.accuracy}%\n${result.summary}`,
          [
            {
              text: 'View Details',
              onPress: () => router.push({
                pathname: '/analysis',
                params: {
                  accuracy: result.accuracy,
                  summary: result.summary,
                  totalFrames: result.total_frames,
                  goodFrames: result.good_frames,
                  detailedReport: JSON.stringify(result.detailed_report || [])
                }
              })
            }
          ]
        );
      } else {
        Alert.alert('Analysis Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Server connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Connection Error',
        `Failed to connect to server at ${SERVER_URL}\n\nError: ${errorMessage}\n\nMake sure:\n1. Server is running on port 5001\n2. You're using the correct URL for your platform`
      );
    } finally {
      setIsAnalyzing(false);
      stopLoadingAnimation();
    }
  };

  const handleVideoUpload = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access media library is required to upload videos.');
        return;
      }

      // Launch image picker for video
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedVideo(result.assets[0].uri);

        // Immediately start analysis
        Alert.alert(
          'Video Selected',
          'Starting analysis of your workout form...',
          [
            {
              text: 'Analyze',
              onPress: () => uploadVideoToServer(result.assets[0].uri)
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload video. Please try again.');
      console.error('Video upload error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        <View style={styles.background}>
          <Text style={styles.headerTitle}>Workout</Text>

          <View style={styles.progressCard}>
            <View style={styles.progressCardContent}>
              <Text style={styles.progressTitle}>Workout Progress</Text>
              <Text style={styles.progressSubtitle}>
                {workoutStats.totalSessions} sessions • {Math.round(workoutStats.averageAccuracy)}% avg accuracy
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <View style={styles.circularProgress}>
                <Text style={styles.progressPercentage}>{Math.round(workoutStats.averageAccuracy)}%</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent Workouts</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.workoutScrollContainer}
            contentContainerStyle={styles.workoutScrollContent}
          >
            {workoutStats.recentSessions.length > 0 ? (
              workoutStats.recentSessions.map((session, index) => (
                <TouchableOpacity key={session.id} style={styles.workoutCard}>
                  <View style={styles.workoutCardHeader}>
                    <View style={styles.workoutTypeContainer}>
                      <Target size={16} color="#FF7171" />
                      <Text style={styles.workoutType}>{session.exerciseType}</Text>
                    </View>
                    <Text style={styles.workoutDate}>{session.date}</Text>
                  </View>

                  <View style={styles.workoutStats}>
                    <View style={styles.workoutStatItem}>
                      <Clock size={14} color="#666" />
                      <Text style={styles.workoutStatText}>{session.duration}min</Text>
                    </View>
                    <View style={styles.workoutStatItem}>
                      <TrendingUp size={14} color="#00B208" />
                      <Text style={styles.workoutStatText}>{session.accuracy}%</Text>
                    </View>
                  </View>


                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyWorkoutCard}>
                <Zap size={32} color="#DDD" />
                <Text style={styles.emptyWorkoutText}>No workouts yet</Text>
                <Text style={styles.emptyWorkoutSubtext}>Upload a video to get started!</Text>
              </View>
            )}

            {/* Add new workout card */}
            <TouchableOpacity style={styles.addWorkoutCard} onPress={handleVideoUpload}>
              <View style={styles.addWorkoutIcon}>
                <Text style={styles.addWorkoutPlus}>+</Text>
              </View>
              <Text style={styles.addWorkoutText}>Add Workout</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <View style={styles.statHeader}>
                <Award size={20} color="#FF7171" />
                <Text style={styles.statTitle}>Best Score</Text>
              </View>
              <Text style={styles.statValue}>{workoutStats.bestAccuracy.toFixed(1)}%</Text>
              <Text style={styles.statSubtext}>Personal best</Text>
            </View>

            <View style={styles.statsCard}>
              <View style={styles.statHeader}>
                <Clock size={20} color="#00B208" />
                <Text style={styles.statTitle}>Total Time</Text>
              </View>
              <Text style={styles.statValue}>{Math.round(workoutStats.totalDuration / 60)}h</Text>
              <Text style={styles.statSubtext}>{workoutStats.totalDuration % 60}min</Text>
            </View>

            <View style={styles.statsCard}>
              <View style={styles.statHeader}>
                <TrendingUp size={20} color="#007DE1" />
                <Text style={styles.statTitle}>Avg Accuracy</Text>
              </View>
              <Text style={styles.statValue}>{workoutStats.averageAccuracy.toFixed(1)}%</Text>
              <Text style={styles.statSubtext}>Overall performance</Text>
            </View>
          </View>

          <View style={{ height: 4 }} />

          <View style={styles.formSection}>
            <View style={styles.formAnalysisCard}>
              <View style={styles.formQuestion}>
                <Text style={styles.formQuestionText}>Need to fix your form?</Text>
                {selectedVideo && (
                  <Text style={styles.videoSelectedText}>✓ Video selected</Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
                onPress={handleVideoUpload}
                disabled={isAnalyzing}
              >
                <Text style={styles.analyzeButtonText}>
                  {isAnalyzing ? 'Analyzing...' : selectedVideo ? 'Upload New Video' : 'Analyze Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <FloatingActionMenu />

      {/* Loading Modal */}
      <Modal
        visible={isAnalyzing}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <Animated.View
              style={[
                styles.loadingSpinner,
                {
                  transform: [
                    {
                      rotate: spinValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                    { scale: pulseValue },
                  ],
                },
              ]}
            >
              <Target size={40} color="#FF7171" />
            </Animated.View>

            <Text style={styles.loadingTitle}>Analyzing Your Form</Text>
            <Text style={styles.loadingStage}>{analysisStage}</Text>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${analysisProgress}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{analysisProgress}%</Text>
            </View>

            <View style={styles.loadingSteps}>
              <View style={[styles.loadingStep, analysisProgress >= 10 && styles.loadingStepActive]}>
                <View style={[
                  styles.loadingStepDot,
                  analysisProgress >= 10 && { backgroundColor: '#FF7171' }
                ]} />
                <Text style={[
                  styles.loadingStepText,
                  analysisProgress >= 10 && { color: '#FF7171', fontFamily: 'Poppins-SemiBold' }
                ]}>Upload</Text>
              </View>
              <View style={[styles.loadingStep, analysisProgress >= 30 && styles.loadingStepActive]}>
                <View style={[
                  styles.loadingStepDot,
                  analysisProgress >= 30 && { backgroundColor: '#FF7171' }
                ]} />
                <Text style={[
                  styles.loadingStepText,
                  analysisProgress >= 30 && { color: '#FF7171', fontFamily: 'Poppins-SemiBold' }
                ]}>Extract</Text>
              </View>
              <View style={[styles.loadingStep, analysisProgress >= 60 && styles.loadingStepActive]}>
                <View style={[
                  styles.loadingStepDot,
                  analysisProgress >= 60 && { backgroundColor: '#FF7171' }
                ]} />
                <Text style={[
                  styles.loadingStepText,
                  analysisProgress >= 60 && { color: '#FF7171', fontFamily: 'Poppins-SemiBold' }
                ]}>Analyze</Text>
              </View>
              <View style={[styles.loadingStep, analysisProgress >= 90 && styles.loadingStepActive]}>
                <View style={[
                  styles.loadingStepDot,
                  analysisProgress >= 90 && { backgroundColor: '#FF7171' }
                ]} />
                <Text style={[
                  styles.loadingStepText,
                  analysisProgress >= 90 && { color: '#FF7171', fontFamily: 'Poppins-SemiBold' }
                ]}>Results</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  background: {
    backgroundColor: '#FFFFFF',
    minHeight: 812,
    paddingBottom: 50,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    marginTop: 18,
    marginLeft: 21,
  },
  progressCard: {
    width: 335,
    height: 71,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 24,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 3,
  },
  progressCardContent: {
    marginLeft: 10,
  },
  progressTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
  },
  progressSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#A2A2A2',
  },
  progressCircle: {
    marginRight: 10,
  },
  circularProgress: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#00B208',
  },
  progressPercentage: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: '#00B208',
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    marginTop: 16,
    marginLeft: 24,
  },
  workoutScrollContainer: {
    marginTop: 8,
    height: 100,
    marginBottom: 0,
    paddingBottom: 0,
  },
  workoutScrollContent: {
    paddingLeft: 21,
    paddingBottom: 0,
  },
  workoutCard: {
    width: 200,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  workoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutType: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#333',
    marginLeft: 6,
  },
  workoutDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#666',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  workoutStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutStatText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },

  emptyWorkoutCard: {
    width: 200,
    height: 100,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
  },
  emptyWorkoutText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  emptyWorkoutSubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#BBB',
    marginTop: 4,
  },
  addWorkoutCard: {
    width: 120,
    height: 100,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginRight: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF7171',
    borderStyle: 'dashed',
    marginBottom: 0,
    paddingBottom: 0,
  },
  addWorkoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF7171',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addWorkoutPlus: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  addWorkoutText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FF7171',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginHorizontal: 21,
    //justifyContent: 'space-between',
    paddingTop: 0,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    color: '#666',
    marginLeft: 6,
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#333',
    marginBottom: 4,
  },
  statSubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
  },
  formSection: {
    marginTop: 8,
    marginHorizontal: 24,
  },
  formAnalysisCard: {
    width: '100%',
    height: 117,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formQuestion: {
    marginBottom: 10,
  },
  formQuestionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 9,
  },
  analyzeButton: {
    width: 127,
    height: 35,
    backgroundColor: '#FF7171',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzeButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  videoSelectedText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 8,
    color: '#00B208',
    marginTop: 4,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  // Loading Animation Styles
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  loadingStage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 25,
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF7171',
    borderRadius: 3,
  },
  progressText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#FF7171',
  },
  loadingSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  loadingStep: {
    alignItems: 'center',
    flex: 1,
    opacity: 0.3,
  },
  loadingStepActive: {
    opacity: 1,
  },
  loadingStepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
    marginBottom: 6,
  },
  loadingStepText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
});

