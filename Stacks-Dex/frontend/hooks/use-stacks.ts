import {
  addLiquidity,
  createPool,
  Pool,
  removeLiquidity,
  swap,
} from "@/lib/amm";
import {
  AppConfig,
  openContractCall,
  showConnect,
  type UserData,
  UserSession,
} from "@stacks/connect";
import { PostConditionMode } from "@stacks/transactions";
import { useEffect, useState, useRef } from "react";

const appDetails = {
  name: "Full Range AMM",
  icon: "https://cryptologos.cc/logos/stacks-stx-logo.png",
};

export function useStacks() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to persist userSession across renders
  const userSessionRef = useRef<UserSession | null>(null);
  const appConfigRef = useRef<AppConfig | null>(null);

  // Initialize once
  useEffect(() => {
    try {
      if (!appConfigRef.current) {
        appConfigRef.current = new AppConfig(["store_write"]);
        userSessionRef.current = new UserSession({ 
          appConfig: appConfigRef.current,
          redirectTo: window.location.origin,
          appDetails,
        });
      }
    } catch (err) {
      console.error("Failed to initialize Stacks session:", err);
      setError("Failed to initialize wallet connection");
      setLoading(false);
    }
  }, []);

  const userSession = userSessionRef.current;

  // Handle authentication state
  useEffect(() => {
    if (!userSession) return;

    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        if (userSession.isSignInPending()) {
          try {
            const signedInUserData = await userSession.handlePendingSignIn();
            if (signedInUserData && signedInUserData.userSession) {
              setUserData(signedInUserData.userSession.loadUserData());
            } else {
              setError("Sign-in failed");
              setUserData(null);
            }
          } catch (signInError) {
            console.error("Sign-in error:", signInError);
            setError("Failed to complete sign-in");
            setUserData(null);
            // Clear corrupted session
            userSession.signUserOut();
          }
        } else if (userSession.isUserSignedIn()) {
          try {
            // Validate loaded data before setting state
            const loadedData = userSession.loadUserData();
            
            // Check if data is valid
            if (loadedData && 
                loadedData.profile && 
                typeof loadedData.profile === 'object' &&
                loadedData.profile.stxAddress) {
              setUserData(loadedData);
            } else {
              console.warn("Invalid user data detected, clearing session");
              userSession.signUserOut();
              setUserData(null);
              setError("Session data corrupted, please reconnect");
            }
          } catch (loadError) {
            console.error("Failed to load user data:", loadError);
            // Clear corrupted session data
            userSession.signUserOut();
            localStorage.removeItem('userSession');
            setUserData(null);
            setError("Session corrupted, please reconnect");
          }
        } else {
          setUserData(null);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setError("Authentication check failed");
        setUserData(null);
        userSession.signUserOut();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [userSession]);

  function connectWallet() {
    if (!userSession) {
      setError("Wallet not initialized");
      return;
    }
    
    try {
      showConnect({
        appDetails,
        onFinish: () => {
          window.location.reload();
        },
        userSession,
        onCancel: () => {
          console.log("User cancelled connection");
        },
      });
    } catch (err) {
      console.error("Connect wallet error:", err);
      setError("Failed to initiate connection");
    }
  }

  function disconnectWallet() {
    if (userSession) {
      userSession.signUserOut();
    }
    setUserData(null);
    setError(null);
    // Clear localStorage to prevent stale data
    localStorage.removeItem('userSession');
  }

  // Helper to clear corrupted session
  function clearSession() {
    if (userSession) {
      userSession.signUserOut();
    }
    localStorage.clear(); // Be careful in production - clear only Stacks data
    setUserData(null);
    setError(null);
    window.location.reload();
  }

  async function handleCreatePool(token0: string, token1: string, fee: number) {
    try {
      if (!userData) throw new Error("User not connected");
      if (!userSession) throw new Error("Wallet session not available");
      
      const options = await createPool(token0, token1, fee);
      await openContractCall({
        ...options,
        appDetails,
        userSession,
        onFinish: (data) => {
          window.alert("Sent create pool transaction");
          console.log(data);
        },
        onCancel: () => {
          console.log("Transaction cancelled");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (err) {
      const error = err as Error;
      console.error("Create pool error:", error);
      window.alert(error.message);
    }
  }

  async function handleSwap(pool: Pool, amount: number, zeroForOne: boolean) {
    try {
      if (!userData) throw new Error("User not connected");
      if (!userSession) throw new Error("Wallet session not available");
      
      const options = await swap(pool, amount, zeroForOne);
      await openContractCall({
        ...options,
        appDetails,
        userSession,
        onFinish: (data) => {
          window.alert("Sent swap transaction");
          console.log(data);
        },
        onCancel: () => {
          console.log("Transaction cancelled");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (err) {
      const error = err as Error;
      console.error("Swap error:", error);
      window.alert(error.message);
    }
  }

  async function handleAddLiquidity(
    pool: Pool,
    amount0: number,
    amount1: number
  ) {
    try {
      if (!userData) throw new Error("User not connected");
      if (!userSession) throw new Error("Wallet session not available");
      
      const options = await addLiquidity(pool, amount0, amount1);
      await openContractCall({
        ...options,
        appDetails,
        userSession,
        onFinish: (data) => {
          window.alert("Sent add liquidity transaction");
          console.log({ data });
        },
        onCancel: () => {
          console.log("Transaction cancelled");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (err) {
      const error = err as Error;
      console.error("Add liquidity error:", error);
      window.alert(error.message);
    }
  }

  async function handleRemoveLiquidity(pool: Pool, liquidity: number) {
    try {
      if (!userData) throw new Error("User not connected");
      if (!userSession) throw new Error("Wallet session not available");
      
      const options = await removeLiquidity(pool, liquidity);
      await openContractCall({
        ...options,
        appDetails,
        userSession,
        onFinish: (data) => {
          window.alert("Sent remove liquidity transaction");
          console.log(data);
        },
        onCancel: () => {
          console.log("Transaction cancelled");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (err) {
      const error = err as Error;
      console.error("Remove liquidity error:", error);
      window.alert(error.message);
    }
  }

  return {
    userData,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    clearSession, 
    handleCreatePool,
    handleSwap,
    handleAddLiquidity,
    handleRemoveLiquidity,
    isConnected: !!userData,
    userSession,
  };
}