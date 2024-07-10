const { MongoClient } = require("mongodb");

// Replace with your MongoDB connection string
const uri = 'mongodb+srv://user:123@demo.lfvxb.mongodb.net/?retryWrites=true&w=majority&appName=DEMO';


const client = new MongoClient(uri);


fetch('https://fakestoreapi.com/products/')
            .then(res=>res.json())
            .then(async json=>{
                await client.connect()
                    client.db("products").collection("products").insertMany(json)
            })


