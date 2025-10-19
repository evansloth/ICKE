import { Article } from '@/hooks/use-explore-state';

const NEWS_API_KEY = '010acdfe83584c45bf94c6e16c46735e';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const METADATA_API_URL = 'https://chb3tvmv0c.execute-api.us-east-1.amazonaws.com/metadata';

// Map our categories to News API categories and search terms
const CATEGORY_MAPPING: { [key: string]: { category?: string; query?: string } } = {
  'Entertainment': { category: 'entertainment' },
  'Politics': { query: 'politics' },
  'Stock Market': { query: 'stock market' },
  'Finance': { query: 'finance' },
  'Technology': { category: 'technology' },
  'Sports': { category: 'sports' },
  'Health': { category: 'health' },
  'Science': { category: 'science' },
  'Art': { query: 'art' },
  'Business': { category: 'business' },
  'World News': { query: 'world news' }
};

// Interface for the metadata API response
interface MetadataResponse {
  title: string;
  url: string;
  canonical_url: string;
  publication_date: string | null;
  authors: string[];
  summary: string;
  key_points: string[];
  notable_quotes: Array<{
    speaker: string | null;
    quote: string;
  }>;
  metadata: {
    description?: string;
    'og:image'?: string;
    [key: string]: any;
  };
  related_entities: any[];
}

export class NewsService {
  static async fetchArticles(categories?: string[]): Promise<Article[]> {
    try {
      if (!categories || categories.length === 0) {
        // Fetch general top headlines
        return await this.fetchTopHeadlines();
      }

      // Fetch articles for each selected category
      const allArticles: Article[] = [];

      for (const category of categories) {
        console.log(`Fetching articles for category: ${category}`);
        const mapping = CATEGORY_MAPPING[category];

        if (mapping) {
          try {
            let articles: Article[] = [];

            if (mapping.category) {
              // Use category endpoint
              console.log(`Using category endpoint for: ${mapping.category}`);
              articles = await this.fetchByCategory(mapping.category);
            } else if (mapping.query) {
              // Use search endpoint
              console.log(`Using search endpoint for: ${mapping.query}`);
              articles = await this.fetchByQuery(mapping.query);
            }

            console.log(`Found ${articles.length} articles for ${category}`);

            // Add category tag to articles
            articles = articles.map(article => ({
              ...article,
              category: category
            }));

            allArticles.push(...articles);
          } catch (error) {
            console.error(`Error fetching articles for category ${category}:`, error);
            // Continue with other categories even if one fails
          }
        } else {
          console.warn(`No mapping found for category: ${category}`);
        }
      }

      // Remove duplicates and limit results
      const uniqueArticles = this.removeDuplicates(allArticles);
      return uniqueArticles.slice(0, 20); // Limit to 20 articles

    } catch (error) {
      console.error('Error fetching articles:', error);
      // Return fallback articles on error
      return this.getFallbackArticles(categories);
    }
  }

  private static async fetchTopHeadlines(): Promise<Article[]> {
    const response = await fetch(
      `${NEWS_API_BASE_URL}/top-headlines?country=us&pageSize=20&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return await this.transformArticles(data.articles);
  }

  private static async fetchByCategory(category: string): Promise<Article[]> {
    const response = await fetch(
      `${NEWS_API_BASE_URL}/top-headlines?category=${category}&country=us&pageSize=10&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return await this.transformArticles(data.articles);
  }

  private static async fetchByQuery(query: string): Promise<Article[]> {
    const response = await fetch(
      `${NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return await this.transformArticles(data.articles);
  }

  private static async transformArticles(apiArticles: any[]): Promise<Article[]> {
    const filteredArticles = apiArticles.filter(article =>
      article.title &&
      article.title !== '[Removed]' &&
      article.description &&
      article.description !== '[Removed]' &&
      article.url
    );

    console.log(`Processing ${filteredArticles.length} articles for metadata extraction`);

    // For now, let's skip metadata extraction to test the basic flow
    // We can enable it later once we confirm the News API is working
    const articlesWithBasicData = filteredArticles.map((article, index) => ({
      id: (Date.now() + index + Math.random()).toString(),
      title: article.title,
      description: article.description || 'No description available',
      content: article.content || article.description || 'Content not available',
      url: article.url,
      source: article.source?.name || 'Unknown Source',
      publishDate: this.formatDate(article.publishedAt),
      category: 'General', // Will be overridden by caller
      imageUrl: article.urlToImage || '',
      keyPoints: article.description ? [article.description] : [],
      summary: article.description || 'No summary available',
      authors: [article.source?.name || 'Unknown'],
      metadata: {}
    }));

    // TODO: Re-enable metadata extraction once basic flow is working
    /*
    // Extract metadata for each article (commented out for testing)
    const articlesWithMetadata = await Promise.all(
      filteredArticles.map(async (article, index) => {
        try {
          const metadata = await this.extractMetadata(article.url);
          return this.createArticleFromMetadata(metadata, article, index);
        } catch (error) {
          console.error(`Failed to extract metadata for ${article.url}:`, error);
          // Fallback to basic article data
          return articlesWithBasicData[index];
        }
      })
    );
    return articlesWithMetadata;
    */

    return articlesWithBasicData;
  }

  private static async extractMetadata(url: string): Promise<MetadataResponse> {
    const response = await fetch(METADATA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Metadata API error! status: ${response.status}`);
    }

    return await response.json();
  }

  private static createArticleFromMetadata(metadata: MetadataResponse, originalArticle: any, index: number): Article {
    return {
      id: (Date.now() + index).toString(),
      title: metadata.title || originalArticle.title,
      description: metadata.summary || originalArticle.description || 'No description available',
      content: metadata.summary || originalArticle.content || 'Content not available',
      url: metadata.url || originalArticle.url,
      source: metadata.authors?.[0] || originalArticle.source?.name || 'Unknown Source',
      publishDate: metadata.publication_date ? this.formatDate(metadata.publication_date) : this.formatDate(originalArticle.publishedAt),
      category: 'General', // Will be overridden by caller
      imageUrl: metadata.metadata?.['og:image'] || originalArticle.urlToImage || '',
      keyPoints: metadata.key_points || [],
      summary: metadata.summary || 'No summary available',
      authors: metadata.authors || [],
      metadata: metadata.metadata || {},
      notableQuotes: metadata.notable_quotes || []
    };
  }

  private static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  }

  private static removeDuplicates(articles: Article[]): Article[] {
    const seen = new Set();
    return articles.filter(article => {
      const key = article.title.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private static getFallbackArticles(categories?: string[]): Article[] {
    // Fallback articles in case API fails
    const fallbackArticles: Article[] = [
      {
        id: "1",
        title: "Stay Connected - News Loading",
        description: "We're working to bring you the latest news. Please check your internet connection and try again.",
        content: "Unable to load news content at this time.",
        url: "#",
        source: "System",
        publishDate: "Now",
        category: categories?.[0] || "General",
        imageUrl: "",
      }
    ];

    return fallbackArticles;
  }

  static async fetchMoreArticles(offset: number = 0, categories?: string[]): Promise<Article[]> {
    // For pagination, we can fetch more articles with different page parameters
    try {
      if (!categories || categories.length === 0) {
        const response = await fetch(
          `${NEWS_API_BASE_URL}/top-headlines?country=us&page=2&pageSize=10&apiKey=${NEWS_API_KEY}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return this.transformArticles(data.articles);
      }

      // For now, return a subset of the original fetch
      const articles = await this.fetchArticles(categories);
      return articles.slice(5, 15); // Return different slice for "more" articles

    } catch (error) {
      console.error('Error fetching more articles:', error);
      return [];
    }
  }
}