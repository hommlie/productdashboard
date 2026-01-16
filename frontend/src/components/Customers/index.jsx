import React, { useState, useEffect } from 'react';
import Layout from "../Layout";
import { Users, Search, Phone, Mail, MapPin, Loader2, User } from "lucide-react";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data || []);
      }
    } catch (err) {
      console.error("Fetch customers error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const formatAddress = (addr) => {
    if (!addr) return "No address on record yet.";

    let parsed = null;
    try {
      if (typeof addr === 'string') {
        if (addr.startsWith('{') || addr.startsWith('[')) {
          parsed = JSON.parse(addr);
        } else {
          return addr; // Plain text
        }
      } else if (typeof addr === 'object') {
        parsed = addr;
      }

      if (parsed) {
        // Define fields in a specific order
        const parts = [
          parsed.fullName,
          parsed.houseNo,
          parsed.area || parsed.street,
          parsed.landmark,
          parsed.city,
          parsed.state,
          parsed.pincode
        ].filter(v => v && String(v).trim() !== "");

        if (parts.length > 0) return parts.join(', ');

        // Fallback: join all non-object values
        return Object.values(parsed)
          .filter(v => v && typeof v !== 'object')
          .join(', ');
      }
    } catch (e) {
      console.error("Address parse error:", e);
    }
    return String(addr);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Customer <span className="text-indigo-600">Database</span>
            </h1>
            <p className="text-gray-500 mt-2 font-medium italic">Manage unique user profiles and their delivery history.</p>
          </div>

          <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search name, phone or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-100 outline-none transition-all font-bold text-gray-900"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold uppercase tracking-widest text-[10px]">Syncing User Profiles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <Users size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold italic">No matching customers found.</p>
              </div>
            ) : (
              filtered.map(c => (
                <div key={c.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group relative overflow-hidden">
                  {/* Accent Decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <User size={30} />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 text-xl tracking-tight leading-none group-hover:text-indigo-600 transition-colors">{c.name}</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded mt-2 inline-block">ID: #{c.id}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                          <Phone size={16} className="text-gray-400 group-hover:text-indigo-600" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">{c.phone}</span>
                      </div>

                      {c.email && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                            <Mail size={16} className="text-gray-400 group-hover:text-indigo-600" />
                          </div>
                          <span className="font-bold text-sm tracking-tight truncate max-w-[200px]">{c.email}</span>
                        </div>
                      )}

                      <div className="flex gap-3 text-gray-600 pt-3 border-t border-gray-50">
                        <div className="p-2 bg-gray-50 rounded-lg h-fit group-hover:bg-indigo-50 transition-colors">
                          <MapPin size={16} className="text-gray-400 group-hover:text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Latest Address</p>
                          <p className="font-bold text-sm leading-relaxed tracking-tight line-clamp-3 italic">
                            {formatAddress(c.address)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )
        }
      </div>
    </Layout>
  );
};

export default Customers;
