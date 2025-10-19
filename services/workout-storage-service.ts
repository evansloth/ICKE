import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WorkoutSession {
  id: string;
  date: string;
  timestamp: number;
  duration: number;
  accuracy: number;
  exerciseType: string;
  totalFrames?: number;
  goodFrames?: number;
}

export interface WorkoutStats {
  totalSessions: number;
  averageAccuracy: number;
  totalDuration: number;
  bestAccuracy: number;
  recentSessions: WorkoutSession[];
}

class WorkoutStorageService {
  private static STORAGE_KEY = '@workout_sessions';

  /**
   * Save a new workout session to AsyncStorage
   */
  async saveWorkoutSession(session: WorkoutSession): Promise<void> {
    try {
      // Load existing sessions
      const existingSessions = await this.loadWorkoutSessions();
      
      // Append new session
      const updatedSessions = [session, ...existingSessions];
      
      // Save back to storage
      await AsyncStorage.setItem(
        WorkoutStorageService.STORAGE_KEY,
        JSON.stringify(updatedSessions)
      );
      
      console.log('✅ Workout session saved successfully');
    } catch (error) {
      console.error('❌ Failed to save workout session:', error);
      throw error;
    }
  }

  /**
   * Load all workout sessions from AsyncStorage
   */
  async loadWorkoutSessions(): Promise<WorkoutSession[]> {
    try {
      const data = await AsyncStorage.getItem(WorkoutStorageService.STORAGE_KEY);
      
      if (data === null) {
        return [];
      }
      
      const sessions = JSON.parse(data) as WorkoutSession[];
      return sessions;
    } catch (error) {
      console.error('❌ Failed to load workout sessions:', error);
      return [];
    }
  }

  /**
   * Calculate statistics from workout sessions
   */
  calculateStats(sessions: WorkoutSession[]): WorkoutStats {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageAccuracy: 0,
        totalDuration: 0,
        bestAccuracy: 0,
        recentSessions: []
      };
    }

    // Calculate average accuracy
    const totalAccuracy = sessions.reduce((sum, session) => sum + session.accuracy, 0);
    const averageAccuracy = totalAccuracy / sessions.length;

    // Calculate total duration
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);

    // Find best accuracy
    const bestAccuracy = Math.max(...sessions.map(session => session.accuracy));

    // Get recent sessions (up to 5, with formatted dates)
    const recentSessions = sessions
      .slice(0, 5)
      .map(session => ({
        ...session,
        date: this.formatRelativeTime(session.timestamp)
      }));

    return {
      totalSessions: sessions.length,
      averageAccuracy: Math.round(averageAccuracy * 10) / 10, // Round to 1 decimal
      totalDuration: Math.round(totalDuration),
      bestAccuracy: Math.round(bestAccuracy * 10) / 10, // Round to 1 decimal
      recentSessions
    };
  }

  /**
   * Format timestamp to relative time string
   */
  formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      // Format as date string
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }
}

// Export singleton instance
export const workoutStorageService = new WorkoutStorageService();
