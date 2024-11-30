document.addEventListener('DOMContentLoaded', () => {
  // Display current date and time
  const dateTimeElement = document.getElementById('date-time');
  const now = new Date();
  dateTimeElement.textContent = now.toLocaleString();

  // Add event listener for the Event button
  const eventButton = document.getElementById('eventButton');
  eventButton.addEventListener('click', () => {
    window.location.href = 'promotion.html'; // Redirect to promotion.html
  });

  // Add event listener for the Manage Events button
  document.getElementById('eventsPageButton').addEventListener('click', () => {
    window.location.href = 'events.html'; // Redirect to events.html
  });

  document.getElementById('usersButton').addEventListener('click', () => {
    window.location.href = 'users.html'; // Redirect to users.html
  });

  document.getElementById('accessSeatsButton').addEventListener('click', () => {
    window.location.href = 'admin_seat.html'; // Redirect to admin_seat.html
  });

  // Add event listener for the Logout button
  const logoutButton = document.getElementById('logoutButton');
  logoutButton.addEventListener('click', async () => {
    if (confirm('Confirm to logout?')) {
      try {
        const logoutResponse = await fetch('/auth/logout', {
          method: 'POST',
        });

        if (logoutResponse.ok) {
          window.open('/login.html', '_self');
        }
      } catch (error) {
        alert('An error occurred during logout.');
      }
    }
  });

  // Function to load and display events
  const eventsContainer = document.getElementById('eventsContainer');
  async function loadEvents() {
    try {
      const response = await fetch('/api/events'); // Fetch events from the API
      const events = await response.json();

      eventsContainer.innerHTML = ''; // Clear previous events
      if (events.length === 0) {
        eventsContainer.innerHTML = '<p>No upcoming events.</p>'; // Display if no events found
      } else {
        events.forEach((event) => {
          const eventDiv = document.createElement('div');
          eventDiv.className = 'event';
          eventDiv.innerHTML = `
            <h5>${event.title}</h5>
            <p><strong>Date/Time:</strong> ${new Date(event.date).toLocaleString()}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p><strong>Description:</strong> ${event.description}</p>
          `;
          eventsContainer.appendChild(eventDiv); // Append each event to the container
        });
      }
    } catch (error) {
      console.error('Error fetching events:', error); // Handle errors
    }
  }

  loadEvents(); // Load events when the admin page is loaded
});
