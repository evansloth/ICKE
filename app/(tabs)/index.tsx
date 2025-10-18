import FloatingActionMenu from '@/components/floating-action-menu';
import { Bell } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DiscoverPage() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover</Text>
          <TouchableOpacity style={styles.bellIcon}>
            <Bell color="#1E1E1E" size={22} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Popular Today</Text>
        
        <View style={styles.popularContainer}>
          <View style={[styles.popularCard, { backgroundColor: '#D0757A' }]} />
          <View style={[styles.popularCard, { backgroundColor: '#1F1E1D' }]} />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Recommended</Text>
        
        <View style={[styles.recommendedCard, { backgroundColor: '#FAD8AE' }]} />
        <View style={[styles.recommendedCard, { backgroundColor: '#DCCEFA', marginTop: 25 }]} />
      </ScrollView>
      <FloatingActionMenu />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
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
  },
  bellIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 30,
    marginLeft: 21,
  },
  popularContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 21,
    marginTop: 6,
    gap: 16,
  },
  popularCard: {
    flex: 1,
    height: 167,
    borderRadius: 10,
  },
  recommendedCard: {
    alignSelf: 'center',
    width: '90%',
    height: 140,
    borderRadius: 10,
    marginTop: 15,
  },
});
