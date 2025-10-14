import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { Icons } from '../../utils/icons';
import { calculatePercentage, cn } from '../../utils/helpers';
import type { Proposal } from '../../types';

interface ProposalCardProps {
  proposal: Proposal;
  onVote: (proposalId: number, optionIndex: number) => void;
}

export function ProposalCard({ proposal, onVote }: ProposalCardProps) {
  const [showVoting, setShowVoting] = useState(false);
  
  const totalVotes = proposal.vote_counts.reduce((a, b) => a + b, 0);
  const percentages = proposal.vote_counts.map(count => 
    calculatePercentage(count, totalVotes)
  );
  
  return (
    <Card className="hover:border-purple-400/40 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
            proposal.status === "Active" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"
          )}>
            <Icons.Clock />
            {proposal.status}
          </div>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
            {proposal.proposal_type}
          </span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">{proposal.title}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{proposal.description}</p>
      
      <div className="space-y-3 mb-4">
        {proposal.voting_options.map((option, index) => (
          <ProgressBar 
            key={option}
            label={`${option} ${proposal.vote_counts[index]} (${percentages[index]}%)`}
            value={percentages[index]}
            color={index === 0 ? "blue" : index === 1 ? "purple" : "pink"}
          />
        ))}
      </div>
      
      {showVoting && (
        <div className="mb-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <p className="text-sm text-gray-300 mb-3">Cast your vote:</p>
          <div className="flex gap-2">
            {proposal.voting_options.map((option, index) => (
              <Button
                key={option}
                variant="outline"
                className="flex-1"
                onClick={() => onVote(proposal.id, index)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Icons.Users />
            {proposal.total_voters} votes
          </span>
          <span className="flex items-center gap-1">
            <Icons.Clock />
            Block {proposal.created_at}
          </span>
        </div>
        <Button 
          variant="ghost" 
          className="text-sm"
          onClick={() => setShowVoting(!showVoting)}
        >
          {showVoting ? "Hide" : "Vote"}
          <Icons.ChevronRight />
        </Button>
      </div>
    </Card>
  );
}
