import FloatingActionMenu from '@/components/floating-action-menu';
import { useRouter } from 'expo-router';
import { Circle } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WorkoutPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        <View style={styles.background}>
          <Text style={styles.headerTitle}>Workout</Text>
          
          <View style={styles.progressCard}>
            <View style={styles.progressCardContent}>
              <Text style={styles.progressTitle}>Workout Progress</Text>
              <Text style={styles.progressSubtitle}>3/12 exercises completed</Text>
            </View>
            <View style={styles.progressCircle}>
              <Circle size={40} strokeWidth={4} color="#00B208" />
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Your workout</Text>
          
          <View style={styles.workoutImagesContainer}>
            <View style={styles.workoutImage}></View>
            <View style={styles.workoutImage}></View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.caloriesCard}>
              <View style={styles.caloriesSection}>
                <Text style={styles.statTitle}>Calories Burned</Text>
                <View style={styles.caloriesChart}>
                  <View style={styles.caloriesLabels}>
                    <Text style={styles.caloriesValue}>1350</Text>
                    <Text style={styles.caloriesUnit}>kcal</Text>
                  </View>
                  <View style={styles.caloriesScale}>
                    <View style={styles.scaleItem}>
                      <Text style={styles.scaleValue}>1250</Text>
                      <View style={styles.scaleLine}></View>
                    </View>
                    <View style={styles.scaleItem}>
                      <Text style={styles.scaleValue}>1300</Text>
                      <View style={styles.scaleLine}></View>
                    </View>
                    <View style={styles.scaleItem}>
                      <Text style={styles.scaleValue}>1400</Text>
                      <View style={styles.scaleLine}></View>
                    </View>
                    <View style={styles.scaleItem}>
                      <Text style={styles.scaleValue}>1450</Text>
                      <View style={styles.scaleLine}></View>
                  </View>
                </View>
              </View>
            </View>
          </View>
            
            <View style={styles.healthMetricsCard}>
              <View style={styles.healthMetricsSection}>
                <View style={styles.healthMetric}>
                  <View style={[styles.metricIndicator, styles.heartIndicator]}></View>
                  <Text style={styles.metricText}>Heart Health</Text>
                </View>
                <View style={styles.healthMetric}>
                  <View style={[styles.metricIndicator, styles.lungIndicator]}></View>
                  <Text style={styles.metricText}>Lung Health</Text>
                </View>
                <View style={styles.healthMetric}>
                  <View style={[styles.metricIndicator, styles.cognitiveIndicator]}></View>
                  <Text style={styles.metricText}>Cognitive Function</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={{ height: 40 }} />
          
          <View style={styles.formSection}>
            <View style={styles.formAnalysisCard}>
              <View style={styles.formQuestion}>
                <Text style={styles.formQuestionText}>Need to fix your form?</Text>
              </View>
              <TouchableOpacity 
                style={styles.analyzeButton}
                onPress={() => router.push('/analysis')}
              >
                <Text style={styles.analyzeButtonText}>Analyze Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <FloatingActionMenu />
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
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    marginTop: 32,
    marginLeft: 24,
  },
  workoutImagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 21,
    marginTop: 18,
  },
  workoutImage: {
    width: 192,
    height: 192,
    backgroundColor: '#D9D9D9',
    borderRadius: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 35,
    marginHorizontal: 21,
    justifyContent: 'space-between',
    gap: 12,
  },
  caloriesCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  caloriesSection: {
    flex: 1,
  },
  healthMetricsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 9,
    marginBottom: 12,
    alignSelf: 'center',
  },
  caloriesChart: {
    alignItems: 'center',
  },
  caloriesLabels: {
    alignItems: 'center',
  },
  caloriesValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  caloriesUnit: {
    fontFamily: 'Poppins-Light',
    fontSize: 7,
  },
  caloriesScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
  },
  scaleItem: {
    alignItems: 'center',
  },
  scaleValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 9,
    color: '#8D8D8D',
  },
  scaleLine: {
    height: 7,
    width: 0.5,
    backgroundColor: '#B8B8B8',
    marginTop: 2,
  },
  healthMetricsSection: {
    flex: 1,
    justifyContent: 'center',
  },
  healthMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  metricIndicator: {
    width: 8,
    height: 16,
    borderRadius: 6,
    marginRight: 9,
  },
  heartIndicator: {
    backgroundColor: '#D0757A',
  },
  lungIndicator: {
    backgroundColor: '#007DE1',
  },
  cognitiveIndicator: {
    backgroundColor: '#DCCEFA',
  },
  metricText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 9,
  },
  formSection: {
    marginTop: 30,
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
});

