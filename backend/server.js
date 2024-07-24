const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const searchRoutes = require('./searchRoutes.js');
const vectorSearchRoutes = require('./vectorSearchRoutes.js');

app.use('/search', searchRoutes);
app.use('/vector-search', vectorSearchRoutes);

const port = process.env.PORT;
app.listen(port, () => console.log('Server running on port ' + port));
