import { useNavigate } from "react-router-dom";
// import model1old from "./jsonModels/model1_old.json";
// import model2old from "./jsonModels/model2_old.json";
// import model3old from "./jsonModels/model3_old.json";
import model1 from "./jsonModels/Model1.json";
import model1a from "./jsonModels/Model1a.json";
import model2 from "./jsonModels/Model2.json";
import model3 from "./jsonModels/Model3.json";
// import model4 from "./jsonModels/model4.json";
// import model5 from "./jsonModels/model5.json";
// import model6 from "./jsonModels/model6.json";
// import model7 from "./jsonModels/model7.json";
// import model8 from "./jsonModels/model8.json";
// import model9 from "./jsonModels/model9.json";
// import model10 from "./jsonModels/model10.json";
// import model11 from "./jsonModels/model11.json";
// import model12 from "./jsonModels/model12.json";
// import model13 from "./jsonModels/model13.json";
// import model14 from "./jsonModels/model14.json";
// import model15 from "./jsonModels/model15.json";
// import model16 from "./jsonModels/model16.json";
// import model17 from "./jsonModels/model17.json";

const models = [
  // model1old,
  // model2old,
  // model3old,
  model1,
  model1a,
  model2,
  model3,
  // model4,
  // model5,
  // model6,
  // model7,
  // model8,
  // model9,
  // model10,
  // model11,
  // model12,
  // model13,
  // model14,
  // model15,
  // model16,
  // model17,
];

const Models = () => {
  const navigate = useNavigate();

  console.log("models", models);

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
          const name = model.assetAdministrationShells[0].displayName[0].text;
          const formula = model.submodels[0].submodelElements.find(
            (el) => el.idShort === "ScopeOfModel"
          ).value;

          return (
            <div className="card w-96 bg-base-100 shadow-xl m-4">
              <div className="card-body">
                <h2 className="card-title">{name}</h2>
                <p>Formula: {formula}</p>
                <button
                  className="btn  text-white bg-secondary hover:bg-primary"
                  onClick={() =>
                    navigate(`/model-details/${encodeURIComponent(name)}`, {
                      state: {
                        modelData: model,
                        modelName: name,
                        formula: formula,
                      },
                    })
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
