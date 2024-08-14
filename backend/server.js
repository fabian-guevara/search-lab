const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const multer = require('multer');

dotenv.config();
openai_apiKey = process.env.OPENAI_KEY;
clip_embedder_url = process.env.CLIP_EMBEDDER_URL; 

const openai = new openAI.OpenAI({
  apiKey: openai_apiKey,
});


const app = express();
app.use(fileUpload());
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const upload = multer({'dest':"uploads/"})

const searchRoutes = require('./searchRoutes.js');
const vectorSearchRoutes = require('./vectorSearchRoutes.js');

app.use('/search', searchRoutes);
app.use('/vector-search', vectorSearchRoutes);

const port = process.env.PORT;
app.listen(port, () => console.log('Server running on port ' + port));
