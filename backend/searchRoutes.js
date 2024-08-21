const express = require('express');
const router = express.Router();
    const client = require('./database.js'); // Import the productColl from a database file

const productColl =client.db("ecommerce").collection("products");



const defaultIndex = {
    $search: {
        index: 'default', // index name
        text: {
            query: "",
            path: ['title', 'description'], // Search in both title and description
            fuzzy: { maxEdits: 1 }
        }
    }
};

const project = {
    $project: {
        _id: 0,
        title: 1,
        description: 1,
        score: { $meta: "searchScore" } // Include search score in the results
    }
};

const facet = {
    $facet: {
        "categorizedByPrice": [
            // Filter out documents without a price e.g., _id: 7
            { $match: { price: { $exists: 1 } } },
            {
              $bucket: {
                groupBy: "$price",
                boundaries: [  0, 150, 200, 300, 400 ],
                default: "Other",
                output: {
                  "count": { $sum: 1 },
                  "titles": { $push: "$title" }, 
                }
              }
            }
          ],
    }
};

router.get('/', async (req, res) => {

    try {

        // faceting 
        const facetResults = await productColl.aggregate([facet]).toArray();
        res.json(facetResults );
    } catch (err) {

        res.status(500).json({ message: err.message });
    }
});


// Search endpoint
router.get('/search', async (req, res) => {

    const query = req.query.q;;
    try {
        // Look for results without Atlas Search
        const findResults = await productColl.find({ title: new RegExp(query) }).toArray();
        // faceting 
        // const facetResults = await productColl.aggregate([facet]).toArray();
        // console.log(facetResults[0].categorizedByPrice[0]);
        // Look for results WITH Atlas Search
        defaultIndex.$search.text.query = query;
        const searchResults = await productColl.aggregate([defaultIndex,  project]).toArray();
        const facets = await productColl.aggregate([defaultIndex, facet]).toArray();
        res.json({ findResults, searchResults, facets });

    } catch (err) {

        res.status(500).json({ message: err.message });
    }
});



const autocompleteAgg =  (query) => { 
    return [ 
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
         { $limit: 4 },
         { $project: { _id: 1, title: 1 } },
     ]
    }
 
 
 router.get('/autocomplete', async (req, res) => {
     const query = req.query.q;

     try {
         const results = await productColl.aggregate(autocompleteAgg(query)).toArray();
         res.json(results);
     } catch (err) {
         res.status(500).json({ message: err.message });
     }
 });

module.exports = router;