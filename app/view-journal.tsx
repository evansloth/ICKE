import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ConversationResponse {
  feedback: string;
  suggestions: string[];
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ViewJournal() {
  const router = useRouter();
  const [journalText] = useState(
    "Today felt different somehow. The coffee tasted better, the sun seemed warmer. I called Mom after weeks of meaning to. Her laugh reminded me why small gestures matter most. Tomorrow, I'll do better."
  );
  const [analysisResult, setAnalysisResult] = useState<ConversationResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);

  const CONVERSATION_API_URL = 'https://fmkrb4vex3.execute-api.us-east-1.amazonaws.com/conversation';



  // ------------------------------
  // Analyze journal
  // ------------------------------
  const analyzeJournal = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const requestBody = { journal: text };
      const response = await fetch(CONVERSATION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const result: ConversationResponse = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to analyze journal: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ------------------------------
  // Chat functionality
  // ------------------------------
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput.trim(),
      isUser: true,
      timestamp: new Date()
    };

    // Add user message immediately
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput.trim();
    setChatInput('');
    setIsChatting(true);

    try {
      const response = await fetch(CONVERSATION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journal: currentInput }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result: ConversationResponse = await response.json();

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: result.feedback || 'I understand how you feel. Would you like to talk more about it?',
        isUser: false,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
      // Remove the user message if the request failed
      setChatMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsChatting(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  useEffect(() => {
    analyzeJournal(journalText);
  }, []);

  return (
    <LinearGradient colors={['#ebead6', '#f9eee9']} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
            <Text style={styles.journalText}>{journalText}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.analysisSection}>
            <View style={styles.analysisTitleRow}>
              <Text style={styles.sectionTitle}>Mood Booster:</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={() => analyzeJournal(journalText)} disabled={isAnalyzing}>
                <Text style={styles.refreshButtonText}>{isAnalyzing ? 'Analyzing...' : 'Refresh'}</Text>
              </TouchableOpacity>
            </View>

            {isAnalyzing ? (
              <Text style={styles.loadingText}>⏳ Analyzing your journal...</Text>
            ) : analysisResult ? (
              <View style={styles.analysisContent}>
                <Text style={styles.analysisText}>{analysisResult.feedback}</Text>

                {analysisResult.suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                    {analysisResult.suggestions.map((suggestion: string, i: number) => (
                      <Text key={i} style={styles.suggestionText}>• {suggestion}</Text>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.analysisText}>Tap "Refresh" to analyze your journal entry for mood insights and suggestions.</Text>
            )}
          </View>
        </View>

        {/* Chat Section */}
        <View style={styles.chatSection}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatPrompt}>Need a chat?</Text>
            {chatMessages.length > 0 && (
              <TouchableOpacity style={styles.clearChatButton} onPress={clearChat}>
                <Text style={styles.clearChatButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Chat Messages */}
          {chatMessages.length > 0 && (
            <View style={styles.chatMessagesContainer}>
              {chatMessages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageContainer,
                    message.isUser ? styles.userMessageContainer : styles.botMessageContainer
                  ]}
                >
                  <Text style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.botMessageText
                  ]}>
                    {message.text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Chat Input */}
          <View style={styles.inputContainer}>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="What's on your mind?"
                placeholderTextColor="#B9B9B9"
                value={chatInput}
                onChangeText={setChatInput}
                multiline
                maxLength={500}
              />
            </View>
            <TouchableOpacity
              style={[styles.sendButton, isChatting && styles.sendButtonDisabled]}
              onPress={sendChatMessage}
              disabled={isChatting || !chatInput.trim()}
            >
              {isChatting ? <Text style={styles.loadingEmoji}>⏳</Text> : <Send size={20} color="#1D1D1D" />}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// ... keep all your previous StyleSheet definitions here


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
    paddingBottom: 20,
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
  analysisTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#6725C9',
    borderRadius: 12,
  },
  refreshButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  chatSection: {
    marginTop: 40,
    marginHorizontal: 20,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chatPrompt: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  clearChatButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
  },
  clearChatButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  chatMessagesContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#6725C9',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    marginTop: 8,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  analysisContent: {
    marginTop: 8,
  },
  analysisText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    lineHeight: 20,
  },
  moodAnalysis: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  moodLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#6725C9',
    marginBottom: 4,
  },
  emotionsLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 6,
  },
  suggestionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    lineHeight: 16,
    marginBottom: 2,
  },
  scoresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 4,
  },
  scoreText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },

  chatResponseContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chatResponseText: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  newChatButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6725C9',
    borderRadius: 20,
  },
  newChatButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  loadingEmoji: {
    fontSize: 16,
  },
  testButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  testButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
});

