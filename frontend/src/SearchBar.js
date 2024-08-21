import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Facets from "./Facets.js";
import './SearchBar.css';



const getFacetResults = async () => {
  try {
    const response = await axios.get('http://localhost:5000/search');
    return response.data;
  } catch (error) { 
    console.error('Error fetching facet results:', error);
  }
};

function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    findResults: [],
    searchResults: [],
    imageResults: []
  });
  const [suggestions, setSuggestions] = useState([]);
  const [facetResults, setFacetResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const results = await getFacetResults();
      setFacetResults(results); // Set state with the resolved data
    };

    fetchData(); // Call the async function
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get('http://localhost:5000/search/search', {
        params: { q: query }
      });
      setResults(prevResults => ({
        ...prevResults,
        searchResults: response.data.searchResults,
        findResults: response.data.findResults
      }));
      setFacetResults(response.data.facets);
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

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    console.log("FIRED!");

    if (files.length > 0) {
      const formData = new FormData();
      formData.append('file', files[0]);

      try {
        const response = await axios.post('http://localhost:9000/vector-search/image-search', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setResults(prevResults => ({
          ...prevResults,
          imageResults: response.data
        }));
      } catch (error) {
        console.error('Error fetching image search results:', error);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
   <div className='main'>
     <Facets facetResults={facetResults} />
    <div 
      className="search-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      
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
        {results.imageResults && results.imageResults.length > 0 && (
          <div className="image-results-box">
            <h2>Image Search Results:</h2>
            <ul className="image-results-list">
              {results.imageResults.map((item, index) => (
                <li key={index}>
                  <img src={item.image} alt={`Result ${index + 1}`} width="300px" height="500px" />
                  <h4>{item.title}</h4>
                  <p><b>Description: </b>{item.description}</p>
                  <p><b>Score: </b>{item.score}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
   </div>
  );
}

export default SearchBar;
