const express = require('express');
const cors = require('cors');
const { MongoClient } = require("mongodb");
const openAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();
openai_apiKey = process.env.OPENAI_KEY;

const openai = new openAI.OpenAI({
  apiKey: openai_apiKey,
});

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

// recommendations endpoint
app.get('/also-recommend', async (req, res) => {
  const vector = req.query.q;
  try {
    const queryVector = [0.2, 0.3, 0.4]; // replace with your query vector

    const pipeline = [
        {
            $search: {
                "vector": {
                    "field": "yourVectorField", // replace with your vector field
                    "query": queryVector,
                    "cosine": true
                }
            }
        },
        {
            $project: {
                "_id": 0,
                "name": 1, // replace with your fields
                "score": { "$meta": "searchScore" }
            }
        }
    ];

    const result = await collection.aggregate(pipeline).toArray();

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get('/vectorize', async (req, res) => {
  const collectionName = "catalog";
  const collection = client.db("ecommerce").collection(collectionName);

  const cursor = collection.find({});
  while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const vector = await createVector(doc.description); // replace with your field
      await collection.updateOne({ _id: doc._id }, { $set: { description_embedding: vector } });
  }

  res.send('Vectorization completed');
});

async function createVector(data) {
  console.log(data)
  const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: data,
      encoding_format: "float"
  });
  
  return response.data[0].embedding;
}


const port = process.env.PORT;
console.log(port);

app.listen(port, () => console.log('Server running on port ' + port));

