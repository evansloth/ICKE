export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  backgroundColor: string;
  text: string;
}

export class JournalService {
  private static readonly DB_API_URL = "https://0q9swf3cmf.execute-api.us-east-1.amazonaws.com/DB";

  static async fetchJournalEntries(): Promise<JournalEntry[]> {
    try {
      const response = await fetch(this.DB_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Journal API Error:', response.status, errorText);
        throw new Error(`Failed to fetch journal entries: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Journal API Response:', data);

      // Transform the API response to match our interface
      // Assuming the API returns an array of entries or an object with entries
      const entries = Array.isArray(data) ? data : data.entries || [];
      
      const transformedEntries = entries.map((entry: any, index: number) => ({
        id: entry.id || entry.Entry_ID || (index + 1).toString(),
        title: entry.title || entry.Title || 'Untitled Entry',
        date: entry.date || entry.Date_Added || new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        backgroundColor: this.getBackgroundColor(index),
        text: entry.text || entry.Text || entry.content || ''
      }));

      // API now returns entries sorted by date, so we can use them directly
      return transformedEntries;

    } catch (error) {
      console.error('Error fetching journal entries:', error);
      // Return fallback data on error
      return this.getFallbackEntries();
    }
  }

  private static getBackgroundColor(index: number): string {
    const colors = ['#A8B5A8', '#B8A8B5', '#A8B8B5'];
    return colors[index % colors.length];
  }

  private static getFallbackEntries(): JournalEntry[] {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(today.getDate() - 2);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    const entries = [
      { 
        id: '1', 
        title: 'Afternoon Walk Journal', 
        date: formatDate(today), 
        backgroundColor: '#A8B5A8',
        text: 'A calm walk through the park helped me slow down and reconnect with the present moment.'
      },
      { 
        id: '2', 
        title: 'Morning Reflection', 
        date: formatDate(yesterday), 
        backgroundColor: '#B8A8B5',
        text: 'Started the day with gratitude and a cup of tea — small rituals, big impact.'
      },
      { 
        id: '3', 
        title: 'Evening Thoughts', 
        date: formatDate(dayBefore), 
        backgroundColor: '#A8B8B5',
        text: 'The sunset reminded me that endings can be peaceful too.'
      }
    ];

    // Return entries in chronological order (oldest to newest) to match API behavior
    return entries;
  }
}