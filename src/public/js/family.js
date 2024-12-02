// Modal handling
const inviteModal = document.getElementById('inviteModal');
const editFamilyModal = document.getElementById('editFamilyModal');
const inviteMemberBtn = document.getElementById('inviteMemberBtn');
const editFamilyNameBtn = document.getElementById('editFamilyNameBtn');
const closeButtons = document.querySelectorAll('.close-modal');

// Open modals
inviteMemberBtn.addEventListener('click', () => {
    document.getElementById('inviteForm').reset();
    inviteModal.classList.add('active');
});

editFamilyNameBtn.addEventListener('click', () => {
    editFamilyModal.classList.add('active');
});

// Close modals
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        inviteModal.classList.remove('active');
        editFamilyModal.classList.remove('active');
    });
});

// Invite member form
document.getElementById('inviteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('inviteEmail').value,
        role: document.getElementById('inviteRole').value
    };

    try {
        const response = await fetch('/api/family/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Success!', 'Invitation sent successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showToast('Error', data.error || 'Failed to send invitation', 'error');
        }
    } catch (error) {
        showToast('Error', 'Something went wrong', 'error');
    }
});

// Edit family name form
document.getElementById('editFamilyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('familyName').value
    };

    try {
        const response = await fetch('/api/family', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Success!', 'Family name updated!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showToast('Error', data.error || 'Failed to update family name', 'error');
        }
    } catch (error) {
        showToast('Error', 'Something went wrong', 'error');
    }
});

// Change member role
document.querySelectorAll('.change-role').forEach(button => {
    button.addEventListener('click', async (e) => {
        const memberId = e.target.closest('.change-role').dataset.memberId;
        const currentRole = e.target.closest('.change-role').dataset.currentRole;
        const newRole = currentRole === 'parent' ? 'child' : 'parent';
        
        if (confirm(`Are you sure you want to change this member's role to ${newRole}?`)) {
            try {
                const response = await fetch(`/api/family/members/${memberId}/role`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role: newRole })
                });

                const data = await response.json();

                if (data.success) {
                    showToast('Success!', 'Member role updated!', 'success');
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (error) {
                showToast('Error', 'Failed to update member role', 'error');
            }
        }
    });
});

// Remove member
document.querySelectorAll('.remove-member').forEach(button => {
    button.addEventListener('click', async (e) => {
        const memberId = e.target.closest('.remove-member').dataset.memberId;
        
        if (confirm('Are you sure you want to remove this member from the family?')) {
            try {
                const response = await fetch(`/api/family/members/${memberId}`, {
                    method: 'DELETE'
                });

                const data = await response.json();

                if (data.success) {
                    showToast('Success!', 'Member removed!', 'success');
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (error) {
                showToast('Error', 'Failed to remove member', 'error');
            }
        }
    });
});

// Handle invite actions
document.querySelectorAll('.resend-invite').forEach(button => {
    button.addEventListener('click', async (e) => {
        const inviteId = e.target.dataset.inviteId;
        
        try {
            const response = await fetch(`/api/family/invites/${inviteId}/resend`, {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                showToast('Success!', 'Invitation resent!', 'success');
            }
        } catch (error) {
            showToast('Error', 'Failed to resend invitation', 'error');
        }
    });
});

document.querySelectorAll('.cancel-invite').forEach(button => {
    button.addEventListener('click', async (e) => {
        const inviteId = e.target.dataset.inviteId;
        
        if (confirm('Are you sure you want to cancel this invitation?')) {
            try {
                const response = await fetch(`/api/family/invites/${inviteId}`, {
                    method: 'DELETE'
                });

                const data = await response.json();

                if (data.success) {
                    showToast('Success!', 'Invitation cancelled!', 'success');
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (error) {
                showToast('Error', 'Failed to cancel invitation', 'error');
            }
        }
    });
});
