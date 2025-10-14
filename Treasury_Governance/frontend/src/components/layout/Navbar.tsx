import React from 'react';
import { Button } from '../ui/Button';
import { Icons } from '../../utils/icons';
import { formatAddress } from '../../utils/helpers';
import { cn } from '../../utils/helpers';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isConnected: boolean;
  account: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function Navbar({ 
  currentPage, 
  setCurrentPage, 
  isConnected, 
  account, 
  onConnect, 
  onDisconnect 
}: NavbarProps) {
  return (
    <nav className="border-b border-purple-500/20 backdrop-blur-md bg-slate-900/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Icons.Vote />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Treasury Gov
              </h1>
              <p className="text-xs text-gray-400">Polkadot Ink!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setCurrentPage('home')}
              className={cn(
                "text-sm font-medium transition-colors",
                currentPage === 'home' ? "text-purple-400" : "text-gray-400 hover:text-white"
              )}
            >
              Proposals
            </button>
            <button 
              onClick={() => setCurrentPage('create')}
              className={cn(
                "text-sm font-medium transition-colors",
                currentPage === 'create' ? "text-purple-400" : "text-gray-400 hover:text-white"
              )}
            >
              Create
            </button>
            <button 
              onClick={() => setCurrentPage('statistics')}
              className={cn(
                "text-sm font-medium transition-colors",
                currentPage === 'statistics' ? "text-purple-400" : "text-gray-400 hover:text-white"
              )}
            >
              Statistics
            </button>
            
            <Button 
              onClick={isConnected ? onDisconnect : onConnect} 
              variant={isConnected ? "outline" : "default"}
            >
              <Icons.Wallet />
              {isConnected && account ? formatAddress(account) : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
