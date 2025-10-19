import FloatingActionMenu from '@/components/floating-action-menu';
import { Calendar, Clock, Music, Star, Trophy } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
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
      <View
        style={[
          styles.wellnessCard,
          { backgroundColor: item.backgroundColor }
        ]}
      >
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
          <TouchableOpacity style={styles.profileIcon}>
            <View style={styles.profileCircle} />
          </TouchableOpacity>
        </Animated.View>

        {/* Main Title Section */}
        <Animated.View entering={FadeInLeft.delay(200)} style={styles.titleSection}>
          <Text style={styles.mainTitle}>Catch-Up</Text>
          <Text style={styles.mainSubtitle}>Welcome back, Ken</Text>
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

        {/* Recent Achievements */}
        <Animated.Text entering={FadeInRight.delay(400)} style={styles.sectionTitle}>Recent Achievements</Animated.Text>
        <Animated.View entering={FadeInUp.delay(500)} style={styles.achievementsContainer}>
          <Animated.View entering={FadeInLeft.delay(600)} style={[styles.achievementCard, { backgroundColor: '#E8F5E8' }]}>
            <Trophy color="#A8B5A8" size={22} />
            <Text style={styles.achievementTitle}>Academic Excellence</Text>
            <Text style={styles.achievementText}>Got an A in CS 500 level class</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInRight.delay(700)} style={[styles.achievementCard, { backgroundColor: '#F0E8F5' }]}>
            <Star color="#B8A8B5" size={22} />
            <Text style={styles.achievementTitle}>Leadership</Text>
            <Text style={styles.achievementText}>Promoted as Club President</Text>
          </Animated.View>
        </Animated.View>

        {/* Upcoming Events */}
        <Animated.Text entering={FadeInLeft.delay(800)} style={styles.sectionTitle}>Upcoming Events</Animated.Text>
        <Animated.View entering={FadeInRight.delay(900)} style={[styles.card, styles.eventCard, { backgroundColor: '#E8F0F5' }]}>
          <View style={styles.cardHeader}>
            <Calendar color="#A8B8B5" size={26} />
            <Text style={styles.cardTitle}>Calendar Reminder</Text>
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle}>Dinner Celebration</Text>
            <View style={styles.eventTime}>
              <Clock color="#A8B8B5" size={18} />
              <Text style={styles.eventTimeText}>Sunday, Oct 19th at 7:00 PM</Text>
            </View>
          </View>
        </Animated.View>

        {/* Current Vibe */}
        <Animated.Text entering={FadeInRight.delay(1000)} style={styles.sectionTitle}>Current Vibe</Animated.Text>
        <Animated.View entering={FadeInLeft.delay(1100)} style={[styles.card, styles.vibeCard, { backgroundColor: '#F5F0E8' }]}>
          <Text style={styles.vibeText}>"Good feeling about winning this hackathon!"</Text>
          <Text style={styles.vibeSubtext}>Stay confident and keep pushing forward</Text>
        </Animated.View>

        {/* Now Playing */}
        <Animated.Text entering={FadeInLeft.delay(1200)} style={styles.sectionTitle}>Now Playing</Animated.Text>
        <Animated.View entering={FadeInRight.delay(1300)} style={[styles.card, styles.musicCard, { backgroundColor: '#E8F5F0' }]}>
          <View style={styles.cardHeader}>
            <Music color="#A8B5A8" size={26} />
            <Text style={styles.cardTitle}>Most Recent Track</Text>
          </View>
          <Text style={styles.musicTitle}>LOVE.</Text>
          <Text style={styles.musicArtist}>Kendrick Lamar</Text>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.Text entering={FadeInRight.delay(1400)} style={styles.sectionTitle}>This Week's Highlights</Animated.Text>
        <Animated.View entering={FadeInUp.delay(1500)} style={styles.statsContainer}>
          <Animated.View entering={FadeInLeft.delay(1600)} style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>A Grade</Text>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(1700)} style={[styles.statCard, { backgroundColor: '#F0E8F5' }]}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Promotion</Text>
          </Animated.View>
          <Animated.View entering={FadeInRight.delay(1800)} style={[styles.statCard, { backgroundColor: '#E8F0F5' }]}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Confidence</Text>
          </Animated.View>
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
    color: '#8B8B8B',
    lineHeight: 24,
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
    justifyContent: 'flex-end',
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
  achievementsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 8,
  },
  achievementCard: {
    flex: 1,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#8B8B8B',
    textAlign: 'center',
    lineHeight: 20,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
  },
  eventDetails: {
    marginTop: 8,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
    marginBottom: 12,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTimeText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#8B8B8B',
    marginLeft: 8,
  },
  vibeCard: {
    backgroundColor: '#FFFFFF',
  },
  vibeText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
    marginBottom: 8,
    lineHeight: 26,
  },
  vibeSubtext: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#8B8B8B',
  },
  musicCard: {
    backgroundColor: '#FFFFFF',
  },
  musicTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
    marginBottom: 6,
  },
  musicArtist: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#8B8B8B',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#8B8B8B',
    textAlign: 'center',
  },
});