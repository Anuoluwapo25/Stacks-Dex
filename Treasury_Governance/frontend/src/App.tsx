import React, { useState } from 'react';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/layout/Hero';
import { Footer } from './components/layout/Footer';
import { StatsSection } from './components/stats/StatsSection';
import { ProposalList } from './components/proposals/ProposalList';
import type { Proposal, GovernanceStats } from './types';

function AppContent() {
  const { account, isConnected, isRegistered, connect, disconnect, registerVoter } = useWallet();
  const [currentPage, setCurrentPage] = useState('home');
  
  const [proposals] = useState<Proposal[]>([
    {
      id: 1,
      title: "Treasury Fund Allocation for Q1 Development",
      description: "Allocate 50,000 tokens for development team expansion and infrastructure improvements",
      proposal_type: "Treasury",
      governance_params: {
        voting_period: "SevenDays",
        quorum_threshold: "Ten",
        execution_delay: "OneDay"
      },
      voting_options: ["Approve", "Reject", "Abstain"],
      proposer: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      created_at: 12345678,
      voting_end: Date.now() + 7 * 24 * 60 * 60 * 1000,
      execution_time: Date.now() + 8 * 24 * 60 * 60 * 1000,
      status: "Active",
      vote_counts: [245, 89, 34],
      total_voters: 368
    },
    {
      id: 2,
      title: "Protocol Upgrade to Version 2.0",
      description: "Implement new consensus mechanism and improve transaction throughput",
      proposal_type: "Technical",
      governance_params: {
        voting_period: "FourteenDays",
        quorum_threshold: "Twenty",
        execution_delay: "TwoDays"
      },
      voting_options: ["Approve", "Reject", "Abstain"],
      proposer: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      created_at: 12445678,
      voting_end: Date.now() + 5 * 24 * 60 * 60 * 1000,
      execution_time: Date.now() + 6 * 24 * 60 * 60 * 1000,
      status: "Active",
      vote_counts: [156, 234, 78],
      total_voters: 468
    }
  ]);

  const stats: GovernanceStats = {
    total_proposals: 24,
    total_voters: 1250,
    active_proposals: 8,
    total_votes_cast: 4520
  };

  const handleRegister = async () => {
    const result = await registerVoter();
    if (result.status === "success") {
      alert("✅ Successfully registered as voter!");
    } else {
      alert("❌ Registration failed: " + result.error);
    }
  };

  const handleVote = async (proposalId: number, optionIndex: number) => {
    // ===== STEP 1: CHECK IF WALLET IS CONNECTED =====
    if (!isConnected) {
      alert("❌ Please connect your wallet first");
      return;
    }
    
    // ===== STEP 2: CHECK IF USER IS REGISTERED =====
    if (!isRegistered) {
      const confirm = window.confirm("You need to register as a voter first. Register now?");
      if (confirm) {
        await handleRegister();
      }
      return;
    }

    // ===== STEP 3: SUBMIT VOTE TO BLOCKCHAIN =====
    // TODO: Replace with real voting call
    alert(`✅ Voted on proposal ${proposalId} with option ${optionIndex}`);
    
    /* In production, this would be:
    try {
      const result = await voteOnProposal(account, proposalId, optionIndex);
      if (result.status === "success") {
        alert("✅ Vote submitted successfully!");
        await fetchProposals(); // Refresh proposals
      } else {
        alert("❌ Vote failed: " + result.message);
      }
    } catch (error) {
      alert("❌ Error: " + error.message);
    }
    */
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isConnected={isConnected}
        account={account?.address || null}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <Hero 
        isConnected={isConnected}
        isRegistered={isRegistered}
        onRegister={handleRegister}
      />

      <StatsSection stats={stats} />

      <ProposalList 
        proposals={proposals}
        onVote={handleVote}
      />

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}