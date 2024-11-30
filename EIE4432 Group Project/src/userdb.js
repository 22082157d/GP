import fs from 'fs/promises';
import client from './dbclient.js';

// User Management Functions
async function init_users_db() {
  try {
    const users = client.db('GP').collection('users');

    const userCount = await users.countDocuments();
    if (userCount === 0) {
      const data = await fs.readFile('users.json', 'utf-8');
      const userProfiles = JSON.parse(data);
      const result = await users.insertMany(userProfiles);
      console.log(`Added ${result.insertedCount} users`);
    } else {
      console.log(`The users collection already has ${userCount} users.`);
    }
  } catch (err) {
    console.error('Unable to initialize the users database!', err);
  }
}

async function validate_user(username, password) {
  if (!username || !password) {
    return false;
  }

  try {
    const users = client.db('GP').collection('users');
    const user = await users.findOne({ username, password });
    return user || false;
  } catch (err) {
    console.error('Unable to fetch from users database!', err);
    return false;
  }
}

async function update_user(username, password, role) {
  const users = client.db('GP').collection('users');

  try {
    const result = await users.updateOne(
      { username },
      {
        $set: {
          password,
          role,
          enabled: true,
        },
      },
      { upsert: true }
    );

    console.log(result.upsertedCount > 0 ? `Added 1 user` : `No user added`);
    return true;
  } catch (err) {
    console.error('Unable to update the users database!', err);
    return false;
  }
}

async function fetch_user(username) {
  const users = client.db('GP').collection('users');

  try {
    const user = await users.findOne({ username });
    return user;
  } catch (err) {
    console.error('Unable to fetch from users database!', err);
  }
}

async function username_exist(username) {
  try {
    const user = await fetch_user(username);
    return user !== null;
  } catch (err) {
    console.error('Unable to fetch from users database!', err);
    return false;
  }
}

// Event Management Functions
async function init_events_db() {
  try {
    const events = client.db('GP').collection('event');

    const eventCount = await events.countDocuments();
    if (eventCount === 0) {
      const data = await fs.readFile('events.json', 'utf-8');
      const eventProfiles = JSON.parse(data);
      const result = await events.insertMany(eventProfiles);
      console.log(`Added ${result.insertedCount} events`);
    } else {
      console.log(`The events collection already has ${eventCount} events.`);
    }
  } catch (err) {
    console.error('Unable to initialize the events database!', err);
  }
}

async function create_event(eventData) {
  if (!eventData.title) {
    return false;
  }

  try {
    const events = client.db('GP').collection('event');
    const result = await events.insertOne(eventData);
    console.log(`Added 1 event with title: ${eventData.title}`);
    return result.insertedId;
  } catch (err) {
    console.error('Unable to create event!', err);
    return false;
  }
}

async function fetch_events() {
  const events = client.db('GP').collection('event');

  try {
    const allEvents = await events.find().toArray();
    return allEvents;
  } catch (err) {
    console.error('Unable to fetch events from database!', err);
    return [];
  }
}

async function delete_event(title) {
  const events = client.db('GP').collection('event');

  try {
    const result = await events.deleteOne({ title });
    if (result.deletedCount > 0) {
      console.log(`Deleted event with title: ${title}`);
      return true;
    } else {
      console.log(`No event found with title: ${title}`);
      return false;
    }
  } catch (err) {
    console.error('Unable to delete event!', err);
    return false;
  }
}

// Initialize both databases
async function init_db() {
  await init_users_db();
  await init_events_db();
}

init_db().catch(console.dir);

export { validate_user, update_user, fetch_user, username_exist, create_event, fetch_events, delete_event };
