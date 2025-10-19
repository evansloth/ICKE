// Must be imported first to polyfill crypto for AWS SDK
import 'react-native-get-random-values';

import { InvokeEndpointCommand, SageMakerRuntimeClient } from "@aws-sdk/client-sagemaker-runtime";
import * as FileSystem from 'expo-file-system/legacy';

// Enable mock mode for testing without hitting the endpoint
const MOCK_MODE = process.env.EXPO_PUBLIC_MOCK_HEARTRATE === 'true';

// Configure AWS credentials from environment variables
const getAWSClient = () => {
  const config = {
    region: process.env.EXPO_PUBLIC_AWS_DEFAULT_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
      sessionToken: process.env.EXPO_PUBLIC_AWS_SESSION_TOKEN || undefined,
    }
  };

  return new SageMakerRuntimeClient(config);
};

export interface HeartRateAnalysisResult {
  status: 'success' | 'error';
  heart_rate?: number;
  confidence?: number;
  error?: string;
}

export async function analyzeVideo(videoUri: string): Promise<HeartRateAnalysisResult> {
  // Mock mode for testing
  if (MOCK_MODE) {
    console.log('🧪 MOCK MODE ENABLED - Simulating heart rate analysis...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
    const mockHeartRate = Math.floor(Math.random() * (85 - 60 + 1)) + 60;
    const mockConfidence = Math.floor(Math.random() * (99 - 85 + 1)) + 85;
    console.log(`✅ Mock result: ${mockHeartRate} BPM, ${mockConfidence}% confidence`);
    return {
      status: 'success',
      heart_rate: mockHeartRate,
      confidence: mockConfidence
    };
  }

  try {
    console.log('==========================================');
    console.log('Starting video analysis for:', videoUri);
    console.log('==========================================');
    
    // Check file info first
    const fileInfo = await FileSystem.getInfoAsync(videoUri);
    console.log('File info:', JSON.stringify(fileInfo, null, 2));
    
    if (!fileInfo.exists) {
      throw new Error('Video file does not exist');
    }

    console.log('File size (bytes):', fileInfo.size);
    
    // Read video file as base64
    console.log('Reading video file as base64...');
    const startRead = Date.now();
    const videoBase64 = await FileSystem.readAsStringAsync(videoUri, {
      encoding: FileSystem.EncodingType.Base64
    });
    const readTime = Date.now() - startRead;
    console.log(`Video read completed in ${readTime}ms`);
    console.log('Base64 length:', videoBase64.length);
    console.log('Estimated payload size (MB):', (videoBase64.length / 1024 / 1024).toFixed(2));

    // Check AWS credentials
    console.log('AWS Configuration:');
    console.log('- Region:', process.env.EXPO_PUBLIC_AWS_DEFAULT_REGION || "us-east-1");
    console.log('- Access Key ID:', process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID?.substring(0, 10) + '...');
    console.log('- Has Secret Key:', !!process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY);
    console.log('- Has Session Token:', !!process.env.EXPO_PUBLIC_AWS_SESSION_TOKEN);

    // Prepare payload
    const payload = {
      video: videoBase64,
      format: 'mp4'
    };

    console.log('Initializing AWS client...');
    const client = getAWSClient();

    // Call SageMaker endpoint
    const command = new InvokeEndpointCommand({
      EndpointName: "hr-detector-endpoint",
      ContentType: "application/json",
      Body: JSON.stringify(payload)
    });

    console.log('Sending request to SageMaker endpoint: hr-detector-endpoint');
    console.log('Request started at:', new Date().toISOString());
    
    const startRequest = Date.now();
    
    // Add timeout wrapper (2 minutes for video processing)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 2 minutes - video may be too large or endpoint is slow')), 120000);
    });
    
    const response = await Promise.race([
      client.send(command),
      timeoutPromise
    ]);
    
    const requestTime = Date.now() - startRequest;
    console.log(`Request completed in ${requestTime}ms`);
    console.log('Response status code:', response.$metadata.httpStatusCode);
    console.log('Response headers:', JSON.stringify(response.$metadata, null, 2));
    
    const resultText = new TextDecoder().decode(response.Body);
    console.log('Raw response:', resultText);
    
    const result = JSON.parse(resultText);
    console.log('Parsed response:', JSON.stringify(result, null, 2));

    if (result.status === 'success') {
      console.log('✅ Analysis successful!');
      return {
        status: 'success',
        heart_rate: result.heart_rate,
        confidence: result.confidence
      };
    } else {
      console.error('❌ Error from endpoint:', result.error);
      return {
        status: 'error',
        error: result.error || 'Unknown error from endpoint'
      };
    }
  } catch (error) {
    console.error('==========================================');
    console.error('❌ FATAL ERROR:', error);
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    console.error('==========================================');
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

