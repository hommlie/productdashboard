import React from 'react';
import Layout from "../Layout";
import { Users } from "lucide-react";

const Customers = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="relative bg-white rounded-2xl p-12 md:p-20 border border-gray-100 shadow-sm overflow-hidden flex flex-col items-center text-center">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50/50 rounded-full blur-3xl -ml-32 -mb-32" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 text-white shadow-xl shadow-indigo-100">
              <Users size={40} />
            </div>

            <div className="space-y-4">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 uppercase tracking-wider">
                Customer Management
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                Customer <span className="text-indigo-600">Overview</span>
              </h1>
              <p className="text-gray-500 mt-6 font-medium max-w-lg leading-relaxed text-lg">
                Manage your global customer database, view profiles, and track user growth from a centralized dashboard.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap gap-4 justify-center">
              <div className="px-6 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Service Active</span>
              </div>
              <div className="px-6 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cloud Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Customers;
