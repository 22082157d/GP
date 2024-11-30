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
  if (seatStatus === 'confirmed') {
    // Change confirmed to available
    selectedSeats.add(seatNumber); // Add to selected
    updateSeatDisplay(seatNumber, 'available'); // Update display to available
  }
}

// Function to update the seat display based on current selections
function updateSeatDisplay(seatNumber, newStatus) {
  const seat = document.querySelector(`.seat[data-seat="${seatNumber}"]`);
  if (seat) {
    seat.classList.remove('confirmed'); // Remove confirmed class
    seat.classList.add(newStatus); // Add new status class
  }
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
  const userUpdates = {};

  selectedSeats.forEach((seatNumber) => {
    seatUpdates[seatNumber] = 'available'; // Set available status for selected seats
    userUpdates[seatNumber] = null; // Set user to null for selected seats
  });

  try {
    // First, update the seat status
    const response = await fetch('/api/seats/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seats: seatUpdates }), // Send selected seats to update
    });

    if (response.ok) {
      // Then update the user to null
      await Promise.all(
        Array.from(selectedSeats).map((seatNumber) =>
          fetch('/api/seats/updateUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ seatNumber: seatNumber, user: null }), // Update user to null
          })
        )
      );

      alert('Seats updated to available successfully!');
      loadSeats(); // Reload seats after confirmation
      selectedSeats.clear(); // Clear selected seats after saving
      updateSelectedSeatsDisplay(); // Update display
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
