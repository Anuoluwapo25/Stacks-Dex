extern crate alloc;

use stylus_sdk::{
    alloy_primitives::{U256, Address, FixedBytes, Uint},
    prelude::*,
};

type U8 = Uint<8, 1>; 

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum TaskStatus {
    Open = 0,
    InProgress = 1,
    Completed = 2,
    Disputed = 3,
}

sol_storage! {
    #[entrypoint]
    pub struct TaskBounty {
        uint256 task_counter;
        
        mapping(uint256 => address) task_creators;
        mapping(uint256 => uint256) task_bounties;
        mapping(uint256 => address) task_assignees;
        mapping(uint256 => uint8) task_status;
        mapping(uint256 => bytes32) task_titles;
        mapping(uint256 => bytes32) task_descriptions;
        mapping(uint256 => uint256) task_deadlines;
        
        mapping(address => uint256) user_completed_tasks;
        mapping(address => uint256) user_created_tasks;
        
        uint256 platform_fee;
        address platform_owner;
        uint256 platform_balance;
        
       
        mapping(uint256 => bool) task_disputes;
        mapping(uint256 => uint256) dispute_deadlines;
    }
}


#[public]
impl TaskBounty {
    pub fn initialize(&mut self) {
        if self.platform_owner.get() == Address::ZERO {
            self.platform_owner.set(self.vm().msg_sender());
            self.platform_fee.set(U256::from(250)); // 2.5% default fee
        }
    }

    #[payable]
    pub fn create_task(
        &mut self,
        title_hash: FixedBytes<32>,
        description_hash: FixedBytes<32>,
        deadline_hours: U256,
    ) -> U256 {
        let bounty = self.vm().msg_value();
        if bounty == U256::ZERO {
            return U256::ZERO;
        }

        let task_id = self.task_counter.get() + U256::from(1);
        self.task_counter.set(task_id);

        let sender = self.vm().msg_sender();

        self.task_creators.setter(task_id).set(sender);
        self.task_bounties.setter(task_id).set(bounty);
        self.task_assignees.setter(task_id).set(Address::ZERO);
        self.task_status.setter(task_id).set(U8::from(TaskStatus::Open as u8));
        self.task_titles.setter(task_id).set(title_hash.into());
        self.task_descriptions.setter(task_id).set(description_hash.into());
        
        let deadline = U256::from(block_timestamp()) + (deadline_hours * U256::from(3600));
        self.task_deadlines.setter(task_id).set(deadline);

        let created_count = self.user_created_tasks.get(self.vm().msg_sender());
        self.user_created_tasks.setter(self.vm().msg_sender()).set(created_count + U256::from(1));

        task_id
    }

    pub fn accept_task(&mut self, task_id: U256) -> bool {
        let status = self.task_status.get(task_id);
        
        if status != U8::from(TaskStatus::Open as u8) {
            return false;
        }

        if U256::from(block_timestamp()) > self.task_deadlines.get(task_id) {
            return false;
        }
        let sender = self.vm().msg_sender();

        self.task_assignees.setter(task_id).set(sender);
        self.task_status.setter(task_id).set(U8::from(TaskStatus::InProgress as u8));
        true
    }

    /// Submit completed task (only assignee can do this)
    pub fn submit_task(&mut self, task_id: U256) -> bool {
        let assignee = self.task_assignees.get(task_id);
        if assignee != self.vm().msg_sender() {
            return false;
        }

        let status = self.task_status.get(task_id);
        if status != (U8::from(TaskStatus::InProgress as u8)) {
            return false;
        }

        self.task_status.setter(task_id).set(U8::from(TaskStatus::Completed as u8));
        
        let dispute_deadline = U256::from(block_timestamp()) + U256::from(86400);
        self.dispute_deadlines.setter(task_id).set(dispute_deadline);
        
        true
    }

    pub fn approve_and_pay(&mut self, task_id: U256) -> bool {
        let creator = self.task_creators.get(task_id);
        if creator != self.vm().msg_sender() {
            return false;
        }

        let status = self.task_status.get(task_id);
        if status != (U8::from(TaskStatus::Completed as u8)) {
            return false;
        }

        if self.task_disputes.get(task_id) {
            return false;
        }

        self._pay_bounty(task_id);
        true
    }

    pub fn release_payment(&mut self, task_id: U256) -> bool {
        let status = self.task_status.get(task_id);
        if status != (U8::from(TaskStatus::Completed as u8)) {
            return false;
        }

        let dispute_deadline = self.dispute_deadlines.get(task_id);
        if U256::from(block_timestamp()) <= dispute_deadline {
            return false;
        }

        if self.task_disputes.get(task_id) {
            return false;
        }

        self._pay_bounty(task_id);
        true
    }

    fn _pay_bounty(&mut self, task_id: U256) {
        let bounty = self.task_bounties.get(task_id);
        let assignee = self.task_assignees.get(task_id);
        
        let fee = (bounty * self.platform_fee.get()) / U256::from(10000);
        let payment = bounty - fee;
        
        let platform_bal = self.platform_balance.get();
        self.platform_balance.set(platform_bal + fee);
        
        let completed_count = self.user_completed_tasks.get(assignee);
        self.user_completed_tasks.setter(assignee).set(completed_count + U256::from(1));
        
        let _ = self.vm().transfer_eth(assignee, payment);
        
        self.task_bounties.setter(task_id).set(U256::ZERO);
    }

    pub fn raise_dispute(&mut self, task_id: U256) -> bool {
        let creator = self.task_creators.get(task_id);
        if creator != self.vm().msg_sender() {
            return false;
        }

        let status = self.task_status.get(task_id);
        if status != (U8::from(TaskStatus::Completed as u8)) {
            return false;
        }

        let dispute_deadline = self.dispute_deadlines.get(task_id);
        if U256::from(block_timestamp()) > dispute_deadline {
            return false;
        }

        self.task_disputes.setter(task_id).set(true);
        self.task_status.setter(task_id).set(U8::from(TaskStatus::Disputed as u8));
        true
    }

    /// Get task details
    pub fn get_task(&self, task_id: U256) -> (Address, U256, Address, u8, FixedBytes<32>, FixedBytes<32>, U256) {
        (
            self.task_creators.get(task_id),
            self.task_bounties.get(task_id),
            self.task_assignees.get(task_id),
            self.task_status.get(task_id).as_limbs()[0] as u8,
            self.task_titles.get(task_id).into(),
            self.task_descriptions.get(task_id).into(),
            self.task_deadlines.get(task_id)
        )
    }

    pub fn get_user_stats(&self, user: Address) -> (U256, U256) {
        (
            self.user_completed_tasks.get(user),
            self.user_created_tasks.get(user)
        )
    }

    /// Get total number of tasks
    pub fn get_task_count(&self) -> U256 {
        self.task_counter.get()
    }

    pub fn get_platform_stats(&self) -> (U256, Address, U256) {
        (
            self.platform_fee.get(),
            self.platform_owner.get(),
            self.platform_balance.get()
        )
    }

    pub fn cancel_task(&mut self, task_id: U256) -> bool {
        let creator = self.task_creators.get(task_id);
        if creator != self.vm().msg_sender() {
            return false;
        }

        let status = self.task_status.get(task_id);
        if status != (U8::from(TaskStatus::Open as u8)) {
            return false;
        }

        // Refund the bounty using the modern vm() method
        let bounty = self.task_bounties.get(task_id);
        self.task_bounties.setter(task_id).set(U256::ZERO);
        
        let _ = self.vm().transfer_eth(creator, bounty);
        true
    }
}

fn block_timestamp() -> u64 {
    // In real Stylus, this would be: stylus_sdk::block::timestamp()
    1697000000 
}
