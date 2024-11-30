const dateTimeElement = document.getElementById('date-time');
const now = new Date();
dateTimeElement.textContent = now.toLocaleString();

// Function to load and display users with role 'user'
async function loadUsers() {
  try {
    const response = await fetch('/api/users'); // Fetch user data from the API
    const users = await response.json();

    const usersContainer = document.getElementById('usersContainer');
    usersContainer.innerHTML = ''; // Clear existing users

    if (users.length === 0) {
      usersContainer.innerHTML = '<p>No users found.</p>';
    } else {
      users.forEach((user) => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user';
        userDiv.innerHTML = `
          <h5>${user.username}</h5>
          <p><strong>Role:</strong> ${user.role}</p>
          <p><strong>Status:</strong> ${user.enabled ? 'Enabled' : 'Disabled'}</p>
          <button class="btn btn-danger" data-title="${user.username}" onclick="deleteUser(this)">Delete User</button>
          <button class="btn btn-success" data-username="${user.username}" data-status="true" onclick="changeStatus(this)">Enabled</button>
          <button class="btn btn-warning" data-username="${user.username}" data-status="false" onclick="changeStatus(this)">Disabled</button>
        `;
        usersContainer.appendChild(userDiv);
      });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

// Call loadUsers when the page loads
loadUsers();

// Function to delete a user
async function deleteUser(button) {
  const username = button.getAttribute('data-title'); // Get the username from the button
  const confirmDeletion = confirm(`Are you sure you want to delete the user "${username}"?`);

  if (!confirmDeletion) {
    return; // Exit if the user cancels the deletion
  }

  try {
    const response = await fetch('/api/users', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }), // Send username to delete
    });

    if (response.ok) {
      alert('User deleted successfully');
      loadUsers(); // Reload users after deletion
    } else {
      const errorText = await response.text();
      alert('Failed to delete user: ' + errorText);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('An error occurred while deleting the user.');
  }
}

// Function to change the user's status
async function changeStatus(button) {
  const username = button.getAttribute('data-username');
  const newStatus = button.getAttribute('data-status') === 'true'; // Convert to boolean

  const confirmChange = confirm(
    `Are you sure you want to change the status of "${username}" to ${newStatus ? 'Enabled' : 'Disabled'}?`
  );

  if (!confirmChange) {
    return; // Exit if the user cancels the status change
  }

  try {
    const response = await fetch('/api/users/status', {
      method: 'PATCH', // Use PATCH to update the user
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, enabled: newStatus }), // Send username and new status
    });

    if (response.ok) {
      alert(`User status changed to ${newStatus ? 'Enabled' : 'Disabled'} successfully`);
      loadUsers(); // Reload users after status change
    } else {
      const errorText = await response.text();
      alert('Failed to change user status: ' + errorText); // Display the specific error message
    }
  } catch (error) {
    console.error('Error changing user status:', error);
    alert('An error occurred while changing user status.');
  }
}
