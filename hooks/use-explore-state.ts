import { useState, useEffect, useCallback } from 'react';

const NEWS_API_KEY = '010acdfe83584c45bf94c6e16c46735e';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export interface Article {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  source: string;
  publishDate: string;
  category: string;
  url: string;
  content?: string;
}

interface SwipeHistory {
  articleId: string;
  direction: 'left' | 'right';
  category: string;
  timestamp: number;
}

// Map user-friendly categories to News API categories
const CATEGORY_MAP: Record<string, string> = {
  'Entertainment': 'entertainment',
  'Politics': 'politics',
  'Stock Market': 'business',
  'Finance': 'business',
  'Technology': 'technology',
  'Sports': 'sports',
  'Health': 'health',
  'Science': 'science',
  'Art': 'entertainment',
  'Business': 'business',
  'World News': 'general'
};

export function useExploreState(selectedTags?: string[]) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState<SwipeHistory[]>([]);
  const [categoryPreferences, setCategoryPreferences] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch news articles from News API
  const fetchNews = useCallback(async (categories: string[]) => {
    if (!categories || categories.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Map user categories to API categories
      const apiCategories = [...new Set(categories.map(cat => CATEGORY_MAP[cat] || 'general'))];
      
      // Fetch articles for each category
      const allArticles: Article[] = [];
      
      for (const category of apiCategories) {
        try {
          const response = await fetch(
            `${NEWS_API_BASE_URL}/top-headlines?category=${category}&language=en&pageSize=20&apiKey=${NEWS_API_KEY}`
          );

          if (!response.ok) {
            console.error(`Failed to fetch ${category} news:`, response.status);
            continue;
          }

          const data = await response.json();
          
          if (data.articles) {
            const formattedArticles = data.articles
              .filter((article: any) => 
                article.title && 
                article.title !== '[Removed]' &&
                article.description &&
                article.description !== '[Removed]'
              )
              .map((article: any) => ({
                id: `${article.source.id || article.source.name}-${Date.now()}-${Math.random()}`,
                title: article.title,
                description: article.description || 'No description available',
                imageUrl: article.urlToImage || '',
                source: article.source.name,
                publishDate: formatDate(article.publishedAt),
                category: categories.find(cat => CATEGORY_MAP[cat] === category) || category,
                url: article.url,
                content: article.content
              }));

            allArticles.push(...formattedArticles);
          }
        } catch (err) {
          console.error(`Error fetching ${category}:`, err);
        }
      }

      // Shuffle and rank articles based on preferences
      const rankedArticles = rankArticlesByPreferences(allArticles, categoryPreferences);
      setArticles(rankedArticles);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [categoryPreferences]);

  // Fetch news when tags are selected
  useEffect(() => {
    if (selectedTags && selectedTags.length > 0) {
      fetchNews(selectedTags);
    }
  }, [selectedTags, fetchNews]);

  // Format date for display
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Rank articles based on user preferences
  function rankArticlesByPreferences(articles: Article[], preferences: Record<string, number>): Article[] {
    const shuffled = [...articles].sort(() => Math.random() - 0.5);
    
    return shuffled.sort((a, b) => {
      const scoreA = preferences[a.category] || 0;
      const scoreB = preferences[b.category] || 0;
      return scoreB - scoreA;
    });
  }

  // Handle swipe action
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (currentIndex >= articles.length) return;

    const article = articles[currentIndex];
    
    // Record swipe in history
    const swipe: SwipeHistory = {
      articleId: article.id,
      direction,
      category: article.category,
      timestamp: Date.now()
    };
    
    setSwipeHistory(prev => [...prev, swipe]);

    // Update category preferences
    setCategoryPreferences(prev => {
      const newPrefs = { ...prev };
      const currentScore = newPrefs[article.category] || 0;
      
      // Right swipe increases preference, left swipe decreases
      newPrefs[article.category] = currentScore + (direction === 'right' ? 2 : -1);
      
      return newPrefs;
    });

    // Move to next article
    setCurrentIndex(prev => prev + 1);

    // If we're running low on articles, fetch more
    if (currentIndex >= articles.length - 5 && selectedTags) {
      fetchNews(selectedTags);
    }
  }, [articles, currentIndex, selectedTags, fetchNews]);

  // Calculate trending topics based on swipe history
  const calculateTrendingTopics = useCallback((): string[] => {
    // Get last 24 hours of right swipes
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentSwipes = swipeHistory.filter(
      swipe => swipe.direction === 'right' && swipe.timestamp > oneDayAgo
    );

    // Count swipes per category
    const categoryCounts: Record<string, number> = {};
    recentSwipes.forEach(swipe => {
      categoryCounts[swipe.category] = (categoryCounts[swipe.category] || 0) + 1;
    });

    // Sort by count and return top 5
    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);
  }, [swipeHistory]);

  // Reset state
  const resetState = useCallback(() => {
    setCurrentIndex(0);
    setSwipeHistory([]);
    setCategoryPreferences({});
    if (selectedTags) {
      fetchNews(selectedTags);
    }
  }, [selectedTags, fetchNews]);

  // Get current articles to display (show 3 cards in stack)
  const currentArticles = articles.slice(currentIndex, currentIndex + 3);
  const hasMoreArticles = currentIndex < articles.length;
  const trendingTopics = calculateTrendingTopics();

  return {
    currentArticles,
    trendingTopics,
    hasMoreArticles,
    isLoading,
    error,
    handleSwipe,
    resetState
  };
}