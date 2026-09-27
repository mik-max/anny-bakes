import "server-only";
import { MongoClient, type Db } from "mongodb";

// Reuse one client per process — avoids opening a new connection on every
// request and on every hot reload in dev.
const globalForMongo = globalThis as unknown as {
  mongoClient?: Promise<MongoClient>;
};

function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local.");
  }

  globalForMongo.mongoClient ??= new MongoClient(uri)
    .connect()
    .catch((err) => {
      // Don't cache a failed connection — let the next request retry.
      globalForMongo.mongoClient = undefined;
      throw err;
    });

  return globalForMongo.mongoClient;
}

/** Database named by MONGODB_DB, or the one in the connection string. */
export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(process.env.MONGODB_DB);
}
