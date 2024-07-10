const express = require('express');
const cors = require('cors');
const { MongoClient } = require("mongodb");
const openai = require('openai');
const dotenv = require('dotenv');

dotenv.config();
openai.apiKey = process.env.OPENAI_KEY;

const app = express();
app.use(express.json());
app.use(cors());

// Replace with your MongoDB connection string
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

const defaultIndex = {
    $search: {
      index: 'default', // Use the name of your search index if different
      text: {
        query: "",
        path: ['name', 'description'], // Search in both name and description
        fuzzy: {
            maxEdits: 2
        }
      }
    }
  }


 const project =   {
    $project: {
      _id: 0,
      name: 1,
      description: 1,
      score: { $meta: "searchScore" } // Include search score in the results
    }
  }



// Search endpoint
app.get('/search', async (req, res) => {
  const query = req.query.q;
  try {

    // connection to DB
    await client.connect();

    //get collection instance
    const productColl = client.db("test").collection("products");
    
    //look for results without Atlas Search
    const findResults = await productColl.find({ name: new RegExp(query) }).toArray();


    // look for results with Atlas Search
    defaultIndex.$search.text.query = query;
    const searchResults = await productColl.aggregate([ defaultIndex, project ]).toArray();

    res.json({ findResults, searchResults });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));

