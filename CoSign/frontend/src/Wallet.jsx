import { useState, useEffect, useCallback } from 'react';
import { ethers, BrowserProvider } from 'ethers';

const useWallet = () => {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [chainId, setChainId] = useState(null);

  const checkConnection = useCallback(async () => {
    try {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          setProvider(provider);
          setSigner(signer);
          setAccount(accounts[0].address);
          setChainId(Number(network.chainId));
          setIsConnected(true);
        }
      }
    } catch (err) {
      console.error('Error checking connection:', err);
      setError(err.message);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!window.ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      setIsConnected(true);

      // Note: localStorage usage removed for Claude.ai compatibility
      // localStorage.setItem('walletConnected', 'true');

    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount('');
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setChainId(null);
    setError('');
    // localStorage.removeItem('walletConnected');
  }, []);

  const switchNetwork = useCallback(async (targetChainId) => {
    try {
      if (!window.ethereum) throw new Error('No wallet found');
      
      const chainIdHex = '0x' + targetChainId.toString(16);
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (err) {
      console.error('Error switching network:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(parseInt(chainId, 16));
      window.location.reload();
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [account, disconnectWallet]);

  useEffect(() => {
    // Auto-reconnection logic would go here if using localStorage
    // For now, just check connection on mount
    checkConnection();
  }, [checkConnection]);

  const formatAddress = useCallback((address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const getNetworkName = useCallback((chainId) => {
    const networks = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia Testnet', // Updated testnet
      5: 'Goerli Testnet',
      137: 'Polygon Mainnet',
      80001: 'Polygon Mumbai',
      56: 'BSC Mainnet',
      97: 'BSC Testnet',
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  }, []);

  return {
    account,
    provider,
    signer,
    isConnected,
    isLoading,
    error,
    chainId,
    
    connectWallet,
    disconnectWallet,
    switchNetwork,
    
    formatAddress,
    getNetworkName: () => getNetworkName(chainId),
  };
};

export default useWallet;