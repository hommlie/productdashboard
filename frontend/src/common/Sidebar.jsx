import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { name: "Dashboard", icon: "📊", to: "/" },
  { name: "Category", icon: "🏷️", to: "/category" },
  { name: "Sub Category", icon: "🏷️", to: "/subcategory" },
  { name: "Products", icon: "📦", to: "/products" },
  { name: "Product Orders", icon: "🛒", to: "/product-orders" },
  { name: "Customers", icon: "👥", to: "/customers" },
  { name: "Settings", icon: "⚙️", to: "/settings" },
];

const Sidebar = ({ isOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`fixed top-16 left-0 bg-gradient-to-b from-green-50 via-green-100 to-green-300
      border-r transition-all duration-300 hidden md:flex flex-col
      ${isOpen ? "w-64" : "w-20"}
      h-[calc(100vh-8rem)]`}  // ⬅️ header (4rem) + footer (4rem)
    >
      {/* Menu */}
      <ul className="flex-1 p-3 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => (
          <li key={index}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                ${isActive
                  ? "bg-indigo-100 text-indigo-700 font-semibold"
                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && <span>{item.name}</span>}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Logout (STICKY BOTTOM) */}
      <div className="p-3 border-t border-green-300 bg-green-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg
          text-white bg-red-500 hover:bg-red-600 transition"
        >
          <span className="text-xl">🔓</span>
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
