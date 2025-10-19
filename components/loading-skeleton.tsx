import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

export function LoadingSkeleton() {
  const colorScheme = useColorScheme();
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const skeletonColor = colorScheme === 'dark' ? '#333' : '#e0e0e0';

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <Animated.View style={[styles.imageArea, { backgroundColor: skeletonColor }, animatedStyle]} />
      <View style={styles.content}>
        <Animated.View style={[styles.badge, { backgroundColor: skeletonColor }, animatedStyle]} />
        <Animated.View style={[styles.title, { backgroundColor: skeletonColor }, animatedStyle]} />
        <Animated.View style={[styles.titleSecond, { backgroundColor: skeletonColor }, animatedStyle]} />
        <Animated.View style={[styles.description, { backgroundColor: skeletonColor }, animatedStyle]} />
        <Animated.View style={[styles.descriptionSecond, { backgroundColor: skeletonColor }, animatedStyle]} />
        <Animated.View style={[styles.meta, { backgroundColor: skeletonColor }, animatedStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  imageArea: {
    height: 200,
  },
  content: {
    padding: 20,
  },
  badge: {
    width: 80,
    height: 20,
    borderRadius: 10,
    marginBottom: 12,
  },
  title: {
    height: 24,
    borderRadius: 4,
    marginBottom: 8,
  },
  titleSecond: {
    height: 24,
    width: '70%',
    borderRadius: 4,
    marginBottom: 12,
  },
  description: {
    height: 16,
    borderRadius: 4,
    marginBottom: 6,
  },
  descriptionSecond: {
    height: 16,
    width: '80%',
    borderRadius: 4,
    marginBottom: 16,
  },
  meta: {
    height: 14,
    width: '60%',
    borderRadius: 4,
  },
});