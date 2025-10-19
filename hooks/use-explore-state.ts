import { useCallback, useEffect, useState } from 'react';
import { NewsService } from '../services/news-service';

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
  keyPoints?: string[];
  summary?: string;
  authors?: string[];
  metadata?: { [key: string]: any };
  notableQuotes?: Array<{
    speaker: string | null;
    quote: string;
  }>;
}

interface SwipeHistory {
  articleId: string;
  direction: 'left' | 'right';
  category: string;
  timestamp: number;
}



export function useExploreState(selectedTags?: string[]) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState<SwipeHistory[]>([]);
  const [categoryPreferences, setCategoryPreferences] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likedArticles, setLikedArticles] = useState<Article[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);

  // Fetch news articles using NewsService
  const fetchNews = useCallback(async (categories: string[]) => {
    if (!categories || categories.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching articles for categories:', categories);
      const articles = await NewsService.fetchArticles(categories);
      console.log('Received articles:', articles.length);
      
      if (articles.length === 0) {
        console.warn('No articles received from NewsService');
        setError('No articles found for selected categories. Please try different topics.');
      } else {
        console.log('Article categories:', articles.map(a => a.category));
        setArticles(articles);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch news when tags are selected
  useEffect(() => {
    if (selectedTags && selectedTags.length > 0) {
      fetchNews(selectedTags);
    }
  }, [selectedTags, fetchNews]);

  // Debug: Log trending topics changes
  useEffect(() => {
    console.log('Trending topics updated:', trendingTopics);
  }, [trendingTopics]);

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

  // Extract trending topics from article metadata
  const extractTrendingTopics = useCallback((article: Article): string[] => {
    console.log('Extracting topics from article:', article.title);
    
    const topics: string[] = [];
    const stopWords = ['about', 'their', 'would', 'could', 'should', 'which', 'where', 'there', 'these', 'those', 'after', 'before', 'during', 'while', 'since', 'until', 'through', 'against', 'between', 'among'];
    
    // Add category as a topic
    topics.push(article.category);
    
    // Extract topics from description (which is currently used as keyPoints)
    if (article.description) {
      const descriptionWords = article.description
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 4)
        .filter(word => !stopWords.includes(word))
        .filter(word => !/^\d+$/.test(word)); // Remove pure numbers
      
      // Take the most meaningful words
      topics.push(...descriptionWords.slice(0, 3));
    }
    
    // Extract topics from title (more aggressive extraction)
    const titleWords = article.title
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3) // Slightly shorter words from titles
      .filter(word => !stopWords.includes(word))
      .filter(word => !/^\d+$/.test(word)); // Remove pure numbers
    
    topics.push(...titleWords.slice(0, 3));
    
    // Extract topics from source name (news organizations often indicate topic areas)
    if (article.source && article.source.length > 3) {
      const sourceWords = article.source
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter(word => !['news', 'times', 'post', 'daily', 'weekly'].includes(word));
      
      topics.push(...sourceWords.slice(0, 1));
    }
    
    const uniqueTopics = [...new Set(topics)].filter(topic => topic && topic.trim().length > 0);
    console.log('Final extracted topics:', uniqueTopics);
    return uniqueTopics;
  }, []);

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

    // If user swiped right, add to liked articles and update trending topics
    if (direction === 'right') {
      console.log('User swiped right on article:', article.title);
      setLikedArticles(prev => [...prev, article]);
      
      // Extract trending topics from this article's metadata
      const articleTopics = extractTrendingTopics(article);
      console.log('Extracted topics from article:', articleTopics);
      
      setTrendingTopics(prev => {
        console.log('Previous trending topics:', prev);
        console.log('New article topics:', articleTopics);
        
        // Add new topics to the beginning and keep only the most recent 5 unique topics
        const recentTopics = [...articleTopics, ...prev];
        const uniqueRecentTopics = [...new Set(recentTopics)].slice(0, 5);
        
        console.log('Updated trending topics (most recent):', uniqueRecentTopics);
        return uniqueRecentTopics;
      });
    }

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
  }, [articles, currentIndex, selectedTags, fetchNews, extractTrendingTopics]);

  // Reset state
  const resetState = useCallback(() => {
    setCurrentIndex(0);
    setSwipeHistory([]);
    setCategoryPreferences({});
    setLikedArticles([]);
    setTrendingTopics([]);
    if (selectedTags) {
      fetchNews(selectedTags);
    }
  }, [selectedTags, fetchNews]);

  // Get current articles to display (show 3 cards in stack)
  const currentArticles = articles.slice(currentIndex, currentIndex + 3);
  const hasMoreArticles = currentIndex < articles.length;

  return {
    currentArticles,
    trendingTopics,
    hasMoreArticles,
    isLoading,
    error,
    handleSwipe,
    resetState,
    likedArticles
  };
}