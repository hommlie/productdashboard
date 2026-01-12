import { useState } from "react";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import BottomBar from "../../common/BottomBar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100">
      {/* Fixed Header */}
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Sidebar and Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />

        {/* Scrollable Main Content */}
        <main 
          className={`flex-1 overflow-y-auto p-6 pb-20 bg-gray-100 transition-all duration-300 ${
            sidebarOpen ? "md:ml-64" : "md:ml-20"
          }`}
        >
          {children}
        </main>
      </div>

      {/* Fixed Bottom Bar */}
      <BottomBar />
    </div>
  );
};

export default Layout;
