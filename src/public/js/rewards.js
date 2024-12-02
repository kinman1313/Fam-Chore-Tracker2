// Modal handling
const modal = document.getElementById('rewardModal');
const addRewardBtn = document.getElementById('addRewardBtn');
const closeButtons = document.querySelectorAll('.close-modal');

if (addRewardBtn) {
    addRewardBtn.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Add New Reward';
        document.getElementById('rewardForm').reset();
        document.getElementById('rewardId').value = '';
        modal.classList.add('active');
    });
}

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        modal.classList.remove('active');
    });
});

// Form submission
document.getElementById('rewardForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const rewardId = document.getElementById('rewardId').value;
    const formData = {
        name: document.getElementById('rewardName').value,
        description: document.getElementById('rewardDescription').value,
        pointsRequired: parseInt(document.getElementById('pointsRequired').value)
    };

    try {
        const url = rewardId ? 
            `/api/rewards/${rewardId}` : 
            '/api/rewards';
            
        const response = await fetch(url, {
            method: rewardId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Success!', 'Reward saved successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showToast('Error', data.error || 'Failed to save reward', 'error');
        }
    } catch (error) {
        showToast('Error', 'Something went wrong', 'error');
    }
});

// Redeem reward
document.querySelectorAll('.redeem-reward').forEach(button => {
    button.addEventListener('click', async (e) => {
        const rewardId = e.target.dataset.rewardId;
        
        if (confirm('Are you sure you want to redeem this reward?')) {
            try {
                const response = await fetch(`/api/rewards/${rewardId}/redeem`, {
                    method: 'POST'
                });
                const data = await response.json();
                
                if (data.success) {
                    showToast('Success!', 'Reward redeemed successfully!', 'success');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showToast('Error', data.error || 'Failed to redeem reward', 'error');
                }
            } catch (error) {
                showToast('Error', 'Something went wrong', 'error');
            }
        }
    });
});

// Edit reward
document.querySelectorAll('.edit-reward').forEach(button => {
    button.addEventListener('click', async (e) => {
        const rewardId = e.target.closest('.edit-reward').dataset.rewardId;
        try {
            const response = await fetch(`/api/rewards/${rewardId}`);
            const reward = await response.json();
            
            document.getElementById('modalTitle').textContent = 'Edit Reward';
            document.getElementById('rewardId').value = reward.id;
            document.getElementById('rewardName').value = reward.name;
            document.getElementById('rewardDescription').value = reward.description;
            document.getElementById('pointsRequired').value = reward.points_required;
            
            modal.classList.add('active');
        } catch (error) {
            showToast('Error', 'Failed to load reward details', 'error');
        }
    });
});

// Delete reward
document.querySelectorAll('.delete-reward').forEach(button => {
    button.addEventListener('click', async (e) => {
        const rewardId = e.target.closest('.delete-reward').dataset.rewardId;
        
        if (confirm('Are you sure you want to delete this reward?')) {
            try {
                const response = await fetch(`/api/rewards/${rewardId}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                
                if (data.success) {
                    showToast('Success!', 'Reward deleted!', 'success');
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (error) {
                showToast('Error', 'Failed to delete reward', 'error');
            }
        }
    });
});

// Handle redemption approval/denial
document.querySelectorAll('.approve-redemption, .deny-redemption').forEach(button => {
    button.addEventListener('click', async (e) => {
        const redemptionId = e.target.dataset.redemptionId;
        const action = e.target.classList.contains('approve-redemption') ? 'approve' : 'deny';
        
        try {
            const response = await fetch(`/api/rewards/redemptions/${redemptionId}/${action}`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                showToast('Success!', `Redemption ${action}ed!`, 'success');
                setTimeout(() => location.reload(), 1500);
            }
        } catch (error) {
            showToast('Error', `Failed to ${action} redemption`, 'error');
        }
    });
});
