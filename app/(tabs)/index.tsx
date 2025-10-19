import FloatingActionMenu from '@/components/floating-action-menu';
import { SpotifyService } from '@/services/spotify-service';
import { Bell, Calendar, Clock, ExternalLink, Music, Smile, Star, Trophy } from 'lucide-react-native';
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

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    loadPlaylistInfo();
  }, []);

  const loadPlaylistInfo = async () => {
    setIsLoadingPlaylist(true);
    try {
      const info = await SpotifyService.getPlaylistInfo('6EUwvbjPTOYUTyWuuTTvo8');
      setPlaylistInfo(info);
    } catch (error) {
      console.error('Error loading playlist info:', error);
      // Keep the default values if API fails
    } finally {
      setIsLoadingPlaylist(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Hello, Ken! 👋</Text>
            <Text style={styles.headerSubtitle}>{currentDate}</Text>
          </View>
          <TouchableOpacity style={styles.bellIcon}>
            <Bell color="#2D3748" size={22} />
          </TouchableOpacity>
        </Animated.View>

        {/* Mood & Feeling Card */}
        <Animated.View entering={FadeInLeft.delay(200)} style={[styles.card, styles.moodCard]}>
          <View style={styles.cardHeader}>
            <Smile color="#48BB78" size={26} />
            <Text style={styles.cardTitle}>How You're Feeling</Text>
          </View>
          <Text style={styles.moodText}>😊 Happy this week</Text>
          <Text style={styles.moodSubtext}>Keep up the positive energy!</Text>
        </Animated.View>

        {/* Recent Achievements */}
        <Animated.Text entering={FadeInRight.delay(300)} style={styles.sectionTitle}>Recent Achievements</Animated.Text>
        <Animated.View entering={FadeInUp.delay(400)} style={styles.achievementsContainer}>
          <Animated.View entering={FadeInLeft.delay(500)} style={[styles.achievementCard, { backgroundColor: '#E6FFFA' }]}>
            <Trophy color="#319795" size={22} />
            <Text style={styles.achievementTitle}>Academic Excellence</Text>
            <Text style={styles.achievementText}>Got an A in CS 500 level class</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInRight.delay(600)} style={[styles.achievementCard, { backgroundColor: '#FFFAF0' }]}>
            <Star color="#D69E2E" size={22} />
            <Text style={styles.achievementTitle}>Leadership</Text>
            <Text style={styles.achievementText}>Promoted as Club President</Text>
          </Animated.View>
        </Animated.View>

        {/* Upcoming Events */}
        <Animated.Text entering={FadeInLeft.delay(700)} style={styles.sectionTitle}>Upcoming Events</Animated.Text>
        <Animated.View entering={FadeInRight.delay(800)} style={[styles.card, styles.eventCard]}>
          <View style={styles.cardHeader}>
            <Calendar color="#E53E3E" size={26} />
            <Text style={styles.cardTitle}>Calendar Reminder</Text>
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle}>🍽️ Dinner Celebration</Text>
            <View style={styles.eventTime}>
              <Clock color="#718096" size={18} />
              <Text style={styles.eventTimeText}>Sunday, Oct 19th at 7:00 PM</Text>
            </View>
          </View>
        </Animated.View>

        {/* Current Vibe */}
        <Animated.Text entering={FadeInRight.delay(900)} style={styles.sectionTitle}>Current Vibe</Animated.Text>
        <Animated.View entering={FadeInLeft.delay(1000)} style={[styles.card, styles.vibeCard]}>
          <Text style={styles.vibeText}>✨ "Good feeling about winning this hackathon!"</Text>
          <Text style={styles.vibeSubtext}>Stay confident and keep pushing forward</Text>
        </Animated.View>

        {/* Now Playing */}
        <Animated.Text entering={FadeInLeft.delay(1100)} style={styles.sectionTitle}>Now Playing</Animated.Text>
        <Animated.View entering={FadeInRight.delay(1200)} style={[styles.card, styles.musicCard]}>
          <View style={styles.cardHeader}>
            <Music color="#48BB78" size={26} />
            <Text style={styles.cardTitle}>Featured Playlist</Text>
          </View>
          <TouchableOpacity 
            onPress={() => Linking.openURL(playlistInfo.url)}
            style={styles.spotifyContainer}
          >
            <View style={styles.spotifyContent}>
              <View style={styles.spotifyInfo}>
                <Text style={styles.musicTitle}>🎵 {playlistInfo.name}</Text>
                <Text style={styles.musicArtist}>by {playlistInfo.owner}</Text>
                <Text style={styles.spotifyDescription}>
                  {playlistInfo.description}
                  {playlistInfo.trackCount > 0 && ` • ${playlistInfo.trackCount} tracks`}
                </Text>
              </View>
              <View style={styles.spotifyButton}>
                <Text style={styles.spotifyButtonText}>
                  {isLoadingPlaylist ? 'Loading...' : 'Open in Spotify'}
                </Text>
              </View>
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
          <Animated.View entering={FadeInLeft.delay(1500)} style={[styles.statCard, { backgroundColor: '#F0FFF4' }]}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>A Grade</Text>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(1600)} style={[styles.statCard, { backgroundColor: '#FFFAF0' }]}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Promotion</Text>
          </Animated.View>
          <Animated.View entering={FadeInRight.delay(1700)} style={[styles.statCard, { backgroundColor: '#FAF5FF' }]}>
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
            style={[styles.card, styles.articleCard]}
          >
            <TouchableOpacity 
              onPress={() => Linking.openURL(article.url)}
              style={styles.articleTouchable}
            >
              <View style={styles.articleContent}>
                <View style={styles.articleTextContent}>
                  <View style={styles.articleHeader}>
                    <Text style={styles.articleTitle}>{article.title}</Text>
                    <ExternalLink color="#718096" size={18} />
                  </View>
                  <Text style={styles.articleSource}>{article.source}</Text>
                  <Text style={styles.articleDescription}>{article.description}</Text>
                </View>
                <Image 
                  source={{ uri: article.thumbnail }} 
                  style={styles.articleThumbnail}
                  resizeMode="cover"
                />
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
    backgroundColor: '#F7FAFC',
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
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#1A202C',
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    marginTop: 4,
  },
  bellIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 32,
    marginBottom: 16,
    marginLeft: 24,
    color: '#2D3748',
  },
  card: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#2D3748',
    marginLeft: 12,
  },
  moodCard: {
    backgroundColor: '#F0FFF4',
    borderColor: '#9AE6B4',
  },
  moodText: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#22543D',
    marginBottom: 8,
  },
  moodSubtext: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#38A169',
  },
  achievementsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 8,
  },
  achievementCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#2D3748',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  achievementText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
  },
  eventCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEB2B2',
  },
  eventDetails: {
    marginTop: 8,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTimeText: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: '#718096',
    marginLeft: 8,
  },
  vibeCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F6E05E',
  },
  vibeText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#744210',
    marginBottom: 8,
    lineHeight: 24,
  },
  vibeSubtext: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#A0792C',
  },
  musicCard: {
    backgroundColor: '#F0FFF4',
    borderColor: '#9AE6B4',
  },
  spotifyContainer: {
    marginTop: 8,
  },
  spotifyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spotifyInfo: {
    flex: 1,
    marginRight: 16,
  },
  musicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#2D3748',
    marginBottom: 6,
  },
  musicArtist: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    marginBottom: 8,
  },
  spotifyDescription: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#4A5568',
    lineHeight: 18,
  },
  spotifyButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotifyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
  },
  playlistImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#2D3748',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#718096',
    textAlign: 'center',
  },
  articleCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E0',
  },
  articleTouchable: {
    flex: 1,
  },
  articleContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  articleTextContent: {
    flex: 1,
    marginRight: 16,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#2D3748',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  articleSource: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#718096',
    marginBottom: 12,
  },
  articleDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#4A5568',
    lineHeight: 20,
  },
  articleThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
});