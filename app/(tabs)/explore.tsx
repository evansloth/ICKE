import FloatingActionMenu from '@/components/floating-action-menu';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExploreState, type Article } from '@/hooks/use-explore-state';
import * as Haptics from 'expo-haptics';
import { Bell, Heart, RotateCcw, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CATEGORIES = [
  'Entertainment', 'Politics', 'Stock Market', 'Finance',
  'Technology', 'Sports', 'Health', 'Science', 'Art',
  'Business', 'World News'
];



export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const [showTagSelection, setShowTagSelection] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const {
    currentArticles,
    trendingTopics,
    hasMoreArticles,
    isLoading,
    handleSwipe,
    resetState
  } = useExploreState(showTagSelection ? undefined : selectedTags);

  const toggleTag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleContinue = () => {
    if (selectedTags.length > 0) {
      setShowTagSelection(false);
    }
  };

  const handleReset = () => {
    resetState();
  };

  if (showTagSelection) {
    return <TagSelectionScreen
      selectedTags={selectedTags}
      onToggleTag={toggleTag}
      onContinue={handleContinue}
      colorScheme={colorScheme}
    />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Explore
          </Text>
          <TouchableOpacity style={styles.bellIcon}>
            <Bell color="#1E1E1E" size={22} />
          </TouchableOpacity>
        </View>

        {/* Card Stack */}
        <View style={styles.cardContainer}>
          {isLoading ? (
            <LoadingSkeleton />
          ) : hasMoreArticles ? (
            currentArticles.map((article, index) => (
              <SwipeCard
                key={article.id}
                article={article}
                index={index}
                isTop={index === 0}
                onSwipe={handleSwipe}
                colorScheme={colorScheme}
              />
            ))
          ) : (
            <EmptyState onReset={handleReset} colorScheme={colorScheme} />
          )}
        </View>

        {/* Trending Section */}
        {trendingTopics.length > 0 && (
          <TrendingSection topics={trendingTopics} colorScheme={colorScheme} />
        )}

        <FloatingActionMenu />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

function TagSelectionScreen({ selectedTags, onToggleTag, onContinue, colorScheme }: {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onContinue: () => void;
  colorScheme: ReturnType<typeof useColorScheme>;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity style={styles.bellIcon}>
          <Bell color="#1E1E1E" size={22} />
        </TouchableOpacity>
      </View>

      <View style={styles.tagSelectionContent}>
        <Text style={styles.tagSelectionTitle}>
          What interests you?
        </Text>
        <Text style={styles.tagSelectionSubtitle}>
          Select topics you'd like to explore
        </Text>

        <View style={styles.tagsContainer}>
          {CATEGORIES.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagPill,
                selectedTags.includes(tag) && styles.tagPillSelected
              ]}
              onPress={() => onToggleTag(tag)}
            >
              <Text style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.tagTextSelected
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedTags.length === 0 && styles.continueButtonDisabled
          ]}
          onPress={onContinue}
          disabled={selectedTags.length === 0}
        >
          <Text style={[
            styles.continueButtonText,
            selectedTags.length === 0 && styles.continueButtonTextDisabled
          ]}>
            Continue ({selectedTags.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FloatingActionMenu />
    </SafeAreaView>
  );
}

function SwipeCard({ article, index, isTop, onSwipe, colorScheme }: {
  article: Article;
  index: number;
  isTop: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
  colorScheme: ReturnType<typeof useColorScheme>;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-15, 0, 15],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotateZ}deg` },
        { scale: 1 - index * 0.05 }
      ],
      opacity: opacity.value,
      zIndex: 10 - index,
    };
  });

  const handleSwipeComplete = (direction: 'left' | 'right') => {
    'worklet';
    runOnJS(onSwipe)(direction);
  };

  const onGestureEvent = (event: any) => {
    'worklet';
    if (!isTop) return;

    translateX.value = event.translationX;
    translateY.value = event.translationY;
    opacity.value = interpolate(
      Math.abs(event.translationX),
      [0, screenWidth / 2],
      [1, 0.7],
      Extrapolate.CLAMP
    );
  };

  const onGestureEnd = (event: any) => {
    'worklet';
    if (!isTop) return;

    const shouldSwipe = Math.abs(event.translationX) > screenWidth * 0.3;

    if (shouldSwipe) {
      const direction = event.translationX > 0 ? 'right' : 'left';
      // Add haptic feedback on main thread
      runOnJS(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium))();

      translateX.value = withTiming(
        direction === 'right' ? screenWidth : -screenWidth,
        { duration: 300 }
      );
      opacity.value = withTiming(0, { duration: 300 });
      handleSwipeComplete(direction);
    } else {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      opacity.value = withSpring(1);
    }
  };

  const handleButtonPress = (direction: 'left' | 'right') => {
    if (!isTop) return;

    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    translateX.value = withTiming(
      direction === 'right' ? screenWidth : -screenWidth,
      { duration: 300 }
    );
    opacity.value = withTiming(0, { duration: 300 });
    onSwipe(direction);
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onEnded={onGestureEnd}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={[styles.cardContent, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <View style={styles.cardImage}>
            <Text style={styles.imagePlaceholder}>📰</Text>
          </View>

          <View style={styles.cardInfo}>
            <View style={[styles.categoryBadge, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
              <Text style={styles.categoryText}>{article.category}</Text>
            </View>

            <Text style={[styles.cardTitle, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>
              {article.title}
            </Text>

            <Text style={[styles.cardDescription, { color: Colors[colorScheme ?? 'light'].icon }]} numberOfLines={3}>
              {article.description}
            </Text>

            <View style={styles.cardMeta}>
              <Text style={[styles.cardSource, { color: Colors[colorScheme ?? 'light'].icon }]}>
                {article.source} • {article.publishDate}
              </Text>
            </View>
          </View>

          {isTop && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleButtonPress('left')}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.likeButton]}
                onPress={() => handleButtonPress('right')}
              >
                <Heart size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

function TrendingSection({ topics, colorScheme }: {
  topics: string[];
  colorScheme: ReturnType<typeof useColorScheme>;
}) {
  return (
    <View style={[styles.trendingContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <Text style={[styles.trendingTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
        Trending Topics You're Reading
      </Text>
      <View style={styles.trendingTags}>
        {topics.map((topic, index) => (
          <View key={`${topic}-${index}`} style={[styles.trendingTag, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
            <Text style={styles.trendingTagText}>{topic}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EmptyState({ onReset, colorScheme }: {
  onReset: () => void;
  colorScheme: ReturnType<typeof useColorScheme>;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
        🎉 You've seen it all!
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: Colors[colorScheme ?? 'light'].icon }]}>
        No more articles to explore right now.
      </Text>
      <TouchableOpacity
        style={[styles.resetButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
        onPress={onReset}
      >
        <RotateCcw size={20} color="#fff" />
        <Text style={styles.resetButtonText}>Start Over</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tagSelectionContent: {
    flex: 1,
    paddingHorizontal: 21,
    paddingTop: 20,
  },
  tagSelectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E1E1E',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  tagSelectionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Poppins-Regular',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  tagPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagPillSelected: {
    backgroundColor: '#FAD8AE',
    borderColor: '#F4C2A1',
  },
  tagText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  tagTextSelected: {
    color: '#8B4513',
  },
  continueButton: {
    backgroundColor: '#D0757A',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  continueButtonTextDisabled: {
    color: '#999',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 21,
    marginTop: 18,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#1E1E1E',
  },
  bellIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 21,
    marginTop: 20,
  },
  card: {
    position: 'absolute',
    width: screenWidth - 42,
    height: screenHeight * 0.6,
  },
  cardContent: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardImage: {
    height: 180,
    backgroundColor: '#FAD8AE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    fontSize: 48,
  },
  cardInfo: {
    flex: 1,
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 12,
    backgroundColor: '#DCCEFA',
  },
  categoryText: {
    color: '#6B46C1',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 26,
    color: '#1E1E1E',
    fontFamily: 'Poppins-Bold',
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  cardMeta: {
    marginTop: 'auto',
  },
  cardSource: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 55,
    height: 55,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  rejectButton: {
    backgroundColor: '#D0757A',
  },
  likeButton: {
    backgroundColor: '#90C695',
  },
  trendingContainer: {
    paddingHorizontal: 21,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1E1E1E',
    fontFamily: 'Poppins-SemiBold',
  },
  trendingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#DCCEFA',
  },
  trendingTagText: {
    color: '#6B46C1',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1E1E1E',
    fontFamily: 'Poppins-Bold',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    backgroundColor: '#D0757A',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});
