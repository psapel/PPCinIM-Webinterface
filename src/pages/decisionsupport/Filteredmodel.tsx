import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function FilteredModel() {
  //   const [showDetails, setShowDetails] = useState(false);
  const { filteredModels } = useLocation().state;

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
      <h1>{filteredModels[0].name}</h1>
    </div>
  );
}

export default FilteredModel;
