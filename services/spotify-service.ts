// Spotify Web API integration
const SPOTIFY_CLIENT_ID = 'your_spotify_client_id'; // Replace with your actual client ID
const SPOTIFY_CLIENT_SECRET = 'your_spotify_client_secret'; // Replace with your actual client secret
const SPOTIFY_REDIRECT_URI = 'your_redirect_uri'; // Replace with your actual redirect URI

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    name: string;
  }>;
  album: {
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  external_urls: {
    spotify: string;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  tracks: {
    items: Array<{
      track: SpotifyTrack;
    }>;
  };
  owner: {
    display_name: string;
  };
}

interface CurrentlyPlaying {
  is_playing: boolean;
  item: SpotifyTrack | null;
  progress_ms: number;
  timestamp: number;
}

export class SpotifyService {
  private static accessToken: string | null = null;
  private static tokenExpiry: number = 0;

  // Get access token using Client Credentials flow (for public data)
  private static async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw error;
    }
  }

  // Fetch playlist data
  static async getPlaylist(playlistId: string): Promise<SpotifyPlaylist | null> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch playlist: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching playlist:', error);
      return null;
    }
  }

  // Get currently playing track (requires user authorization)
  static async getCurrentlyPlaying(): Promise<CurrentlyPlaying | null> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 204) {
        // No content - nothing is playing
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch currently playing: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching currently playing:', error);
      return null;
    }
  }

  // Get user's top tracks
  static async getTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyTrack[]> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch top tracks: ${response.status}`);
      }

      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      return [];
    }
  }

  // Format duration from milliseconds to readable format
  static formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Get playlist info for display
  static async getPlaylistInfo(playlistId: string) {
    const playlist = await this.getPlaylist(playlistId);
    
    if (!playlist) {
      return {
        name: 'Study Vibes',
        description: 'Perfect background music for focused work and study sessions',
        imageUrl: '',
        trackCount: 0,
        owner: 'Unknown',
        url: `https://open.spotify.com/playlist/${playlistId}`
      };
    }

    return {
      name: playlist.name,
      description: playlist.description || 'A curated playlist',
      imageUrl: playlist.images[0]?.url || '',
      trackCount: playlist.tracks.items.length,
      owner: playlist.owner.display_name,
      url: playlist.external_urls.spotify
    };
  }
}
