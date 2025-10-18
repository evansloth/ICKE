import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function Analysis() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.darkSection}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#FFFFFF" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Workout Form Analysis</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.resultSection}>
            <Text style={styles.resultLabel}>Result</Text>
            <Text style={styles.accuracyText}>93% Accuracy</Text>
          </View>
          
          <View style={styles.analysisSection}>
            <Text style={styles.analysisLabel}>Analysis</Text>
            
            <View style={styles.chartContainer}>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={styles.legendDotWhite} />
                  <Text style={styles.legendText}>You</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={styles.legendDotBlue} />
                  <Text style={styles.legendText}>Ideal</Text>
                </View>
              </View>
              
              <LineChart
                data={{
                  labels: ["", "", "", "", "", ""],
                  datasets: [
                    {
                      data: [20, 45, 28, 80, 99, 43],
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      strokeWidth: 2
                    },
                    {
                      data: [30, 50, 35, 90, 70, 40],
                      color: (opacity = 1) => `rgba(0, 110, 255, ${opacity})`,
                      strokeWidth: 2
                    }
                  ]
                }}
                width={screenWidth - 48}
                height={180}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: '#090E12',
                  backgroundGradientTo: '#090E12',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "0",
                  }
                }}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={false}
                withHorizontalLabels={false}
                withVerticalLabels={true}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryText}>
            Today felt different somehow. The coffee tasted better, the sun seemed warmer. I called Mom after weeks of meaning to. Her laugh reminded me why small gestures matter most. Tomorrow, I'll do better.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090E12',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  darkSection: {
    backgroundColor: '#090E12',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 38,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  resultSection: {
    paddingHorizontal: 30,
    marginTop: 40,
  },
  resultLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
  accuracyText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginTop: 5,
  },
  analysisSection: {
    paddingHorizontal: 30,
    marginTop: 30,
  },
  analysisLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    marginBottom: 15,
  },
  chartContainer: {
    marginTop: 10,
  },
  chart: {
    borderRadius: 16,
    paddingRight: 0,
  },
  legendContainer: {
    flexDirection: 'row',
    marginBottom: 5,
    position: 'absolute',
    top: 0,
    left: 10,
    zIndex: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  legendDotWhite: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  legendDotBlue: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#006EFF',
    marginRight: 4,
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 5,
    fontFamily: 'Poppins-Light',
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 30,
    flex: 1,
  },
  summaryTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#000000',
    marginBottom: 7,
  },
  summaryText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#000000',
    lineHeight: 20,
  },
});

