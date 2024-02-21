import { useLocation } from "react-router-dom";

const FilteredModel = () => {
  const location = useLocation();
  const filteredModels = location.state?.filteredModels || [];

  console.log(filteredModels); // Log filteredModels to the console

  // If there are no models, return null
  if (filteredModels.length === 0) return null;

  return (
    <div>
      {filteredModels.map((model) => {
        console.log(model.GrahamNotation.name); // Log model.GrahamNotation.name to the console
        return (
          <div key={model._id}>
            <h2>Model ID: {model.GrahamNotation.name}</h2>
          </div>
        );
      })}
    </div>
  );
};

export default FilteredModel;
