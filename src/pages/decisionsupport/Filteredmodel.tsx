// import { useLocation } from "react-router-dom";

// const FilteredModel = () => {
//   const location = useLocation();
//   const filteredModels = location.state?.filteredModels || [];

//   console.log(filteredModels); // Log filteredModels to the console

//   // If there are no models, return null
//   if (filteredModels.length === 0) return null;

//   return (
//     <div>
//       {filteredModels.map((model) => {
//         console.log(model.GrahamNotation.name); // Log model.GrahamNotation.name to the console
//         return (
//           <div key={model._id}>
//             <h2>Model ID: {model.GrahamNotation.name}</h2>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default FilteredModel;

import React, { useState } from "react";

function FilteredModel() {
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedModelData, setSelectedModelData] = useState({});
  const [selectedAssetData, setSelectedAssetData] = useState([]);

  const displaySelectedModel = async () => {
    const checkbox = document.querySelector(
      "input[name='selected_model']:checked"
    );

    if (checkbox) {
      const selectedModelName = checkbox.value;

      try {
        // Fetch selected model data
        const modelResponse = await fetch(`/model/${selectedModelName}`);
        const modelData = await modelResponse.json();
        setSelectedModelData(modelData);

        // Fetch underlying asset data
        const assetResponse = await fetch(
          `/underlying-asset/${selectedModelName}`
        );
        const assetData = await assetResponse.json();
        setSelectedAssetData(assetData);

        // Show execute button
        document.getElementById("execute").style.display = "block";
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      window.alert("No model selected");
    }
  };

  return (
    <div>
      <h1>Model Catalogue</h1>
      <h5>Scheduling Models for the Injection Molding domain</h5>
      <div className="container-column-1">
        {selectedModels.map((selectedModel, index) => (
          <div className="set" key={index}>
            <h6>{selectedModel.name}</h6>
            <div className="checkbox-container-new">
              <input
                type="checkbox"
                name="selected_model"
                value={selectedModel.name}
                id={`selected_model_${index}`}
              />
              <label htmlFor={`selected_model_${index}`}>
                {selectedModel.name}
              </label>
            </div>
          </div>
        ))}
      </div>
      <div className="button-container">
        <button
          type="button"
          className="submit-button-new"
          onClick={displaySelectedModel}
        >
          Details
        </button>
      </div>
      <div className="flex-container">
        <div id="jsonBox" className="grey-box">
          <h2>Model Metadata</h2>
          <pre id="selectedModelContainer">
            {JSON.stringify(selectedModelData, null, 4)}
          </pre>
        </div>
        <div id="asset" className="black-box">
          <h2>Underlying Asset</h2>
          <table border="1" className="styled-table">
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
              {selectedAssetData.map((data, index) => (
                <tr key={index}>
                  <td>{data.Reference}</td>
                  <td>{data.Duration}</td>
                  <td>{data.Company}</td>
                  <td>{data.Product}</td>
                  <td>{data.Quantity}</td>
                  <td>{data.State}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="button-container-1">
          <button id="execute" type="submit" className="submit-button-1">
            Execute Model
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilteredModel;
