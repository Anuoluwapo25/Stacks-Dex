import { ethers } from 'ethers';


const TASKBOUNTY_ABI = [
  {
    "type": "function",
    "name": "initialize",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "create_task",
    "inputs": [
      {
        "name": "title_hash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "description_hash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "deadline_hours",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "accept_task",
    "inputs": [
      {
        "name": "task_id",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "submit_task",
    "inputs": [
      {
        "name": "task_id",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "approve_and_pay",
    "inputs": [
      {
        "name": "task_id",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "release_payment",
    "inputs": [
      {
        "name": "task_id",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "raise_dispute",
    "inputs": [
      {
        "name": "task_id",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "get_task",
    "inputs": [
      {
        "name": "task_id",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_user_stats",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_task_count",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "get_platform_stats",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "cancel_task",
    "inputs": [
      {
        "name": "task_id",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  }
];

const CONTRACT_ADDRESS = "0xf7575b3aabbf08f1ed2767def1671052814b1c0c"; 

class TaskBountyService {
  constructor() {
    this.contract = null;
    this.provider = null;
    this.signer = null;
  }

  initialize(provider, signer) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, TASKBOUNTY_ABI, signer);
  }

  createHash(text) {
    return ethers.id(text); 
  }

  bytes32ToString(bytes32) {
    return ethers.toUtf8String(bytes32);
  }

  async initializeContract() {
    try {
      const tx = await this.contract.initialize();
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error initializing contract:', error);
      throw error;
    }
  }

  async createTask(title, description, deadlineHours, bountyAmount) {
    try {
      const titleHash = this.createHash(title);
      const descriptionHash = this.createHash(description);
      const value = ethers.parseEther(bountyAmount.toString());

      const tx = await this.contract.create_task(
        titleHash,
        descriptionHash,
        BigInt(deadlineHours),
        { value }
      );
      
      const receipt = await tx.wait();
      

      return {
        transaction: tx,
        receipt: receipt,
        taskId: receipt.logs.length > 0 ? receipt.logs[0].data : null
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async acceptTask(taskId) {
    try {
      const tx = await this.contract.accept_task(BigInt(taskId));
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error accepting task:', error);
      throw error;
    }
  }

  // Submit completed task
  async submitTask(taskId) {
    try {
      const tx = await this.contract.submit_task(BigInt(taskId));
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error submitting task:', error);
      throw error;
    }
  }

  async approveAndPay(taskId) {
    try {
      const tx = await this.contract.approve_and_pay(BigInt(taskId));
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error approving and paying task:', error);
      throw error;
    }
  }

  async releasePayment(taskId) {
    try {
      const tx = await this.contract.release_payment(BigInt(taskId));
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error releasing payment:', error);
      throw error;
    }
  }

  async raiseDispute(taskId) {
    try {
      const tx = await this.contract.raise_dispute(BigInt(taskId));
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error raising dispute:', error);
      throw error;
    }
  }

  async cancelTask(taskId) {
    try {
      const tx = await this.contract.cancel_task(BigInt(taskId));
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error canceling task:', error);
      throw error;
    }
  }

  async getTask(taskId) {
    try {
      const taskData = await this.contract.get_task(BigInt(taskId));
      
      return {
        creator: taskData[0],
        bounty: ethers.formatEther(taskData[1]),
        assignee: taskData[2],
        status: Number(taskData[3]),
        titleHash: taskData[4],
        descriptionHash: taskData[5],
        deadline: Number(taskData[6]) * 1000, // Convert to milliseconds
        id: taskId
      };
    } catch (error) {
      console.error('Error getting task:', error);
      throw error;
    }
  }

  async getUserStats(userAddress) {
    try {
      const stats = await this.contract.get_user_stats(userAddress);
      return {
        completed: Number(stats[0]),
        created: Number(stats[1])
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  async getTaskCount() {
    try {
      const count = await this.contract.get_task_count();
      return Number(count);
    } catch (error) {
      console.error('Error getting task count:', error);
      throw error;
    }
  }

  async getPlatformStats() {
    try {
      const stats = await this.contract.get_platform_stats();
      return {
        fee: Number(stats[0]), 
        owner: stats[1],
        balance: ethers.formatEther(stats[2])
      };
    } catch (error) {
      console.error('Error getting platform stats:', error);
      throw error;
    }
  }

 
  async getAllTasks() {
    try {
      const taskCount = await this.getTaskCount();
      const tasks = [];

      for (let i = 1; i <= taskCount; i++) {
        try {
          const task = await this.getTask(i);
          tasks.push(task);
        } catch (error) {
          console.warn(`Error fetching task ${i}:`, error);
        }
      }

      return tasks;
    } catch (error) {
      console.error('Error getting all tasks:', error);
      throw error;
    }
  }

  async getUserTasks(userAddress) {
    try {
      const allTasks = await this.getAllTasks();
      return allTasks.filter(task => 
        task.creator.toLowerCase() === userAddress.toLowerCase() ||
        task.assignee.toLowerCase() === userAddress.toLowerCase()
      );
    } catch (error) {
      console.error('Error getting user tasks:', error);
      throw error;
    }
  }

  onTaskCreated(callback) {
    if (this.contract) {
      this.contract.on('TaskCreated', callback);
    }
  }

  onTaskAccepted(callback) {
    if (this.contract) {
      this.contract.on('TaskAccepted', callback);
    }
  }

  onTaskCompleted(callback) {
    if (this.contract) {
      this.contract.on('TaskCompleted', callback);
    }
  }

  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

const taskBountyService = new TaskBountyService();
export default taskBountyService;