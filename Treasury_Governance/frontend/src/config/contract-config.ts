export const CONTRACT_ADDRESS = "0x89623480a4d67Addb0aC4952f8037C279d540772";

export const ProposalType = {
  Treasury: "Treasury",
  Governance: "Governance", 
  Technical: "Technical",
  Other: "Other",
} as const;

export const ProposalStatus = {
  Active: "Active",
  Passed: "Passed", 
  Rejected: "Rejected",
  Executed: "Executed",
  Expired: "Expired",
} as const;

export const VotingPeriod = {
  ThreeDays: "ThreeDays",
  SevenDays: "SevenDays",
  FourteenDays: "FourteenDays",
  ThirtyDays: "ThirtyDays",
} as const;

export const QuorumThreshold = {
  Five: "Five",
  Ten: "Ten",
  Twenty: "Twenty",
  TwentyFive: "TwentyFive",
} as const;

export const ExecutionDelay = {
  Immediately: "Immediately",
  OneDay: "OneDay",
  TwoDays: "TwoDays",
  SevenDays: "SevenDays",
} as const;