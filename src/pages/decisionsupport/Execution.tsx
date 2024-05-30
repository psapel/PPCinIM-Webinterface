import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./Decisionsupport.css";

const Execution = () => {
  const [executionData, setExecutionData] = useState("");
  // const [logs, setLogs] = useState([]);

  const location = useLocation();
  const tableData = location.state.tableData;
  const { isChecked } = location.state;
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Clear the state before fetching new data

    setExecutionData([]);

    // Find the first checked model
    const modelName = Object.keys(isChecked).find(
      (modelName) => isChecked[modelName]
    );

    if (modelName) {
      // Define an async function inside the hook
      const fetchData = async () => {
        try {
          const response = await fetch(
            `http://localhost:5005/api/execution_logs/${modelName}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setExecutionData(data);
        } catch (error) {
          console.error("Error fetching execution data:", error);
        }
      };

      // Call the async function
      fetchData();
    }
  }, [isChecked]);
  console.log("isChecked", isChecked);
  console.log(tableData);

  return (
    <div>
      <h1 style={{ fontSize: "1em", fontWeight: "bold", textAlign: "center" }}>
        Execution of Models
      </h1>

      <div className="overflow-x-auto">
        {tableData.length > 0 && (
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Name</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) =>
                row.names.map((name, i) => (
                  <tr key={`${index}-${i}`}>
                    <td>{name}</td>
                    <td>{row.durations[i]}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className="execution-logs" style={{ textAlign: "center" }}>
        {executionData ? (
          <div>
            <strong> {executionData["146"]}</strong>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div>
        <button
          className="btn text-white bg-secondary hover:bg-primary mr-3 ml-auto"
          style={{ marginRight: "50px", float: "right" }}
          onClick={() => {
            const newWindow = window.open("", "_blank");
            newWindow.document.write(
              `<pre>${JSON.stringify(executionData, null, 2)}</pre>`
            );
          }}
        >
          Detailed Execution Steps
        </button>
      </div>
    </div>
  );
};

export default Execution;
