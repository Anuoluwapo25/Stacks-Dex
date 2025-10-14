import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface HeroProps {
  isConnected: boolean;
  isRegistered: boolean;
  onRegister: () => void;
}

export function Hero({ isConnected, isRegistered, onRegister }: HeroProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 text-center">
      <h2 className="text-5xl font-bold mb-4">
        Decentralized
        <br />
        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Governance
        </span>
      </h2>
      <p className="text-gray-400 text-lg max-w-2xl mx-auto">
        Participate in treasury decisions on Polkadot through democratic on-chain voting
      </p>
      
      {isConnected && !isRegistered && (
        <div className="mt-8 max-w-md mx-auto">
          <Card className="border-yellow-500/30">
            <p className="text-yellow-400 mb-4">⚠️ You need to register as a voter to participate</p>
            <Button onClick={onRegister} className="w-full">
              Register as Voter
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
