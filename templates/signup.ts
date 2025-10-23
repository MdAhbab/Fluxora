document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form') as HTMLFormElement;
    const passwordInput = document.getElementById('signup-password') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('signup-confirm-password') as HTMLInputElement;

    signupForm?.addEventListener('submit', (e: Event) => {
        e.preventDefault();

        // Reset previous validation states
        confirmPasswordInput.style.borderColor = '';

        if (passwordInput.value !== confirmPasswordInput.value) {
            alert('Passwords do not match.');
            confirmPasswordInput.style.borderColor = 'red';
            confirmPasswordInput.focus();
            return;
        }

        // In a real app, you would handle signup logic here
        alert('Signup functionality is for demonstration purposes.');
        // e.g. window.location.href = 'login.html';
    });
});
