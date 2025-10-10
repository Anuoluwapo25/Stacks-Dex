import React, { useState, useEffect } from 'react';
import { Menu, X, Plus, Vote, Users, FileText, Clock, CheckCircle, XCircle, AlertCircle, Wallet, LogOut, Loader2 } from 'lucide-react';

type ProposalType = 'Treasury' | 'Governance' | 'Technical' | 'Other';
type ProposalStatus = 'Active' | 'Passed' | 'Rejected' | 'Executed' | 'Expired';
type VotingPeriod = 'ThreeDays' | 'SevenDays' | 'FourteenDays' | 'ThirtyDays';
type QuorumThreshold = 'Five' | 'Ten' | 'Twenty' | 'TwentyFive';
type ExecutionDelay = 'Immediately' | 'OneDay' | 'TwoDays' | 'SevenDays';

interface GovernanceParameters {
  votingPeriod: VotingPeriod;
  quorumThreshold: QuorumThreshold;
  executionDelay: ExecutionDelay;
}

interface Proposal {
  id: number;
  title: string;
  description: string;
  proposalType: ProposalType;
  status: ProposalStatus;
  votingEnd: number;
  executionTime: number;
  voteCounts: number[];
  votingOptions: string[];
  totalVoters: number;
  governanceParams: GovernanceParameters;
  proposer: string;
  createdAt: number;
}

interface WalletState {
  connected: boolean;
  account: string | null;
  balance: string | null;
}

// Mock contract interaction - replace with actual Polkadot.js integration
const mockContractAPI = {
  async getProposals(): Promise<Proposal[]> {
    return [
      {
        id: 1,
        title: "Treasury Fund Allocation for Q1 Development",
        description: "Allocate 50,000 tokens for development team expansion and infrastructure improvements",
        proposalType: "Treasury",
        status: "Active",
        votingEnd: 12345678,
        executionTime: 12445678,
        voteCounts: [245, 89, 34],
        votingOptions: ["Approve", "Reject", "Abstain"],
        totalVoters: 368,
        governanceParams: {
          votingPeriod: "SevenDays",
          quorumThreshold: "Ten",
          executionDelay: "OneDay"
        },
        proposer: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        createdAt: 12245678
      },
      {
        id: 2,
        title: "Protocol Upgrade to Version 2.0",
        description: "Implement new consensus mechanism and improve transaction throughput",
        proposalType: "Technical",
        status: "Active",
        votingEnd: 12445678,
        executionTime: 12545678,
        voteCounts: [156, 234, 78],
        votingOptions: ["Approve", "Reject", "Abstain"],
        totalVoters: 468,
        governanceParams: {
          votingPeriod: "FourteenDays",
          quorumThreshold: "Twenty",
          executionDelay: "TwoDays"
        },
        proposer: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        createdAt: 12145678
      }
    ];
  },
  
  async getStats() {
    return { total: 24, active: 3, executed: 18, totalVoters: 1234 };
  },

  async createProposal(data: any) {
    console.log("Creating proposal:", data);
    return { success: true, proposalId: 3 };
  },

  async vote(proposalId: number, optionIndex: number) {
    console.log(`Voting on proposal ${proposalId}, option ${optionIndex}`);
    return { success: true };
  },

  async registerVoter() {
    console.log("Registering voter");
    return { success: true };
  }
};

const TreasuryGovernanceUI: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'proposals' | 'create' | 'stats'>('proposals');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  
  // Wallet state
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    account: null,
    balance: null
  });

  // Proposals data
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, executed: 0, totalVoters: 0 });

  // Create proposal form state
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    type: 'Treasury' as ProposalType,
    votingPeriod: 'SevenDays' as VotingPeriod,
    quorum: 'Ten' as QuorumThreshold,
    executionDelay: 'OneDay' as ExecutionDelay,
    options: ['Approve', 'Reject', 'Abstain']
  });

  const [customOptions, setCustomOptions] = useState('');

  // Load data on mount
  useEffect(() => {
    loadProposals();
    loadStats();
  }, []);

  const loadProposals = async () => {
    try {
      const data = await mockContractAPI.getProposals();
      setProposals(data);
    } catch (error) {
      console.error("Error loading proposals:", error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await mockContractAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // Wallet connection - Replace with actual Polkadot.js implementation
  const connectWallet = async () => {
    setLoading(true);
    try {
      // Simulating wallet connection
      // In production: use @polkadot/extension-dapp
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWallet({
        connected: true,
        account: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        balance: "100.5"
      });
      setTxStatus("Wallet connected successfully!");
      setTimeout(() => setTxStatus(null), 3000);
    } catch (error) {
      console.error("Wallet connection error:", error);
      setTxStatus("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet({ connected: false, account: null, balance: null });
  };

  const handleVote = async (optionIndex: number) => {
    if (!wallet.connected || !selectedProposal) return;
    
    setSelectedVote(optionIndex);
    setLoading(true);
    setTxStatus("Submitting vote...");
    
    try {
      await mockContractAPI.vote(selectedProposal.id, optionIndex);
      setTxStatus(`Vote cast successfully for: ${selectedProposal.votingOptions[optionIndex]}`);
      setTimeout(() => {
        setIsVoting(false);
        setSelectedVote(null);
        setTxStatus(null);
        loadProposals();
      }, 2000);
    } catch (error) {
      console.error("Vote error:", error);
      setTxStatus("Failed to cast vote");
      setSelectedVote(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!wallet.connected) {
      setTxStatus("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setTxStatus("Creating proposal...");
    
    try {
      const options = customOptions.trim() 
        ? customOptions.split(',').map(o => o.trim()).filter(o => o)
        : newProposal.options;

      if (options.length === 0 || options.length > 10) {
        setTxStatus("Please provide 1-10 voting options");
        setLoading(false);
        return;
      }

      await mockContractAPI.createProposal({
        ...newProposal,
        options
      });
      
      setTxStatus("Proposal created successfully!");
      setTimeout(() => {
        setNewProposal({
          title: '',
          description: '',
          type: 'Treasury',
          votingPeriod: 'SevenDays',
          quorum: 'Ten',
          executionDelay: 'OneDay',
          options: ['Approve', 'Reject', 'Abstain']
        });
        setCustomOptions('');
        setTxStatus(null);
        setSelectedTab('proposals');
        loadProposals();
        loadStats();
      }, 2000);
    } catch (error) {
      console.error("Create proposal error:", error);
      setTxStatus("Failed to create proposal");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterVoter = async () => {
    if (!wallet.connected) {
      setTxStatus("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setTxStatus("Registering as voter...");
    
    try {
      await mockContractAPI.registerVoter();
      setTxStatus("Successfully registered as voter!");
      setTimeout(() => {
        setTxStatus(null);
        loadStats();
      }, 2000);
    } catch (error) {
      console.error("Register voter error:", error);
      setTxStatus("Failed to register as voter");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case 'Active': return 'text-blue-400 bg-blue-400/10';
      case 'Passed': return 'text-green-400 bg-green-400/10';
      case 'Rejected': return 'text-red-400 bg-red-400/10';
      case 'Executed': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: ProposalStatus) => {
    switch (status) {
      case 'Active': return <Clock className="w-4 h-4" />;
      case 'Passed': return <CheckCircle className="w-4 h-4" />;
      case 'Rejected': return <XCircle className="w-4 h-4" />;
      case 'Executed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className=" min-h-screen w-full bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Transaction Status Toast */}
      {txStatus && (
        <div className="fixed top-4 right-4 z-50 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{txStatus}</span>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white block">Treasury Gov</span>
                <span className="text-xs text-purple-400">Polkadot Ink!</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setSelectedTab('proposals')}
                className={`text-sm font-medium transition-colors ${
                  selectedTab === 'proposals' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Proposals
              </button>
              <button
                onClick={() => setSelectedTab('create')}
                className={`text-sm font-medium transition-colors ${
                  selectedTab === 'create' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Create
              </button>
              <button
                onClick={() => setSelectedTab('stats')}
                className={`text-sm font-medium transition-colors ${
                  selectedTab === 'stats' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Statistics
              </button>
              
              {wallet.connected ? (
                <div className="flex items-center space-x-3">
                  <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-xs text-gray-400">Balance</div>
                    <div className="text-sm text-white font-medium">{wallet.balance} DOT</div>
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-xs text-gray-400">Account</div>
                    <div className="text-sm text-white font-medium">{formatAddress(wallet.account!)}</div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                    title="Disconnect"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      <span>Connect Wallet</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3">
              <button
                onClick={() => { setSelectedTab('proposals'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Proposals
              </button>
              <button
                onClick={() => { setSelectedTab('create'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Create
              </button>
              <button
                onClick={() => { setSelectedTab('stats'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Statistics
              </button>
              {wallet.connected ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-xs text-gray-400">Account</div>
                    <div className="text-sm text-white font-medium">{formatAddress(wallet.account!)}</div>
                    <div className="text-xs text-purple-400 mt-1">{wallet.balance} DOT</div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="w-full px-6 py-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="w-full px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium disabled:opacity-50"
                >
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {selectedTab === 'proposals' && !selectedProposal && (
          <div className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Decentralized
              <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Governance
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
              Participate in treasury decisions on Polkadot through democratic on-chain voting
            </p>
            {wallet.connected && (
              <button
                onClick={handleRegisterVoter}
                disabled={loading}
                className="px-6 py-3 bg-purple-600/20 border border-purple-500/50 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-all disabled:opacity-50"
              >
                Register as Voter
              </button>
            )}
          </div>
        )}

        {/* Statistics Cards */}
        {selectedTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">{stats.total}</span>
              </div>
              <p className="text-gray-400 text-sm">Total Proposals</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">{stats.active}</span>
              </div>
              <p className="text-gray-400 text-sm">Active Proposals</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">{stats.totalVoters}</span>
              </div>
              <p className="text-gray-400 text-sm">Registered Voters</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">{stats.executed}</span>
              </div>
              <p className="text-gray-400 text-sm">Executed</p>
            </div>
          </div>
        )}

        {/* Create Proposal Form */}
        {selectedTab === 'create' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-bold text-white mb-6">Create New Proposal</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Title</label>
                  <input
                    type="text"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="Enter proposal title"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Description</label>
                  <textarea
                    value={newProposal.description}
                    onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="Describe your proposal in detail"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Proposal Type</label>
                    <select
                      value={newProposal.type}
                      onChange={(e) => setNewProposal({...newProposal, type: e.target.value as ProposalType})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Treasury">Treasury</option>
                      <option value="Governance">Governance</option>
                      <option value="Technical">Technical</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Voting Period</label>
                    <select
                      value={newProposal.votingPeriod}
                      onChange={(e) => setNewProposal({...newProposal, votingPeriod: e.target.value as VotingPeriod})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="ThreeDays">3 Days</option>
                      <option value="SevenDays">7 Days</option>
                      <option value="FourteenDays">14 Days</option>
                      <option value="ThirtyDays">30 Days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Quorum Threshold</label>
                    <select
                      value={newProposal.quorum}
                      onChange={(e) => setNewProposal({...newProposal, quorum: e.target.value as QuorumThreshold})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Five">5%</option>
                      <option value="Ten">10%</option>
                      <option value="Twenty">20%</option>
                      <option value="TwentyFive">25%</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Execution Delay</label>
                    <select
                      value={newProposal.executionDelay}
                      onChange={(e) => setNewProposal({...newProposal, executionDelay: e.target.value as ExecutionDelay})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Immediately">Immediately</option>
                      <option value="OneDay">1 Day</option>
                      <option value="TwoDays">2 Days</option>
                      <option value="SevenDays">7 Days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Voting Options (comma-separated, max 10)
                  </label>
                  <input
                    type="text"
                    value={customOptions}
                    onChange={(e) => setCustomOptions(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="e.g., Approve, Reject, Abstain"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to use default: Approve, Reject, Abstain</p>
                </div>

                <button
                  onClick={handleCreateProposal}
                  disabled={loading || !wallet.connected}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>{wallet.connected ? 'Create Proposal' : 'Connect Wallet to Create'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Proposals List */}
        {selectedTab === 'proposals' && !selectedProposal && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                onClick={() => setSelectedProposal(proposal)}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(proposal.status)}`}>
                        {getStatusIcon(proposal.status)}
                        <span>{proposal.status}</span>
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-400">
                        {proposal.proposalType}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {proposal.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{proposal.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {proposal.votingOptions.map((option, idx) => {
                    const percentage = proposal.totalVoters > 0 
                      ? (proposal.voteCounts[idx] / proposal.totalVoters * 100).toFixed(1)
                      : '0';
                    
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{option}</span>
                          <span className="text-gray-400">{proposal.voteCounts[idx]} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{proposal.totalVoters} votes</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Block {proposal.votingEnd}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Proposal Detail View */}
        {selectedProposal && selectedTab === 'proposals' && (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedProposal(null)}
              className="mb-6 text-gray-400 hover:text-white flex items-center space-x-2 transition-colors"
            >
              <span>← Back to proposals</span>
            </button>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(selectedProposal.status)}`}>
                      {getStatusIcon(selectedProposal.status)}
                      <span>{selectedProposal.status}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-400">
                      {selectedProposal.proposalType}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedProposal.title}</h2>
                  <p className="text-gray-400">Proposal #{selectedProposal.id}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{selectedProposal.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Total Votes</p>
                  <p className="text-2xl font-bold text-white">{selectedProposal.totalVoters}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Voting Period</p>
                  <p className="text-xl font-bold text-white">{selectedProposal.governanceParams.votingPeriod.replace(/([A-Z])/g, ' $1').trim()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Quorum</p>
                  <p className="text-2xl font-bold text-white">{selectedProposal.governanceParams.quorumThreshold.replace(/([A-Z])/g, ' $1').trim()}%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Proposer</p>
                  <p className="text-sm font-bold text-purple-400">{formatAddress(selectedProposal.proposer)}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Vote Distribution</h3>
                <div className="space-y-4">
                  {selectedProposal.votingOptions.map((option, idx) => {
                    const percentage = selectedProposal.totalVoters > 0 
                      ? (selectedProposal.voteCounts[idx] / selectedProposal.totalVoters * 100).toFixed(1)
                      : '0';
                    
                    return (
                      <div key={idx} className="bg-white/5 rounded-lg p-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white font-medium">{option}</span>
                          <span className="text-gray-400">{selectedProposal.voteCounts[idx]} votes ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedProposal.status === 'Active' && !isVoting && (
                <button
                  onClick={() => setIsVoting(true)}
                  disabled={!wallet.connected}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Vote className="w-5 h-5" />
                  <span>{wallet.connected ? 'Cast Your Vote' : 'Connect Wallet to Vote'}</span>
                </button>
              )}

              {isVoting && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white mb-4">Select Your Vote</h3>
                  {selectedProposal.votingOptions.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleVote(idx)}
                      disabled={selectedVote !== null || loading}
                      className={`w-full px-6 py-3 rounded-lg font-medium transition-all ${
                        selectedVote === idx
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                      } ${selectedVote !== null && selectedVote !== idx ? 'opacity-50' : ''} disabled:opacity-50`}
                    >
                      {selectedVote === idx && loading ? (
                        <span className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </span>
                      ) : (
                        option
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setIsVoting(false);
                      setSelectedVote(null);
                    }}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-white/5 rounded-lg text-gray-400 font-medium hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">© 2025 Treasury Governance • Built on Polkadot</p>
            <div className="flex items-center space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Documentation</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Contract</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TreasuryGovernanceUI;