import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Decisionsupport.css";
import { urlToNameMapping } from "./Decisionsupport.tsx";

function FilteredModel() {
  const { filteredModels } = useLocation().state;
  const [isChecked, setIsChecked] = useState({});
  const [tableData, setTableData] = useState([]);
  const [data, setData] = useState([]);

  const navigate = useNavigate();

  const handleCheckboxChange = (event, modelName) => {
    setIsChecked((prevState) => ({
      ...prevState,
      [modelName]: event.target.checked,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setTableData([]); // Clear the table data before fetching new data
      setData([]); // Clear the data array before fetching new data

      for (const modelName of Object.keys(isChecked)) {
        if (isChecked[modelName]) {
          try {
            const source = filteredModels.find(
              (model) => model.name === modelName
            );

            const response = await fetch(
              `http://localhost:5005/api/underlying_asset`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ source }),
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const fetchedData = await response.json();
            console.log(fetchedData);

            // Update the data state with the new fetched data
            setData((prevData) => [...prevData, fetchedData]);

            // Update the table data with the relevant information
            setTableData((prevTableData) => [
              ...prevTableData,
              { names: fetchedData.names, durations: fetchedData.durations },
            ]);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        }
      }
    };

    fetchData();
  }, [isChecked, filteredModels]);

  useEffect(() => {
    console.log(tableData);
    console.log("data:", data);
  }, [tableData]);

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
                      Machine Environment:{" "}
                      {urlToNameMapping[
                        model[
                          "http://www.iop.rwth-aachen.de/PPC/1/1/machineEnvironment"
                        ]
                      ] ||
                        model[
                          "http://www.iop.rwth-aachen.de/PPC/1/1/machineEnvironment"
                        ]}
                    </p>
                    <br></br>
                    <p>
                      Scheduling Constraints:{" "}
                      {Array.isArray(
                        model[
                          "http://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints"
                        ]
                      )
                        ? model[
                            "http://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints"
                          ]
                            .map((url) => urlToNameMapping[url] || url)
                            .join(", ")
                        : urlToNameMapping[
                            model[
                              "http://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints"
                            ]
                          ] ||
                          model[
                            "http://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints"
                          ]}
                    </p>
                    <br></br>
                    <p>
                      Scheduling Objective Function:{" "}
                      {Array.isArray(
                        model[
                          "http://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction"
                        ]
                      )
                        ? model[
                            "http://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction"
                          ]
                            .map((url) => urlToNameMapping[url] || url)
                            .join(", ")
                        : urlToNameMapping[
                            model[
                              "http://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction"
                            ]
                          ] ||
                          model[
                            "http://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction"
                          ]}
                    </p>
                  </div>
                );
              }
              return null;
            })}
          </div>
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
        </div>
      )}
      {Object.values(isChecked).some((value) => value) && (
        <div className="button">
          <button
            className="btn text-white bg-secondary hover:bg-primary rounded"
            onClick={() => {
              navigate("/execution-model", {
                state: { isChecked, tableData, data },
              });
            }}
          >
            Execute Model
          </button>
        </div>
      )}
    </div>
  );
}

export default FilteredModel;
