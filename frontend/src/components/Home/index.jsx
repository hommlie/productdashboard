import { useState, useEffect } from "react";
import Layout from "../Layout";
import {
  Plus,
  Download,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingBag,
  DollarSign,
  Users as UsersIcon,
  Search,
  Calendar
} from "lucide-react";

const Home = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    growth: {
      products: 0,
      orders: 0,
      revenue: 0,
      customers: 0
    }
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await fetch("/api/dashboard/stats");
        const statsResult = await statsRes.json();

        if (statsResult.success) {
          setStats(statsResult.data.stats);
          setRecentOrders(statsResult.data.recentOrders);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    { title: "Total Products", value: stats.totalProducts, growth: stats.growth.products, icon: Package, color: "text-blue-600", bg: "bg-blue-100/50" },
    { title: "Orders", value: stats.totalOrders, growth: stats.growth.orders, icon: ShoppingBag, color: "text-orange-600", bg: "bg-orange-100/50" },
    { title: "Revenue", value: stats.totalRevenue, growth: stats.growth.revenue, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100/50" },
    { title: "Customers", value: stats.totalCustomers, growth: stats.growth.customers, icon: UsersIcon, color: "text-purple-600", bg: "bg-purple-100/50" },
  ];

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1 font-medium">Detailed insights into your business performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200">
            <Download size={18} />
            <span className="hidden sm:inline">Export Report</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all duration-200">
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon size={22} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${card.growth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {card.growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(card.growth)}%
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{card.title}</p>
              <h2 className="text-2xl font-bold mt-1 text-gray-900">
                {card.title === "Revenue" ? formatCurrency(card.value) : card.value.toLocaleString()}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 gap-8 pb-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <ShoppingBag size={18} />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
            </div>
            <div className="relative max-w-xs hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search orders..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all w-64" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr><td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-500 font-medium">Loading transactions...</p>
                    </div>
                  </td></tr>
                ) : recentOrders.length === 0 ? (
                  <tr><td colSpan="5" className="py-20 text-center text-gray-500 font-medium">No transactions found.</td></tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-indigo-600">#{order.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{order.customer_name || "Anonymous User"}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(order.total_amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${order.order_status === 'PAID' || order.order_status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                          {order.order_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
