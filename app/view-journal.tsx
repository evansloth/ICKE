import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const params = useLocalSearchParams();
  
  // Parameter validation and fallback logic
  const validateAndGetParams = () => {
    const fallbackText = "Today felt different somehow. The coffee tasted better, the sun seemed warmer. I called Mom after weeks of meaning to. Her laugh reminded me why small gestures matter most. Tomorrow, I'll do better.";
    const fallbackTitle = "Untitled Entry";
    const fallbackDate = new Date().toISOString();
    const fallbackBackgroundColor = '#E8F5E8';

    const text = params.text as string;
    const title = params.title as string;
    const date = params.date as string;
    const backgroundColor = params.backgroundColor as string;

    return {
      text: text && text.trim() ? text : fallbackText,
      title: title && title.trim() ? title : fallbackTitle,
      date: date && date.trim() ? date : fallbackDate,
      backgroundColor: backgroundColor || fallbackBackgroundColor
    };
  };

  const journalData = validateAndGetParams();
  const [journalText, setJournalText] = useState(journalData.text);
  const [journalTitle, setJournalTitle] = useState(journalData.title);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(journalData.title);
  const [editedText, setEditedText] = useState(journalData.text);
  
  // ScrollView ref for auto-scrolling
  const scrollViewRef = useRef<ScrollView>(null);

  // Log the received parameters for debugging
  console.log('ViewJournal received params:', {
    title: journalData.title,
    date: journalData.date,
    backgroundColor: journalData.backgroundColor,
    textLength: journalData.text.length
  });
  const [analysisResult, setAnalysisResult] = useState<ConversationResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);

  const CONVERSATION_API_URL = 'https://fmkrb4vex3.execute-api.us-east-1.amazonaws.com/conversation';
  const CHAT_API_URL = 'https://jxi8n0j0k5.execute-api.us-east-1.amazonaws.com/chat';



  // ------------------------------
  // Analyze journal
  // ------------------------------
  const analyzeJournal = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const requestBody = { 
        journal: text,
        requestSuggestions: true,
        analysisType: 'mood_and_suggestions'
      };
      const response = await fetch(CONVERSATION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const result = await response.json();
      console.log('Analysis API Response:', result);
      console.log('Raw result type:', typeof result);
      console.log('Result keys:', Object.keys(result));
      
      // Handle different possible response formats
      let suggestions = result.suggestions || result.recommendations || result.tips || [];
      
      // Ensure suggestions is an array
      if (!Array.isArray(suggestions)) {
        if (typeof suggestions === 'string') {
          // If it's a string, try to split it or wrap it in an array
          suggestions = suggestions.includes('\n') ? suggestions.split('\n').filter(s => s.trim()) : [suggestions];
        } else {
          suggestions = [];
        }
      }
      
      // Clean up suggestions (remove empty strings, trim whitespace)
      suggestions = suggestions
        .map((s: any) => typeof s === 'string' ? s.trim() : String(s).trim())
        .filter((s: string) => s.length > 0);
      
      const processedResult: ConversationResponse = {
        feedback: result.feedback || result.analysis || result.message || 'Analysis completed',
        suggestions: suggestions
      };
      
      // If no suggestions were provided, generate some generic ones based on common themes
      if (processedResult.suggestions.length === 0) {
        const genericSuggestions = [
          "Take a few deep breaths and reflect on this moment",
          "Consider journaling about this experience again tomorrow",
          "Share your thoughts with someone you trust",
          "Practice gratitude for the insights you've gained"
        ];
        processedResult.suggestions = genericSuggestions.slice(0, 2); // Show 2 generic suggestions
      }
      
      console.log('Final processed suggestions:', processedResult.suggestions);
      console.log('Final processed feedback:', processedResult.feedback);
      setAnalysisResult(processedResult);
      setLastAnalyzed(new Date());
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
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      console.log('Chat API Response:', JSON.stringify(result, null, 2));

      // Handle different response formats
      let responseText = '';
      if (result.response) {
        // Expected format: { "response": "text" }
        responseText = result.response;
      } else if (result.feedback) {
        // If it's returning the old format: { "feedback": "text", "suggestions": [...] }
        responseText = result.feedback;
        console.warn('Chat endpoint returned feedback/suggestions format instead of response format');
      } else if (typeof result === 'string') {
        // If it's just a string
        responseText = result;
      } else {
        // Fallback
        responseText = 'I understand how you feel. Would you like to talk more about it?';
        console.error('Unexpected chat response format:', result);
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
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

  // Function to scroll to bottom when chat input is focused
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // ------------------------------
  // Journal editing functionality
  // ------------------------------
  const handleEdit = () => {
    setIsEditing(true);
    setEditedTitle(journalTitle);
    setEditedText(journalText);
  };

  const handleSave = () => {
    // Update title if it has content, otherwise keep original
    if (editedTitle.trim()) {
      setJournalTitle(editedTitle.trim());
    } else {
      setEditedTitle(journalTitle);
    }
    
    // Update text if it has content, otherwise keep original
    if (editedText.trim()) {
      setJournalText(editedText.trim());
    } else {
      setEditedText(journalText);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(journalTitle);
    setEditedText(journalText);
    setIsEditing(false);
  };

  // Parse date for display with robust handling of different formats
  const parseDate = (dateString: string) => {
    try {
      let date: Date;
      
      // Try parsing as ISO string first
      date = new Date(dateString);
      
      // If that fails, try parsing common formats
      if (isNaN(date.getTime())) {
        // Try parsing formatted date strings like "December 19, 2024 at 2:30 PM"
        const dateMatch = dateString.match(/(\w+)\s+(\d+),\s+(\d+)/);
        if (dateMatch) {
          date = new Date(`${dateMatch[1]} ${dateMatch[2]}, ${dateMatch[3]}`);
        }
      }
      
      // If still invalid, use current date as fallback
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format received:', dateString);
        date = new Date();
      }
      
      return {
        day: date.getDate().toString(),
        month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase(),
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      };
    } catch (error) {
      console.error('Error parsing date:', error);
      // Fallback to current date
      const today = new Date();
      return {
        day: today.getDate().toString(),
        month: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase(),
        time: today.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      };
    }
  };

  const dateInfo = parseDate(journalData.date);

  useEffect(() => {
    analyzeJournal(journalText);
  }, [journalText]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Journal</Text>
        </View>

        <View style={[styles.journalCard, { backgroundColor: journalData.backgroundColor }]}>
          <View style={styles.journalHeader}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateNumber}>{dateInfo.day}</Text>
              <View style={styles.dateDetails}>
                <Text style={styles.month}>{dateInfo.month}</Text>
                <Text style={styles.time}>{dateInfo.time}</Text>
              </View>
            </View>
            <Text style={styles.emoji}>🙂</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.journalContent}>
            <View style={styles.journalTitleRow}>
              {isEditing ? (
                <TextInput
                  style={styles.titleEditInput}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  placeholder="Enter title..."
                  placeholderTextColor="#B9B9B9"
                  maxLength={100}
                  multiline={false}
                />
              ) : (
                <>
                  <TouchableOpacity style={styles.titleContainer} onPress={handleEdit}>
                    <Text style={[styles.journalTitleText, styles.editableTitle]}>{journalTitle}</Text>
                    <View style={styles.editIndicator} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleEdit}>
                    <Text style={styles.editButton}>Edit</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            
            {isEditing ? (
              <TextInput
                style={styles.textEditInput}
                value={editedText}
                onChangeText={setEditedText}
                placeholder="Write your journal entry..."
                placeholderTextColor="#B9B9B9"
                multiline={true}
                textAlignVertical="top"
                maxLength={2000}
              />
            ) : (
              <TouchableOpacity onPress={handleEdit}>
                <Text style={[styles.journalText, styles.editableText]}>{journalText}</Text>
              </TouchableOpacity>
            )}
            
            {isEditing && (
              <View style={styles.editButtonsContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={[styles.analysisSection, { backgroundColor: journalData.backgroundColor, borderRadius: 16, marginHorizontal: 16, paddingHorizontal: 24, paddingVertical: 20 }]}>
            <View style={styles.analysisTitleRow}>
              <Text style={styles.sectionTitle}>Mood Booster:</Text>
              <TouchableOpacity 
                style={[styles.refreshButton, isAnalyzing && styles.refreshButtonDisabled]} 
                onPress={() => analyzeJournal(journalText)} 
                disabled={isAnalyzing}
              >
                <Text style={styles.refreshButtonText}>
                  {isAnalyzing ? '🔄 Analyzing...' : '🔄 Refresh'}
                </Text>
              </TouchableOpacity>
            </View>

            {isAnalyzing ? (
              <Text style={styles.loadingText}>⏳ Analyzing your journal...</Text>
            ) : analysisResult ? (
              <View style={styles.analysisContent}>
                <Text style={styles.analysisText}>{analysisResult.feedback}</Text>

                {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <View style={styles.suggestionsTitleRow}>
                      <Text style={styles.suggestionsTitle}>Personalized Suggestions:</Text>
                      {lastAnalyzed && (
                        <Text style={styles.lastUpdatedText}>
                          Updated {lastAnalyzed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                    </View>
                    {analysisResult.suggestions.map((suggestion: string, i: number) => (
                      <View key={i} style={styles.suggestionItem}>
                        <Text style={styles.suggestionBullet}>💡</Text>
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </View>
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
        <View style={[styles.chatSection, { backgroundColor: '#E8F0F5', borderRadius: 24, padding: 24, marginHorizontal: 24 }]}>
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
                onFocus={scrollToBottom}
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
    </KeyboardAvoidingView>
  );
}

