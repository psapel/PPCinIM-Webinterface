import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Decisionsupport.css";
import { urlToNameMapping } from "./Decisionsupport.tsx";

function FilteredModel() {
  const { filteredModels } = useLocation().state;
  const [isChecked, setIsChecked] = useState({});
  const [tableData, setTableData] = useState([]);

  const navigate = useNavigate();

  const handleCheckboxChange = (event, modelName) => {
    setIsChecked((prevState) => ({
      ...prevState,
      [modelName]: event.target.checked,
    }));
  };

  useEffect(() => {
    setTableData([]); // Clear the table data before fetching new data
    Object.keys(isChecked).forEach(async (modelName) => {
      if (isChecked[modelName]) {
        try {
          const response = await fetch(
            `http://localhost:5005/api/underlying_asset/${modelName}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setTableData((prevData) => [...prevData, ...data]);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    });
  }, [isChecked]);

  return (
    <div>
      <h1 style={{ fontSize: "1em", fontWeight: "bold", textAlign: "center" }}>
        Scheduling Models for the Injection Molding domain
      </h1>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {filteredModels.map((model, index) => (
          <div className="modelBox" key={index}>
            <input
              type="checkbox"
              checked={isChecked[model.name] || false}
              onChange={(event) => handleCheckboxChange(event, model.name)}
              style={{ marginRight: "10px" }}
            />
            <h1>{model.name}</h1>
          </div>
        ))}
      </div>
      {Object.values(isChecked).some((value) => value) && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <div className="modelBox">
            {filteredModels.map((model, index) => {
              if (isChecked[model.name]) {
                return (
                  <div key={index} style={{ textAlign: "center" }}>
                    <p>Name: {model.name}</p>
                    <br></br>
                    <p>Formula: {model.formula}</p>
                    <br></br>
                    <p>
                      Machine Environment:{""}
                      {urlToNameMapping[
                        model[
                          "https://www.iop.rwth-aachen.de/PPC/1/1/machineEnvironment"
                        ]
                      ] ||
                        model[
                          "https://www.iop.rwth-aachen.de/PPC/1/1/machineEnvironment"
                        ]}
                    </p>
                    <br></br>
                    <p>
                      Scheduling Constraints:{" "}
                      {Array.isArray(
                        model[
                          "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints"
                        ]
                      )
                        ? model[
                            "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints"
                          ]
                            .map((url) => urlToNameMapping[url] || url)
                            .join(", ")
                        : urlToNameMapping[
                            model[
                              "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints"
                            ]
                          ] ||
                          model[
                            "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints"
                          ]}
                    </p>
                    <br></br>
                    <p>
                      Scheduling Objective Function:{" "}
                      {Array.isArray(
                        model[
                          "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction"
                        ]
                      )
                        ? model[
                            "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction"
                          ]
                            .map((url) => urlToNameMapping[url] || url)
                            .join(", ")
                        : urlToNameMapping[
                            model[
                              "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction"
                            ]
                          ] ||
                          model[
                            "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction"
                          ]}
                    </p>
                  </div>
                );
              }
            })}
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
      {Object.values(isChecked).some((value) => value) && (
        <div className="button">
          <button
            className="btn text-white bg-secondary hover:bg-primary rounded"
            onClick={() =>
              navigate("/execution-model", { state: { isChecked } })
            }
          >
            Execute Model
          </button>
        </div>
      )}
    </div>
  );
}

export default FilteredModel;
