import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, Search, Bell, LogOut } from "lucide-react";

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Hamburger */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/hommlieloogo.png"
            alt="Logo"
            className="h-8 md:h-9 object-contain"
          />
        </div>
      </div>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full group">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-indigo-500 transition-colors">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent border focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 rounded-xl outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Profile & Notifications */}
      <div className="flex items-center gap-2 md:gap-4">
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>

        <div className="h-8 w-px bg-gray-200 mx-1"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name || "Admin"}</p>
            <p className="text-xs text-indigo-500 font-medium tracking-tight">Super Admin</p>
          </div>
          <div className="relative">
            <img
              src={`https://ui-avatars.com/api/?name=${user?.name || "A"}&background=6366f1&color=fff&bold=true`}
              alt="profile"
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl border-2 border-indigo-50 object-cover shadow-sm"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
