import React, { useState, useMemo } from 'react';
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
];

const ArticleReader: React.FC<{ article: ExtendedArticle; onBack: () => void }> = ({ article, onBack }) => {
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

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 no-scrollbar">
                <div 
                    className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-600 dark:prose-li:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: article.content || '' }}
                />
                
                {/* Tags */}
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Related Topics</p>
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
                    <Icons.Share className="w-5 h-5" /> Share
                </button>
                <button className="bg-slate-900 dark:bg-teal-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-200 dark:shadow-none active:scale-95 transition-transform flex items-center gap-2">
                    <Icons.Bookmark className="w-4 h-4" /> Save Article
                </button>
            </div>
        </div>
    );
};

const Learn: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<ExtendedArticle | null>(null);

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

  if (selectedArticle) {
      return <ArticleReader article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
  }

  return (
      <div className="h-full overflow-y-auto pb-40 no-scrollbar bg-gray-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-500">
          {/* Header */}
          <div className="pt-14 px-6 pb-4 bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-sm transition-colors duration-300">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Knowledge Hub</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 font-medium">Daily bite-sized wisdom.</p>
            
            {/* Search */}
            <div className="mt-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.Search className="w-5 h-5" />
                </div>
                <input 
                    type="text" 
                    placeholder="Search topics..." 
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
              {/* Featured Hero Card */}
              {featuredArticle && (
                  <div onClick={() => setSelectedArticle(featuredArticle)} className="relative h-80 rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-none group cursor-pointer active:scale-[0.98] transition-all">
                      <img src={featuredArticle.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Featured" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                      
                      <div className="absolute top-5 right-5 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-slate-900 transition-colors">
                          <Icons.Play className="w-5 h-5 ml-1" />
                      </div>

                      <div className="absolute bottom-0 left-0 p-6 w-full">
                          <div className="flex items-center gap-2 mb-3">
                              <span className="px-2 py-1 bg-teal-500 text-white text-[10px] font-bold uppercase rounded-md shadow-sm">Featured</span>
                              <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold uppercase rounded-md">{featuredArticle.category}</span>
                          </div>
                          <h2 className="text-2xl font-bold text-white leading-tight mb-2 line-clamp-2">{featuredArticle.title}</h2>
                          <p className="text-slate-300 text-xs font-medium line-clamp-2 mb-4 opacity-90">{featuredArticle.description}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                              <span>{featuredArticle.readTime} read</span>
                              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                              <span>{featuredArticle.date}</span>
                          </div>
                      </div>
                  </div>
              )}

              {/* List Section */}
              {listArticles.length > 0 && (
                  <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1">Trending Now</h3>
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
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No articles found.</p>
                  </div>
              )}
          </div>
      </div>
  )
}

export default Learn;