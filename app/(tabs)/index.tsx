import FloatingActionMenu from '@/components/floating-action-menu';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInUp
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

export default function DiscoverPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);

  const wellnessCards = [
    {
      id: '1',
      tag: 'Mindfulness',
      title: 'The Power of Morning Meditation',
      backgroundColor: '#A8B5A8'
    },
    {
      id: '2',
      tag: 'Nutrition',
      title: 'Healthy Eating for Mental Clarity',
      backgroundColor: '#B8A8B5'
    },
    {
      id: '3',
      tag: 'Exercise',
      title: 'Movement as Medicine for the Mind',
      backgroundColor: '#A8B8B5'
    },
    {
      id: '4',
      tag: 'Sleep',
      title: 'Creating Your Perfect Sleep Routine',
      backgroundColor: '#B5B8A8'
    },
    {
      id: '5',
      tag: 'Stress Relief',
      title: 'Breathing Techniques for Calm',
      backgroundColor: '#A8B5B8'
    }
  ];

  const renderWellnessCard = ({ item }: { item: any }) => {
    return (
      <View style={[styles.wellnessCard, { backgroundColor: item.backgroundColor }]}>
        <View style={styles.moodCardContent}>
          <View style={styles.moodTag}>
            <Text style={styles.moodTagText}>{item.tag}</Text>
          </View>
          <Text style={styles.moodTitle}>{item.title}</Text>
          <TouchableOpacity style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>Read more</Text>
            <Text style={styles.readMoreArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const onCarouselScroll = (event: any) => {
    const slideSize = screenWidth - 48;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCarouselIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Text style={styles.pageTitle}>Wellness</Text>
        </Animated.View>

        {/* Main Title Section */}
        <Animated.View entering={FadeInLeft.delay(200)} style={styles.titleSection}>
          <Text style={styles.mainTitle}>Catch-Up</Text>
          <Text style={styles.mainSubtitle}>Welcome back, Ken</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </Animated.View>

        {/* Wellness Cards Carousel */}
        <Animated.View entering={FadeInLeft.delay(300)} style={styles.carouselContainer}>
          <FlatList
            ref={carouselRef}
            data={wellnessCards}
            renderItem={renderWellnessCard}
            keyExtractor={(item: any) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={screenWidth - 48}
            decelerationRate="fast"
            onScroll={onCarouselScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.carouselContent}
          />
          <View style={styles.paginationDots}>
            {wellnessCards.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === carouselIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Mood Trends Card */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.moodTrendsCard}>
          <View style={styles.moodTrendsHeader}>
            <Text style={styles.moodTrendsTitle}>Mood Trends</Text>
            <TouchableOpacity style={styles.heartIcon}>
              <Text style={styles.heartIconText}>♡</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysContainer}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <View key={day} style={styles.dayColumn}>
                <View style={[styles.moodPill, index < 5 && styles.moodPillActive]} />
                <Text style={styles.dayLabel}>{day}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statGridCard}>
              <Text style={styles.statGridTitle}>Workouts</Text>
              <Text style={styles.statGridNumber}>12</Text>
              <Text style={styles.statGridSubtext}>this week</Text>
            </View>
            <View style={styles.statGridCard}>
              <Text style={styles.statGridTitle}>Meditation</Text>
              <Text style={styles.statGridNumber}>45</Text>
              <Text style={styles.statGridSubtext}>minutes</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statGridCard}>
              <Text style={styles.statGridTitle}>Journal</Text>
              <Text style={styles.statGridNumber}>5</Text>
              <Text style={styles.statGridSubtext}>entries</Text>
            </View>
            <View style={styles.statGridCard}>
              <Text style={styles.statGridTitle}>Sleep</Text>
              <Text style={styles.statGridNumber}>7.5</Text>
              <Text style={styles.statGridSubtext}>avg hours</Text>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
      <FloatingActionMenu />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  scrollView: {
    flex: 1,
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
    marginBottom: 40,
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
    color: '#A8B5A8',
    lineHeight: 24,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#A8B5A8',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 32,
    marginBottom: 16,
    marginLeft: 24,
    color: '#4A4A4A',
  },
  card: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 32,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
    marginLeft: 12,
  },
  moodCard: {
    backgroundColor: '#A8B5A8',
    height: 280,
    justifyContent: 'flex-end',
  },
  moodCardContent: {
    padding: 32,
    flex: 1,
    justifyContent: 'flex-end',
  },
  moodTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  moodTagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  moodTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 20,
    lineHeight: 32,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
    marginRight: 8,
  },
  readMoreArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  carouselContainer: {
    marginBottom: 32,
    height: 320,
  },
  carouselContent: {
    paddingHorizontal: 16,
  },
  wellnessCard: {
    width: screenWidth - 64,
    height: 280,
    borderRadius: 24,
    marginHorizontal: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },

  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: '#A8B5A8',
    width: 24,
  },
  moodTrendsCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    padding: 32,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  moodTrendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  moodTrendsTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
  },
  heartIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIconText: {
    fontSize: 24,
    color: '#B8B8B8',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  moodPill: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8E8E8',
    marginBottom: 12,
  },
  moodPillActive: {
    backgroundColor: '#A8B5A8',
  },
  dayLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#8B8B8B',
  },
  statsGrid: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statGridCard: {
    flex: 1,
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  statGridTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#8B8B8B',
    marginBottom: 8,
  },
  statGridNumber: {
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
    marginBottom: 4,
  },
  statGridSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#8B8B8B',
  },
});