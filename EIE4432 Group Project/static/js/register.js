document.addEventListener('DOMContentLoaded', () => {
  const registerButton = document.getElementById('registerButton');
  const form = document.querySelector('form');

  registerButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const repeatPassword = document.getElementById('repeat-password').value;
    const role = document.getElementById('role').value;

    if (!username || !password) {
      return alert('Username and password cannot be empty');
    }
    if (password !== repeatPassword) {
      return alert('Password mismatch!');
    }
    if (!role) {
      return alert('Please select your role');
    }

    const formData = new FormData(form);

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Welcome, ${result.user.username}!\nYou can login with your account now!`);
        window.location.href = '/login.html';
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('An error occurred while processing your request. Please try again.');
    }
  });
});
