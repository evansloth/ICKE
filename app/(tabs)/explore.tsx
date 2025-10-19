import FloatingActionMenu from '@/components/floating-action-menu';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExploreState, type Article } from '@/hooks/use-explore-state';
import * as Haptics from 'expo-haptics';
import { Heart, RotateCcw, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, Image, Linking, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowTagSelection(true);
            }}
          >
            <Text style={styles.backButtonText}>← Topics ({selectedTags.length})</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Explore
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Card Stack */}
        <View style={styles.cardContainer}>
          {isLoading ? (
            <LoadingSkeleton />
          ) : hasMoreArticles && currentArticles.length > 0 ? (
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
        <TrendingSection topics={trendingTopics} colorScheme={colorScheme} />

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
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Explore</Text>
        <View style={styles.headerSpacer} />
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
      [-15, 0, 15]
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

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (!isTop) return;

      translateX.value = event.translationX;
      translateY.value = event.translationY;
      opacity.value = interpolate(
        Math.abs(event.translationX),
        [0, screenWidth / 2],
        [1, 0.7]
      );
    })
    .onEnd((event) => {
      if (!isTop) return;

      const shouldSwipe = Math.abs(event.translationX) > screenWidth * 0.3;

      if (shouldSwipe) {
        const direction = event.translationX > 0 ? 'right' : 'left';

        // Add haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        translateX.value = withTiming(
          direction === 'right' ? screenWidth : -screenWidth,
          { duration: 300 }
        );
        opacity.value = withTiming(0, { duration: 300 });
        onSwipe(direction);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

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

  const handleCardPress = async () => {
    if (!isTop || !article.url) return;

    try {
      const supported = await Linking.canOpenURL(article.url);
      if (supported) {
        await Linking.openURL(article.url);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.cardContent}>
          {article.imageUrl ? (
            <Image
              source={{ uri: article.imageUrl }}
              style={styles.cardBackgroundImage}
              defaultSource={require('@/assets/images/react-logo.png')}
            />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Text style={styles.imagePlaceholder}>📰</Text>
            </View>
          )}

          <View style={styles.cardOverlay}>
            <TouchableOpacity style={styles.cardInfo} onPress={handleCardPress} activeOpacity={1}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{article.category}</Text>
              </View>

              <Text style={styles.cardTitle} numberOfLines={3}>
                {article.title}
              </Text>

              <Text style={styles.cardSummary} numberOfLines={6}>
                {article.summary || article.description}
              </Text>

              <View style={styles.cardMeta}>
                <Text style={styles.cardSource}>
                  {article.authors?.[0] || article.source}
                </Text>
              </View>
            </TouchableOpacity>

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
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

function TrendingSection({ topics, colorScheme }: {
  topics: string[];
  colorScheme: ReturnType<typeof useColorScheme>;
}) {
  // Format topics for better display
  const formatTopic = (topic: string) => {
    return topic
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <View style={styles.trendingContainer}>
      <Text style={styles.trendingTitle}>
        Trending Topics You're Reading
      </Text>
      <View style={styles.trendingTags}>
        {topics.slice(0, 5).map((topic, index) => (
          <View key={`${topic}-${index}`} style={styles.trendingTag}>
            <Text style={styles.trendingTagText}>{formatTopic(topic)}</Text>
          </View>
        ))}
      </View>
      {topics.length === 0 && (
        <Text style={styles.noTrendingText}>
          Swipe right on articles to see trending topics!
        </Text>
      )}
    </View>
  );
}

function EmptyState({ onReset, colorScheme }: {
  onReset: () => void;
  colorScheme: ReturnType<typeof useColorScheme>;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        You've seen it all!
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        No more articles to explore right now.
      </Text>
      <TouchableOpacity
        style={styles.resetButton}
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
    backgroundColor: '#F5F5F0',
  },
  tagSelectionContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  tagSelectionTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  tagSelectionSubtitle: {
    fontSize: 16,
    color: '#8B8B8B',
    marginBottom: 40,
    fontFamily: 'Poppins-Regular',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  tagPill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagPillSelected: {
    backgroundColor: '#A8B5A8',
    borderColor: '#A8B5A8',
  },
  tagText: {
    color: '#8B8B8B',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#A8B5A8',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  continueButtonTextDisabled: {
    color: '#8B8B8B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 40,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#8B8B8B',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 40,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#A8B5A8',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    position: 'absolute',
    width: screenWidth - 48,
    height: screenHeight * 0.5,
  },
  cardContent: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  cardBackgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#A8B5A8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  imagePlaceholder: {
    fontSize: 48,
    color: '#FFFFFF',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(168, 181, 168, 0.85)',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
  },
  categoryTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 32,
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },
  cardSummary: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Poppins-Regular',
  },
  keyPointsContainer: {
    marginBottom: 20,
  },
  keyPointsTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  keyPoint: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardSource: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Poppins-Regular',
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  rejectButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  likeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  trendingContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#F5F5F0',
    marginTop: 'auto',
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#4A4A4A',
    fontFamily: 'Poppins-SemiBold',
  },
  trendingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trendingTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#A8B5A8',
  },
  trendingTagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  noTrendingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    color: '#8B8B8B',
    fontFamily: 'Poppins-Regular',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#4A4A4A',
    fontFamily: 'Poppins-SemiBold',
  },
  emptyStateSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#8B8B8B',
    fontFamily: 'Poppins-Regular',
    lineHeight: 26,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    gap: 12,
    backgroundColor: '#A8B5A8',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});