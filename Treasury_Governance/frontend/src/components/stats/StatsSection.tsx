import React from 'react';
import { StatCard } from './StatCard';
import { Icons } from '../../utils/icons';
import type { GovernanceStats } from '../../types';

interface StatsSectionProps {
  stats: GovernanceStats;
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={Icons.FileText} 
          label="Total Proposals" 
          value={stats.total_proposals} 
          trend="12%" 
        />
        <StatCard 
          icon={Icons.Users} 
          label="Total Voters" 
          value={stats.total_voters.toLocaleString()} 
          trend="8%" 
        />
        <StatCard 
          icon={Icons.TrendingUp} 
          label="Active Proposals" 
          value={stats.active_proposals} 
        />
        <StatCard 
          icon={Icons.Vote} 
          label="Votes Cast" 
          value={stats.total_votes_cast.toLocaleString()} 
          trend="15%" 
        />
      </div>
    </div>
  );
}
