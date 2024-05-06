import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Models = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);

  const fetchModels = async () => {
    const url = "http://localhost:5005/testmodel2";

    try {
      const response = await fetch(url);
      const data = await response.json();
      setModels(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div>
      <div className="flex justify-center m-4">
        <input
          type="text"
          placeholder="Search"
          className="input input-bordered input-primary w-full max-w-xs ml-auto"
        />
        <button
          className="btn  text-white bg-secondary hover:bg-primary mr-3 ml-auto"
          onClick={() => navigate("/new-model")}
        >
          Create New Model
        </button>
      </div>

      <div className="flex justify-center flex-wrap m-4">
        {models.map((model) => {
          const formula = model.modelData.submodels[0].submodelElements.find(
            (el) => el.idShort === "ScopeOfModel"
          ).value;

          console.log(model.modelId);

          return (
            <div className="card w-96 bg-base-100 shadow-xl m-4">
              <div className="card-body">
                <h2 className="card-title">{model.modelName}</h2>
                <p>Formula: {formula}</p>
                <button
                  className="btn  text-white bg-secondary hover:bg-primary"
                  onClick={() =>
                    navigate(
                      `/model-details/${encodeURIComponent(model.modelId)}`,
                      {
                        state: {
                          modelData: model.modelData,
                          modelName: model.modelName,
                          modelId: model.modelId,
                          formula: formula,
                        },
                      }
                    )
                  }
                >
                  Go to Model Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Models;
