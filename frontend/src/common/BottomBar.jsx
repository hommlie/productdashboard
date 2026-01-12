const BottomBar = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 h-16">
      {/* Copyright */}
      <div className="text-center text-xs text-gray-500 py-5 bg-gray-50 h-full flex items-center justify-center">
        © {new Date().getFullYear()} ProductDashboard. All rights reserved.
      </div>
    </footer>
  );
};

export default BottomBar;
