document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('loginButton');

  loginButton.addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
      alert('Username and password cannot be empty');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Logged in as \`${result.user.username}\` (${result.user.role})`);

        // Store the username in local storage
        localStorage.setItem('username', result.user.username);

        // Check if the user is admin
        if (username === 'admin' && password === 'adminpass') {
          window.location.href = '/admin.html'; // Redirect to admin.html
        } else {
          window.location.href = '/index.html'; // Redirect to index.html for other users
        }
      } else {
        alert(result.message || 'Unknown error');
      }
    } catch (error) {
      alert('Unknown error');
    }
  });
});
