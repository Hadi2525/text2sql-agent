function QueryResults({ results, error }) {
    return (
      <div className="section">
        <h2>Query Results</h2>
        
        {error && <p className="error">{error}</p>}
        
        <div id="results">
          {results && (
            results.results.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    {results.columns.map((column, index) => (
                      <th key={index}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell ?? 'NULL'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No results found</p>
            )
          )}
        </div>
      </div>
    )
  }
  
  export default QueryResults