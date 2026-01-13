import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Tag,
  Box,
  ShoppingCart,
  Users,
  Settings,
  LogOut
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, to: "/" },
  { name: "Category", icon: Tag, to: "/category" },
  { name: "Sub Category", icon: Tag, to: "/subcategory" },
  { name: "Products", icon: Box, to: "/products" },
  { name: "Product Orders", icon: ShoppingCart, to: "/product-orders" },
  { name: "Customers", icon: Users, to: "/customers" },
  { name: "Settings", icon: Settings, to: "/settings" },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full bg-white border-r border-gray-100 
        transition-all duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none
        ${isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-20"}
        pt-16`}
      >
        {/* Menu Items */}
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 768) toggleSidebar();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`font-medium transition-opacity duration-300 ${!isOpen && "md:hidden"}`}>
                    {item.name}
                  </span>

                  {!isOpen && (
                    <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity hidden md:block whitespace-nowrap z-[60]">
                      {item.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all duration-200 group relative"
          >
            <LogOut size={22} strokeWidth={2} />
            <span className={`font-medium transition-opacity duration-300 ${!isOpen && "md:hidden"}`}>
              Logout
            </span>

            {!isOpen && (
              <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity hidden md:block whitespace-nowrap z-[60]">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
