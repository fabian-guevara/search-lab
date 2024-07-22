const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

// Replace with your MongoDB connection string
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);
let productColl;

client.connect().then(() => {
    // Get collection instance
    productColl = client.db("products").collection("products");
});

module.exports = { client, productColl };
