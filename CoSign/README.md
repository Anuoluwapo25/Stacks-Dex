# TaskBounty 

> **Decentralized Task Marketplace on Arbitrum**  
> Create tasks, earn bounties, build reputation - all powered by smart contracts

[![Arbitrum](https://img.shields.io/badge/Arbitrum-2D374B?style=flat&logo=arbitrum&logoColor=white)](https://arbitrum.io/)
[![Stylus](https://img.shields.io/badge/Stylus_SDK-FF6B35?style=flat)](https://docs.arbitrum.io/stylus/stylus-gentle-introduction)
[![Rust](https://img.shields.io/badge/Rust-000000?style=flat&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**TaskBounty** transforms how work gets done on the blockchain. Post tasks with ETH bounties, complete work for others, and build your on-chain reputation - all with guaranteed payments and dispute protection.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/taskbounty.git
cd taskbounty

# Install Stylus CLI
cargo install --force cargo-stylus

# Build the contract
cargo stylus build

# Deploy to Arbitrum Sepolia (testnet)
cargo stylus deploy --endpoint https://sepolia-rollup.arbitrum.io/rpc
```

## What Makes TaskBounty Special?

- **Trustless Escrow**: Your ETH is safe until work is completed
- **Built with Stylus**: 10x cheaper gas costs, blazing fast execution
- **Dispute Protection**: 24-hour dispute window protects both parties  
- **On-Chain Reputation**: Build credibility with completed task history
- **Smart Deadlines**: Automatic deadline enforcement and payment release
- **Zero Vendor Lock-in**: Truly decentralized, no platform can shut you down

## How It Works

### For Task Creators 
1. **Post a Task**: Title, description, deadline, and bounty in ETH
2. **Wait for Acceptance**: Workers can claim your open tasks
3. **Review & Pay**: Approve completed work or raise disputes
4. **Build Network**: Attract quality workers with good task history

### For Task Workers  
1. **Browse Tasks**: Find work that matches your skills
2. **Accept & Deliver**: Claim tasks and submit completed work
3. **Get Paid**: Automatic payment after approval or dispute window
4. **Build Reputation**: Showcase your completed task portfolio

## Architecture Overview

```
TaskBounty Smart Contract
├── Task Management
│   ├── Create tasks with ETH bounties
│   ├── Accept and assign tasks
│   └── Submit completed work
├── Payment System  
│   ├── Escrow ETH until completion
│   ├── Automatic payment release
│   └── Platform fee handling (2.5%)
├── Dispute Resolution
│   ├── 24-hour dispute window
│   ├── Creator can challenge work
│   └── Prevents payment until resolved
└── Reputation System
    ├── Track completed tasks
    ├── Monitor created tasks
    └── Build on-chain credibility
```

## Core Functions

### Task Lifecycle
```rust
create_task()     // Post new task with bounty
accept_task()     // Worker claims task  
submit_task()     // Worker submits completion
approve_and_pay() // Creator approves & pays immediately
release_payment() // Auto-pay after dispute window
raise_dispute()   // Creator challenges work quality
cancel_task()     // Creator cancels open task
```

### Information Queries
```rust
get_task()         // Get complete task details
get_user_stats()   // Get user's task history  
get_task_count()   // Total tasks on platform
get_platform_stats() // Platform fees and stats
```

##  Development Setup

### Prerequisites
- **Rust** 1.70+ with `wasm32-unknown-unknown` target
- **Stylus CLI** for deployment and testing
- **Foundry** for additional testing (optional)

### Environment Setup
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target  
rustup target add wasm32-unknown-unknown

# Install Stylus CLI
cargo install --force cargo-stylus

# Verify installation
cargo stylus --version
```

### Local Development
```bash
# Run tests
cargo test

# Check WASM compilation
cargo stylus check

# Estimate deployment gas
cargo stylus deploy --estimate-gas --endpoint <RPC_URL>
```

##  Testing

### Unit Tests
```bash
# Run all tests
cargo test

# Run specific test
cargo test test_create_task

# Test with output
cargo test -- --nocapture
```

### Integration Testing  
```bash
# Test against local node
cargo stylus deploy --endpoint http://localhost:8545

# Test against Arbitrum Sepolia
cargo stylus deploy --endpoint https://sepolia-rollup.arbitrum.io/rpc
```

## Deployment Guide

### Testnet Deployment (Arbitrum Sepolia)
```bash
# Deploy contract
cargo stylus deploy \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc \
  --private-key <YOUR_PRIVATE_KEY>

# Initialize platform
cast send <CONTRACT_ADDRESS> "initialize()" \
  --rpc-url https://sepolia-rollup.arbitrum.io/rpc \
  --private-key <YOUR_PRIVATE_KEY>
```

### Mainnet Deployment (Arbitrum One)
```bash
# Deploy to mainnet
cargo stylus deploy \
  --endpoint https://arb1.arbitrum.io/rpc \
  --private-key <YOUR_PRIVATE_KEY>
```

## Contributing

We welcome all contributors! Here's how to get started:



### Ready to Code?

#### Easy First Issues
- [ ] Add task category system
- [ ] Implement task search filters  
- [ ] Create task expiration cleanup
- [ ] Add batch task operations
- [ ] Improve error messages

#### Advanced Contributions
- [ ] Multi-token payment support
- [ ] Milestone-based payments
- [ ] Reputation scoring algorithm  
- [ ] Cross-chain task posting
- [ ] Advanced dispute resolution

### Pull Request Process
1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Test** your changes thoroughly
4. **Document** new features/changes
5. **Submit** PR with clear description



## Resources

### Documentation
- **[Stylus Book](https://docs.arbitrum.io/stylus/)** - Official Stylus documentation
- **[Arbitrum Docs](https://docs.arbitrum.io/)** - Arbitrum network guides  
- **[Smart Contract Security](https://github.com/crytic/awesome-ethereum-security)** - Security best practices

### Community
- **[Discord](https://discord.gg/arbitrum)** - Join Arbitrum community
- **[Twitter](https://twitter.com/arbitrum)** - Follow updates
- **[GitHub Discussions](../../discussions)** - Ask questions & share ideas

### Tools
- **[Stylus CLI](https://github.com/OffchainLabs/cargo-stylus)** - Development toolkit


##  Roadmap

### Phase 1: Core Platform 
- [x] Basic task creation and assignment
- [x] Escrow payment system  
- [x] Dispute resolution mechanism
- [x] User reputation tracking

### Phase 2: Enhanced Features 
- [ ] Task categories and tagging
- [ ] Advanced search and filtering
- [ ] Multi-token payment support
- [ ] Mobile-responsive frontend

### Phase 3: Advanced Platform 
- [ ] Milestone-based payments
- [ ] Team collaboration tasks
- [ ] Skill-based task matching  
- [ ] Governance token integration

### Phase 4: Ecosystem Growth 
- [ ] Cross-chain compatibility
- [ ] Third-party integrations
- [ ] Enterprise features
- [ ] DAO governance transition

## Support



This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **Arbitrum Team** for the amazing Stylus SDK
- **Rust Community** for excellent tooling and docs


---

**Ready to build the future of work?**  
