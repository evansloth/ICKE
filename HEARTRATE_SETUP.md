# Heart Rate Monitor Setup & Troubleshooting

## 🎯 Overview

The Heart Rate Monitor tab allows you to analyze videos to extract heart rate measurements using AWS SageMaker.

## 🚀 Quick Start

### Option 1: Test with Mock Mode (Recommended First)

1. Add to your `.env` file:
   ```bash
   EXPO_PUBLIC_MOCK_HEARTRATE=true
   ```

2. Restart your Expo server:
   ```bash
   npm start
   ```

3. Navigate to the Heart Rate tab and test the UI with mock data

### Option 2: Use Real SageMaker Endpoint

1. Fix the endpoint error (see below)
2. Set in `.env`:
   ```bash
   EXPO_PUBLIC_MOCK_HEARTRATE=false
   ```
3. Restart server and test with real videos

## 📱 Features

### Back Navigation
- **Back button** in the header to return to previous page
- Can navigate away at any time
- State is preserved while on the tab

### Record Video (Front-Facing Camera)
- 3-second countdown before recording
- **7-second recording** with on-screen timer (optimized for faster processing)
- Visual guidance to keep face in frame
- **Background processing** - can navigate away while analyzing

### Upload Video
- Select pre-recorded videos from your device
- Test with videos you know work
- **Background processing** - navigate away while analyzing
- Great for debugging and testing

### Background Processing
- Videos analyze in the background
- Navigate away immediately after submitting
- Return to the tab to check results
- Visual banner shows processing status
- Results appear automatically when ready

## 🐛 Current Issue: SageMaker Endpoint Error

### The Problem

Your SageMaker endpoint has a bug that causes this error:
```python
ZeroDivisionError: float division by zero
```

**Location**: `/opt/ml/heart_rate_detector.py` line 27

**Cause**: The code tries to divide by FPS (frames per second) when it's 0.

### The Fix

Update your SageMaker endpoint's Python code:

```python
# In /opt/ml/heart_rate_detector.py

def extract_heart_rate(self, video_path, min_duration=3):
    # ... existing code to read video ...
    
    # Get FPS and frame count
    fps = video.get(cv2.CAP_PROP_FPS)
    total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # ✅ ADD THIS CHECK:
    if fps == 0 or fps is None:
        video.release()
        return {
            "status": "error",
            "error": "Invalid video: Could not detect frame rate. Ensure video is properly encoded with valid FPS."
        }
    
    # Now safe to use fps:
    duration = total_frames / fps
    print(f"Video: {fps} FPS, {total_frames} frames, {duration:.1f} seconds")
    
    # ... rest of your code ...
```

### Steps to Deploy Fix

1. Update the Python code in your SageMaker model
2. Redeploy the endpoint
3. Test with the script:
   ```bash
   node scripts/test-sagemaker.js
   ```
4. Once working, set `EXPO_PUBLIC_MOCK_HEARTRATE=false` in `.env`

## 🔍 Diagnostic Tools

### Test SageMaker Connection
```bash
node scripts/test-sagemaker.js
```

This will:
- Verify AWS credentials
- Test endpoint connectivity
- Show detailed error messages
- Time the request/response

### Check Environment Variables
```bash
node scripts/check-env.js
```

Verifies all required env vars are set.

### View Console Logs

When using the app, check the console for detailed logs:
- Video file information
- Base64 encoding progress
- AWS request/response details
- Timing information

## 📋 Environment Variables

Required in `.env`:

```bash
# AWS Credentials
EXPO_PUBLIC_AWS_ACCESS_KEY_ID=your_key_here
EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY=your_secret_here
EXPO_PUBLIC_AWS_SESSION_TOKEN=your_token_here  # Optional, for temporary credentials
EXPO_PUBLIC_AWS_DEFAULT_REGION=us-east-1

# Mock Mode (true = fake results, false = real endpoint)
EXPO_PUBLIC_MOCK_HEARTRATE=true
```

**Note**: Your session token is temporary and will expire. Update it when needed.

## 🎨 UI States

1. **Idle**: Show "Record Video" and "Upload Video" buttons
2. **Countdown**: 3-2-1 countdown before recording
3. **Recording**: 7-second timer with live recording indicator
4. **Processing**: 
   - Initial: "Starting analysis..." (0.5 seconds)
   - Background: Shows clock icon with message "Feel free to navigate away"
   - Banner: Shows at top when processing in background
5. **Complete**: Show heart rate results with confidence score

## 🔄 Background Processing Flow

1. **Submit Video** (record or upload)
2. **Brief Processing Screen** (0.5 seconds)
3. **Background Mode Enabled**
   - Banner appears at top
   - Clock icon shows in camera area
   - Message: "Feel free to navigate away"
4. **Navigate Away** (optional)
   - Tap back button or use floating menu
   - Processing continues
5. **Return to Tab**
   - If still processing: See same background processing screen
   - If complete: See results automatically
6. **View Results**
   - Heart rate displayed with animations
   - Tap "Analyze Another" to start over

## 🔐 Security

- `.env` is in `.gitignore` - your credentials won't be committed
- Never share your AWS credentials
- Use IAM roles with minimal permissions in production

## 📊 CloudWatch Logs

View endpoint logs at:
https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logEventViewer:group=/aws/sagemaker/Endpoints/hr-detector-endpoint

## 💡 Tips

1. **Good lighting** improves detection accuracy
2. **Keep face visible** throughout recording
3. **Stay still** during recording
4. **Test videos first** - upload known-good videos before recording new ones
5. **Mock mode** - great for UI development without hitting the endpoint

## 🆘 Common Issues

### "Stuck on Analyzing"
- Endpoint has the division by zero bug (see fix above)
- Or: Request timeout (check CloudWatch logs)
- Or: Credentials expired

### "Camera Permission Denied"
- Go to phone Settings → ICKE → Allow Camera

### "Invalid Video"
- Video might be corrupted
- Try a different video format (MP4 works best)
- Ensure video has valid FPS metadata

### Environment Variables Not Loading
- Restart Expo development server
- Check `.env` file exists in project root
- Verify variables start with `EXPO_PUBLIC_`

## 📞 Support

If issues persist:
1. Check CloudWatch logs
2. Run diagnostic scripts
3. Test in mock mode first
4. Verify AWS credentials are valid

