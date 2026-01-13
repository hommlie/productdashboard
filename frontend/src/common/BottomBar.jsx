const BottomBar = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-gray-100 z-30 h-16 mt-auto shrink-0">
      <div className="h-full flex items-center justify-between px-8 max-w-[1600px] mx-auto w-full">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/20" />
          © {new Date().getFullYear()} <span className="text-indigo-600">ADMINPANEL</span>. ALL RIGHTS RESERVED.
        </div>
        <div className="flex items-center gap-8">
          <a href="#" className="text-[10px] font-black text-gray-400 hover:text-indigo-600 transition-all uppercase tracking-[0.2em] hover:tracking-[0.3em]">SUPPORT</a>
          <a href="#" className="text-[10px] font-black text-gray-400 hover:text-indigo-600 transition-all uppercase tracking-[0.2em] hover:tracking-[0.3em]">DOCS</a>
        </div>
      </div>
    </footer>
  );
};

export default BottomBar;
