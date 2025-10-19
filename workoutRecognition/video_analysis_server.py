import os
import cv2
import json
import boto3
import tempfile
import shutil
import time
import ssl
import certifi
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Fix SSL certificate issues
os.environ['SSL_CERT_FILE'] = certifi.where()
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native requests

# ==========================
# CONFIGURATION
# ==========================
UPLOAD_FOLDER = 'uploads'
FRAME_RATE = 5  # capture every 5 frames
ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv'}

# Load configuration from environment variables
MODEL_ARN = os.getenv('MODEL_ARN', "arn:aws:rekognition:us-east-1:542718282237:project/gym_app/version/gym_app.2025-10-18T17.27.08/1760822828065")
AWS_REGION = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
FLASK_PORT = int(os.getenv('FLASK_PORT', 5001))
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'

VALID_LABELS = {"good", "bad"}

# Print configuration for debugging
print(f"🔧 Configuration loaded:")
print(f"   AWS Region: {AWS_REGION}")
print(f"   Model ARN: {MODEL_ARN}")
print(f"   Flask Port: {FLASK_PORT}")
print(f"   Debug Mode: {FLASK_DEBUG}")

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ==========================
# SETUP AWS REKOGNITION
# ==========================
# AWS credentials will be loaded from .env file automatically
rekognition = boto3.client('rekognition', region_name=AWS_REGION)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def classify_frame(frame_bytes):
    """Classify a single frame using AWS Rekognition - returns single best prediction"""
    try:
        response = rekognition.detect_custom_labels(
            ProjectVersionArn=MODEL_ARN,
            Image={'Bytes': frame_bytes},
            MinConfidence=30
        )

        if response['CustomLabels']:
            # Find the prediction with highest confidence
            best_prediction = None
            best_confidence = 0
            
            for item in response['CustomLabels']:
                label = item['Name'].lower()
                confidence = item['Confidence']
                
                if label in VALID_LABELS and confidence > best_confidence:
                    best_prediction = label
                    best_confidence = confidence
            
            if best_prediction:
                return best_prediction, best_confidence
            else:
                return "No Prediction", 0
        else:
            return "No Prediction", 0
            
    except Exception as e:
        print(f"⚠️  Error classifying frame: {e}")
        return "Error", 0

def analyze_video(video_path):
    """Main video analysis function - processes frames in memory"""
    try:
        print(f"\n🎬 Starting video analysis: {video_path}")
        print("=" * 60)
        
        # Open video
        cap = cv2.VideoCapture(video_path)
        
        # Process frames directly in memory
        report = []
        good_frames = 0
        frame_count = 0
        frame_id = 0
        
        print("🔍 Analyzing frames in memory...\n")
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Only process every FRAME_RATE frames
            if frame_count % FRAME_RATE == 0:
                # Encode frame to JPEG in memory
                _, buffer = cv2.imencode('.jpg', frame)
                frame_bytes = buffer.tobytes()
                
                # Classify frame directly
                prediction, confidence = classify_frame(frame_bytes)
                
                # Real-time logging for each frame
                frame_status = "✅ GOOD" if prediction == "good" else "❌ BAD"
                confidence_str = f" (confidence: {confidence:.1f}%)" if confidence > 0 else ""
                
                print(f"Frame {frame_id:3d}: {frame_status} - [{prediction}]{confidence_str}")
                
                # Count good form frames
                if prediction == "good":
                    good_frames += 1
                
                report.append({
                    "frame": frame_id,
                    "prediction": prediction,
                    "confidence": confidence
                })
                
                frame_id += 1
            
            frame_count += 1
        
        cap.release()
        total_frames = frame_id
        
        # Calculate accuracy percentage
        accuracy = (good_frames / total_frames * 100) if total_frames > 0 else 0
        
        print("\n" + "=" * 60)
        print(f"📊 ANALYSIS COMPLETE")
        print(f"✅ Good form frames: {good_frames}/{total_frames}")
        print(f"📈 Overall accuracy: {accuracy:.1f}%")
        
        # Generate summary
        summary = generate_summary(report, accuracy)
        print(f"💡 Summary: {summary}")
        print("=" * 60 + "\n")
        
        return {
            "success": True,
            "accuracy": round(accuracy, 1),
            "total_frames": total_frames,
            "good_frames": good_frames,
            "detailed_report": report,
            "summary": summary
        }
        
    except Exception as e:
        print(f"❌ Error during video analysis: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

def generate_summary(report, accuracy):
    """Generate a workout analysis summary"""
    total_frames = len(report)
    good_frames = sum(1 for frame in report if frame["prediction"] == "good")
    bad_frames = total_frames - good_frames
    
    # Calculate average confidence for good and bad predictions
    good_confidences = [frame["confidence"] for frame in report if frame["prediction"] == "good"]
    bad_confidences = [frame["confidence"] for frame in report if frame["prediction"] == "bad"]
    
    avg_good_confidence = sum(good_confidences) / len(good_confidences) if good_confidences else 0
    avg_bad_confidence = sum(bad_confidences) / len(bad_confidences) if bad_confidences else 0
    
    if accuracy >= 90:
        base_summary = f"Excellent form! Your technique is very consistent with {accuracy:.1f}% good form."
    elif accuracy >= 75:
        base_summary = f"Good form overall with {accuracy:.1f}% accuracy. Some areas for improvement."
    elif accuracy >= 50:
        base_summary = f"Decent form at {accuracy:.1f}% accuracy, but several areas need attention."
    else:
        base_summary = f"Form needs significant improvement. Only {accuracy:.1f}% of frames showed good form."
    
    # Add confidence information
    if good_frames > 0:
        base_summary += f" Good form frames averaged {avg_good_confidence:.1f}% confidence."
    if bad_frames > 0:
        base_summary += f" Areas needing work averaged {avg_bad_confidence:.1f}% confidence."
    
    return base_summary

@app.route('/analyze', methods=['POST'])
def analyze_workout_video():
    """API endpoint to analyze workout videos"""
    try:
        print("\n🚀 New video analysis request received!")
        
        # Check if file is present
        if 'video' not in request.files:
            print("❌ No video file in request")
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        
        if file.filename == '':
            print("❌ Empty filename")
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            # Save uploaded file
            filename = secure_filename(file.filename)
            timestamp = str(int(time.time()))
            filename = f"{timestamp}_{filename}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            
            print(f"💾 Saving video as: {filename}")
            file.save(filepath)
            
            # Get file size for logging
            file_size = os.path.getsize(filepath)
            print(f"📁 File size: {file_size / (1024*1024):.2f} MB")
            
            # Analyze the video
            result = analyze_video(filepath)
            
            # Clean up uploaded file
            print(f"🗑️  Cleaning up temporary file: {filename}")
            os.remove(filepath)
            
            return jsonify(result)
        else:
            print(f"❌ Invalid file type: {file.filename}")
            return jsonify({'error': 'Invalid file type. Please upload MP4, MOV, AVI, or MKV files.'}), 400
            
    except Exception as e:
        print(f"💥 Server error: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Video analysis server is running'})

if __name__ == '__main__':
    print("Starting video analysis server...")
    print(f"Server will be available at http://localhost:{FLASK_PORT}")
    app.run(debug=FLASK_DEBUG, host='0.0.0.0', port=FLASK_PORT)
