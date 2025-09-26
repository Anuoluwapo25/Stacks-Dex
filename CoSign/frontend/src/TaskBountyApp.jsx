import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Wallet, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Star,
  Filter,
  Search,
  User,
  Trophy,
  DollarSign,
  Calendar,
  FileText,
  Settings,
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import useWallet from './Wallet';
import taskBountyService from './TaskBountyService';

const TaskBountyApp = () => {
  const {
    account,
    provider,
    signer,
    isConnected,
    isLoading: walletLoading,
    error: walletError,
    connectWallet,
    disconnectWallet,
    formatAddress,
    getNetworkName,
    chainId
  } = useWallet();

  const [activeTab, setActiveTab] = useState('browse');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({ completed: 0, created: 0, earned: 0 });
  const [platformStats, setPlatformStats] = useState({ fee: 0, owner: '', balance: '0' });
  const [taskCount, setTaskCount] = useState(0);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    bounty: '',
    deadline: 24
  });

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize contract service when wallet connects
  useEffect(() => {
    if (isConnected && provider && signer) {
      taskBountyService.initialize(provider, signer);
      loadAllData();
    }
  }, [isConnected, provider, signer]);

  // Load all contract data
  const loadAllData = async () => {
    if (!isConnected) return;

    try {
      setLoading(true);
      
      // Load tasks, user stats, and platform stats concurrently
      const [allTasks, userStatsData, platformStatsData, count] = await Promise.all([
        taskBountyService.getAllTasks(),
        taskBountyService.getUserStats(account),
        taskBountyService.getPlatformStats(),
        taskBountyService.getTaskCount()
      ]);

      // Process tasks to add title and description from hashes
      // Note: In a real app, you'd want to store title/description off-chain 
      // or implement a mapping system
      const processedTasks = allTasks.map(task => ({
        ...task,
        title: `Task #${task.id}`, // Placeholder - you'll need to implement title retrieval
        description: 'Task description...', // Placeholder
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Mock creation date
        tags: [] // You'd implement tags separately
      }));

      setTasks(processedTasks);
      setUserStats(userStatsData);
      setPlatformStats(platformStatsData);
      setTaskCount(count);

    } catch (error) {
      console.error('Error loading contract data:', error);
      setError('Failed to load contract data');
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createTask = async (e) => {
    if (e) e.preventDefault();
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!newTask.title || !newTask.description || !newTask.bounty) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await taskBountyService.createTask(
        newTask.title,
        newTask.description,
        newTask.deadline,
        newTask.bounty
      );

      console.log('Task created:', result);
      
      // Reset form
      setNewTask({ title: '', description: '', bounty: '', deadline: 24 });
      setActiveTab('browse');
      
      // Reload data
      await loadAllData();

    } catch (error) {
      console.error('Error creating task:', error);
      alert(`Failed to create task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Accept a task
  const acceptTask = async (taskId) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      await taskBountyService.acceptTask(taskId);
      await loadAllData(); // Reload to get updated task status
    } catch (error) {
      console.error('Error accepting task:', error);
      alert(`Failed to accept task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Submit completed task
  const submitTask = async (taskId) => {
    setLoading(true);
    try {
      await taskBountyService.submitTask(taskId);
      await loadAllData(); // Reload to get updated task status
    } catch (error) {
      console.error('Error submitting task:', error);
      alert(`Failed to submit task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Approve and pay for task (creator only)
  const approveAndPay = async (taskId) => {
    setLoading(true);
    try {
      await taskBountyService.approveAndPay(taskId);
      await loadAllData();
    } catch (error) {
      console.error('Error approving task:', error);
      alert(`Failed to approve task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cancel task (creator only)
  const cancelTask = async (taskId) => {
    if (!confirm('Are you sure you want to cancel this task? The bounty will be refunded.')) {
      return;
    }

    setLoading(true);
    try {
      await taskBountyService.cancelTask(taskId);
      await loadAllData();
    } catch (error) {
      console.error('Error canceling task:', error);
      alert(`Failed to cancel task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 0: return { text: 'Open', color: 'bg-green-100 text-green-800 border-green-200', icon: <Plus className="w-4 h-4" /> };
      case 1: return { text: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Clock className="w-4 h-4" /> };
      case 2: return { text: 'Completed', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <CheckCircle className="w-4 h-4" /> };
      case 3: return { text: 'Disputed', color: 'bg-red-100 text-red-800 border-red-200', icon: <AlertCircle className="w-4 h-4" /> };
      default: return { text: 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <XCircle className="w-4 h-4" /> };
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status.toString() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const timeLeft = new Date(deadline) - now;
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (timeLeft <= 0) return 'Expired';
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-2 rounded-xl">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">TaskBounty</h1>
                <p className="text-white/80">Decentralized Task Marketplace</p>
                <p className="text-white/60 text-sm">
                  {taskCount} total tasks • {platformStats.balance} ETH in platform
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isConnected && (
                <>
                  <button
                    onClick={loadAllData}
                    disabled={loading}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-xl text-white transition-all duration-300 disabled:opacity-50"
                    title="Refresh data"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{formatAddress(account)}</span>
                        <span className="text-white/60 text-xs">{getNetworkName()}</span>
                      </div>
                      <div className="text-white/80 text-sm">
                        {userStats.completed} completed | {userStats.created} created
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {walletError && (
                <div className="bg-red-500/20 backdrop-blur-lg rounded-xl px-4 py-2 text-red-200 text-sm">
                  {walletError}
                </div>
              )}
              
              <button
                onClick={isConnected ? disconnectWallet : connectWallet}
                disabled={walletLoading}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isConnected 
                    ? 'bg-green-500/20 text-green-100 border border-green-400/30 hover:bg-green-500/30' 
                    : 'bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50'
                }`}
              >
                {walletLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Wallet className="w-5 h-5" />
                )}
                <span>
                  {walletLoading ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect Wallet'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'browse', label: 'Browse Tasks', icon: <Search className="w-5 h-5" /> },
              { id: 'create', label: 'Create Task', icon: <Plus className="w-5 h-5" /> },
              { id: 'my-tasks', label: 'My Tasks', icon: <User className="w-5 h-5" /> },
              { id: 'stats', label: 'Statistics', icon: <Trophy className="w-5 h-5" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white shadow-lg transform scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contract Connection Warning */}
        {isConnected && taskCount === 0 && !loading && (
          <div className="bg-yellow-500/20 backdrop-blur-lg rounded-xl p-6 mb-8 border border-yellow-400/30">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-300" />
              <div>
                <h3 className="text-yellow-100 font-semibold">Contract Not Deployed or Configured</h3>
                <p className="text-yellow-200/80 text-sm mt-1">
                  Make sure to update the CONTRACT_ADDRESS in TaskBountyService.js with your deployed contract address.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
            <p className="text-white/80">Loading contract data...</p>
          </div>
        )}

        {/* Browse Tasks Tab */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="all">All Status</option>
                  <option value="0">Open</option>
                  <option value="1">In Progress</option>
                  <option value="2">Completed</option>
                  <option value="3">Disputed</option>
                </select>
              </div>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTasks.map(task => {
                const statusInfo = getStatusInfo(task.status);
                const isMyTask = task.creator?.toLowerCase() === account?.toLowerCase();
                const isAssignedToMe = task.assignee?.toLowerCase() === account?.toLowerCase();
                const canAccept = task.status === 0 && !isMyTask && isConnected && task.assignee === '0x0000000000000000000000000000000000000000';
                const canSubmit = task.status === 1 && isAssignedToMe;
                const canApprove = task.status === 2 && isMyTask;
                const canCancel = task.status === 0 && isMyTask;
                const timeRemaining = getTimeRemaining(task.deadline);

                return (
                  <div key={task.id} className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800 flex-1 pr-4">{task.title}</h3>
                      <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span>{statusInfo.text}</span>
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{task.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="font-bold text-lg text-green-600">{task.bounty} ETH</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className={`text-sm font-medium ${timeRemaining === 'Expired' ? 'text-red-500' : ''}`}>
                            {timeRemaining}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Creator: {formatAddress(task.creator)}</span>
                        </div>
                        {task.assignee && task.assignee !== '0x0000000000000000000000000000000000000000' && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                            <span>Assignee: {formatAddress(task.assignee)}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        Task ID: #{task.id} • Deadline: {formatDate(task.deadline)}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      {canAccept && (
                        <button
                          onClick={() => acceptTask(task.id)}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          <span>Accept Task</span>
                        </button>
                      )}
                      
                      {canSubmit && (
                        <button
                          onClick={() => submitTask(task.id)}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          <span>Submit Work</span>
                        </button>
                      )}

                      {canApprove && (
                        <button
                          onClick={() => approveAndPay(task.id)}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                          <span>Approve & Pay</span>
                        </button>
                      )}

                      {canCancel && (
                        <button
                          onClick={() => cancelTask(task.id)}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          <span>Cancel</span>
                        </button>
                      )}

                      {isMyTask && !canCancel && !canApprove && (
                        <div className="flex-1 flex items-center justify-center text-indigo-600 font-semibold bg-indigo-50 rounded-xl py-3">
                          <Star className="w-4 h-4 mr-2" />
                          Your Task
                        </div>
                      )}

                      {!canAccept && !canSubmit && !isMyTask && !canApprove && !canCancel && (
                        <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50 rounded-xl py-3">
                          {task.status === 0 ? 'Available' : statusInfo.text}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTasks.length === 0 && !loading && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
                <p className="text-white/60">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Create Task Tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Create New Task</h2>
              </div>

              {!isConnected && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-yellow-800 font-medium">Please connect your wallet to create tasks</p>
                  </div>
                </div>
              )}

              <form onSubmit={createTask} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter a clear, descriptive title..."
                    required
                    disabled={!isConnected}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Provide detailed requirements, deliverables, and any specific instructions..."
                    required
                    disabled={!isConnected}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bounty Amount (ETH) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={newTask.bounty}
                      onChange={(e) => setNewTask({...newTask, bounty: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                      placeholder="0.1"
                      required
                      disabled={!isConnected}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline</label>
                    <select
                      value={newTask.deadline}
                      onChange={(e) => setNewTask({...newTask, deadline: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                      disabled={!isConnected}
                    >
                      <option value={24}>24 hours</option>
                      <option value={48}>48 hours</option>
                      <option value={72}>3 days</option>
                      <option value={168}>1 week</option>
                      <option value={336}>2 weeks</option>
                      <option value={720}>1 month</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">Important Notes:</span>
                  </div>
                  <ul className="text-blue-700 text-sm space-y-1 ml-7">
                    <li>• A {platformStats.fee / 100}% platform fee will be deducted from the bounty</li>
                    <li>• Title and description are hashed on-chain for privacy</li>
                    <li>• Tasks cannot be edited after creation</li>
                    <li>• You can cancel open tasks and get a full refund</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isConnected || !newTask.title || !newTask.description || !newTask.bounty}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Task...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Create Task ({newTask.bounty || '0'} ETH)</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* My Tasks Tab */}
        {activeTab === 'my-tasks' && (
          <div className="space-y-6">
            {!isConnected ? (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h3>
                <p className="text-white/60 mb-6">Connect your wallet to view your tasks</p>
                <button
                  onClick={connectWallet}
                  className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">My Tasks Overview</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white/20 rounded-xl p-6 text-center">
                      <div className="text-4xl font-bold text-white mb-2">{userStats.created}</div>
                      <div className="text-white/80 text-sm font-medium">Tasks Created</div>
                    </div>
                    <div className="bg-white/20 rounded-xl p-6 text-center">
                      <div className="text-4xl font-bold text-white mb-2">{userStats.completed}</div>
                      <div className="text-white/80 text-sm font-medium">Tasks Completed</div>
                    </div>
                    <div className="bg-white/20 rounded-xl p-6 text-center">
                      <div className="text-4xl font-bold text-white mb-2">-</div>
                      <div className="text-white/80 text-sm font-medium">ETH Earned</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {tasks.filter(task => 
                    task.creator?.toLowerCase() === account?.toLowerCase() || 
                    task.assignee?.toLowerCase() === account?.toLowerCase()
                  ).map(task => {
                    const statusInfo = getStatusInfo(task.status);
                    const isCreator = task.creator?.toLowerCase() === account?.toLowerCase();

                    return (
                      <div key={task.id} className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-gray-800 flex-1 pr-4">{task.title}</h3>
                          <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                            {statusInfo.icon}
                            <span>{statusInfo.text}</span>
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>

                        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-600">{task.bounty} ETH</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isCreator ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                              {isCreator ? 'Creator' : 'Assignee'}
                            </span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-500">
                          Task ID: #{task.id} • Deadline: {formatDate(task.deadline)} • {getTimeRemaining(task.deadline)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {tasks.filter(task => 
                  task.creator?.toLowerCase() === account?.toLowerCase() || 
                  task.assignee?.toLowerCase() === account?.toLowerCase()
                ).length === 0 && !loading && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No tasks yet</h3>
                    <p className="text-white/60 mb-6">Create your first task or start browsing available tasks</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 mr-3"
                    >
                      Create Task
                    </button>
                    <button
                      onClick={() => setActiveTab('browse')}
                      className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                    >
                      Browse Tasks
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Platform Statistics</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">{taskCount}</div>
                  <div className="text-gray-700 font-medium">Total Tasks</div>
                  <div className="text-xs text-gray-500 mt-1">On-chain verified</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200">
                  <div className="text-4xl font-bold text-green-600 mb-2">{tasks.filter(t => t.status === 2).length}</div>
                  <div className="text-gray-700 font-medium">Completed</div>
                  <div className="text-xs text-gray-500 mt-1">{taskCount > 0 ? Math.round((tasks.filter(t => t.status === 2).length / taskCount) * 100) : 0}% success rate</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl border border-purple-200">
                  <div className="text-4xl font-bold text-purple-600 mb-2">{platformStats.balance}</div>
                  <div className="text-gray-700 font-medium">ETH in Platform</div>
                  <div className="text-xs text-gray-500 mt-1">{platformStats.fee / 100}% platform fee</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-100 rounded-xl border border-orange-200">
                  <div className="text-4xl font-bold text-orange-600 mb-2">{tasks.filter(t => t.status === 0).length}</div>
                  <div className="text-gray-700 font-medium">Open Tasks</div>
                  <div className="text-xs text-gray-500 mt-1">Available now</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Task Status Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <span className="font-medium text-gray-800 flex items-center">
                      <Plus className="w-4 h-4 mr-2 text-green-600" />
                      Open Tasks
                    </span>
                    <span className="text-sm text-gray-600">{tasks.filter(t => t.status === 0).length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <span className="font-medium text-gray-800 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      In Progress
                    </span>
                    <span className="text-sm text-gray-600">{tasks.filter(t => t.status === 1).length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                    <span className="font-medium text-gray-800 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-purple-600" />
                      Completed
                    </span>
                    <span className="text-sm text-gray-600">{tasks.filter(t => t.status === 2).length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <span className="font-medium text-gray-800 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                      Disputed
                    </span>
                    <span className="text-sm text-gray-600">{tasks.filter(t => t.status === 3).length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Platform Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-800">Platform Fee</span>
                    <span className="text-sm text-gray-600">{platformStats.fee / 100}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-800">Owner</span>
                    <span className="text-sm text-gray-600">{formatAddress(platformStats.owner)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-800">Network</span>
                    <span className="text-sm text-gray-600">{getNetworkName()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-800">Contract</span>
                    <span className="text-sm text-gray-600">{formatAddress(CONTRACT_ADDRESS)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskBountyApp;