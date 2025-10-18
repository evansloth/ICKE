import FloatingActionMenu from '@/components/floating-action-menu';
import { useRouter } from 'expo-router';
import { BookOpen, Clock, Plus } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
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
    { id: '1', title: 'Afternoon Walk Journal', icon: '🌲', date: 'Saturday, Oct 18, 2025' },
    { id: '2', title: 'Morning Reflection', icon: '☀️', date: 'Friday, Oct 17, 2025' },
    { id: '3', title: 'Evening Thoughts', icon: '🌙', date: 'Thursday, Oct 16, 2025' },
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

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/view-journal')}
      >
        <Animated.View
          style={[
            styles.carouselItem,
            {
              transform: [{ scale }, { perspective: 1000 }, { rotateY }],
              opacity,
            },
          ]}
        >
          <View style={styles.carouselIcon}>
            <Text style={styles.carouselIconText}>{item.icon}</Text>
          </View>
          <Text style={styles.carouselTitle}>{item.title}</Text>
          <View style={styles.carouselDivider} />
          <Text style={styles.carouselDate}>{item.date}</Text>
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
          <Text style={styles.journalTitle}>Journal</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/write-journal' as any)}
          >
            <Plus color="#fff" size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Clock size={14} color="#FF8D00" />
            <Text style={styles.statText}>26 hr</Text>
          </View>
          <View style={styles.statItem}>
            <BookOpen size={13} color="#007DE2" />
            <Text style={styles.statText}>14</Text>
          </View>
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
          <View style={styles.suggestionCard}>
            <Image
              source={require('@/assets/images/sun2.png')}
              style={styles.suggestionImage}
            />
            <Text style={styles.suggestionDescription}>Write about your day</Text>
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.suggestionCard}>
            <Image
              source={require('@/assets/images/heart2.png')}
              style={styles.suggestionImage}
            />
            <Text style={styles.suggestionDescription}>What makes you happy?</Text>
            <TouchableOpacity style={styles.startButton}>
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
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 8,
  },
  journalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingHorizontal: 18,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    minWidth: 80,
    height: 36,
  },
  statText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 8,
  },
  calendarContainer: {
    marginTop: 18,
    maxHeight: 65,
  },
  calendarContent: {
    paddingHorizontal: 18,
  },
  dayItem: {
    width: 50,
    height: 65,
    borderRadius: 16,
    backgroundColor: '#F2F5F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activeDayItem: {
    backgroundColor: '#007DE2',
  },
  dayText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#B3B3B3',
  },
  activeDayText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
  },
  dateText: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#B3B3B3',
    marginTop: 2,
  },
  activeDateText: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    marginTop: 2,
  },
  carouselContainer: {
    marginTop: 20,
    height: 220,
  },
  carouselContent: {
    paddingHorizontal: 26,
  },
  carouselItem: {
    width: screenWidth - 52,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 0,
    padding: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  carouselIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8BC34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  carouselIconText: {
    fontSize: 32,
  },
  carouselTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    marginBottom: 8,
  },
  carouselDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  carouselDate: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#999',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#007DE2',
    width: 24,
  },
  suggestionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginLeft: 21,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 21,
    marginTop: 10,
    gap: 12,
  },
  suggestionCard: {
    width: 175,
    height: 175,
    backgroundColor: '#F2F5F4',
    borderRadius: 25,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
  suggestionImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  suggestionDescription: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#000',
    textAlign: 'center',
    paddingHorizontal: 4,
    marginVertical: 8,
  },
  startButton: {
    width: 130,
    height: 38,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  startButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
  },
});

