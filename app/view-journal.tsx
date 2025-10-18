import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ViewJournal() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#ebead6', '#f9eee9']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Journal</Text>
        </View>
        
        <View style={styles.journalCard}>
          <View style={styles.journalHeader}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateNumber}>17</Text>
              <View style={styles.dateDetails}>
                <Text style={styles.month}>OCTOBER 2025</Text>
                <Text style={styles.time}>2:08 AM</Text>
              </View>
            </View>
            <Text style={styles.emoji}>🙂</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.journalContent}>
            <View style={styles.journalTitleRow}>
              <Text style={styles.sectionTitle}>Journal</Text>
              <Text style={styles.editButton}>Edit</Text>
            </View>
            
            <Text style={styles.journalText}>
              Today felt different somehow. The coffee tasted better, the sun seemed warmer. I called Mom after weeks of meaning to. Her laugh reminded me why small gestures matter most. Tomorrow, I'll do better.
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>NLP Analysis:</Text>
            {/* Analysis content would go here */}
          </View>
        </View>
        
        <Text style={styles.chatPrompt}>Need a chat?</Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="What's on your mind?"
              placeholderTextColor="#B9B9B9"
            />
          </View>
          <TouchableOpacity style={styles.sendButton}>
            <Send size={20} color="#1D1D1D" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 59,
    paddingHorizontal: 18,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  journalCard: {
    width: 332,
    height: 397,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignSelf: 'center',
    marginTop: 22,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.13)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 2,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateNumber: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  dateDetails: {
    marginLeft: 6,
  },
  month: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6725C9',
  },
  time: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  emoji: {
    fontSize: 24,
    marginRight: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#D7D7D7',
    marginHorizontal: 15,
    marginVertical: 15,
  },
  journalContent: {
    paddingHorizontal: 20,
  },
  journalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#A7A7A7',
  },
  editButton: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#006AFF',
  },
  journalText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#000',
    lineHeight: 24,
  },
  analysisSection: {
    paddingHorizontal: 20,
    paddingTop: 9,
  },
  chatPrompt: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 69,
    gap: 12,
  },
  textInputContainer: {
    flex: 1,
    maxWidth: 280,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  textInput: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

