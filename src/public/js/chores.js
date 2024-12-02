// Filter buttons
document.querySelectorAll('.filter-buttons .btn').forEach(button => {
    button.addEventListener('click', () => {
        // Update active state
        document.querySelector('.filter-buttons .active').classList.remove('active');
        button.classList.add('active');

        // Filter chores
        const filter = button.dataset.filter;
        document.querySelectorAll('.chore-card').forEach(card => {
            if (filter === 'all' || card.dataset.status === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Modal handling
const modal = document.getElementById('choreModal');
const addChoreBtn = document.getElementById('addChoreBtn');
const closeButtons = document.querySelectorAll('.close-modal');

if (addChoreBtn) {
    addChoreBtn.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Add New Chore';
        document.getElementById('choreForm').reset();
        document.getElementById('choreId').value = '';
        modal.classList.add('active');
    });
}

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        modal.classList.remove('active');
    });
});

// Form submission
document.getElementById('choreForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const choreId = document.getElementById('choreId').value;
    const formData = {
        name: document.getElementById('choreName').value,
        description: document.getElementById('choreDescription').value,
        points: parseInt(document.getElementById('chorePoints').value),
        frequency: document.getElementById('choreFrequency').value,
        assignedTo: document.getElementById('choreAssignee').value
    };

    try {
        const url = choreId ? 
            `/api/chores/${choreId}` : 
            '/api/chores';
            
        const response = await fetch(url, {
            method: choreId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Success!', 'Chore saved successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showToast('Error', data.error || 'Failed to save chore', 'error');
        }
    } catch (error) {
        showToast('Error', 'Something went wrong', 'error');
    }
});

// Complete chore
document.querySelectorAll('.complete-chore').forEach(button => {
    button.addEventListener('click', async (e) => {
        const choreId = e.target.dataset.choreId;
        try {
            const response = await fetch(`/api/chores/${choreId}/complete`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                showToast('Success!', 'Chore completed!', 'success');
                setTimeout(() => location.reload(), 1500);
            }
        } catch (error) {
            showToast('Error', 'Failed to complete chore', 'error');
        }
    });
});

// Verify chore
document.querySelectorAll('.verify-chore').forEach(button => {
    button.addEventListener('click', async (e) => {
        const choreId = e.target.dataset.choreId;
        try {
            const response = await fetch(`/api/chores/${choreId}/verify`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                showToast('Success!', 'Chore verified!', 'success');
                setTimeout(() => location.reload(), 1500);
            }
        } catch (error) {
            showToast('Error', 'Failed to verify chore', 'error');
        }
    });
});

// Edit chore
document.querySelectorAll('.edit-chore').forEach(button => {
    button.addEventListener('click', async (e) => {
        const choreId = e.target.closest('.edit-chore').dataset.choreId;
        try {
            const response = await fetch(`/api/chores/${choreId}`);
            const chore = await response.json();
            
            document.getElementById('modalTitle').textContent = 'Edit Chore';
            document.getElementById('choreId').value = chore.id;
            document.getElementById('choreName').value = chore.name;
            document.getElementById('choreDescription').value = chore.description;
            document.getElementById('chorePoints').value = chore.points;
            document.getElementById('choreFrequency').value = chore.frequency;
            document.getElementById('choreAssignee').value = chore.assigned_to;
            
            modal.classList.add('active');
        } catch (error) {
            showToast('Error', 'Failed to load chore details', 'error');
        }
    });
});

// Delete chore
document.querySelectorAll('.delete-chore').forEach(button => {
    button.addEventListener('click', async (e) => {
        const choreId = e.target.closest('.delete-chore').dataset.choreId;
        
        if (confirm('Are you sure you want to delete this chore?')) {
            try {
                const response = await fetch(`/api/chores/${choreId}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                
                if (data.success) {
                    showToast('Success!', 'Chore deleted!', 'success');
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (error) {
                showToast('Error', 'Failed to delete chore', 'error');
            }
        }
    });
});
