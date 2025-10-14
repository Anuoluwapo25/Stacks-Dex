import React from 'react';
import { ProposalCard } from './ProposalCard';
import { Button } from '../ui/Button';
import { Icons } from '../../utils/icons';
import type { Proposal } from '../../types';

interface ProposalListProps {
  proposals: Proposal[];
  onVote: (proposalId: number, optionIndex: number) => void;
}

export function ProposalList({ proposals, onVote }: ProposalListProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 pb-16">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold">Active Proposals</h3>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Icons.Filter />
            Filter
          </Button>
          <Button>
            <Icons.Plus />
            New Proposal
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {proposals.map(proposal => (
          <ProposalCard 
            key={proposal.id} 
            proposal={proposal}
            onVote={onVote}
          />
        ))}
      </div>
    </div>
  );
}