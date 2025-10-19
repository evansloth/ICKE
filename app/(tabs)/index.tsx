import FloatingActionMenu from '@/components/floating-action-menu';
import { Calendar, Clock, ExternalLink, Music, Star, Trophy } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Linking, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeInDown,
    FadeInLeft,
    FadeInRight,
    FadeInUp
} from 'react-native-reanimated';

// Hardcoded articles data
const articles = [
  {
    title: "Lehigh University Introduces Denim Research Initiative",
    source: "Campus Style Weekly",
    description: "Lehigh University announced a new sustainability-focused program exploring eco-friendly denim production. Fashion and engineering students will collaborate to create durable jeans made from recycled cotton and water-saving dye techniques.",
    url: "https://www.lehigh.edu/denim-initiative",
    thumbnail: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f"
  },
  {
    title: "Dot's Pretzels Expands Nationwide with New Flavors",
    source: "Snack Industry Journal",
    description: "Dot's Pretzels, known for its signature buttery seasoning, has launched two new flavors — Honey Mustard Ranch and Spicy Cheddar. The brand plans to increase supermarket presence across all 50 states by mid-2025.",
    url: "https://www.dotspretzels.com/new-flavors",
    thumbnail: "https://images.unsplash.com/photo-1604909052743-112c5f3f43c1"
  },
  {
    title: "U.S. Retail Trends Show Surge in Personalized Fashion",
    source: "Retail Insights Daily",
    description: "Consumers are shifting toward customizable jeans and snack bundles, with brands like Levi's and Dot's Pretzels offering build-your-own kits online. Experts predict personalization will dominate Gen Z retail habits in 2025.",
    url: "https://www.retailinsights.com/personalization-trends",
    thumbnail: "https://images.unsplash.com/photo-1542272604-787c3835535d"
  }
];

export default function DiscoverPage() {
  const [playlistInfo, setPlaylistInfo] = useState({
    name: 'Study Vibes',
    description: 'Perfect background music for focused work and study sessions',
    imageUrl: '',
    trackCount: 0,
    owner: 'Unknown',
    url: 'https://open.spotify.com/playlist/6EUwvbjPTOYUTyWuuTTvo8'
  });
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Wellness cards data
  const wellnessCards = [
    {
      category: 'Mindfulness',
      title: 'The Power of Morning Meditation',
      description: 'Start your day with intention and clarity through guided meditation practices.',
    },
    {
      category: 'Nutrition',
      title: 'Balanced Eating for Better Energy',
      description: 'Discover how proper nutrition can boost your daily energy levels.',
    },
    {
      category: 'Exercise',
      title: 'Quick Workouts for Busy Days',
      description: 'Effective 15-minute routines that fit into any schedule.',
    },
    {
      category: 'Sleep',
      title: 'Creating the Perfect Sleep Environment',
      description: 'Tips for optimizing your bedroom for better rest and recovery.',
    }
  ];

  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <TouchableOpacity style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wellness</Text>
          <TouchableOpacity style={styles.profileIcon}>
            <View style={styles.profileCircle} />
          </TouchableOpacity>
        </Animated.View>

        {/* Catch-Up Section */}
        <Animated.View entering={FadeInLeft.delay(200)} style={styles.catchUpSection}>
          <Text style={styles.catchUpTitle}>Catch-Up</Text>
          <Text style={styles.catchUpSubtitle}>Your daily wellness insights</Text>
        </Animated.View>

        {/* Wellness Cards Carousel */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.carouselContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
              setCurrentCardIndex(index);
            }}
            style={styles.carousel}
          >
            {wellnessCards.map((card, index) => (
              <Animated.View 
                key={index}
                entering={FadeInRight.delay(400 + (index * 100))}
                style={styles.wellnessCard}
              >
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{card.category}</Text>
                </View>
                <Text style={styles.wellnessTitle}>{card.title}</Text>
                <TouchableOpacity style={styles.readMoreButton}>
                  <Text style={styles.readMoreText}>Read more</Text>
                  <Text style={styles.readMoreArrow}>›</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
          
          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {wellnessCards.map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentCardIndex && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Recent Achievements */}
        <Animated.Text entering={FadeInRight.delay(300)} style={styles.sectionTitle}>Recent Achievements</Animated.Text>
        <Animated.View entering={FadeInUp.delay(400)} style={styles.achievementsContainer}>
          <Animated.View entering={FadeInLeft.delay(500)} style={styles.achievementCard}>
            <Trophy color="#FFFFFF" size={22} />
            <Text style={styles.achievementTitle}>Academic Excellence</Text>
            <Text style={styles.achievementText}>Got an A in CS 500 level class</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInRight.delay(600)} style={styles.achievementCard}>
            <Star color="#FFFFFF" size={22} />
            <Text style={styles.achievementTitle}>Leadership</Text>
            <Text style={styles.achievementText}>Promoted as Club President</Text>
          </Animated.View>
        </Animated.View>

        {/* Upcoming Events */}
        <Animated.Text entering={FadeInLeft.delay(700)} style={styles.sectionTitle}>Upcoming Events</Animated.Text>
        <Animated.View entering={FadeInRight.delay(800)} style={styles.eventCard}>
          <View style={styles.eventIconContainer}>
            <Calendar color="#FFFFFF" size={24} />
          </View>
          <Text style={styles.eventTitle}>🍽️ Dinner Celebration</Text>
          <View style={styles.eventTime}>
            <Clock color="rgba(255, 255, 255, 0.8)" size={16} />
            <Text style={styles.eventTimeText}>Sunday, Oct 19th at 7:00 PM</Text>
          </View>
        </Animated.View>

        {/* Current Vibe */}
        <Animated.Text entering={FadeInRight.delay(900)} style={styles.sectionTitle}>Current Vibe</Animated.Text>
        <Animated.View entering={FadeInLeft.delay(1000)} style={styles.vibeCard}>
          <Text style={styles.vibeText}>✨ "Good feeling about winning this hackathon!"</Text>
          <Text style={styles.vibeSubtext}>Stay confident and keep pushing forward</Text>
        </Animated.View>

        {/* Now Playing */}
        <Animated.Text entering={FadeInLeft.delay(1100)} style={styles.sectionTitle}>Now Playing</Animated.Text>
        <Animated.View entering={FadeInRight.delay(1200)} style={styles.musicCard}>
          <View style={styles.musicIconContainer}>
            <Music color="#FFFFFF" size={24} />
          </View>
          <TouchableOpacity 
            onPress={() => Linking.openURL(playlistInfo.url)}
            style={styles.spotifyContainer}
          >
            <Text style={styles.musicTitle}>🎵 {playlistInfo.name}</Text>
            <Text style={styles.musicArtist}>by {playlistInfo.owner}</Text>
            <Text style={styles.spotifyDescription}>
              {playlistInfo.description}
              {playlistInfo.trackCount > 0 && ` • ${playlistInfo.trackCount} tracks`}
            </Text>
            <View style={styles.spotifyButton}>
              <Text style={styles.spotifyButtonText}>
                {isLoadingPlaylist ? 'Loading...' : 'Open in Spotify'}
              </Text>
              <Text style={styles.readMoreArrow}>›</Text>
            </View>
            {playlistInfo.imageUrl && (
              <Image 
                source={{ uri: playlistInfo.imageUrl }} 
                style={styles.playlistImage}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.Text entering={FadeInRight.delay(1300)} style={styles.sectionTitle}>This Week's Highlights</Animated.Text>
        <Animated.View entering={FadeInUp.delay(1400)} style={styles.statsContainer}>
          <Animated.View entering={FadeInLeft.delay(1500)} style={styles.statCard}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>A Grade</Text>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(1600)} style={styles.statCard}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Promotion</Text>
          </Animated.View>
          <Animated.View entering={FadeInRight.delay(1700)} style={styles.statCard}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Confidence</Text>
          </Animated.View>
        </Animated.View>

        {/* Articles Section */}
        <Animated.Text entering={FadeInLeft.delay(1800)} style={styles.sectionTitle}>Latest Articles</Animated.Text>
        {articles.map((article, index) => (
          <Animated.View 
            key={index}
            entering={FadeInRight.delay(1900 + (index * 100))} 
            style={styles.articleCard}
          >
            <TouchableOpacity 
              onPress={() => Linking.openURL(article.url)}
              style={styles.articleTouchable}
            >
              <View style={styles.articleHeader}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <ExternalLink color="rgba(255, 255, 255, 0.8)" size={18} />
              </View>
              <Text style={styles.articleSource}>{article.source}</Text>
              <Text style={styles.articleDescription}>{article.description}</Text>
              <View style={styles.readMoreButton}>
                <Text style={styles.readMoreText}>Read more</Text>
                <Text style={styles.readMoreArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

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
  menuIcon: {
    width: 24,
    height: 24,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: '#8B8B8B',
    borderRadius: 1,
  },
  headerTitle: {
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
  catchUpSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  catchUpTitle: {
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
    marginBottom: 8,
  },
  catchUpSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#8B8B8B',
    lineHeight: 24,
  },
  carouselContainer: {
    marginBottom: 40,
  },
  carousel: {
    paddingLeft: 24,
  },
  wellnessCard: {
    width: 320,
    height: 400,
    backgroundColor: '#A8B5A8',
    borderRadius: 24,
    padding: 32,
    marginRight: 16,
    justifyContent: 'flex-end',
  },
  categoryTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
    fontWeight: '500',
  },
  wellnessTitle: {
    fontSize: 28,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    lineHeight: 36,
    marginBottom: 24,
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  paginationDotActive: {
    backgroundColor: '#A8B5A8',
    width: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 40,
    marginBottom: 20,
    marginLeft: 24,
    color: '#4A4A4A',
  },
  achievementsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 20,
  },
  achievementCard: {
    flex: 1,
    backgroundColor: '#A8B5A8',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  eventCard: {
    backgroundColor: '#A8B5A8',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    minHeight: 160,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTimeText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
  },
  vibeCard: {
    backgroundColor: '#A8B5A8',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    minHeight: 140,
    justifyContent: 'center',
  },
  vibeText: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 28,
  },
  vibeSubtext: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  musicCard: {
    backgroundColor: '#A8B5A8',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    minHeight: 180,
  },
  musicIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  spotifyContainer: {
    flex: 1,
  },
  musicTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  musicArtist: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  spotifyDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  spotifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginRight: 8,
  },
  playlistImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#A8B5A8',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  articleCard: {
    backgroundColor: '#A8B5A8',
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    minHeight: 160,
  },
  articleTouchable: {
    flex: 1,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  articleSource: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  articleDescription: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 16,
  },
});