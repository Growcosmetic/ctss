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
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
