import FloatingActionMenu from '@/components/floating-action-menu';
import { BookOpen, Dumbbell, PenLine } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

// Generate sample data for the habit tracker (52 weeks * 7 days)
const generateHabitData = () => {
  const data = [];
  for (let week = 0; week < 52; week++) {
    const weekData = [];
    for (let day = 0; day < 7; day++) {
      // Random intensity: 0 (none), 1 (light), 2 (medium), 3 (dark)
      const intensity = Math.random() > 0.3 ? Math.floor(Math.random() * 4) : 0;
      weekData.push(intensity);
    }
    data.push(weekData);
  }
  return data;
};

const HabitGrid = ({ data }: { data: number[][] }) => {
  const getColorForIntensity = (intensity: number) => {
    switch (intensity) {
      case 0:
        return '#EBEDF0';
      case 1:
        return '#C6E48B';
      case 2:
        return '#7BC96F';
      case 3:
        return '#239A3B';
      case 4:
        return '#196127';
      default:
        return '#EBEDF0';
    }
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.gridScrollView}
    >
      <View style={styles.grid}>
        {data.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.column}>
            {week.map((intensity, dayIndex) => (
              <View
                key={`${weekIndex}-${dayIndex}`}
                style={[
                  styles.cell,
                  { backgroundColor: getColorForIntensity(intensity) }
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default function HabitsPage() {
  const dailyReadData = generateHabitData();
  const workoutData = generateHabitData();
  const journalData = generateHabitData();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.pageTitle}>Habit Tracker</Text>

        <View style={styles.habitSection}>
          <View style={styles.habitHeader}>
            <BookOpen size={20} color="#000" />
            <Text style={styles.habitTitle}>Daily Read</Text>
          </View>
          <HabitGrid data={dailyReadData} />
        </View>

        <View style={styles.habitSection}>
          <View style={styles.habitHeader}>
            <Dumbbell size={20} color="#000" />
            <Text style={styles.habitTitle}>Workout</Text>
          </View>
          <HabitGrid data={workoutData} />
        </View>

        <View style={styles.habitSection}>
          <View style={styles.habitHeader}>
            <PenLine size={20} color="#000" />
            <Text style={styles.habitTitle}>Journal</Text>
          </View>
          <HabitGrid data={journalData} />
        </View>
      </ScrollView>
      <FloatingActionMenu />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginTop: 18,
    marginLeft: 21,
    marginBottom: 20,
  },
  habitSection: {
    marginBottom: 30,
    paddingHorizontal: 21,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    marginLeft: 8,
  },
  gridScrollView: {
    marginTop: 5,
  },
  grid: {
    flexDirection: 'row',
    gap: 3,
  },
  column: {
    flexDirection: 'column',
    gap: 3,
  },
  cell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});

