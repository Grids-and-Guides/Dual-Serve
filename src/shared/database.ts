import { Db, MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI;
// Once we connect to the database once, we'll store that connection and reuse it so that we don't have to connect to the database on every request.
export let cachedDb:Db|null = null;

export function connectToDatabase(): Promise<Db> {
    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI is required");
    }
    
    return new Promise(async (resolve, reject)=> {
        if (cachedDb) {
            resolve(cachedDb);
          }
          try {
              // Connect to our MongoDB database hosted on MongoDB Atlas
              const client = await MongoClient.connect(MONGODB_URI);
              // Specify which database we want to use
              const db = await client.db("dual-serve");
              cachedDb = db;
              resolve(db);
          } catch (error) {
              console.log("DB connection Failed", error);
              reject(error);
          }
    })
    
}