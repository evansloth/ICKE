import FloatingActionMenu from '@/components/floating-action-menu';
import { Bell, Calendar, Clock, Music, Smile, Star, Trophy } from 'lucide-react-native';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp
} from 'react-native-reanimated';

export default function DiscoverPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
            <Text style={styles.cardTitle}>Most Recent Track</Text>
          </View>
          <Text style={styles.musicTitle}>🎵 LOVE.</Text>
          <Text style={styles.musicArtist}>Kendrick Lamar</Text>
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
});