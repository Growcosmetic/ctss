import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FAFAFA" }}>
      {/* Sidebar - chỉ sidebar có background mint */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: "240px" }}>
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
