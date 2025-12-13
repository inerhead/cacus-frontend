'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';

export default function WishlistSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Fixed Sidebar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-lego-orange text-white p-4 rounded-l-lg shadow-lg hover:bg-orange-600 transition-colors"
        aria-label="Lista de deseos"
      >
        <div className="flex flex-col items-center gap-2">
          <Heart className="w-6 h-6 fill-current" />
          <span className="writing-vertical text-xs font-bold uppercase tracking-wider">
            Lista de deseos
          </span>
        </div>
      </button>

      {/* Sidebar Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold uppercase">Lista de deseos</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-black"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-center py-12">
                <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">Tu lista de deseos está vacía</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

