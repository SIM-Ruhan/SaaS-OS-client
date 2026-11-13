import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('Missing MONGODB_URI in .env.local');
// MongoClient connects lazily when a request uses the database.
if (!globalThis._shoposMongoClient) globalThis._shoposMongoClient = new MongoClient(uri);
const clientPromise = Promise.resolve(globalThis._shoposMongoClient);
export default clientPromise;
