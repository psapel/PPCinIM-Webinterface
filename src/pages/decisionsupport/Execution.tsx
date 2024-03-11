import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./Decisionsupport.css";

const Execution = () => {
  const [tableData, setTableData] = useState([]);
  const [executionData, setExecutionData] = useState("");
  // const [logs, setLogs] = useState([]);

  const location = useLocation();
  // const filteredModels = location.state.filteredModels;
  const { isChecked } = location.state;

  useEffect(() => {
    // Clear the state before fetching new data
    setTableData([]);
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
            `http://localhost:5000/underlying-asset/${modelName}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setTableData(data);
          console.log("Fetched data:", data); // Log the fetched data
        } catch (error) {
          console.error("Error fetching asset data:", error);
        }

        try {
          const response = await fetch(
            `http://localhost:5000/execution_logs/${modelName}`
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
                <th>Job</th>
                <th>Duration</th>
                <th>Quantity</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td>{row.Reference}</td>
                  <td>{row.Duration}</td>
                  <td>{row.Quantity}</td>
                  <td>{row.State}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="execution-logs">
        <div className="execution-logs-title">Execution logs</div>
        <pre>{JSON.stringify(executionData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Execution;
