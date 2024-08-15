const client = require('./database.js');



const seedDatabase = async () => {
    try {
        // Connect to the MongoDB client
        await client.connect();

        const db = client.db("ecommerce");
        
        // Fetch the collections in the database
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(collection => collection.name);
        
        // Check if the "products" collection exists
        if (!collectionNames.includes("products")) {
            console.log("Seeding products collection...");
            
            // Fetch products from the Fake Store API
            const response = await fetch('https://fakestoreapi.com/products/');
            const jsonResponse = await response.json();

            // Insert products into the database
            await db.collection("products").insertMany(jsonResponse);

            console.log("Database seeded successfully. Happy demoing!");
        } else {
            console.log("Products collection already exists. Skipping seeding.");
        }
    } catch (error) {
        console.error("There was an error seeding the database", error.message);
    } finally {
        // Close the client connection
        await client.close();
    }
};

// Run the function
seedDatabase();