import FloatingActionMenu from '@/components/floating-action-menu';
import { useRouter } from 'expo-router';
import { BookOpen, Clock, Plus } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const generateDates = (startDate: Date, count: number, startIndex: number = 0) => {
  const dates = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'];
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const uniqueId = startIndex + i;
    dates.push({
      id: `date-${uniqueId}-${date.getTime()}`,
      day: dayNames[date.getDay()],
      date: date.getDate(),
      isActive: uniqueId === 2, // Make the third item active
    });
  }
  return dates;
};

export default function JournalPage() {
  const router = useRouter();
  const [dates, setDates] = useState(generateDates(new Date(2024, 9, 15), 20));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const carouselRef = useRef<FlatList>(null);

  const loadMoreDates = () => {
    const lastDate = new Date(2024, 9, 15);
    lastDate.setDate(15 + dates.length);
    const newDates = generateDates(lastDate, 10, dates.length);
    setDates([...dates, ...newDates]);
  };

  const renderDateItem = ({ item }: { item: any }) => (
    <View style={[styles.dayItem, item.isActive && styles.activeDayItem]}>
      <Text style={item.isActive ? styles.activeDayText : styles.dayText}>{item.day}</Text>
      <Text style={item.isActive ? styles.activeDateText : styles.dateText}>{item.date}</Text>
    </View>
  );

  const carouselData = [
  { 
    id: '1', 
    title: 'Afternoon Walk Journal', 
    date: 'Saturday, Oct 18, 2025', 
    backgroundColor: '#A8B5A8',
    text: 'A calm walk through the park helped me slow down and reconnect with the present moment.'
  },
  { 
    id: '2', 
    title: 'Morning Reflection', 
    date: 'Friday, Oct 17, 2025', 
    backgroundColor: '#B8A8B5',
    text: 'Started the day with gratitude and a cup of tea — small rituals, big impact.'
  },
  { 
    id: '3', 
    title: 'Evening Thoughts', 
    date: 'Thursday, Oct 16, 2025', 
    backgroundColor: '#A8B8B5',
    text: 'The sunset reminded me that endings can be peaceful too.'
  },
  { 
    id: '4', 
    title: 'Mindful Monday', 
    date: 'Monday, Oct 13, 2025', 
    backgroundColor: '#B8A8B5',
    text: 'Focused on breathing between meetings — it made the whole day feel lighter.'
  },
  { 
    id: '5', 
    title: 'Wellness Wednesday', 
    date: 'Wednesday, Oct 15, 2025', 
    backgroundColor: '#A8B5A8',
    text: 'Took time to stretch and hydrate — simple actions that fueled my energy.'
  },
  { 
    id: '6', 
    title: 'Gratitude Journal', 
    date: 'Tuesday, Oct 14, 2025', 
    backgroundColor: '#B8A8B5',
    text: 'Listed three things I was thankful for — and felt my mood lift instantly.'
  },
  { 
    id: '7', 
    title: 'Self-Care Sunday', 
    date: 'Sunday, Oct 12, 2025', 
    backgroundColor: '#A8B5A8',
    text: 'Unplugged for a few hours to read and rest — it felt like a quiet reset.'
  },
  { 
    id: '8', 
    title: 'Focus Friday', 
    date: 'Friday, Oct 10, 2025', 
    backgroundColor: '#B8A8B5',
    text: 'Tuned out distractions and worked deeply — a satisfying end to the week.'
  },
];


  const scrollX = useRef(new Animated.Value(0)).current;

  const renderCarouselItem = ({ item, index }: { item: any; index: number }) => {
    const inputRange = [
      (index - 1) * (screenWidth - 52),
      index * (screenWidth - 52),
      (index + 1) * (screenWidth - 52),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    const rotateY = scrollX.interpolate({
      inputRange,
      outputRange: ['-15deg', '0deg', '15deg'],
      extrapolate: 'clamp',
    });

    const handleCarouselItemPress = () => {
      router.push({
        pathname: '/view-journal',
        params: {
          text: item.text,
          title: item.title,
          date: item.date,
          backgroundColor: item.backgroundColor
        }
      });
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleCarouselItemPress}
      >
        <Animated.View
          style={[
            styles.carouselItem,
            { backgroundColor: item.backgroundColor },
            {
              transform: [{ scale }, { perspective: 1000 }, { rotateY }],
              opacity,
            },
          ]}
        >
          <View style={styles.journalCardContent}>
            <Text style={styles.journalCardTitle}>{item.title}</Text>
            <Text style={styles.journalCardDate}>{item.date}</Text>
            <TouchableOpacity style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>Read more</Text>
              <Text style={styles.readMoreArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const onCarouselScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const slideSize = screenWidth - 52;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        setCarouselIndex(index);
      },
    }
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Journal</Text>
          <TouchableOpacity 
            style={styles.headerAddButton}
            onPress={() => router.push('/write-journal' as any)}
          >
            <Plus color="#FFFFFF" size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Your Entries</Text>
          <Text style={styles.mainSubtitle}>Capture your thoughts and reflections</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statItem, { backgroundColor: '#E8F5E8' }]}>
            <Clock size={16} color="#A8B5A8" />
            <Text style={styles.statText}>26 hr</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: '#F0E8F5' }]}>
            <BookOpen size={16} color="#B8A8B5" />
            <Text style={styles.statText}>14</Text>
          </View>
          <TouchableOpacity 
            style={[styles.statItem, styles.addButton]}
            onPress={() => router.push('/write-journal' as any)}
          >
            <Plus color="#FFFFFF" size={16} />
            <Text style={[styles.statText, { color: '#FFFFFF' }]}>New</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={dates}
          renderItem={renderDateItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.calendarContainer}
          contentContainerStyle={styles.calendarContent}
          onEndReached={loadMoreDates}
          onEndReachedThreshold={0.5}
        />

        <View style={styles.carouselContainer}>
          <AnimatedFlatList
            ref={carouselRef}
            data={carouselData}
            renderItem={renderCarouselItem}
            keyExtractor={(item: any) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={screenWidth - 52}
            decelerationRate="fast"
            onScroll={onCarouselScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.carouselContent}
          />
          <View style={styles.paginationDots}>
            {carouselData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === carouselIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        <Text style={styles.suggestionsTitle}>Suggestions</Text>

        <View style={styles.suggestionsContainer}>
          <View style={[styles.suggestionCard, { backgroundColor: '#E8F5E8' }]}>
            <Image
              source={require('@/assets/images/sun2.png')}
              style={styles.suggestionImage}
            />
            <Text style={styles.suggestionDescription}>Write about your day</Text>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => router.push({
                pathname: '/write-journal',
                params: { 
                  suggestionType: 'daily',
                  suggestionTitle: 'Write about your day'
                }
              } as any)}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.suggestionCard, { backgroundColor: '#F0E8F5' }]}>
            <Image
              source={require('@/assets/images/heart2.png')}
              style={styles.suggestionImage}
            />
            <Text style={styles.suggestionDescription}>What makes you happy?</Text>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => router.push({
                pathname: '/write-journal',
                params: { 
                  suggestionType: 'happiness',
                  suggestionTitle: 'What makes you happy?'
                }
              } as any)}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{ height: 80 }} />
      </ScrollView>
      
      {/* Journal editor moved to a dedicated page at /write-journal */}
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
    backgroundColor: '#F5F5F0',
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
  headerAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A8B5A8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  addButton: {
    backgroundColor: '#A8B5A8',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    paddingHorizontal: 24,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 90,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statText: {
    color: '#4A4A4A',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 8,
  },
  calendarContainer: {
    marginBottom: 32,
    maxHeight: 70,
  },
  calendarContent: {
    paddingHorizontal: 24,
  },
  dayItem: {
    width: 56,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeDayItem: {
    backgroundColor: '#A8B5A8',
  },
  dayText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#8B8B8B',
  },
  activeDayText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
    marginTop: 2,
  },
  activeDateText: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  carouselContainer: {
    marginBottom: 32,
    height: 280,
  },
  carouselContent: {
    paddingHorizontal: 24,
  },
  carouselItem: {
    width: screenWidth - 48,
    height: 240,
    borderRadius: 24,
    marginRight: 0,
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  journalCardContent: {
    padding: 32,
  },
  journalCardTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 32,
  },
  journalCardDate: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
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
  suggestionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#4A4A4A',
    marginTop: 32,
    marginLeft: 24,
    marginBottom: 16,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  suggestionCard: {
    width: 180,
    height: 180,
    borderRadius: 24,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  suggestionDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4A4A4A',
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 12,
    marginBottom: 40,
    lineHeight: 20,
  },
  startButton: {
    width: 140,
    height: 40,
    backgroundColor: '#A8B5A8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  startButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
});

