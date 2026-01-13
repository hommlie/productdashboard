import { useState, useEffect } from "react";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import BottomBar from "../../common/BottomBar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  // Update sidebar state on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f8fafc]">
      {/* Fixed Header */}
      <Header toggleSidebar={toggleSidebar} />

      {/* Sidebar and Main Content */}
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Content Wrapper */}
        <div
          className={`flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ease-in-out custom-scrollbar
          ${sidebarOpen ? "md:ml-64" : "md:ml-20"} w-full`}
        >
          {/* Main Area */}
          <main className="flex-1 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          {/* Bottom Bar naturally at the end */}
          <BottomBar />
        </div>
      </div>

      {/* Global Style Inject for custom scrollbar */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes bounceSlow { 0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); } 50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-slide-up { animation: slideInUp 0.6s ease-out forwards; }
        .animate-bounce-slow { animation: bounceSlow 3s infinite; }
      `}} />
    </div>
  );
};

export default Layout;
