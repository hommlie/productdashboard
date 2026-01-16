import React, { useState, useEffect } from 'react';
import Layout from "../Layout";
import {
    User,
    Phone,
    Mail,
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    Search,
    CheckCircle2,
    AlertCircle,
    Package,
    ChevronRight,
    ArrowRight,
    CreditCard,
    Banknote,
    MapPin,
    RotateCcw
} from "lucide-react";

// Load Razorpay Script
const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const AddOrder = () => {
    // Initial States
    const [customer, setCustomer] = useState({ id: null, name: '', phone: '', email: '', address: '' });
    const [allCustomers, setAllCustomers] = useState([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [customerFilter, setCustomerFilter] = useState('');

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [settings, setSettings] = useState({ minimum_order_amount: 0, free_delivery_min_amount: 0, delivery_charge: 0 });

    const [selectedCat, setSelectedCat] = useState('');
    const [selectedSub, setSelectedSub] = useState('');
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isRestored, setIsRestored] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // 1. Initial Data Fetch
    useEffect(() => {
        fetchCategories();
        fetchSettings();
        fetchCustomers();
        restoreDraft();
    }, []);

    // 2. Persistence Logic
    const restoreDraft = () => {
        const saved = localStorage.getItem('add_order_draft');
        if (saved) {
            try {
                const draft = JSON.parse(saved);
                setCustomer(draft.customer || { id: null, name: '', phone: '', email: '', address: '' });
                setCart(draft.cart || []);
                setCustomerFilter(draft.customerFilter || '');
                setSelectedCat(draft.selectedCat || '');
                setSelectedSub(draft.selectedSub || '');
                setPaymentMethod(draft.paymentMethod || 'COD');
                setIsRestored(true);
            } catch (e) { console.error("Restore failed", e); }
        }
    };

    useEffect(() => {
        if (isRestored) {
            const draft = { customer, cart, customerFilter, selectedCat, selectedSub, paymentMethod };
            localStorage.setItem('add_order_draft', JSON.stringify(draft));
        }
    }, [customer, cart, customerFilter, selectedCat, selectedSub, paymentMethod, isRestored]);

    // 3. Dependent Data Fetching
    useEffect(() => {
        if (selectedCat) fetchSubcategories(selectedCat);
    }, [selectedCat]);

    useEffect(() => {
        if (selectedSub) fetchProducts(selectedSub);
    }, [selectedSub]);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            const data = await res.json();
            setAllCustomers(data.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success) {
                setSettings(data.data);
            }
        } catch (err) { console.error(err); }
    };

    const fetchSubcategories = async (catId) => {
        try {
            const res = await fetch(`/api/subcategory/category/${catId}`);
            const data = await res.json();
            setSubcategories(data.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchProducts = async (subId) => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            const filtered = (data.data || []).filter(p => p.subcategory_id === parseInt(subId));
            setProducts(filtered);
        } catch (err) { console.error(err); }
    };

    // 4. Input Handlers
    const selectCustomer = (c) => {
        setCustomer({
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email || '',
            address: c.address || ''
        });
        setCustomerFilter(c.phone);
        setShowCustomerDropdown(false);
    };

    const handlePhoneChange = (e) => {
        const val = e.target.value;
        setCustomerFilter(val);
        setCustomer({ ...customer, phone: val, id: null });
        setShowCustomerDropdown(true);

        const found = allCustomers.find(c => c.phone === val);
        if (found) {
            setCustomer({
                id: found.id,
                name: found.name,
                phone: found.phone,
                email: found.email || '',
                address: found.address || ''
            });
            setShowCustomerDropdown(false);
        }
    };

    const filteredCustomers = allCustomers.filter(c =>
        (c.phone && c.phone.includes(customerFilter)) ||
        (c.name && c.name.toLowerCase().includes(customerFilter.toLowerCase()))
    ).slice(0, 5);

    // 5. Cart Logic
    const addToCart = (product) => {
        const exists = cart.find(item => item.product_id === product.id);
        if (exists) {
            setCart(cart.map(item => item.product_id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item));
        } else {
            setCart([...cart, {
                product_id: product.id,
                product_name: product.product_name,
                price: product.product_discount_price || product.product_price,
                quantity: 1,
                image: product.product_image,
                payment_mode: product.payment_mode
            }]);
        }
        if (!isRestored) setIsRestored(true); // Mark as active once user interacts
    };

    const updateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item.product_id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.product_id !== id));
    };

    const clearDraft = () => {
        localStorage.removeItem('add_order_draft');
        setCustomer({ id: null, name: '', phone: '', email: '', address: '' });
        setCart([]);
        setCustomerFilter('');
        setSelectedCat('');
        setSelectedSub('');
        setProducts([]);
        setPaymentMethod('COD');
        setMessage({ type: '', text: '' });
    };

    // Totals & Delivery Logic
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const minOrder = Number(settings.minimum_order_amount || 0);
    const freeThreshold = Number(settings.free_delivery_min_amount || 0);
    const baseDelivery = Number(settings.delivery_charge || 0);

    // REVERTED: Delivery is FREE if subtotal meets the threshold, independent of min order
    const isFreeDelivery = subtotal > 0 && subtotal >= freeThreshold;
    const deliveryCharge = isFreeDelivery ? 0 : baseDelivery;
    const totalAmount = subtotal + (subtotal > 0 ? deliveryCharge : 0);

    const isCodDisabled = cart.some(item => item.payment_mode === 1);

    useEffect(() => {
        if (isCodDisabled) setPaymentMethod('ONLINE');
    }, [isCodDisabled]);

    // 7. Payment & Order Submission
    const handleOnlinePayment = async () => {
        const resScript = await loadRazorpay();
        if (!resScript) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        const orderRes = await fetch("/api/razorpay/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: totalAmount,
                receipt: `receipt_${Date.now()}`
            }),
        });
        const orderData = await orderRes.json();

        if (!orderData.success) {
            alert("Error creating payment order.");
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: orderData.order.amount,
            currency: orderData.order.currency,
            name: "Hommlie Admin Portal",
            description: "Manual Order Payment",
            order_id: orderData.order.id,
            handler: async (response) => {
                const verifyRes = await fetch("/api/razorpay/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(response),
                });
                const verifyData = await verifyRes.json();

                if (verifyData.success) {
                    submitFinalOrder('ONLINE', response);
                } else {
                    alert("Payment verification failed.");
                }
            },
            prefill: {
                name: customer.name,
                email: customer.email,
                contact: customer.phone,
            },
            theme: { color: "#4f46e5" },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    };

    const submitFinalOrder = async (finalMethod, paymentDetails = {}) => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/orders/place', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer,
                    items: cart,
                    totalAmount,
                    paymentMethod: finalMethod,
                    address: customer.address,
                    ...paymentDetails
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowSuccessModal(true);
                clearDraft();
                fetchCustomers();

                // Auto-hide modal after 3 seconds
                setTimeout(() => {
                    setShowSuccessModal(false);
                }, 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to place order.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Server error.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handlePlaceOrder = () => {
        if (!customer.name || !customer.phone || cart.length === 0 || !customer.address) {
            setMessage({ type: 'error', text: 'Please fill name, phone, address and add products.' });
            return;
        }

        if (subtotal < minOrder) {
            setMessage({ type: 'error', text: `Minimum order amount is ₹${minOrder}.` });
            return;
        }

        if (paymentMethod === 'ONLINE') {
            handleOnlinePayment();
        } else {
            submitFinalOrder('COD');
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto animate-fade-in pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Create <span className="text-indigo-600">New Order</span>
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium italic">Place manual orders with dynamic delivery and search rules.</p>
                    </div>
                    {cart.length > 0 && (
                        <button
                            onClick={clearDraft}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all uppercase tracking-widest"
                        >
                            <RotateCcw size={14} />
                            Reset Form
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Customer & Products Selection */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Customer Details Card */}
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16" />
                            <div className="relative z-10">
                                <h2 className="text-lg font-black text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <User size={20} className="text-indigo-600" />
                                    Customer Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 relative">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Phone or Name Search *</label>
                                        <div className="relative group">
                                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Search by phone or name..."
                                                value={customerFilter}
                                                onChange={handlePhoneChange}
                                                onFocus={() => { setShowCustomerDropdown(true); if (!isRestored) setIsRestored(true); }}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-gray-900"
                                            />
                                        </div>
                                        {showCustomerDropdown && customerFilter && filteredCustomers.length > 0 && (
                                            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                {filteredCustomers.map(c => (
                                                    <div
                                                        key={c.id}
                                                        className="p-4 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                                        onClick={() => selectCustomer(c)}
                                                    >
                                                        <p className="font-black text-gray-900 text-sm">{c.name}</p>
                                                        <p className="text-xs text-gray-500 font-bold">{c.phone}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name *</label>
                                        <div className="relative group">
                                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Customer name"
                                                value={customer.name}
                                                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Delivery Address *</label>
                                        <div className="relative group">
                                            <MapPin size={18} className="absolute left-4 top-6 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                            <textarea
                                                placeholder="Full street address, area, landmark, pincode..."
                                                value={customer.address}
                                                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-gray-900 min-h-[100px]"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email (Optional)</label>
                                        <div className="relative group">
                                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                            <input
                                                type="email"
                                                placeholder="customer@example.com"
                                                value={customer.email || ''}
                                                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-gray-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Selection Card */}
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
                            <h2 className="text-lg font-black text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Package size={20} className="text-indigo-600" />
                                Browse Catalog
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <select
                                    className="px-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none font-bold text-gray-700 focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer hover:bg-white hover:border-indigo-100"
                                    value={selectedCat}
                                    onChange={(e) => {
                                        setSelectedCat(e.target.value);
                                        setSelectedSub('');
                                        setProducts([]);
                                        if (!isRestored) setIsRestored(true);
                                    }}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                                </select>
                                <select
                                    className="px-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none font-bold text-gray-700 focus:ring-4 focus:ring-indigo-50 transition-all disabled:opacity-50 cursor-pointer hover:bg-white hover:border-indigo-100"
                                    value={selectedSub}
                                    disabled={!selectedCat}
                                    onChange={(e) => {
                                        setSelectedSub(e.target.value);
                                    }}
                                >
                                    <option value="">Select Subcategory</option>
                                    {subcategories.map(s => <option key={s.id} value={s.id}>{s.subcategory_name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {products.length === 0 && selectedSub && (
                                    <p className="col-span-full text-center py-10 text-gray-400 font-medium italic">No products found in this section.</p>
                                )}
                                {products.map(p => (
                                    <div key={p.id} className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl flex items-center justify-between group hover:bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50 transition-all cursor-pointer"
                                        onClick={() => addToCart(p)}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 overflow-hidden shrink-0">
                                                {(() => {
                                                    let img = null;
                                                    try {
                                                        const parsed = JSON.parse(p.product_image);
                                                        img = Array.isArray(parsed) ? parsed[0] : (parsed || p.product_image);
                                                    } catch (e) { img = p.product_image; }
                                                    return img ? <img src={`/uploads/${img}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300"><ShoppingCart size={16} /></div>
                                                })()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{p.product_name}</p>
                                                <p className="text-xs text-indigo-600 font-black tracking-tight">₹{p.product_discount_price || p.product_price}</p>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-white rounded-lg border border-gray-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                                            <Plus size={18} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-2xl shadow-gray-200/50 sticky top-24">
                            <h2 className="text-lg font-black text-gray-800 uppercase tracking-wider mb-8 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <ShoppingCart size={20} className="text-indigo-600" />
                                    Order Summary
                                </span>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] rounded-full border border-indigo-100">{cart.length} Items</span>
                            </h2>

                            <div className="space-y-6 mb-8 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.length === 0 && (
                                    <div className="py-12 text-center text-gray-300 space-y-4">
                                        <ShoppingCart size={48} strokeWidth={1} className="mx-auto" />
                                        <p className="font-bold text-sm">Your basket is empty</p>
                                    </div>
                                )}
                                {cart.map(item => (
                                    <div key={item.product_id} className="flex flex-col gap-3 p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-900 text-sm line-clamp-1">{item.product_name}</span>
                                            <button onClick={() => removeFromCart(item.product_id)} className="text-rose-500 hover:text-rose-600"><Trash2 size={16} /></button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-2 py-1">
                                                <button onClick={() => updateQuantity(item.product_id, -1)} className="text-gray-400 hover:text-indigo-600"><Minus size={14} /></button>
                                                <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product_id, 1)} className="text-gray-400 hover:text-indigo-600"><Plus size={14} /></button>
                                            </div>
                                            <span className="text-sm font-black text-gray-900">₹{item.price * item.quantity}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 mb-8">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Payment Method</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setPaymentMethod('COD')}
                                        disabled={isCodDisabled}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${paymentMethod === 'COD' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'} ${isCodDisabled && 'opacity-30 cursor-not-allowed'}`}
                                    >
                                        <Banknote size={24} />
                                        <span className="text-[10px] font-black uppercase">COD</span>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('ONLINE')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${paymentMethod === 'ONLINE' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                    >
                                        <CreditCard size={24} />
                                        <span className="text-[10px] font-black uppercase">Online</span>
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-6 space-y-4">
                                <div className="flex justify-between items-center text-xs font-bold text-gray-600 text-indigo-600">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-600">Delivery Charge</span>
                                    <span className={`font-black text-xs uppercase tracking-widest ${deliveryCharge === 0 ? 'text-emerald-500' : 'text-gray-400'}`}>
                                        {deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}
                                    </span>
                                </div>
                                {subtotal > 0 && subtotal < minOrder && (
                                    <p className="text-[10px] text-rose-500 font-black uppercase tracking-tighter bg-rose-50 p-2 rounded-lg text-center animate-pulse">
                                        Add ₹{minOrder - subtotal} more to reach min. order
                                    </p>
                                )}
                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <span className="text-gray-900 font-black uppercase tracking-widest text-sm">Grand Total</span>
                                    <span className="text-3xl font-black text-indigo-600">₹{totalAmount}</span>
                                </div>
                            </div>

                            {message.text && (
                                <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-bottom-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                    }`}>
                                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    <span className="text-[10px] font-black uppercase tracking-wider">{message.text}</span>
                                </div>
                            )}

                            <button
                                onClick={handlePlaceOrder}
                                disabled={submitting || cart.length === 0 || subtotal < minOrder}
                                className="w-full mt-8 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? "Processing..." : (
                                    <>
                                        {paymentMethod === 'ONLINE' ? 'Pay & Place Order' : 'Confirm & Place Order'}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowSuccessModal(false)}
                        />

                        {/* Modal Content */}
                        <div className="relative bg-white rounded-[2rem] p-8 md:p-12 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-500">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-60 -mr-16 -mt-16" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-60 -ml-16 -mb-16" />

                            {/* Content */}
                            <div className="relative z-10 text-center space-y-6">
                                {/* Animated Checkmark */}
                                <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-200 animate-in zoom-in duration-700" style={{ animationDelay: '200ms' }}>
                                    <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M5 13l4 4L19 7"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="animate-draw-check"
                                            style={{
                                                strokeDasharray: 24,
                                                strokeDashoffset: 24,
                                                animation: 'drawCheck 0.8s ease-out 0.5s forwards'
                                            }}
                                        />
                                    </svg>
                                </div>

                                {/* Success Message */}
                                <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '400ms' }}>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                        Order Placed!
                                    </h2>
                                    <p className="text-gray-500 font-medium text-sm">
                                        Your order has been successfully placed and is being processed.
                                    </p>
                                </div>

                                {/* Order Details */}
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 space-y-3 animate-in slide-in-from-bottom-4 duration-700 border border-indigo-100" style={{ animationDelay: '600ms' }}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Order Total</span>
                                        <span className="text-2xl font-black text-indigo-600">₹{totalAmount}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-indigo-100">
                                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Payment Method</span>
                                        <span className="text-sm font-black text-gray-900 bg-white px-3 py-1 rounded-lg">{paymentMethod}</span>
                                    </div>
                                </div>

                                {/* Close Button */}
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 animate-in slide-in-from-bottom-4 duration-700"
                                    style={{ animationDelay: '800ms' }}
                                >
                                    <CheckCircle2 size={18} />
                                    Got it!
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AddOrder;
