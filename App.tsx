import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout, AdminLayout } from './components/Layouts';
import { AdminGuard } from './components/AdminGuard';
import { Home, About, Journalists, Contact, News, ArticleView } from './components/PublicPages';
import { 
  AdminLogin, 
  AdminForgotPassword,
  AdminDashboard, 
  AdminJournalists, 
  AdminEditor, 
  AdminSettings, 
  AdminAnalytics, 
  AdminMediaLibrary 
} from './components/AdminPages';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect old hash URLs (#/admin/login) to path URLs (/admin/login) so invite links and bookmarks work
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/') && hash.length > 2) {
      const path = (window.location.pathname.replace(/\/$/, '') || '/') + hash.slice(1);
      window.location.replace(path + window.location.search);
      return;
    }
  }, []);

  useEffect(() => {
    // Function to check if fonts are ready
    const waitForFonts = async () => {
      try {
        await document.fonts.ready;
        // Add a small artificial delay to ensure smooth visual transition
        // and prevent the preloader from flickering too quickly
        setTimeout(() => {
          setIsLoading(false);
        }, 1200);
      } catch (e) {
        // Fallback in case of error
        setIsLoading(false);
      }
    };

    waitForFonts();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-primary flex flex-col items-center justify-center z-[100] transition-opacity duration-500">
        {/* 
           Hidden elements to force browser to fetch font resources immediately 
           so document.fonts.ready has something to wait for.
        */}
        <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
           <span className="material-icons">check</span>
           <span className="material-icons-outlined">check</span>
           <span className="font-display font-bold">Load</span>
           <span className="font-serif italic">Load</span>
        </div>

        <div className="relative flex items-center justify-center mb-8">
            {/* Outer Ring */}
            <div className="absolute w-24 h-24 border-2 border-white/10 rounded-full"></div>
            
            {/* Spinning Indicator */}
            <div className="absolute w-24 h-24 border-2 border-t-primary-light border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            
            {/* Pulse Core */}
            <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
        </div>
        
        <div className="text-center space-y-3">
           <h1 className="text-white text-3xl font-bold tracking-[0.25em] font-display">ACJ EKSU</h1>
           <div className="flex items-center justify-center gap-1">
             <div className="w-1 h-1 bg-primary-light rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
             <div className="w-1 h-1 bg-primary-light rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
             <div className="w-1 h-1 bg-primary-light rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<ArticleView />} />
          <Route path="about" element={<About />} />
          <Route path="journalists" element={<Journalists />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Admin Login - Standalone */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

        {/* Admin Dashboard Routes (protected) */}
        <Route path="/admin" element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="journalists" element={<AdminJournalists />} />
            <Route path="editor" element={<AdminEditor />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="media" element={<AdminMediaLibrary />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;