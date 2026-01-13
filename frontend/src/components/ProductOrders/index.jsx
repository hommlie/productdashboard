import React, { useEffect, useState } from 'react';
import Layout from "../Layout";
import axios from 'axios';
import {
  Eye,
  Package,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  CreditCard,
  Truck,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';

const ProductOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/all');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (id) => {
    try {
      const response = await axios.get(`/api/orders/details/${id}`);
      if (response.data.success) {
        setSelectedOrder(response.data.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const getStatusInfo = (status) => {
    const s = status?.toUpperCase() || 'PENDING';
    switch (s) {
      case 'CONFIRMED': return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle size={14} /> };
      case 'PAID': return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle size={14} /> };
      case 'PENDING': return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock size={14} /> };
      case 'CANCELLED': return { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: <XCircle size={14} /> };
      case 'SHIPPED': return { color: 'bg-sky-100 text-sky-700 border-sky-200', icon: <Truck size={14} /> };
      default: return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <Package size={14} /> };
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    let addr = address;

    if (typeof address === 'string' && address.trim().startsWith('{')) {
      try { addr = JSON.parse(address); } catch (e) { return address; }
    }

    if (typeof addr === 'object' && addr !== null) {
      const parts = [
        addr.fullName,
        addr.houseNo,
        addr.street || addr.line1 || addr.address_line1 || addr.address,
        addr.landmark,
        addr.city,
        addr.state,
        addr.location,
        addr.zip || addr.pincode || addr.postalCode || addr.postal_code,
        addr.country,
        addr.mobile ? `Ph: ${addr.mobile}` : null,
        addr.email
      ].filter(part => part && String(part).trim() !== '');

      if (parts.length > 0) return parts.join(', ');
      return Object.values(addr).filter(val => typeof val === 'string' || typeof val === 'number').join(', ');
    }
    return String(address);
  };

  const filteredOrders = orders.filter(order =>
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)
  );

  return (
    <Layout>
      <div className="flex flex-col gap-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              Order Management
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100 uppercase tracking-wider">
                {orders.length} Orders
              </span>
            </h1>
            <p className="text-gray-500 font-medium">Manage customer orders and track fulfillment status.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search by ID or name..."
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm font-medium">
              <Filter size={18} />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-24">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-semibold text-xs uppercase tracking-widest">Loading orders...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 text-gray-300">
                        <Package size={48} strokeWidth={1} />
                        <p className="font-semibold text-gray-500">No orders found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const status = getStatusInfo(order.order_status);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-indigo-600">#{order.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                              {order.customer_name ? order.customer_name.substring(0, 1) : 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{order.customer_name || 'Anonymous'}</p>
                              <p className="text-xs text-gray-500 truncate">{order.customer_phone || 'No phone'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${status.color}`}>
                            {status.icon}
                            {order.order_status || 'PENDING'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 leading-none">
                          ₹{Number(order.total_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {order.payment_method === 'ONLINE' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 uppercase tracking-wide bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              <CreditCard size={12} /> Online
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 uppercase tracking-wide bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                              <Truck size={12} /> COD
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => fetchOrderDetails(order.id)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Eye size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal Redesign */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-300 border border-gray-100">
            {/* Sidebar Section */}
            <div className="md:w-72 bg-gray-50/80 border-r border-gray-100 flex flex-col p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-rose-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Information</p>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                        <User size={18} />
                      </div>
                      <p className="font-bold text-gray-900 text-sm truncate">{selectedOrder.customer_name || 'Anonymous'}</p>
                    </div>
                    <div className="text-xs font-semibold text-gray-600 space-y-1">
                      <p className="flex items-center gap-2"><CreditCard size={12} /> {selectedOrder.customer_phone || 'N/A'}</p>
                      <p className="flex items-center gap-2 truncate opacity-80">{selectedOrder.customer_email || 'No email'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order Status</p>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">Fullfillment</span>
                      <span className="text-xs font-bold text-indigo-700 uppercase">{selectedOrder.order_status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">Payment</span>
                      <span className="text-xs font-bold text-emerald-700 uppercase">{selectedOrder.payment_status}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <span className="text-xs font-semibold text-gray-500">Placed on</span>
                      <span className="text-xs font-bold text-gray-900">{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8">
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-wider">
                  <Download size={18} /> Export Invoice
                </button>
              </div>
            </div>

            {/* Main Section */}
            <div className="flex-1 p-8 overflow-y-auto bg-white">
              <div className="space-y-8">
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Truck size={16} className="text-indigo-500" /> Delivery Address
                  </h3>
                  <div className="p-5 bg-indigo-50 text-indigo-900 rounded-2xl border border-indigo-100">
                    <p className="text-sm font-semibold leading-relaxed">
                      {formatAddress(selectedOrder.address)}
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Package size={16} className="text-indigo-500" /> Order Summary
                    </h3>
                    <span className="text-[11px] font-bold text-gray-400 uppercase">{selectedOrder.items?.length || 0} Items</span>
                  </div>

                  <div className="space-y-3">
                    {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0 overflow-hidden">
                          {item.product_image ? (
                            <img src={`/uploads/${item.product_image}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package size={20} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{item.product_name || `Product ID: ${item.product_id}`}</p>
                          <p className="text-xs font-semibold text-gray-500">₹{item.price} x {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-indigo-700">₹{item.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-gray-900 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Grand Total</p>
                      <p className="text-3xl md:text-4xl font-bold tracking-tight">₹{Number(selectedOrder.total_amount).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                      <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Paid in Full</span>
                      </div>
                      <p className="text-[9px] font-bold text-white/30 tracking-widest uppercase">Verified Secure</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductOrders;
