import { MongoClient, ServerApiVersion } from 'mongodb';
import config from './config.js';

const connect_uri = config.CONNECTION_STR;

const client = new MongoClient(connect_uri, {
  connectTimeoutMS: 2000,
  serverSelectionTimeoutMS: 2000,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connect() {
  try {
    // Establish the connection to the database
    await client.connect();

    // Test the connection by pinging the database
    await client.db('GP').command({ ping: 1 });

    console.log('Successfully connected to the database!');
  } catch (err) {
    console.error('Unable to establish connection to the database!', err);
    process.exit(1); // Abort the process with exit status 1
  }
}

// Call connect() asynchronously when this module is loaded
connect().catch(console.dir);

// Export the client for later use in other modules
export default client;
