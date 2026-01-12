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
  Filter
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

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700 border-green-200';
      case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      case 'SHIPPED': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    let addr = address;

    if (typeof address === 'string' && address.trim().startsWith('{')) {
      try {
        addr = JSON.parse(address);
      } catch (e) {
        return address;
      }
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

      return Object.values(addr)
        .filter(val => typeof val === 'string' || typeof val === 'number')
        .join(', ');
    }

    return String(address);
  };

  const filteredOrders = orders.filter(order =>
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Client Orders
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <Package size={16} />
              Manage and track all incoming orders
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all w-64 bg-gray-50/50 focus:bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            </div>
            <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-600">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600">Order ID</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600">Customer</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600">Total</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600">Payment</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">Loading orders...</td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">No orders found.</td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="py-4 px-6 font-medium text-gray-900">#{order.id}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                            {order.customer_name ? order.customer_name.substring(0, 2) : 'UK'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{order.customer_name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{order.customer_phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.order_status)}`}>
                          {order.order_status || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        ₹{Number(order.total_amount).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          {order.payment_method === 'ONLINE' ? (
                            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs font-medium">Online</span>
                          ) : (
                            <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs font-medium">COD</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => fetchOrderDetails(order.id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all hover:scale-105 active:scale-95"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Order Details #{selectedOrder.id}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-red-500"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <p className="text-xs text-indigo-500 uppercase font-semibold">Order Status</p>
                  <p className="text-lg font-bold text-indigo-700 mt-1">{selectedOrder.order_status}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-xs text-emerald-500 uppercase font-semibold">Payment Status</p>
                  <p className="text-lg font-bold text-emerald-700 mt-1">{selectedOrder.payment_status}</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                  <p className="text-xs text-purple-500 uppercase font-semibold">Total Amount</p>
                  <p className="text-lg font-bold text-purple-700 mt-1">₹{Number(selectedOrder.total_amount).toLocaleString()}</p>
                </div>
              </div>

              {/* Customer Info & Address */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User size={18} className="text-gray-500" /> Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{selectedOrder.customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Contact Number</p>
                    <p className="font-medium text-gray-900">{selectedOrder.customer_phone || ((() => {
                      if (selectedOrder.address && typeof selectedOrder.address === 'string' && selectedOrder.address.startsWith('{')) {
                        try { return JSON.parse(selectedOrder.address).mobile; } catch { return ''; }
                      }
                      return '';
                    })()) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{(selectedOrder.customer_email || (() => {
                      if (selectedOrder.address && typeof selectedOrder.address === 'string' && selectedOrder.address.startsWith('{')) {
                        try { return JSON.parse(selectedOrder.address).email; } catch { return ''; }
                      }
                      return '';
                    })()) || 'N/A'}</p>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-gray-500">Delivery Address</p>
                    <p className="font-medium text-gray-900 mt-1 bg-white p-3 rounded-lg border border-gray-200">
                      {formatAddress(selectedOrder.address)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Package size={18} className="text-gray-500" /> Order Items
                </h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-left font-medium text-gray-600">Product</th>
                        <th className="py-3 px-4 text-center font-medium text-gray-600">Qty</th>
                        <th className="py-3 px-4 text-right font-medium text-gray-600">Price</th>
                        <th className="py-3 px-4 text-right font-medium text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {item.product_image && (
                                <img src={`http://localhost:4000${item.product_image}`} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                              )}
                              <span className="font-medium text-gray-900">{item.product_name || `Product #${item.product_id}`}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-600">x{item.quantity}</td>
                          <td className="py-3 px-4 text-right text-gray-600">₹{item.price}</td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900">₹{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
              <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition-colors">
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductOrders;
