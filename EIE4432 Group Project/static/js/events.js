const dateTimeElement = document.getElementById('date-time');
const now = new Date();
dateTimeElement.textContent = now.toLocaleString();

async function loadEvents() {
  try {
    const response = await fetch('/api/events');
    const events = await response.json();

    const eventsContainer = document.getElementById('eventsContainer');
    eventsContainer.innerHTML = ''; // Clear existing events

    if (events.length === 0) {
      eventsContainer.innerHTML = '<p>No upcoming events.</p>';
    } else {
      events.forEach((event) => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event';
        eventDiv.innerHTML = `
          <h5>${event.title}</h5>
          <p><strong>Date/Time:</strong> ${new Date(event.date).toLocaleString()}</p>
          <p><strong>Venue:</strong> ${event.venue}</p>
          <p><strong>Description:</strong> ${event.description}</p>
          <button class="btn btn-danger" data-title="${event.title}" onclick="deleteEvent(this)">Delete Event</button>
        `;
        eventsContainer.appendChild(eventDiv);
      });
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
}

async function deleteEvent(button) {
  const eventTitle = button.getAttribute('data-title');
  const confirmDeletion = confirm(`Are you sure you want to delete the event titled "${eventTitle}"?`);

  if (!confirmDeletion) {
    return; // Exit if the user cancels the deletion
  }

  console.log('Attempting to delete event with title:', eventTitle);

  try {
    const response = await fetch('/api/events', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: eventTitle }),
    });

    if (response.ok) {
      alert('Event deleted successfully');
      loadEvents(); // Reload events after deletion
    } else {
      const errorText = await response.text();
      alert('Failed to delete event: ' + errorText);
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    alert('An error occurred while deleting the event.');
  }
}

loadEvents(); // Load events on page load
