import React, { useState } from 'react';
import axios from 'axios';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    findResults: [],
    searchResults: []
  });

  const handleSearch = async () => {
    try {
      const response = await axios.get('http://localhost:5000/search', {
        params: { q: query }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button onClick={handleSearch}>Search</button>
      <h2>Find Results:</h2>
      <ul>
        {results.findResults && results.findResults.length > 0 ? (
          results.findResults.map((item) => (
            <li key={item._id}>
              <strong>{item.name}</strong>
              <br />
              {item.description}
            </li>
          ))
        ) : (
          <li>No find results</li>
        )}
      </ul>
      <h2>Search Results:</h2>
      <ul>
        {results.searchResults && results.searchResults.length > 0 ? (
          results.searchResults.map((item) => (
            <li key={item._id}>
              <strong>{item.name}</strong>
              <br />
              {item.description}
              <br />
              {item.score}
            </li>
          ))
        ) : (
          <li>No search results</li>
        )}
      </ul>
    </div>
  );
}

export default SearchBar;
