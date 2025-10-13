"use client";

import DesktopSidebar from "@/components/navigation/DesktopSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import TopNav from "@/components/navigation/TopNav";
import { initConsoleWarning } from "@/lib/consoleWarning";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Initialize console warning with default settings
    const consoleWarning = initConsoleWarning({
      showOnLoad: true,
      detectDevTools: true,
      overrideConsoleLog: true,
      checkInterval: 500
    });

    // Cleanup function
    return () => {
      consoleWarning.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop Sidebar */}
      <DesktopSidebar className="hidden md:block" />
      
      {/* Top Navigation */}
      <TopNav className="md:ml-64" />
      
      {/* Main Content */}
      <main className="pt-16 md:pt-16 md:ml-64 pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to <span className="text-yellow-500">Goat Fun</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Create and trade meme coins on Goat Network
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
                Create Your First Coin
              </button>
              <button className="border border-gray-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">
                Explore Trending
              </button>
            </div>
          </div>
          
          {/* Placeholder Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                <h3 className="text-lg font-bold mb-2">Sample Coin {item}</h3>
                <p className="text-gray-400 mb-4">Market Cap: $1.2M</p>
                <button className="bg-yellow-500 text-black px-4 py-2 rounded font-medium hover:bg-yellow-400 transition-colors">
                  Trade Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav className="block md:hidden" />
    </div>
  );
}
