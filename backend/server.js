const express = require('express');
const cors = require('cors');
const { MongoClient, } = require("mongodb");

 
const app = express();
app.use(express.json());
app.use(cors());

// Replace with your MongoDB connection string
const uri = 'mongodb+srv://user:123@demo.lfvxb.mongodb.net/?retryWrites=true&w=majority&appName=DEMO';

const client = new MongoClient(uri);
let productColl;

client.connect().then(() => {
    //get collection instance
productColl = client.db("products").collection("products")
});




app.get('/autocomplete', async (req, res) => {
    const query = req.query.q;
    try {
      const results = await productColl.aggregate([
        {
          $search: {
            index: 'autocomplete',
            autocomplete: {
              query: query,
              path: 'title',
              fuzzy: {
                maxEdits: 2
              }
            }
          }
        },
        {
          $limit: 4
        },
        {
          $project: {
            _id: 1,
            title: 1
          }
        }
      ]).toArray();
      res.json(results);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });



const defaultIndex = {
    $search: {
      index: 'default', // Use the name of your search index if different
      text: {
        query: "",
        path: ['title', 'description'], // Search in both title and description
        fuzzy: {
            maxEdits: 1
        }
      }
    }
  }


 const project =   {
    $project: {
      _id: 0,
      title: 1,
      description: 1,
      score: { $meta: "searchScore" } // Include search score in the results
    }
  }



// Search endpoint
app.get('/search', async (req, res) => {
  const query = req.query.q;
  try {

    // connection to DB
  
    
    //look for results without Atlas Search
    const findResults = await productColl.find({ title: new RegExp(query) }).toArray();

    // look for results with Atlas Search
    defaultIndex.$search.text.query = query;
    const searchResults = await productColl.aggregate([ defaultIndex, project ]).toArray();

    res.json({ findResults, searchResults });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));

