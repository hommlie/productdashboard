import { useState, useEffect } from "react";
import Layout from "../Layout";

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
        const res = await fetch("/api/dashboard/stats");
        const result = await res.json();
        if (result.success) {
          setStats(result.data.stats);
          setRecentOrders(result.data.recentOrders);
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
    { title: "Total Products", value: stats.totalProducts, growth: stats.growth.products, color: "bg-blue-50 text-blue-600" },
    { title: "Orders", value: stats.totalOrders, growth: stats.growth.orders, color: "bg-orange-50 text-orange-600" },
    { title: "Revenue", value: stats.totalRevenue, growth: stats.growth.revenue, color: "bg-green-50 text-green-600" },
    { title: "Customers", value: stats.totalCustomers, growth: stats.growth.customers, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, Admin</h1>
          <p className="text-gray-500 mt-1">Here's a quick overview of your premium dashboard.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">New Report</button>
          <button className="px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition">Export Data</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4 text-xl font-bold`}>
              {card.title[0]}
            </div>
            <p className="text-gray-500 text-sm font-medium">{card.title}</p>
            <h2 className="text-3xl font-bold mt-1 text-gray-800">
              {card.title === "Revenue" ? formatCurrency(card.value) : card.value.toLocaleString()}
            </h2>
            <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${card.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
              <span className={`flex items-center justify-center w-4 h-4 rounded-full ${card.growth >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                {card.growth >= 0 ? "↑" : "↓"}
              </span>
              <span>{Math.abs(card.growth)}% from last month</span>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Recent Orders</h3>
            <button className="text-sm font-semibold text-indigo-600 hover:underline">View All Orders</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="pb-4">Order ID</th>
                  <th className="pb-4">Customer</th>
                  <th className="pb-4 text-center">Date</th>
                  <th className="pb-4 text-center">Amount</th>
                  <th className="pb-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400">Loading recent orders...</td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400">No recent orders found.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-mono text-sm text-indigo-600">#{order.id.toString().padStart(5, '0')}</td>
                      <td className="py-4">
                        <div className="font-semibold text-gray-800">{order.customer_name || "Unknown"}</div>
                      </td>
                      <td className="py-4 text-center text-gray-500 text-sm">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-4 text-center font-bold text-gray-800">
                        {formatCurrency(order.total_amount || 0)}
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.order_status === 'Delivered' || order.order_status === 'PAID' ? 'bg-green-100 text-green-700' :
                          order.order_status === 'Pending' || order.order_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            order.order_status === 'Cancelled' || order.order_status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                          }`}>
                          {order.order_status || 'Processing'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
