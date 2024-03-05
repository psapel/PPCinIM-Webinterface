import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Decisionsupport.css";

function FilteredModel() {
  //   const [showDetails, setShowDetails] = useState(false);
  const { filteredModels } = useLocation().state;
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  console.log("hiiiiiiiii", filteredModels);
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
                  Machine Environment:
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
        </div>
      )}
    </div>
  );
}

export default FilteredModel;
