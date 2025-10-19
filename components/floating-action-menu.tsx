import { usePathname, useRouter } from 'expo-router';
import { BookOpen, CheckCircle, Dumbbell, Heart, Home, Newspaper, X } from 'lucide-react-native';
import { useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function FloatingActionMenu() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const router = useRouter();
  const pathname = usePathname();

  const toggleMenu = () => {
    const toValue = isExpanded ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    setIsExpanded(!isExpanded);
  };

  const navigateTo = (route: string) => {
    router.push(route);
    toggleMenu();
  };

  const menuItems = [
    { icon: Home, label: 'Discover', route: '/' },
    { icon: Newspaper, label: 'Explore', route: '/explore' },
    { icon: BookOpen, label: 'Journal', route: '/journal' },
    { icon: Dumbbell, label: 'Workout', route: '/workout' },
    { icon: CheckCircle, label: 'Habits', route: '/habits' },
    { icon: Heart, label: 'Heart Rate', route: '/heartrate' },
  ];

  return (
    <View style={styles.container}>
      {/* Expanded Menu Items */}
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        const angle = (100 + index * 35) * (Math.PI / 180); // Spread items in an arc to the left with more spacing
        const radius = 120;

        const translateX = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, radius * Math.cos(angle)],
        });

        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -radius * Math.sin(angle)],
        });

        const scale = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        });

        const opacity = animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.5, 1],
        });

        return (
          <Animated.View
            key={item.route}
            style={[
              styles.menuItem,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                ],
                opacity,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.menuButton,
                pathname === item.route && styles.activeMenuButton,
              ]}
              onPress={() => navigateTo(item.route)}
            >
              <Icon
                size={20}
                color={pathname === item.route ? '#FFFFFF' : '#000000'}
              />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Main FAB Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        {isExpanded ? (
          <X size={24} color="#FFFFFF" />
        ) : (
          <View style={styles.pauseIcon}>
            <View style={styles.pauseBar} />
            <View style={styles.pauseBar} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    zIndex: 1000,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  pauseIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pauseBar: {
    width: 4,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  menuItem: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  menuButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  activeMenuButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
});

