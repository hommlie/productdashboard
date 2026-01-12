import { useAuth } from "../context/AuthContext";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-5 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Hamburger */}
        <button
          onClick={toggleSidebar}
          className="text-2xl text-gray-600 hover:text-indigo-600"
        >
          ☰
        </button>

        {/* Logo */}
        <img
          src="/hommlieloogo.png"
          alt="Logo"
          className="h-9 object-contain"
        />
      </div>

      {/* Search */}
      <div className="hidden md:block w-1/3">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Profile */}
      <div className="flex items-center gap-4">
        <span className="text-xl cursor-pointer">🔔</span>
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-800">{user?.name || "Admin"}</p>
            <p className="text-[10px] text-gray-400">Dashboard Access</p>
          </div>
          <img
            src={`https://ui-avatars.com/api/?name=${user?.name || "A"}&background=random`}
            alt="profile"
            className="w-9 h-9 rounded-full border-2 border-emerald-100"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
