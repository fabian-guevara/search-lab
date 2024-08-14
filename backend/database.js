const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

// Replace with your MongoDB connection string
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);


client.connect().then(() => {
   console.log("Connected to MongoDB");
}).catch((e) => {
    console.error("There was an error connecting to MongoDB. Error Message:", e.message)
});

module.exports = client;
