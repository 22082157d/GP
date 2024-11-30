import express from 'express';
import session from 'express-session';
import login from './login.js';
import mongostore from 'connect-mongo';
import client from './dbclient.js';

const app = express();

app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: '22082157d_eie4432_group_project',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
    store: mongostore.create({
      client,
      dbName: 'GP',
      collectionName: 'session',
    }),
  })
);

app.use('/auth', login);

// Endpoint to create a new event
app.post('/api/events', async (req, res) => {
  const newEvent = req.body;

  try {
    const eventsCollection = client.db('GP').collection('event');
    const result = await eventsCollection.insertOne(newEvent);
    res.status(201).send(`Event saved successfully with ID: ${result.insertedId}`);
  } catch (err) {
    console.error('Error saving event:', err);
    res.status(500).send('Error saving event');
  }
});

// Endpoint to get all events
app.get('/api/events', async (req, res) => {
  try {
    const eventsCollection = client.db('GP').collection('event');
    const events = await eventsCollection.find().toArray();
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).send('Error reading events from database');
  }
});

// Endpoint to delete an event by title
app.delete('/api/events', async (req, res) => {
  const { title } = req.body; // Get title from the request body

  try {
    const eventsCollection = client.db('GP').collection('event');
    const result = await eventsCollection.deleteOne({ title });

    if (result.deletedCount > 0) {
      console.log(`Deleted event with title: ${title}`);
      res.status(200).send('Event deleted successfully');
    } else {
      console.log(`No event found with title: ${title}`);
      res.status(404).send('No event found with that title');
    }
  } catch (err) {
    console.error('Unable to delete event!', err);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to get all users with role 'user'
app.get('/api/users', async (req, res) => {
  try {
    const usersCollection = client.db('GP').collection('users');
    const users = await usersCollection.find({ role: 'user' }).toArray(); // Filter by role
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Error reading users from database');
  }
});

// Endpoint to delete a user by username
app.delete('/api/users', async (req, res) => {
  const { username } = req.body; // Get username from the request body

  try {
    const usersCollection = client.db('GP').collection('users');
    const result = await usersCollection.deleteOne({ username });

    if (result.deletedCount > 0) {
      console.log(`Deleted user with username: ${username}`);
      res.status(200).send('User deleted successfully');
    } else {
      console.log(`No user found with username: ${username}`);
      res.status(404).send('No user found with that username');
    }
  } catch (err) {
    console.error('Unable to delete user!', err);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to change the user's status
app.patch('/api/users/status', async (req, res) => {
  const { username, enabled } = req.body; // Get username and new status from the request body

  try {
    const usersCollection = client.db('GP').collection('users');
    const user = await usersCollection.findOne({ username }); // Find the user

    if (!user) {
      return res.status(404).send('No user found with that username');
    }

    // Check if the status is already what is being requested
    if (user.enabled === enabled) {
      return res.status(400).send(`User is already ${enabled ? 'Enabled' : 'Disabled'}`);
    }

    // Proceed to update the status if it is different
    const result = await usersCollection.updateOne(
      { username },
      { $set: { enabled } } // Update the enabled status
    );

    if (result.modifiedCount > 0) {
      console.log(`Updated status for user: ${username}`);
      return res.status(200).send('User status updated successfully');
    } else {
      console.log(`No changes made to user: ${username}`);
      return res.status(500).send('Failed to update user status');
    }
  } catch (err) {
    console.error('Unable to update user status!', err);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to get seat statuses
app.get('/api/seats', async (req, res) => {
  try {
    const seatsCollection = client.db('GP').collection('seat1');
    const seatsData = await seatsCollection.find({}).toArray();
    const seatStatus = {};
    seatsData.forEach((seat) => {
      seatStatus[seat.seatNumber] = { status: seat.status };
    });
    res.json(seatStatus);
  } catch (err) {
    console.error('Error fetching seat statuses:', err);
    res.status(500).send('Error fetching seat statuses');
  }
});

// Endpoint to update multiple seats
// Endpoint to update multiple seats
// Endpoint to update multiple seats
// Endpoint to update multiple seats
app.post('/api/seats/update', async (req, res) => {
  const { seats, username } = req.body; // Expecting an object with seat statuses and username

  try {
    const seatsCollection = client.db('GP').collection('seat1');
    const operations = Object.entries(seats).map(([seatNumber, status]) => {
      return {
        updateOne: {
          filter: { seatNumber: seatNumber },
          update: { $set: { status: status, user: username } }, // Set username
          upsert: true, // Insert if it doesn't exist
        },
      };
    });

    await seatsCollection.bulkWrite(operations);
    res.status(200).send('Seats updated successfully');
  } catch (err) {
    console.error('Error saving seats:', err);
    res.status(500).send('Error saving seats');
  }
});

app.post('/api/seats/updateUser', async (req, res) => {
  const { seatNumber, user } = req.body; // Expecting seat number and new user

  try {
    const seatsCollection = client.db('GP').collection('seat1');
    await seatsCollection.updateOne(
      { seatNumber: seatNumber },
      { $set: { user: user } } // Update the user field to null
    );
    res.status(200).send('User updated successfully');
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).send('Error updating user');
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' });
  console.log(`Current Date and Time in HKT: ${currentDate}`);
  console.log(`Server started at http://127.0.0.1:${PORT}`);
});
