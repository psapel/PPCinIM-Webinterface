import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// const location = useLocation();
// const filteredModels = location.state ? location.state.filteredModels : [];

const Execution = () => {
  const { filteredModels } = useLocation().state;
  const [tableData, setTableData] = useState([]);
  // const [executionData, setExecutionData] = useState("");
  // const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response1 = await fetch(
          `http://localhost:5000/underlying-asset/${filteredModels[0].name}`
        );
        const data1 = await response1.json();
        setTableData(data1);

        // const response2 = await fetch(
        //   `http://localhost:5000/execution/${filteredModels[0].name}`
        // );
        // const data2 = await response2.text();
        // setExecutionData(data2);

        // const response3 = await fetch(
        //   `http://localhost:5000/execution_logs/${filteredModels[0].name}`
        // );
        // const data3 = await response3.json();
        // setLogs(data3);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [filteredModels]);

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
                <tr key={row.Reference}>
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
    </div>
  );
};

export default Execution;
