import React from 'react';
import Layout from "../Layout";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="relative bg-white rounded-[3rem] p-12 md:p-20 border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col items-center text-center animate-slide-up">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -ml-32 -mb-32" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] flex items-center justify-center mb-8 text-white shadow-2xl shadow-amber-200">
              <SettingsIcon size={48} />
            </div>

            <div className="space-y-4">
              <span className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full border border-amber-100 uppercase tracking-[0.2em]">
                System Config v4.0.2
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-none">
                Core <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">Parameters</span>
              </h1>
              <p className="text-gray-500 mt-6 font-medium max-w-lg leading-relaxed text-lg italic">
                Calibrate your application engine. Modify regional localization, adjust security protocols, and manage API endpoints from this secure administrative environment.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap gap-4 justify-center">
              <div className="px-8 py-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-[10px]">Cloud Sync Active</span>
              </div>
              <div className="px-8 py-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-[10px]">Admin Access Only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
