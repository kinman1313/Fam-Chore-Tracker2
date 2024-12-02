document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm(e.target)) return;
    
    showLoading();

    try {
        const response = await fetch('/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('email').value
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Success!', 'Check your email for reset instructions', 'success');
            setTimeout(() => window.location.href = '/auth/login', 3000);
        } else {
            showToast('Error', data.error || 'Password reset failed', 'error');
        }
    } catch (error) {
        showToast('Error', 'Something went wrong', 'error');
    } finally {
        hideLoading();
    }
});
