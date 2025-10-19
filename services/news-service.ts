import { Article } from '@/hooks/use-explore-state';

// Simulated news service - in a real app, this would connect to a news API
export class NewsService {
  private static articles: Article[] = [
    {
      id: 1,
      title: "Revolutionary AI Breakthrough Changes Everything",
      description: "Scientists have developed a new AI system that can understand and generate human-like responses with unprecedented accuracy, marking a significant milestone in artificial intelligence research.",
      source: "Tech Today",
      publishDate: "2 hours ago",
      category: "Technology",
      image: "https://picsum.photos/400/250?random=1"
    },
    {
      id: 2,
      title: "Global Markets Surge on Economic Recovery",
      description: "Stock markets worldwide are experiencing significant gains as economic indicators point to a strong recovery from recent downturns, with tech stocks leading the charge.",
      source: "Financial Times",
      publishDate: "4 hours ago",
      category: "Finance",
      image: "https://picsum.photos/400/250?random=2"
    },
    {
      id: 3,
      title: "Climate Change Summit Reaches Historic Agreement",
      description: "World leaders have reached a groundbreaking agreement on climate action that could reshape global environmental policy for decades to come.",
      source: "World News",
      publishDate: "6 hours ago",
      category: "World News",
      image: "https://picsum.photos/400/250?random=3"
    },
    {
      id: 4,
      title: "New Health Study Reveals Surprising Benefits",
      description: "A comprehensive study involving 50,000 participants has uncovered unexpected health benefits of a common daily habit that millions practice worldwide.",
      source: "Health Weekly",
      publishDate: "8 hours ago",
      category: "Health",
      image: "https://picsum.photos/400/250?random=4"
    },
    {
      id: 5,
      title: "Sports Championship Delivers Thrilling Finale",
      description: "The championship game delivered one of the most exciting finishes in sports history, with a last-second victory that had fans on the edge of their seats.",
      source: "Sports Central",
      publishDate: "1 day ago",
      category: "Sports",
      image: "https://picsum.photos/400/250?random=5"
    },
    {
      id: 6,
      title: "Breakthrough in Renewable Energy Storage",
      description: "New battery technology promises to revolutionize how we store and use renewable energy sources, potentially solving one of clean energy's biggest challenges.",
      source: "Green Tech",
      publishDate: "1 day ago",
      category: "Science",
      image: "https://picsum.photos/400/250?random=6"
    },
    {
      id: 7,
      title: "Art Exhibition Breaks Attendance Records",
      description: "The latest contemporary art exhibition has attracted record-breaking crowds from around the world, showcasing innovative works from emerging artists.",
      source: "Art Weekly",
      publishDate: "2 days ago",
      category: "Art",
      image: "https://picsum.photos/400/250?random=7"
    },
    {
      id: 8,
      title: "Business Leaders Discuss Future Trends",
      description: "Top executives gather to discuss emerging trends that will shape the business landscape, including AI integration and sustainable practices.",
      source: "Business Today",
      publishDate: "2 days ago",
      category: "Business",
      image: "https://picsum.photos/400/250?random=8"
    },
    {
      id: 9,
      title: "Political Reform Gains Momentum",
      description: "New legislative proposals are gaining bipartisan support, potentially leading to significant changes in how government operates.",
      source: "Political Review",
      publishDate: "3 days ago",
      category: "Politics",
      image: "https://picsum.photos/400/250?random=9"
    },
    {
      id: 10,
      title: "Entertainment Industry Embraces New Technology",
      description: "Studios are adopting cutting-edge technology to create more immersive experiences for audiences worldwide.",
      source: "Entertainment Weekly",
      publishDate: "3 days ago",
      category: "Entertainment",
      image: "https://picsum.photos/400/250?random=10"
    }
  ];

  static async fetchArticles(categories?: string[]): Promise<Article[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (categories && categories.length > 0) {
      return this.articles.filter(article => 
        categories.includes(article.category)
      );
    }
    
    return this.articles;
  }

  static async fetchMoreArticles(offset: number = 0): Promise<Article[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate more articles by cycling through existing ones with new IDs
    const moreArticles = this.articles.slice(0, 5).map((article, index) => ({
      ...article,
      id: article.id + offset + 100,
      publishDate: this.getRandomTimeAgo(),
    }));
    
    return moreArticles;
  }

  private static getRandomTimeAgo(): string {
    const timeOptions = [
      '1 hour ago', '2 hours ago', '3 hours ago', '4 hours ago',
      '5 hours ago', '1 day ago', '2 days ago', '3 days ago'
    ];
    return timeOptions[Math.floor(Math.random() * timeOptions.length)];
  }
}