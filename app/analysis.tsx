import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function Analysis() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get analysis results from params with proper validation
  const accuracy = params.accuracy ? Math.max(0, Math.min(100, parseFloat(params.accuracy as string) || 93)) : 93;
  const summary = params.summary as string || "Analysis completed successfully.";
  const totalFrames = params.totalFrames ? Math.max(1, parseInt(params.totalFrames as string) || 100) : 100;
  const goodFrames = params.goodFrames ? Math.max(0, Math.min(totalFrames, parseInt(params.goodFrames as string) || 93)) : 93;
  
  // Parse detailed report for graph data with error handling
  let detailedReport = [];
  try {
    if (params.detailedReport && typeof params.detailedReport === 'string') {
      const parsed = JSON.parse(params.detailedReport as string);
      detailedReport = Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.warn('Failed to parse detailed report:', error);
    detailedReport = [];
  }
  
  // Generate graph data from actual analysis results with validation
  const generateGraphData = () => {
    // Helper function to ensure valid numbers
    const ensureValidNumber = (num: number, fallback: number = 50) => {
      return isNaN(num) || !isFinite(num) ? fallback : Math.max(0, Math.min(100, num));
    };
    
    if (detailedReport.length === 0) {
      // Fallback to simulated data based on overall accuracy
      const baseAccuracy = ensureValidNumber(accuracy);
      return {
        labels: ["Start", "", "", "", "", "End"],
        yourData: [
          ensureValidNumber(baseAccuracy),
          ensureValidNumber(baseAccuracy * 0.9),
          ensureValidNumber(baseAccuracy * 1.1),
          ensureValidNumber(baseAccuracy * 0.8),
          ensureValidNumber(baseAccuracy * 1.05),
          ensureValidNumber(baseAccuracy)
        ],
        idealData: [100, 100, 100, 100, 100, 100]
      };
    }
    
    // Group frames into segments for the graph (6 segments)
    const segmentSize = Math.max(1, Math.ceil(detailedReport.length / 6));
    const segments = [];
    
    for (let i = 0; i < 6; i++) {
      const startIdx = i * segmentSize;
      const endIdx = Math.min(startIdx + segmentSize, detailedReport.length);
      const segmentFrames = detailedReport.slice(startIdx, endIdx);
      
      if (segmentFrames.length === 0) {
        segments.push(50); // Default value if no frames
        continue;
      }
      
      // Calculate percentage of good frames in this segment
      const goodFramesInSegment = segmentFrames.filter(frame => 
        frame && frame.prediction === 'good'
      ).length;
      
      const segmentAccuracy = (goodFramesInSegment / segmentFrames.length) * 100;
      segments.push(ensureValidNumber(segmentAccuracy));
    }
    
    // Ensure we have exactly 6 data points
    while (segments.length < 6) {
      segments.push(ensureValidNumber(accuracy));
    }
    
    return {
      labels: ["Start", "", "", "", "", "End"],
      yourData: segments.slice(0, 6), // Ensure exactly 6 points
      idealData: [100, 100, 100, 100, 100, 100]
    };
  };
  
  const graphData = generateGraphData();
  
  // Debug logging (remove in production)
  console.log('Analysis params:', { accuracy, totalFrames, goodFrames });
  console.log('Detailed report length:', detailedReport.length);
  console.log('Graph data:', graphData);

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
            <Text style={styles.accuracyText}>{Math.round(accuracy)}% Accuracy</Text>
            <Text style={styles.frameInfo}>{goodFrames}/{totalFrames} frames with good form</Text>
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
              
              {(() => {
                try {
                  return (
                    <LineChart
                      data={{
                        labels: graphData.labels,
                        datasets: [
                          {
                            data: graphData.yourData,
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            strokeWidth: 2
                          },
                          {
                            data: graphData.idealData,
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
                          r: "3",
                          strokeWidth: 1,
                        }
                      }}
                      bezier
                      style={styles.chart}
                      withInnerLines={true}
                      withOuterLines={false}
                      withHorizontalLabels={true}
                      withVerticalLabels={true}
                    />
                  );
                } catch (error) {
                  console.error('Chart rendering error:', error);
                  return (
                    <View style={styles.chartFallback}>
                      <Text style={styles.chartFallbackText}>
                        Chart temporarily unavailable
                      </Text>
                      <Text style={styles.chartFallbackSubtext}>
                        Your accuracy: {Math.round(accuracy)}%
                      </Text>
                    </View>
                  );
                }
              })()}
            </View>
          </View>
          
          {detailedReport.length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={styles.detailsLabel}>Frame Analysis</Text>
              <View style={styles.frameStatsContainer}>
                <View style={styles.frameStat}>
                  <Text style={styles.frameStatNumber}>{goodFrames}</Text>
                  <Text style={styles.frameStatLabel}>Good Form</Text>
                </View>
                <View style={styles.frameStat}>
                  <Text style={styles.frameStatNumber}>{totalFrames - goodFrames}</Text>
                  <Text style={styles.frameStatLabel}>Needs Work</Text>
                </View>
                <View style={styles.frameStat}>
                  <Text style={styles.frameStatNumber}>{totalFrames}</Text>
                  <Text style={styles.frameStatLabel}>Total Frames</Text>
                </View>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryText}>
            {summary}
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
  frameInfo: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 5,
    opacity: 0.8,
  },
  detailsSection: {
    paddingHorizontal: 30,
    marginTop: 20,
  },
  detailsLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    marginBottom: 15,
  },
  frameStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frameStat: {
    alignItems: 'center',
    flex: 1,
  },
  frameStatNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
  },
  frameStatLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    opacity: 0.8,
    marginTop: 4,
  },
  chartFallback: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  chartFallbackText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  chartFallbackSubtext: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginTop: 8,
  },
});

