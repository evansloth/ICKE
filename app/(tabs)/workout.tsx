import FloatingActionMenu from '@/components/floating-action-menu';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Clock, Play, Target, TrendingUp, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Workout</Text>
            <TouchableOpacity style={styles.profileIcon}>
              <View style={styles.profileCircle} />
            </TouchableOpacity>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Workouts</Text>
            <Text style={styles.mainSubtitle}>Move your body, nurture your soul</Text>
          </View>

          <View style={[styles.progressCard, { backgroundColor: '#E8F5E8' }]}>
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

          {/* Analyze My Form Banner */}
          <TouchableOpacity
            style={styles.analyzeFormBannerContainer}
            onPress={handleVideoUpload}
            disabled={isAnalyzing}
          >
            <View style={styles.analyzeFormBanner}>
              <View style={styles.gradientOverlay} />
              <View style={styles.analyzeFormContent}>
                <Text style={styles.analyzeFormTitle}>Analyze My Form</Text>
                <Text style={styles.analyzeFormSubtitle}>
                  {isAnalyzing ? 'Analyzing your workout...' : 'Upload a video to get form feedback'}
                </Text>
                <View style={styles.streakDots}>
                  {[...Array(7)].map((_, index) => (
                    <View key={index} style={[styles.streakDot, index < 5 && styles.streakDotActive]} />
                  ))}
                </View>
              </View>
              <View style={styles.analyzeFormIcon}>
                <Target size={32} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Add Exercise Card */}
          <View style={styles.addExerciseContainer}>
            <View style={[styles.workoutProgramCard, { backgroundColor: '#A8B5A8' }]}>
              <Text style={styles.workoutProgramTitle}>Add Exercise</Text>
              <Text style={styles.workoutProgramDescription}>Create your own custom workout routine</Text>
              <View style={styles.workoutProgramTags}>
                <View style={styles.workoutTag}>
                  <Text style={styles.workoutTagText}>Custom</Text>
                </View>
                <View style={styles.workoutTag}>
                  <Text style={styles.workoutTagText}>Your Pace</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.startWorkoutButton}>
                <Text style={styles.startWorkoutText}>Create workout</Text>
                <View style={styles.startWorkoutIcon}>
                  <Play size={16} color="#4A4A4A" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent Workouts</Text>

          <View style={styles.recentWorkoutsContainer}>
            {workoutStats.recentSessions.length > 0 ? (
              workoutStats.recentSessions.map((session, index) => {
                const cardColors = ['#B8A8B5', '#A8B5B8', '#B5B8A8'];
                const backgroundColor = cardColors[index % cardColors.length];

                return (
                  <View key={session.id} style={[styles.recentWorkoutCard, { backgroundColor }]}>
                    <Text style={styles.recentWorkoutTitle}>{session.exerciseType}</Text>
                    <Text style={styles.recentWorkoutDescription}>Completed {session.date.toLowerCase()}</Text>
                    <View style={styles.recentWorkoutTags}>
                      <View style={styles.workoutTag}>
                        <Text style={styles.workoutTagText}>{session.duration} min</Text>
                      </View>
                      <View style={styles.workoutTag}>
                        <Text style={styles.workoutTagText}>{session.accuracy}% accuracy</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.viewWorkoutButton}>
                      <Text style={styles.viewWorkoutText}>View details</Text>
                      <View style={styles.viewWorkoutIcon}>
                        <TrendingUp size={16} color="#4A4A4A" />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <View style={[styles.recentWorkoutCard, { backgroundColor: '#E8E8E8' }]}>
                <Text style={styles.recentWorkoutTitle}>No Recent Workouts</Text>
                <Text style={styles.recentWorkoutDescription}>Start your fitness journey today</Text>
                <View style={styles.recentWorkoutTags}>
                  <View style={styles.workoutTag}>
                    <Text style={styles.workoutTagText}>Get Started</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.viewWorkoutButton} onPress={handleVideoUpload}>
                  <Text style={styles.viewWorkoutText}>Upload video</Text>
                  <View style={styles.viewWorkoutIcon}>
                    <Zap size={16} color="#4A4A4A" />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.dailyGoalCard}>
              <View style={styles.circularProgressContainer}>
                <View style={[styles.circularProgressRing, { borderColor: '#A8B5A8' }]}>
                  <TrendingUp size={24} color="#A8B5A8" />
                </View>
                <Text style={styles.circularProgressText}>{Math.round(workoutStats.averageAccuracy)}%</Text>
              </View>
              <Text style={styles.dailyGoalTitle}>Daily Goal</Text>
            </View>

            <View style={styles.dailyGoalCard}>
              <View style={styles.circularProgressContainer}>
                <View style={[styles.circularProgressRing, { borderColor: '#B8A8B5' }]}>
                  <Clock size={24} color="#B8A8B5" />
                </View>
                <Text style={styles.circularProgressText}>{workoutStats.totalSessions}</Text>
              </View>
              <Text style={styles.dailyGoalTitle}>Active Days</Text>
            </View>
          </View>

          <View style={{ height: 4 }} />


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
    backgroundColor: '#F5F5F0',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  background: {
    backgroundColor: '#F5F5F0',
    minHeight: 812,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#8B8B8B',
    letterSpacing: 0.5,
  },
  profileIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCircle: {
    width: 36,
    height: 36,
    backgroundColor: '#B8C5B8',
    borderRadius: 18,
  },
  titleSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#8B8B8B',
    lineHeight: 24,
  },
  progressCard: {
    width: '92%',
    height: 80,
    borderRadius: 24,
    marginHorizontal: 24,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  progressCardContent: {
    marginLeft: 10,
  },
  progressTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#000000ff',
  },
  progressSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#000000ff',
  },
  progressCircle: {
    marginRight: 10,
  },
  circularProgress: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(168, 168, 168, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  progressPercentage: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
    marginBottom: 16,
    marginLeft: 24,
  },
  recentWorkoutsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  recentWorkoutCard: {
    borderRadius: 24,
    marginBottom: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },

  recentWorkoutTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  recentWorkoutDescription: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 24,
  },
  recentWorkoutTags: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  viewWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  viewWorkoutText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
  },
  viewWorkoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginHorizontal: 21,
    //justifyContent: 'space-between',
    paddingTop: 0,
    gap: 12,
  },
  dailyGoalCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  circularProgressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  circularProgressText: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
  },
  dailyGoalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#8B8B8B',
    textAlign: 'center',
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
  analyzeFormBannerContainer: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  analyzeFormBanner: {
    borderRadius: 24,
    padding: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#A8B5A8',
    position: 'relative',
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: '50%',
    backgroundColor: '#B8A8B5',
    opacity: 0.7,
  },
  analyzeFormContent: {
    flex: 1,
  },
  analyzeFormTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  analyzeFormSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 24,
  },
  streakDots: {
    flexDirection: 'row',
    gap: 8,
  },
  streakDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  streakDotActive: {
    backgroundColor: '#FFFFFF',
  },
  analyzeFormIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addExerciseContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  workoutProgramCard: {
    borderRadius: 24,
    padding: 32,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  workoutProgramTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  workoutProgramDescription: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 24,
  },
  workoutProgramTags: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  workoutTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  workoutTagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  startWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  startWorkoutText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
  },
  startWorkoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

