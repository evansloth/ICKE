import ocrEvents from '@/utils/ocrEvents';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { CameraView } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [loaded] = useFonts({
    'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
    'Poppins-BlackItalic': require('../assets/fonts/Poppins-BlackItalic.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-BoldItalic': require('../assets/fonts/Poppins-BoldItalic.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraBoldItalic': require('../assets/fonts/Poppins-ExtraBoldItalic.ttf'),
    'Poppins-ExtraLight': require('../assets/fonts/Poppins-ExtraLight.ttf'),
    'Poppins-ExtraLightItalic': require('../assets/fonts/Poppins-ExtraLightItalic.ttf'),
    'Poppins-Italic': require('../assets/fonts/Poppins-Italic.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins-LightItalic': require('../assets/fonts/Poppins-LightItalic.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-MediumItalic': require('../assets/fonts/Poppins-MediumItalic.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-SemiBoldItalic': require('../assets/fonts/Poppins-SemiBoldItalic.ttf'),
    'Poppins-Thin': require('../assets/fonts/Poppins-Thin.ttf'),
    'Poppins-ThinItalic': require('../assets/fonts/Poppins-ThinItalic.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="analysis" options={{ headerShown: false }} />
        <Stack.Screen name="write-journal" options={{ headerTitle: '' }} />
        <Stack.Screen name="view-journal" options={{ headerShown: false }} />
      </Stack>

      <TopLevelCamera />

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

function TopLevelCamera() {
  const [visible, setVisible] = useState(false);
  const cameraRef = useRef<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const off = ocrEvents.on('openCamera', () => {
      setVisible(true);
    });
    return off;
  }, []);

  async function uploadAndExtractText(uri: string) {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    // TODO: replace with your real API URL
    const TEXTRACT_API_URL = 'https://REPLACE_WITH_YOUR_API_GATEWAY_URL/textract';
    const res = await fetch(TEXTRACT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64 }),
    });
    if (!res.ok) throw new Error('textract api error');
    const json = await res.json();
    return json.text ?? json.extractedText ?? '';
  }

  const take = async () => {
    if (!cameraRef.current) return;
    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        const extracted = await uploadAndExtractText(photo.uri);
        ocrEvents.emit('ocrResult', extracted);
        setVisible(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="overFullScreen" transparent statusBarTranslucent hardwareAccelerated>
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        <View style={{ position: 'absolute', top: 40, right: 20 }}>
          <TouchableOpacity onPress={() => setVisible(false)} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <X stroke="white" width={20} height={20} />
          </TouchableOpacity>
        </View>
        <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' }}>
          {isProcessing ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <TouchableOpacity onPress={take} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 5, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' }} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
