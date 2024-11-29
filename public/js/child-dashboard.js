// Add the functions referenced in the template
function toggleChore(choreId) {
    fetch(`/chores/${choreId}/toggle`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload(); // Or update UI dynamically
        } else {
            alert(data.error || 'Error updating chore');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating chore');
    });
}

function redeemReward(rewardId) {
    if (!confirm('Are you sure you want to redeem this reward?')) return;

    fetch(`/rewards/${rewardId}/redeem`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload(); // Or update UI dynamically
        } else {
            alert(data.error || 'Error redeeming reward');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error redeeming reward');
    });
}

// Add filter functionality
document.getElementById('filterStatus').addEventListener('change', function() {
    const status = this.value;
    const chores = document.querySelectorAll('.chore-item');
    
    chores.forEach(chore => {
        if (status === 'all') {
            chore.style.display = 'flex';
        } else if (status === 'completed') {
            chore.style.display = chore.classList.contains('completed') ? 'flex' : 'none';
        } else if (status === 'pending') {
            chore.style.display = !chore.classList.contains('completed') ? 'flex' : 'none';
        }
    });
});
