document.addEventListener('DOMContentLoaded', () => {
    // Auto-expand post input on focus
    const postInput = document.querySelector('.post-input');
    postInput.addEventListener('focus', () => {
        postInput.style.minHeight = '120px';
    });

    // ... rest of the JavaScript ... 
});
