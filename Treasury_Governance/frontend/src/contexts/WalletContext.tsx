import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { WalletAccount, TransactionStatus } from '../types';

interface WalletContextType {
  account: WalletAccount | null;
  isConnected: boolean;
  isRegistered: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  registerVoter: () => Promise<TransactionStatus>;
  loading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with real wallet connection
      const mockAccount: WalletAccount = {
        address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        name: "My Account"
      };
      
      setAccount(mockAccount);
      localStorage.setItem("connectedAccount", JSON.stringify(mockAccount));
      
      // Check registration status
      const registered = localStorage.getItem("isRegistered") === "true";
      setIsRegistered(registered);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setIsRegistered(false);
    setError(null);
    localStorage.removeItem("connectedAccount");
    localStorage.removeItem("isRegistered");
  };

  const registerVoter = async (): Promise<TransactionStatus> => {
    if (!account) {
      return { status: "error", error: "No wallet connected" };
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with real registration call
      localStorage.setItem("isRegistered", "true");
      setIsRegistered(true);
      return { status: "success", message: "Registered successfully" };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to register";
      setError(errorMessage);
      return { status: "error", error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Rehydrate on mount
  useEffect(() => {
    const saved = localStorage.getItem("connectedAccount");
    const savedRegistration = localStorage.getItem("isRegistered");
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAccount(parsed);
        setIsRegistered(savedRegistration === "true");
      } catch (e) {
        localStorage.removeItem("connectedAccount");
      }
    }
  }, []);

  return (
    <WalletContext.Provider value={{
      account,
      isConnected: !!account,
      isRegistered,
      connect,
      disconnect,
      registerVoter,
      loading,
      error
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}