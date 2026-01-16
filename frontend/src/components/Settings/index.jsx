import React, { useState, useEffect } from 'react';
import Layout from "../Layout";
import { Settings as SettingsIcon, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const Settings = () => {
  const [settings, setSettings] = useState({
    minimum_order_amount: 0,
    free_delivery_min_amount: 0,
    delivery_charge: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const result = await res.json();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error("Fetch settings error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const result = await res.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to update settings.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Store <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">Configurations</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium leading-relaxed italic">
            Adjust your core business rules and delivery thresholds.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold uppercase tracking-widest text-[10px]">Loading parameters...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-30 -mr-32 -mt-32" />

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Min Order Amount */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                      <AlertCircle size={20} />
                    </div>
                    <label className="text-sm font-black text-gray-700 uppercase tracking-wider">
                      Minimum Order Limit
                    </label>
                  </div>
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      value={settings.minimum_order_amount}
                      onChange={(e) => setSettings({ ...settings, minimum_order_amount: e.target.value })}
                      className="w-full pl-12 pr-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-black text-gray-900 focus:ring-4 focus:ring-amber-50 focus:border-amber-500 outline-none transition-all group-hover:bg-white"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-medium italic">
                    Customers cannot checkout if their subtotal is below this amount.
                  </p>
                </div>

                {/* Free Delivery Threshold */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                      <CheckCircle2 size={20} />
                    </div>
                    <label className="text-sm font-black text-gray-700 uppercase tracking-wider">
                      Free Delivery Threshold
                    </label>
                  </div>
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      value={settings.free_delivery_min_amount}
                      onChange={(e) => setSettings({ ...settings, free_delivery_min_amount: e.target.value })}
                      className="w-full pl-12 pr-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-black text-gray-900 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all group-hover:bg-white"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-medium italic">
                    Orders above this amount will automatically qualify for free shipping.
                  </p>
                </div>

                {/* Delivery Charge */}
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                      <SettingsIcon size={20} />
                    </div>
                    <label className="text-sm font-black text-gray-700 uppercase tracking-wider">
                      Fixed Delivery Charge
                    </label>
                  </div>
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      value={settings.delivery_charge}
                      onChange={(e) => setSettings({ ...settings, delivery_charge: e.target.value })}
                      className="w-full pl-12 pr-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-black text-gray-900 focus:ring-4 focus:ring-rose-50 focus:border-rose-500 outline-none transition-all group-hover:bg-white"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-medium italic">
                    Standard delivery fee applied to orders below the free delivery threshold.
                  </p>
                </div>
              </div>

              {/* Status Messages */}
              {message.text && (
                <div className={`mt-8 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-bottom-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                  {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  <span className="text-sm font-bold uppercase tracking-wider">{message.text}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-12 flex justify-end">
                <button
                  disabled={saving}
                  className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Save size={20} />
                  )}
                  Update Configuration
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default Settings;
