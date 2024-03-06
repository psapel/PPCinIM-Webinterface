import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Decisionsupport.css";

function FilteredModel() {
  //   const [showDetails, setShowDetails] = useState(false);
  const { filteredModels } = useLocation().state;
  const [isChecked, setIsChecked] = useState(false);
  const [modelData, setModelData] = useState([]);
  const [tableData, setTableData] = useState([]);

  const navigate = useNavigate();

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  useEffect(() => {
    if (isChecked && filteredModels.length > 0 && filteredModels[0].name) {
      const fetchAsset = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/underlying-asset/${filteredModels[0].name}`
          );
          console.log("response", response);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log("Fetched data:", data); // Log the fetched data
          setTableData(data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchAsset();
    }
  }, [isChecked, filteredModels]);

  useEffect(() => {
    if (isChecked && modelData) {
      const fetchAsset = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/underlying-asset/${modelData.GrahamNotation.name}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setTableData(data);
        } catch (error) {
          console.error("Error fetching asset data:", error);
        }
      };

      fetchAsset();
    }
  }, [isChecked, modelData]);

  console.log("hiiiiiiiii", filteredModels);
  console.log("tableData", tableData);
  console.log("modelData", modelData);
  //   const displaySelectedModel = async (selectedModelName) => {
  //     try {
  //       const modelResponse = await fetch(`/model/${selectedModelName}`);
  //       const modelData = await modelResponse.text();
  //       setShowDetails(JSON.stringify(JSON.parse(modelData), null, 4));
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  return (
    <div>
      <h1 style={{ fontSize: "1em", fontWeight: "bold", textAlign: "center" }}>
        Scheduling Models for the Injection Molding domain
      </h1>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className="modelBox">
          <input
            type="checkbox"
            onChange={handleCheckboxChange}
            style={{ marginRight: "10px" }}
          />
          <h1>{filteredModels[0].name}</h1>
        </div>
      </div>
      {isChecked && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <div className="modelBox">
            {filteredModels.map((model, index) => (
              <div key={index} style={{ textAlign: "center" }}>
                <p>Name: {model.name}</p>
                <br></br>
                <p>Formula: {model.formula}</p>
                <br></br>
                <p>
                  Machine Environment:{""}
                  {
                    model[
                      "https://www.iop.rwth-aachen.de/PPC/1/1/machineEnvironment"
                    ]
                  }
                </p>
                <br></br>
                <p>
                  Scheduling Constraints:{" "}
                  {
                    model[
                      "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints"
                    ]
                  }
                </p>
                <br></br>
                <p>
                  Scheduling Objective Function:{" "}
                  {
                    model[
                      "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction"
                    ]
                  }
                </p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            {tableData.length > 0 && (
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Duration</th>
                    <th>Company</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>State</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={row.Reference}>
                      <td>{row.Reference}</td>
                      <td>{row.Duration}</td>
                      <td>{row.Company}</td>
                      <td>{row.Product}</td>
                      <td>{row.Quantity}</td>
                      <td>{row.State}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      {isChecked && (
        <div className="button">
          <button
            className="btn text-white bg-secondary hover:bg-primary rounded"
            onClick={() => navigate("/execution-model")}
          >
            Execute Model
          </button>
        </div>
      )}
    </div>
  );
}

export default FilteredModel;
