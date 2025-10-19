// Test script to verify SageMaker endpoint connectivity
// Run with: node scripts/test-sagemaker.js

const { SageMakerRuntimeClient, InvokeEndpointCommand } = require("@aws-sdk/client-sagemaker-runtime");
require('dotenv').config();

async function testEndpoint() {
  console.log('🔍 Testing SageMaker Endpoint Connection...\n');

  // Check environment variables
  console.log('Environment Variables:');
  console.log('- AWS_ACCESS_KEY_ID:', process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID?.substring(0, 10) + '...');
  console.log('- AWS_SECRET_ACCESS_KEY:', process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY ? 'Set ✓' : 'Missing ✗');
  console.log('- AWS_SESSION_TOKEN:', process.env.EXPO_PUBLIC_AWS_SESSION_TOKEN ? 'Set ✓' : 'Missing ✗');
  console.log('- AWS_REGION:', process.env.EXPO_PUBLIC_AWS_DEFAULT_REGION || 'us-east-1');
  console.log('');

  // Create client
  const client = new SageMakerRuntimeClient({
    region: process.env.EXPO_PUBLIC_AWS_DEFAULT_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
      sessionToken: process.env.EXPO_PUBLIC_AWS_SESSION_TOKEN || undefined,
    }
  });

  try {
    console.log('📡 Attempting to connect to endpoint: hr-detector-endpoint');
    console.log('Time:', new Date().toISOString());
    console.log('');

    // Create a minimal test payload
    const testPayload = {
      video: "test",
      format: "mp4"
    };

    const command = new InvokeEndpointCommand({
      EndpointName: "hr-detector-endpoint",
      ContentType: "application/json",
      Body: JSON.stringify(testPayload)
    });

    const startTime = Date.now();
    
    // Add 10 second timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000);
    });
    
    const response = await Promise.race([
      client.send(command),
      timeoutPromise
    ]);
    
    const duration = Date.now() - startTime;

    console.log(`✅ SUCCESS! Endpoint responded in ${duration}ms`);
    console.log('Response status:', response.$metadata.httpStatusCode);
    console.log('');

    const resultText = new TextDecoder().decode(response.Body);
    console.log('Response body:', resultText);
    
  } catch (error) {
    console.error('❌ ERROR connecting to endpoint:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('');
    
    if (error.name === 'ValidationException') {
      console.log('💡 Endpoint might not exist or is not active');
    } else if (error.name === 'UnrecognizedClientException') {
      console.log('💡 AWS credentials are invalid or expired');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Request timed out - endpoint might be slow or unresponsive');
    }
    
    console.error('\nFull error:', error);
  }
}

testEndpoint();

