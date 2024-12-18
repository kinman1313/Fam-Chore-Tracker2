document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm(e.target)) return;
    
    showLoading();

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                role: document.getElementById('role').value
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Success!', 'Account created successfully!', 'success');
            setTimeout(() => window.location.href = '/auth/login', 1500);
        } else {
            showToast('Error', data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showToast('Error', 'Something went wrong', 'error');
    } finally {
        hideLoading();
    }
});
