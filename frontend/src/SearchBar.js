import React, { useState } from 'react';
import axios from 'axios';
import './SearchBar.css';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    findResults: [],
    searchResults: []
  });
  const [suggestions, setSuggestions] = useState([]);

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

  const handleAutocomplete = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      try {
        const response = await axios.get('http://localhost:5000/search/autocomplete', {
          params: { q: value }
        });
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.title);
    setSuggestions([]);
  };

  return (
    <div className="search-container">
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={handleAutocomplete}
          placeholder="Search..."
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion) => (
            <li key={suggestion._id} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion.title}
            </li>
          ))}
        </ul>
      )}
      <div className="results-container">
        <div className="results-box">
          <h2>Find Results:</h2>
          <ul className="results-list">
            {results.findResults && results.findResults.length > 0 ? (
              results.findResults.map((item) => (
                <li key={item._id}>
                  <strong>{item.title}</strong>
                  <br />
                  {item.description}
                </li>
              ))
            ) : (
              <li className="no-results">No find results</li>
            )}
          </ul>
        </div>
        <div className="results-box">
          <h2>Search Results:</h2>
          <ul className="results-list">
            {results.searchResults && results.searchResults.length > 0 ? (
              results.searchResults.map((item) => (
                <li key={item._id}>
                  <strong>{item.title}</strong>
                  <br />
                  {item.description}
                </li>
              ))
            ) : (
              <li className="no-results">No search results</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
