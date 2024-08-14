const express = require('express');
const router = express.Router();
const client = require('./database.js'); // Import the MongoDB client from a database file
const openAI = require('openai');
const dotenv = require('dotenv');
const samplevector = require('./queryVector.js');
const fs = require('fs');
const axios = require('axios');

const collection = client.db("ecommerce").collection("catalog");
// Recommendations endpoint
router.get('/also-recommend', async (req, res) => {
    //const vector = req.query.q;
    const vector = samplevector;
    try {
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
        res.status(500).json({ message: err.message ,scope:"VS"});
    }
});

router.get('/vectorize', async (req, res) => {
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

async function imageEmbbeding(image) {
  try {
    // Write the image to a temporary file
    await fs.promises.writeFile("./tempImage.jpeg", image);

    // Read the file and create a Blob
    const data = await fs.promises.readFile("./tempImage.jpeg");
    const file = new Blob([data], { type: "image/jpeg" });

    // Create FormData and append the file
    const formData = new FormData();
    formData.append('image', file, "image.jpeg");

    // Make the request
    const response = await axios.post(`${clip_embedder_url}/upload_image_vector`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'content-type': 'image/jpeg'
      }
    });

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading image to vector:', error);
  }
}

router.post('/image-search', async (req, res) => {
  console.log(req);
  const image = req.files.file.data;
 
  const imageVector = await imageEmbbeding(image);
  try {
    const collectionName = "catalog";
    const collection = client.db("ecommerce").collection(collectionName);
    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_imege3", 
          //path: "vector", 
          path: "image_embedding3", 
          queryVector:imageVector, 
          numCandidates: 3, 
          limit: 2
        }
      }, {
        '$project': {
          _id: 0, 
          title: 1, 
          description: 1, 
          image: 1,
          score: {
            $meta: "vectorSearchScore"
          }
        }
      }
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