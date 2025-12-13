"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";
import { useUIStore } from "@/store/useUIStore";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useUIStore();
  
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FAFAFA" }}>
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Skip to content
      </a>

      {/* Sidebar - chỉ sidebar có background mint */}
      <Sidebar />
      
      {/* Main Content Area - adjust margin based on sidebar state */}
      <div 
        className="flex-1 flex flex-col transition-all duration-300 ease-in-out" 
        style={{ marginLeft: sidebarOpen ? "240px" : "0" }}
      >
        {/* Header nằm trong main content */}
        <Header />
        
        {/* Main content */}
        <main id="main-content" className="flex-1 p-6" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
