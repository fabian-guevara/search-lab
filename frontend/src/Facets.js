const facetLables = {
    0: "From 0 to 149",
    150: "From 150 to 199",
    200: "From 200 to 299",
    300: "From 300 to 399",
    "Other": "Other"
  }

function Facets({facetResults}) {
    return (
        <div>
        {
          facetResults[0] && facetResults[0].categorizedByPrice.map((facet, index) => ( 
            <div key={index}>
              <h3> {facetLables[facet._id]}</h3>
              <h3>{facet.count} Results</h3>
            </div>
          ))
        }
      </div>
    )
}


export default Facets;