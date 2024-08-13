
# Text/Vector Search Lab with MongoDB Services

## Overview

This repository contains a lab demonstrating the capabilities of MongoDB services for performing text and vector search. The lab leverages a dataset taken from [Fake Store API](https://fakestoreapi.com), which contains a collection of 20 items from an e-commerce platform in JSON format.

## Authors

- Fabian Guevara
- Royer Arenas

## Industry Focus

E-commerce

## Sections

### 1. Text Search

In this section, we demonstrate how to perform text search using MongoDB's powerful indexing and aggregation pipeline on a dynamic mapping. The steps include:

- Setting up a text index on the dataset.
- Using the aggregation pipeline to perform advanced text searches.
- Examples of queries that utilize the text index for efficient searching.

### 2. Vector Search

This section covers the functions of vector search for similarity matching, which can be used to build a recommendation system. The steps include:

- Vectorizing product descriptions or other relevant fields using the OpenAI Embedding API.
- Performing similarity matching using vector search.
- Building a basic recommendation system based on similarity scores.

### 3. Image-Based Search

In the final section, we explore the use of a vectorized image to perform searches using an image. The steps include:

- Vectorizing images from the dataset using the OpenAI Embedding API.
- Using vector search to find similar images.
- Demonstrating how image-based search can be applied in e-commerce for finding similar products.

## App Structure

The app is structured with a backend and a front end, both using Node.js. The backend handles data processing, indexing, and search operations, while the front end provides an interface for users to interact with the search functionalities.

## Getting Started

### Prerequisites

- MongoDB Atlas account
- MongoDB Atlas Search enabled
- Node.js installed
- OpenAI API key for embedding

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/text-vector-search-lab.git
cd text-vector-search-lab
```

2. Install the necessary Node.js packages:

```bash
npm install
```

3. Set up your  `.env` file at the backend folder level:

```bash
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
OPENAI_API_KEY=your_openai_api_key
PORT=9000
CLIP_EMBEDDER_URL=http://localhost:<port>
```

### Running the Lab

1. Import the dataset into your MongoDB Atlas cluster.
2. Start the backend server:

```bash
npm run start:backend
```

3. Start the frontend server:

```bash
npm run start:frontend
```

4. Start the image vectorizer , all credits due to [Pat Wendorf](https://github.com/patw/ImageVectorizer)  
```bash 
cd vectorizer 
python -m venv myenv
source  myenv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 3001 --reload
```

5. Explore the `scripts` directory for additional functionalities and extensions.

## Dataset

The dataset used in this lab is taken from [Fake Store API](https://fakestoreapi.com). It contains a collection of 20 items in JSON format, representing various products in an e-commerce platform.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

Special thanks to the authors and contributors who have made this project possible.
