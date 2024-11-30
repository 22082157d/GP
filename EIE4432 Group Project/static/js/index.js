document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/auth/me');

    if (!response.ok) {
      throw new Error('Please login');
    }

    const userInfo = await response.json();
    const greetingElement = document.getElementById('greeting');
    greetingElement.textContent = `Welcome back! ${userInfo.user.username} (${userInfo.user.role})`;

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
  } catch (error) {
    alert(error.message);
    window.open('/login.html', '_self');
  }
});

const dateTimeElement = document.getElementById('date-time');
const now = new Date();
dateTimeElement.textContent = now.toLocaleString();

const eventsContainer = document.getElementById('eventsContainer');

async function loadEvents() {
  try {
    const response = await fetch('/api/events');
    const events = await response.json();

    if (events.length === 0) {
      eventsContainer.innerHTML += '<p>No upcoming events.</p>';
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
        eventsContainer.appendChild(eventDiv);
      });
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
}

document.getElementById('seatsPageButton').addEventListener('click', () => {
  window.location.href = 'seats.html'; // Redirect to seats.html
});

loadEvents(); // Load events on page load
