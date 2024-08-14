const express = require('express');
const router = express.Router();
const { client } = require('./database.js'); // Import the MongoDB client from a database file
const openAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();
const openai_apiKey = process.env.OPENAI_KEY;

const openai = new openAI.OpenAI({
    apiKey: openai_apiKey,
});

const upload = multer({'dest':"uploads/"})


// Recommendations endpoint
router.get('/also-recommend', async (req, res) => {
    const vector = req.query.q;
    try {
        const collection = client.db("ecommerce").collection("catalog");
        const pipeline = [
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "description_embedding",
                    queryVector: vector,
                    numCandidates: 3,
                    limit: 2
                }
            },
            { '$project': { _id: 0, title: 1, description: 1, score: { $meta: "vectorSearchScore" } } }
        ];
        const result = await collection.aggregate(pipeline).toArray();
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/vectorize', async (req, res) => {
    const collection = client.db("ecommerce").collection("catalog");
    const cursor = collection.find({});
    while (await cursor.hasNext()) {
        const doc = await cursor.next();
        const vector = await createVector(doc.description); // replace with your field
        await collection.updateOne({ _id: doc._id }, { $set: { description_embedding: vector } });
    }
    res.send('Vectorization completed');
});

async function createVector(data) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: data,
        encoding_format: "float"
    });
    return response.data[0].embedding;
}

router.get('/image-search', async (req, res) => {
    const vector = req.query.q;
    try {
        const collection = client.db("ecommerce").collection("catalog");
        const pipeline = [
            {
                $vectorSearch: {
                    index: "vector_image",
                    path: "image_embedding",
                    queryVector: vector,
                    numCandidates: 3,
                    limit: 2
                }
            },
            { '$project': { _id: 0, title: 1, description: 1, score: { $meta: "vectorSearchScore" } } }
        ];
        const result = await collection.aggregate(pipeline).toArray();
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;



//TODO: semantic search
//WIP: Hybrid search
/*
app.get('/hybrid-search', async (req, res) => {
  try {
    const query = req.query.q;
    const collectionName = "catalog";
    const collection = client.db("ecommerce").collection(collectionName);
    const pipeline = [
      {
        $search: {
          index: 'default', // index name
          text: {
            query: query,
            path: ['title', 'description'], // Search in both title and description
            fuzzy: {
              maxEdits: 1
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          title: 1,
          description: 1,
          score: { $meta: "searchScore" } // Include search score in the results
        }
      },
      {
        $unionWith: {
          coll: "catalog",
          pipeline: [
            {
              $vectorSearch: {
                index: "vector_index",
                path: "description_embedding",
                queryVector: queryVector,
                numCandidates: 3,
                limit: 2
              }
            },
            {
              $project: {
                _id: 0,
                title: 1,
                description: 1,
                score: { $meta: "vectorSearchScore" }
              }
            }
          ]
        }
      },
      {
        $addFields: {
          jointScore: { $add: ["$score", "$vectorSearchScore"] } // Calculate the joint score
        }
      }
    ];
    result = await collection.aggregate(pipeline).toArray();
    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
*/