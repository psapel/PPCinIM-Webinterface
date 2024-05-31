import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./Decisionsupport.css";

const Execution = () => {
  const [executionData, setExecutionData] = useState("");
  const [executionLogsData, setExecutionLogsData] = useState("");

  const location = useLocation();
  const tableData = location.state.tableData;
  const { isChecked } = location.state;
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Clear the state before fetching new data
    setExecutionData("");
    setExecutionLogsData("");

    // Find the first checked model
    const modelName = Object.keys(isChecked).find(
      (modelName) => isChecked[modelName]
    );

    if (modelName) {
      // Define an async function inside the hook
      const fetchData = async () => {
        try {
          // Then, fetch the execution data
          const executionResponse = await fetch(
            "http://localhost:5005/api/execution",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(tableData[0]),
            }
          );
          if (!executionResponse.ok) {
            throw new Error(`HTTP error! status: ${executionResponse.status}`);
          }
          const executionData = await executionResponse.json();
          setExecutionData(JSON.stringify(executionData)); // Format data here
        } catch (error) {
          console.error("Error fetching execution data:", error);
        }

        try {
          const response = await fetch(
            `http://localhost:5005/api/execution_logs/${modelName}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setExecutionLogsData(data);
        } catch (error) {
          console.error("Error fetching execution logs data:", error);
        }
      };

      // Call the async function
      fetchData();
    }
  }, [isChecked]);

  console.log("isChecked", isChecked);
  console.log(tableData);
  console.log("executionData", executionData);

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
        {executionData && (
          <div>
            <strong>The optimal job order is:</strong>
            <br />
            <pre>{executionData}</pre>
          </div>
        )}
      </div>
      <div>
        <button
          className="btn text-white bg-secondary hover:bg-primary mr-3 ml-auto"
          style={{ marginRight: "50px", float: "right" }}
          onClick={() => {
            const newWindow = window.open("", "_blank");
            newWindow.document.write(
              `<pre>${JSON.stringify(executionLogsData, null, 2)}</pre>`
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