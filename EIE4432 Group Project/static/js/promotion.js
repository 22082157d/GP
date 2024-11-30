document.getElementById('promotionForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  const eventDate = document.getElementById('eventDate').value;
  const eventTitle = document.getElementById('eventTitle').value;
  const venue = document.getElementById('venue').value;
  const description = document.getElementById('description').value;

  const newEvent = {
    date: eventDate,
    title: eventTitle,
    venue: venue,
    description: description,
  };

  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    });

    if (response.ok) {
      alert('Event saved successfully!');
      window.location.href = 'admin.html'; // Redirect to admin page
    } else {
      alert('Failed to save event: ' + (await response.text()));
    }
  } catch (error) {
    alert('Error saving event: ' + error.message);
  }
});
