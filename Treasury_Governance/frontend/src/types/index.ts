export interface WalletAccount {
  address: string;
  name?: string;
  source?: string;
  wallet?: any;
}

export interface Proposal {
  id: number;
  title: string;
  description: string;
  proposal_type: ProposalTypeEnum;
  governance_params: GovernanceParameters;
  voting_options: string[];
  proposer: string;
  created_at: number;
  voting_end: number;
  execution_time: number;
  status: ProposalStatusEnum;
  vote_counts: number[];
  total_voters: number;
}

export interface GovernanceParameters {
  voting_period: VotingPeriodEnum;
  quorum_threshold: QuorumThresholdEnum;
  execution_delay: ExecutionDelayEnum;
}

export interface GovernanceStats {
  total_proposals: number;
  total_voters: number;
  active_proposals: number;
  total_votes_cast: number;
}

export interface TransactionStatus {
  status: "success" | "error";
  message?: string;
  hash?: string;
  error?: string;
}

export type ProposalTypeEnum = "Treasury" | "Governance" | "Technical" | "Other";
export type ProposalStatusEnum = "Active" | "Passed" | "Rejected" | "Executed" | "Expired";
export type VotingPeriodEnum = "ThreeDays" | "SevenDays" | "FourteenDays" | "ThirtyDays";
export type QuorumThresholdEnum = "Five" | "Ten" | "Twenty" | "TwentyFive";
export type ExecutionDelayEnum = "Immediately" | "OneDay" | "TwoDays" | "SevenDays";