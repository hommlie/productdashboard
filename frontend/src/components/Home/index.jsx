import { useState, useEffect, useRef } from "react";
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
    Calendar,
    Clock,
    RotateCcw,
    AlertCircle,
    CreditCard,
    ChevronDown,
    CheckCircle2,
    Filter,
    BarChart3,
    MousePointerClick,
    Eye,
    X
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const Home = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        returnRequests: 0,
        pendingCancel: 0,
        unpaidPayments: 0,
        outOfStock: 0,
        completedOrders: 0,
        growth: {
            products: 0,
            orders: 0,
            revenue: 0,
            customers: 0
        },
        charts: {
            sales: [],
            shipping: []
        },
        topItems: {
            bySales: [],
            byViews: []
        }
    });

    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRange, setActiveRange] = useState("Today");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeSalesTab, setActiveSalesTab] = useState('orders'); // 'orders' or 'amount'
    const [activeTopItemsTab, setActiveTopItemsTab] = useState('By Sales');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [modalTitle, setModalTitle] = useState("");
    const [modalType, setModalType] = useState("");
    const [modalLoading, setModalLoading] = useState(false);

    const filterRef = useRef(null);

    const timeRanges = [
        "Today", "This Week", "This Month", "This Quarter", "This Year",
        "Previous Week", "Previous Month", "Previous Quarter", "Previous Year"
    ];

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const statsRes = await fetch(`/api/dashboard/stats?period=${activeRange.toLowerCase()}`);
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
    }, [activeRange]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleViewDetails = async (type, title) => {
        setModalTitle(title);
        setModalType(type);
        setIsModalOpen(true);
        setModalLoading(true);
        try {
            const res = await fetch(`/api/dashboard/details?type=${type}`);
            const result = await res.json();
            if (result.success) {
                setModalData(result.data);
            }
        } catch (err) {
            console.error("Failed to fetch details:", err);
        } finally {
            setModalLoading(false);
        }
    };

    const statusBoxesRow1 = [
        { title: "PENDING ORDERS", value: stats.pendingOrders, subText: "To Be Confirmed", icon: Clock, color: "text-orange-500", bg: "bg-orange-50", type: "PENDING_ORDERS" },
        { title: "RETURN REQUESTS", value: stats.returnRequests, subText: "To Be Reviewed", icon: RotateCcw, color: "text-orange-500", bg: "bg-orange-50", type: "RETURN_REQUESTS" },
        { title: "PENDING CANCEL REQUEST", value: stats.pendingCancel, subText: "To Be Processed", icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50", type: "PENDING_CANCEL" },
        { title: "YET TO RECEIVE PAYMENTS", value: stats.unpaidPayments, subText: "To Be Received", icon: CreditCard, color: "text-orange-500", bg: "bg-orange-50", type: "YET_TO_RECEIVE_PAYMENTS" },
        { title: "OUT OF STOCK ITEMS", value: stats.outOfStock, subText: "To Be Restocked", icon: Package, color: "text-blue-500", bg: "bg-blue-50", type: "OUT_OF_STOCK" },
    ];

    const statusBoxesRow2 = [
        { title: "Total Products", value: stats.totalProducts, growth: stats.growth?.products, icon: Package, color: "text-blue-600", bg: "bg-blue-100/50" },
        { title: "Orders", value: stats.totalOrders, growth: stats.growth?.orders, icon: ShoppingBag, color: "text-orange-600", bg: "bg-orange-100/50" },
        { title: "Revenue", value: stats.totalRevenue, growth: stats.growth?.revenue, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100/50" },
        { title: "Customers", value: stats.totalCustomers, growth: stats.growth?.customers, icon: UsersIcon, color: "text-purple-600", bg: "bg-purple-100/50" },
        { title: "Completed Orders", value: stats.completedOrders, growth: null, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100/50", type: "COMPLETED_ORDERS" },
    ];

    const shippingColors = {
        'PENDING': '#f59e0b',
        'CONFIRMED': '#8b5cf6',
        'PACKED': '#6366f1',
        'SHIPPED': '#3b82f6',
        'DELIVERED': '#10b981',
        'PROCESSING': '#a855f7',
        'CANCELLED': '#ef4444'
    };

    const dashboardShippingData = stats.charts.shipping.map(item => ({
        ...item,
        color: shippingColors[item.name.toUpperCase()] || '#94a3b8'
    }));

    const totalShippings = stats.charts.shipping.reduce((acc, curr) => acc + curr.value, 0);

    const getProductImage = (imageStr) => {
        if (!imageStr) return null;
        try {
            const parsed = JSON.parse(imageStr);
            return Array.isArray(parsed) ? parsed[0] : parsed;
        } catch (e) {
            return imageStr;
        }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Detailed insights into your business performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <Calendar size={18} className="text-indigo-600" />
                            <span>{activeRange}</span>
                            <ChevronDown size={16} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                                {timeRanges.map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => {
                                            setActiveRange(range);
                                            setIsFilterOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${activeRange === range ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {range}
                                        {activeRange === range && <CheckCircle2 size={14} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                        <Download size={18} className="text-indigo-600" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-1px] active:translate-y-[0px] transition-all duration-200">
                        <Plus size={18} />
                        <span>New Order</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-lg"></div>
                    <p className="text-gray-500 font-bold animate-pulse">Syncing real-time data...</p>
                </div>
            ) : (
                <>
                    {/* Row 1: 5 Status Boxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        {statusBoxesRow1.map((box, i) => (
                            <div key={i} className="relative bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 group overflow-hidden flex flex-col justify-between">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl ${box.bg} ${box.color} shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                                        <box.icon size={20} />
                                    </div>
                                    <button
                                        onClick={() => handleViewDetails(box.type, box.title)}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                                        title="View Details"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 leading-none">{box.value}</h2>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-3 mb-1">{box.title}</p>
                                    <p className="text-[10px] font-semibold text-gray-400">{box.subText}</p>
                                </div>
                                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-12 h-12 bg-linear-to-br from-indigo-50/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        ))}
                    </div>

                    {/* Row 2: 5 Main Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        {statusBoxesRow2.map((card, i) => (
                            <div key={i} className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl ${card.bg} ${card.color} shadow-xs`}>
                                        <card.icon size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {card.growth !== null && (
                                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${card.growth >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                                                {card.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                {Math.abs(card.growth)}%
                                            </div>
                                        )}
                                        {card.type && (
                                            <button
                                                onClick={() => handleViewDetails(card.type, card.title)}
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 truncate">
                                        {card.title === "Revenue" ? formatCurrency(card.value || 0) : (card.value || 0).toLocaleString()}
                                    </h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{card.title}</p>
                                </div>

                                <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-gray-50/50 to-transparent rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Sales Summary */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Sales Summary</h3>
                                    <p className="text-sm text-gray-500">Revenue and orders over time</p>
                                </div>
                                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                                    <button
                                        onClick={() => setActiveSalesTab('orders')}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeSalesTab === 'orders' ? 'bg-white text-indigo-600 shadow-xs border border-indigo-100' : 'text-gray-500 hover:text-gray-700'}`}
                                    >Order</button>
                                    <button
                                        onClick={() => setActiveSalesTab('amount')}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeSalesTab === 'amount' ? 'bg-white text-indigo-600 shadow-xs border border-indigo-100' : 'text-gray-500 hover:text-gray-700'}`}
                                    >Amount</button>
                                </div>
                            </div>

                            <div className="h-80 w-full font-medium">
                                {stats.charts.sales.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.charts.sales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Area type="monotone" dataKey={activeSalesTab} stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400 font-bold italic">No sales data found for this period.</div>
                                )}
                            </div>
                        </div>

                        {/* Shipping Overview */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Shipping Overview</h3>
                            <p className="text-sm text-gray-500 mb-6">Distribution by status</p>

                            <div className="h-64 w-full relative">
                                {dashboardShippingData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={dashboardShippingData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                {dashboardShippingData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 rounded-full border-4 border-dashed border-gray-100">
                                        <p className="text-gray-300 font-black text-xs">NO DATA</p>
                                    </div>
                                )}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">All Shippings</p>
                                    <p className="text-2xl font-black text-gray-900">{totalShippings}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mt-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {dashboardShippingData.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-sm font-semibold text-gray-600">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Items & Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                        {/* Top Items List */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Top Items</h3>
                                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                                    <button
                                        onClick={() => setActiveTopItemsTab('By Sales')}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${activeTopItemsTab === 'By Sales' ? 'bg-white text-indigo-600 shadow-xs border border-indigo-100' : 'text-gray-500'}`}
                                    >By Sales</button>
                                    <button
                                        onClick={() => setActiveTopItemsTab('By Views')}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${activeTopItemsTab === 'By Views' ? 'bg-white text-indigo-600 shadow-xs border border-indigo-100' : 'text-gray-500'}`}
                                    >By Views</button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {((activeTopItemsTab === 'By Sales' ? stats.topItems?.bySales : stats.topItems?.byViews) || []).length > 0 ? (
                                    ((activeTopItemsTab === 'By Sales' ? stats.topItems?.bySales : stats.topItems?.byViews) || []).map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50/50 transition-colors group text-left">
                                            <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden group-hover:scale-110 transition-transform border border-gray-100">
                                                {getProductImage(item.image) ? (
                                                    <img
                                                        src={`/uploads/${getProductImage(item.image)}`}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    />
                                                ) : null}
                                                <div className={`${getProductImage(item.image) ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-gray-300`}>
                                                    <Package size={20} />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {activeTopItemsTab === 'By Sales' ? `${item.sales} sales` : `${item.views || 0} views`}
                                                </p>
                                            </div>
                                            <div className="text-indigo-600">
                                                <MousePointerClick size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-sm font-bold text-gray-400 italic">No top items found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity / Transactions Section (Moved from old layout) */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-xs">
                                        <BarChart3 size={18} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Real-time Activity</h3>
                                </div>
                                <div className="relative max-w-xs hidden md:block">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input type="text" placeholder="Search entries..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:bg-white outline-none transition-all w-64" />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                {recentOrders.length > 0 ? (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/30 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                                <th className="px-6 py-4">Order ID</th>
                                                <th className="px-6 py-4">Customer</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-sm">
                                            {recentOrders.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-6 py-4 font-black text-indigo-600 group-hover:translate-x-1 transition-transform inline-block">#{order.id}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-900">{order.customer_name || "Anonymous User"}</td>
                                                    <td className="px-6 py-4 text-gray-500 font-medium">{new Date(order.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 font-black text-gray-900">{formatCurrency(order.total_amount)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${order.order_status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            order.order_status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
                                                            {order.order_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-6 text-center py-20">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                                            <ShoppingBag className="text-gray-300" size={24} />
                                        </div>
                                        <p className="text-gray-400 font-bold mb-1">No recent transactions found</p>
                                        <p className="text-xs text-gray-400">Your latest activities will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Details Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{modalTitle}</h3>
                                <p className="text-sm text-gray-500 font-medium mt-0.5">Below are the details for your selection.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 custom-scrollbar">
                            {modalLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-gray-500 font-bold">Fetching details...</p>
                                </div>
                            ) : modalData.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {modalData.map((item, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                            {/* Product Style */}
                                            {modalType === 'OUT_OF_STOCK' ? (
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                        {getProductImage(item.image) ? (
                                                            <img src={`/uploads/${getProductImage(item.image)}`} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24} /></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                                                        <p className="text-xs text-rose-600 font-bold mt-1">Out of Stock</p>
                                                        <p className="text-xs text-gray-500 font-medium">Price: {formatCurrency(item.price)}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Order Style */
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-indigo-600 uppercase">Order #{item.id}</p>
                                                            <h4 className="font-bold text-gray-900 mt-0.5">{item.customer_name || "Anonymous User"}</h4>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-black text-gray-900">{formatCurrency(item.total_amount)}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold mt-0.5">{new Date(item.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>

                                                    {item.products && (
                                                        <div className="pt-3 border-t border-gray-50 space-y-2">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Products ({JSON.parse(item.products)?.length || 0})</p>
                                                            <div className="space-y-2">
                                                                {JSON.parse(item.products).map((p, pIdx) => (
                                                                    <div key={pIdx} className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                                                            {getProductImage(p.image) ? (
                                                                                <img src={`/uploads/${getProductImage(p.image)}`} alt="" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={12} /></div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-bold text-gray-700 truncate">{p.name}</p>
                                                                            <p className="text-[10px] text-gray-400 font-medium">Qty: {p.quantity}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <BarChart3 className="text-gray-200 mb-4" size={48} />
                                    <p className="text-gray-400 font-bold">No items found for this category</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Home;
