const seatsContainer = document.getElementById('seatLayout'); // Container to display seats
const selectedSeats = new Set(); // To track selected seats

// Function to load and display seats
async function loadSeats() {
  try {
    const response = await fetch('/api/seats'); // Fetch seat data from the API
    const seats = await response.json();

    seatsContainer.innerHTML = ''; // Clear existing seats

    if (Object.keys(seats).length === 0) {
      seatsContainer.innerHTML = '<p>No seats available.</p>';
    } else {
      Object.keys(seats).forEach((seatNumber) => {
        const seatStatus = seats[seatNumber].status;
        const seatDiv = document.createElement('div');
        seatDiv.className = `seat ${seatStatus}`; // Set class based on status
        seatDiv.setAttribute('data-seat', seatNumber);
        seatDiv.innerHTML = `
          <h5>${seatNumber}</h5>
        `;
        seatsContainer.appendChild(seatDiv);

        // Event listener for seat selection
        seatDiv.addEventListener('click', () => {
          handleSeatSelection(seatNumber, seatStatus);
        });
      });
    }
  } catch (error) {
    console.error('Error fetching seats:', error);
  }
}

// Function to handle seat selection
function handleSeatSelection(seatNumber, seatStatus) {
  if (seatStatus === 'available') {
    // Toggle selection
    if (selectedSeats.has(seatNumber)) {
      selectedSeats.delete(seatNumber); // Deselect
    } else {
      selectedSeats.add(seatNumber); // Select
    }
    updateSeatDisplay(); // Update display
  }
}

// Function to update the seat display based on current selections
function updateSeatDisplay() {
  const seats = document.querySelectorAll('.seat');
  seats.forEach((seat) => {
    const seatNumber = seat.getAttribute('data-seat');
    if (selectedSeats.has(seatNumber)) {
      seat.classList.add('selected'); // Highlight selected seats
    } else {
      seat.classList.remove('selected'); // Remove highlight if not selected
    }
  });
  updateSelectedSeatsDisplay(); // Update the selected seats display
}

// Function to update the selected seats display
function updateSelectedSeatsDisplay() {
  const selectedArray = Array.from(selectedSeats);
  document.getElementById('selectedSeatsList').textContent = selectedArray.join(', ') || 'None';
  document.getElementById('confirmButton').disabled = selectedArray.length === 0; // Enable/disable confirm button
}

// Function to confirm seat selections
async function confirmSelection() {
  const seatUpdates = {};
  const username = localStorage.getItem('username'); // Retrieve the username from local storage
  selectedSeats.forEach((seatNumber) => {
    seatUpdates[seatNumber] = 'confirmed'; // Set confirmed status for selected seats
  });

  try {
    const response = await fetch('/api/seats/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seats: seatUpdates, username: username }), // Send selected seats and username to update
    });

    if (response.ok) {
      alert('Seats confirmed and saved successfully!');
      loadSeats(); // Reload seats after confirmation
    } else {
      const errorText = await response.text();
      alert('Failed to save seats: ' + errorText);
    }
  } catch (error) {
    console.error('Error confirming seats:', error);
    alert('An error occurred while confirming seats.');
  }
}

// Call loadSeats when the page loads
loadSeats();

// Call confirmSelection when the confirm button is clicked
document.getElementById('confirmButton').addEventListener('click', confirmSelection);
