const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

// Replace with your MongoDB connection string
const mongoURI = 'mongodb+srv://user:123@demo.lfvxb.mongodb.net/?retryWrites=true&w=majority&appName=DEMO';


mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
});

const Product = mongoose.model('Product', productSchema);

const products = Array.from({ length: 100 }).map(() => ({
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  price: faker.commerce.price({ min: 20, max: 90}),
}));

const seedDB = async () => {
  try {
    await Product.deleteMany({});
    console.log(products);
    await Product.insertMany(products);
    console.log('Database seeded');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
