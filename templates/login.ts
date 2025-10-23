document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        // In a real app, you would handle login logic here
        alert('Login functionality is for demonstration purposes.');
    });
});
