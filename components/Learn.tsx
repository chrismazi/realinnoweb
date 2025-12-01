import React, { useState, useMemo, useEffect } from 'react';
import { Article } from '../types';

// --- Icons ---
const Icons = {
    Back: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
    Search: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Clock: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Bookmark: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>,
    Share: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
    Play: (props: any) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>,
};

// --- Extended Data ---
interface ExtendedArticle extends Article {
    author: string;
    date: string;
    tags: string[];
    description: string;
}

const articlesData: ExtendedArticle[] = [
    { 
        id: '1', 
        title: 'The 50/30/20 Rule Simplified', 
        category: 'Finance', 
        readTime: '3 min', 
        imageUrl: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=800&q=80',
        author: 'Sarah Jenkins',
        date: 'Oct 24, 2024',
        tags: ['Budgeting', 'Beginner'],
        description: 'A simple framework to manage your after-tax income effectively: Needs, Wants, and Savings.',
        content: `
            <p>Managing money doesn't have to be complicated. The 50/30/20 rule is a simple, practical rule of thumb for budgeting.</p>
            <h3>How it works</h3>
            <p>The rule divides your after-tax income into three categories:</p>
            <ul>
                <li><strong>50% Needs:</strong> Essentials like rent, groceries, and utilities.</li>
                <li><strong>30% Wants:</strong> Non-essentials like dining out, hobbies, and entertainment.</li>
                <li><strong>20% Savings:</strong> Debt repayment, emergency funds, and investments.</li>
            </ul>
            <p>By sticking to these ratios, you ensure that you are living within your means while still building wealth for the future.</p>
            <h3>Getting Started</h3>
            <p>Review your last 3 months of bank statements. Categorize every expense into one of these three buckets. If your "Needs" exceed 50%, look for ways to reduce fixed costs like subscriptions or energy bills.</p>
        `
    },
    { 
        id: '2', 
        title: 'Compound Interest Magic', 
        category: 'Finance', 
        readTime: '5 min', 
        imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff0a77?auto=format&fit=crop&w=800&q=80',
        author: 'David Chen',
        date: 'Oct 20, 2024',
        tags: ['Investing', 'Wealth'],
        description: 'Einstein called it the eighth wonder of the world. Here is why starting early matters more than starting big.',
        content: `
            <p>Compound interest is the interest on a loan or deposit calculated based on both the initial principal and the accumulated interest from previous periods.</p>
            <h3>The Snowball Effect</h3>
            <p>Imagine rolling a snowball down a hill. As it rolls, it picks up more snow, becoming larger and faster. That is exactly how compound interest works for your money.</p>
            <p>If you invest $100 a month starting at age 25, assuming a 7% return, you'll have significantly more by age 65 than if you started investing $200 a month at age 45.</p>
        `
    },
    { 
        id: '3', 
        title: 'Mindfulness 101', 
        category: 'Wellness', 
        readTime: '4 min', 
        imageUrl: 'https://images.unsplash.com/photo-1544367563-12123d8250a6?auto=format&fit=crop&w=800&q=80',
        author: 'Dr. Emily Ray',
        date: 'Oct 18, 2024',
        tags: ['Mental Health', 'Anxiety'],
        description: 'Simple grounding techniques to reduce anxiety and stay present in the moment.',
        content: `
            <p>Mindfulness is the basic human ability to be fully present, aware of where we are and what we’re doing, and not overly reactive or overwhelmed by what’s going on around us.</p>
            <h3>3-3-3 Rule</h3>
            <p>When you feel overwhelmed, look around you and name:</p>
            <ul>
                <li>3 things you can see</li>
                <li>3 sounds you can hear</li>
                <li>3 parts of your body you can move</li>
            </ul>
            <p>This simple trick helps center your mind and brings you back to the present moment.</p>
        `
    },
    { 
        id: '4', 
        title: 'Investment Basics', 
        category: 'Growth', 
        readTime: '6 min', 
        imageUrl: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&w=800&q=80',
        author: 'Michael Ross',
        date: 'Oct 15, 2024',
        tags: ['Stocks', 'Beginner'],
        description: 'Stocks, bonds, and ETFs explained simply. Build a portfolio that matches your risk tolerance.',
        content: `
            <p>Investing is the act of allocating resources, usually money, with the expectation of generating an income or profit.</p>
            <h3>Stocks vs. Bonds</h3>
            <p><strong>Stocks</strong> represent ownership in a company. They offer higher potential returns but come with higher risk.</p>
            <p><strong>Bonds</strong> are a loan to a company or government. They pay interest over time and are generally safer than stocks.</p>
        `
    },
    { 
        id: '5', 
        title: 'Building an Emergency Fund', 
        category: 'Finance', 
        readTime: '4 min', 
        imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=800&q=80',
        author: 'Lisa Thompson',
        date: 'Oct 12, 2024',
        tags: ['Savings', 'Security'],
        description: 'Why 3-6 months of expenses saved can be your financial safety net.',
        content: `
            <p>An emergency fund is money set aside to cover unexpected expenses or financial emergencies.</p>
            <h3>How Much to Save</h3>
            <p>Financial experts recommend saving 3-6 months of living expenses. Start small - even $500 can cover many emergencies.</p>
            <h3>Where to Keep It</h3>
            <p>Keep your emergency fund in a high-yield savings account. It should be accessible but separate from your checking account.</p>
        `
    },
    { 
        id: '6', 
        title: 'Stress Management Techniques', 
        category: 'Wellness', 
        readTime: '5 min', 
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
        author: 'Dr. James Wilson',
        date: 'Oct 10, 2024',
        tags: ['Stress', 'Self-Care'],
        description: 'Practical strategies to manage daily stress and improve your mental wellbeing.',
        content: `
            <p>Stress is a normal part of life, but chronic stress can affect your health and wellbeing.</p>
            <h3>Deep Breathing</h3>
            <p>Practice the 4-7-8 technique: Breathe in for 4 seconds, hold for 7, exhale for 8. This activates your parasympathetic nervous system.</p>
            <h3>Physical Activity</h3>
            <p>Even a 10-minute walk can reduce stress hormones and boost endorphins.</p>
        `
    },
    { 
        id: '7', 
        title: 'Side Hustles That Actually Work', 
        category: 'Growth', 
        readTime: '7 min', 
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80',
        author: 'Alex Rivera',
        date: 'Oct 8, 2024',
        tags: ['Income', 'Entrepreneurship'],
        description: 'Realistic ways to earn extra income without quitting your day job.',
        content: `
            <p>A side hustle can provide extra income and even turn into a full-time business.</p>
            <h3>Freelancing</h3>
            <p>Use skills you already have - writing, design, programming, or consulting.</p>
            <h3>Online Selling</h3>
            <p>Platforms like Etsy, eBay, or Amazon make it easy to sell products online.</p>
        `
    },
    { 
        id: '8', 
        title: 'Sleep Hygiene Essentials', 
        category: 'Wellness', 
        readTime: '4 min', 
        imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
        author: 'Dr. Maria Santos',
        date: 'Oct 5, 2024',
        tags: ['Sleep', 'Health'],
        description: 'Better sleep habits for improved mental clarity and overall health.',
        content: `
            <p>Quality sleep is essential for physical and mental health.</p>
            <h3>Create a Routine</h3>
            <p>Go to bed and wake up at the same time every day, even on weekends.</p>
            <h3>Optimize Your Environment</h3>
            <p>Keep your bedroom cool, dark, and quiet. Avoid screens 1 hour before bed.</p>
        `
    },
    { 
        id: '9', 
        title: 'Credit Score Demystified', 
        category: 'Finance', 
        readTime: '6 min', 
        imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
        author: 'Robert Kim',
        date: 'Oct 3, 2024',
        tags: ['Credit', 'Financial Health'],
        description: 'Understanding and improving your credit score for better financial opportunities.',
        content: `
            <p>Your credit score affects your ability to get loans, rent apartments, and even get certain jobs.</p>
            <h3>What Affects Your Score</h3>
            <ul>
                <li>Payment history (35%)</li>
                <li>Credit utilization (30%)</li>
                <li>Length of credit history (15%)</li>
                <li>Credit mix (10%)</li>
                <li>New credit inquiries (10%)</li>
            </ul>
        `
    },
    { 
        id: '10', 
        title: 'Goal Setting Framework', 
        category: 'Growth', 
        readTime: '5 min', 
        imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80',
        author: 'Jennifer Adams',
        date: 'Oct 1, 2024',
        tags: ['Productivity', 'Success'],
        description: 'SMART goals and other frameworks to achieve what you set out to do.',
        content: `
            <p>Setting clear goals is the first step to achieving them.</p>
            <h3>SMART Goals</h3>
            <p>Make your goals Specific, Measurable, Achievable, Relevant, and Time-bound.</p>
            <h3>Break It Down</h3>
            <p>Large goals can be overwhelming. Break them into smaller, actionable steps.</p>
        `
    },
];

// Video content data
const videosData = [
    {
        id: 'v1',
        title: 'Budgeting Basics in 5 Minutes',
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff0a77?auto=format&fit=crop&w=800&q=80',
        duration: '5:23',
        category: 'Finance',
        views: '12.5K'
    },
    {
        id: 'v2',
        title: 'Morning Meditation Guide',
        thumbnail: 'https://images.unsplash.com/photo-1544367563-12123d8250a6?auto=format&fit=crop&w=800&q=80',
        duration: '10:00',
        category: 'Wellness',
        views: '8.2K'
    },
    {
        id: 'v3',
        title: 'Investing for Beginners',
        thumbnail: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&w=800&q=80',
        duration: '15:45',
        category: 'Finance',
        views: '25.1K'
    }
];

const ArticleReader: React.FC<{ article: ExtendedArticle; onBack: () => void; savedArticles: string[]; onSave: (id: string) => void; readProgress: Record<string, number>; onProgress: (id: string, progress: number) => void }> = ({ article, onBack, savedArticles, onSave, readProgress, onProgress }) => {
    const isSaved = savedArticles.includes(article.id);
    const progress = readProgress[article.id] || 0;
    
    // Track scroll progress
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const scrollProgress = Math.round((scrollTop / scrollHeight) * 100);
        onProgress(article.id, scrollProgress);
    };
    
    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col animate-slide-up overflow-hidden transition-colors duration-500">
            {/* Header Image with Gradient Overlay */}
            <div className="relative h-72 shrink-0">
                <img src={article.imageUrl} className="w-full h-full object-cover" alt={article.title} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-white dark:to-slate-950"></div>
                <button 
                    onClick={onBack}
                    className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                    <Icons.Back className="w-6 h-6" />
                </button>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                    <span className="inline-block px-3 py-1 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full mb-3 shadow-sm">
                        {article.category}
                    </span>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight mb-2 drop-shadow-sm">{article.title}</h1>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-300">
                         <span>{article.author}</span>
                         <span>•</span>
                         <span>{article.date}</span>
                         <span>•</span>
                         <span className="flex items-center gap-1"><Icons.Clock className="w-3 h-3" /> {article.readTime}</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-100 dark:bg-slate-800 w-full">
                <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 no-scrollbar" onScroll={handleScroll}>
                <div 
                    className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-600 dark:prose-li:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: article.content || '' }}
                />
                
                {/* Tags */}
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Ibyerekeranye</p>
                    <div className="flex flex-wrap gap-2">
                        {article.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="absolute bottom-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-gray-100 dark:border-slate-800 p-4 flex justify-between items-center pb-8">
                <button className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Icons.Share className="w-5 h-5" /> Sangiza
                </button>
                <button 
                    onClick={() => onSave(article.id)}
                    className={`px-6 py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform flex items-center gap-2 ${isSaved ? 'bg-teal-500 text-white shadow-teal-200 dark:shadow-none' : 'bg-slate-900 dark:bg-teal-600 text-white shadow-slate-200 dark:shadow-none'}`}
                >
                    <Icons.Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} /> {isSaved ? 'Yabitswe' : 'Bika Inyandiko'}
                </button>
            </div>
        </div>
    );
};

const Learn: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<ExtendedArticle | null>(null);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [readProgress, setReadProgress] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'articles' | 'videos' | 'saved'>('articles');

  // Load saved articles and progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedArticles');
    const progress = localStorage.getItem('readProgress');
    if (saved) setSavedArticles(JSON.parse(saved));
    if (progress) setReadProgress(JSON.parse(progress));
  }, []);

  // Save article handler
  const handleSaveArticle = (id: string) => {
    const newSaved = savedArticles.includes(id) 
      ? savedArticles.filter(a => a !== id)
      : [...savedArticles, id];
    setSavedArticles(newSaved);
    localStorage.setItem('savedArticles', JSON.stringify(newSaved));
    
    // Show toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-teal-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
    toast.textContent = savedArticles.includes(id) ? 'Inyandiko yakuweho' : 'Inyandiko yabitswe!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  // Update reading progress
  const handleProgressUpdate = (id: string, progress: number) => {
    const newProgress = { ...readProgress, [id]: progress };
    setReadProgress(newProgress);
    localStorage.setItem('readProgress', JSON.stringify(newProgress));
  };

  const categories = ['All', 'Finance', 'Wellness', 'Growth'];

  const filteredArticles = useMemo(() => {
    return articlesData.filter(article => {
        const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              article.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const featuredArticle = filteredArticles[0];
  const listArticles = filteredArticles.slice(1);

  // Get saved articles data
  const savedArticlesData = useMemo(() => {
    return articlesData.filter(a => savedArticles.includes(a.id));
  }, [savedArticles]);

  if (selectedArticle) {
      return <ArticleReader 
        article={selectedArticle} 
        onBack={() => setSelectedArticle(null)} 
        savedArticles={savedArticles}
        onSave={handleSaveArticle}
        readProgress={readProgress}
        onProgress={handleProgressUpdate}
      />;
  }

  return (
      <div className="h-full overflow-y-auto pb-40 no-scrollbar bg-gray-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-500">
          {/* Header */}
          <div className="pt-14 px-6 pb-4 bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-sm transition-colors duration-300">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Ikigo cy'Ubumenyi</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 font-medium">Ubwenge bwa buri munsi.</p>
            
            {/* Tab Switcher */}
            <div className="flex gap-2 mt-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('articles')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'articles' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                Inyandiko
              </button>
              <button 
                onClick={() => setActiveTab('videos')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'videos' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                Amashusho
              </button>
              <button 
                onClick={() => setActiveTab('saved')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'saved' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                Zabitswe ({savedArticles.length})
              </button>
            </div>
            
            {/* Search */}
            <div className="mt-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.Search className="w-5 h-5" />
                </div>
                <input 
                    type="text" 
                    placeholder="Shakisha inyandiko..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 transition-all placeholder-gray-400 dark:text-white"
                />
            </div>

            {/* Categories */}
            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                            activeCategory === cat 
                            ? 'bg-slate-900 text-white border-slate-900 dark:bg-teal-600 dark:border-teal-600 shadow-md' 
                            : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
          </div>

          <div className="p-6 space-y-8 animate-slide-up">
              {/* Videos Tab */}
              {activeTab === 'videos' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white px-1">Amasomo y'Amashusho</h3>
                  {videosData.map(video => (
                    <div key={video.id} className="relative rounded-[2rem] overflow-hidden group cursor-pointer active:scale-[0.98] transition-all">
                      <img src={video.thumbnail} className="w-full h-48 object-cover" alt={video.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:bg-white group-hover:text-slate-900 transition-all">
                          <Icons.Play className="w-6 h-6 text-white group-hover:text-slate-900 ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 p-5 w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-teal-500 text-white text-[10px] font-bold rounded-md">{video.category}</span>
                          <span className="text-white/80 text-[10px] font-bold">{video.views} barebye</span>
                        </div>
                        <h4 className="text-white font-bold text-lg">{video.title}</h4>
                        <span className="text-white/60 text-xs font-medium">{video.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Saved Tab */}
              {activeTab === 'saved' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white px-1">Inyandiko Zabitswe</h3>
                  {savedArticlesData.length > 0 ? savedArticlesData.map(article => (
                    <div key={article.id} onClick={() => setSelectedArticle(article)} className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 cursor-pointer group hover:shadow-md transition-all active:scale-[0.99]">
                      <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden relative">
                        <img src={article.imageUrl} className="w-full h-full object-cover" alt={article.title} />
                        {readProgress[article.id] > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
                            <div className="h-full bg-teal-500" style={{ width: `${readProgress[article.id]}%` }}></div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">{article.category}</span>
                        <h4 className="font-bold text-slate-900 dark:text-white leading-snug mb-1 line-clamp-2">{article.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <Icons.Clock className="w-3 h-3" />
                          <span>{article.readTime}</span>
                          {readProgress[article.id] > 0 && (
                            <span className="text-teal-500">{readProgress[article.id]}% byasomwe</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 opacity-50">
                      <Icons.Bookmark className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Nta nyandiko zabitswe</p>
                      <p className="text-xs text-gray-400 mt-1">Bika inyandiko uzasome nyuma</p>
                    </div>
                  )}
                </div>
              )}

              {/* Articles Tab - Featured Hero Card */}
              {activeTab === 'articles' && featuredArticle && (
                  <div onClick={() => setSelectedArticle(featuredArticle)} className="relative h-80 rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-none group cursor-pointer active:scale-[0.98] transition-all">
                      <img src={featuredArticle.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Featured" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                      
                      <div className="absolute top-5 right-5 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-slate-900 transition-colors">
                          <Icons.Play className="w-5 h-5 ml-1" />
                      </div>

                      <div className="absolute bottom-0 left-0 p-6 w-full">
                          <div className="flex items-center gap-2 mb-3">
                              <span className="px-2 py-1 bg-teal-500 text-white text-[10px] font-bold uppercase rounded-md shadow-sm">Ibyiza</span>
                              <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold uppercase rounded-md">{featuredArticle.category}</span>
                          </div>
                          <h2 className="text-2xl font-bold text-white leading-tight mb-2 line-clamp-2">{featuredArticle.title}</h2>
                          <p className="text-slate-300 text-xs font-medium line-clamp-2 mb-4 opacity-90">{featuredArticle.description}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                              <span>{featuredArticle.readTime} gusoma</span>
                              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                              <span>{featuredArticle.date}</span>
                          </div>
                      </div>
                  </div>
              )}

              {/* List Section */}
              {listArticles.length > 0 && (
                  <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1">Ibikunzwe Ubu</h3>
                      <div className="space-y-4">
                          {listArticles.map(article => (
                              <div key={article.id} onClick={() => setSelectedArticle(article)} className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-none cursor-pointer group hover:shadow-md transition-all active:scale-[0.99]">
                                  <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden relative">
                                      <img src={article.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={article.title} />
                                  </div>
                                  <div className="flex flex-col justify-center flex-1">
                                      <div className="flex justify-between items-start mb-1">
                                          <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">{article.category}</span>
                                      </div>
                                      <h4 className="font-bold text-slate-900 dark:text-white leading-snug mb-1 line-clamp-2">{article.title}</h4>
                                      <p className="text-xs text-slate-400 font-medium line-clamp-1 mb-2">{article.description}</p>
                                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                          <Icons.Clock className="w-3 h-3" />
                                          <span>{article.readTime}</span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
              
              {filteredArticles.length === 0 && (
                  <div className="text-center py-20 opacity-50">
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Nta nyandiko zabonetse.</p>
                  </div>
              )}
          </div>
      </div>
  )
}

export default Learn;