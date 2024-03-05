import { useNavigate } from "react-router-dom";
import model1 from "./jsonModels/model1.json";
import model2 from "./jsonModels/model2.json";
import model3 from "./jsonModels/model3.json";
import model4 from "./jsonModels/model4.json";
import model5 from "./jsonModels/model5.json";
import model6 from "./jsonModels/model6.json";
import model7 from "./jsonModels/model7.json";
import model8 from "./jsonModels/model8.json";
import model9 from "./jsonModels/model9.json";
import model10 from "./jsonModels/model10.json";
import model11 from "./jsonModels/model11.json";
import model12 from "./jsonModels/model12.json";
import model13 from "./jsonModels/model13.json";
import model14 from "./jsonModels/model14.json";
import model15 from "./jsonModels/model15.json";
import model16 from "./jsonModels/model16.json";
import model17 from "./jsonModels/model17.json";

const models = [
  model1,
  model2,
  model3,
  model4,
  model5,
  model6,
  model7,
  model8,
  model9,
  model10,
  model11,
  model12,
  model13,
  model14,
  model15,
  model16,
  model17,
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
        {models.map((model, index) => (
          <div className="card w-96 bg-base-100 shadow-xl m-4">
            <div className="card-body">
              <h2 className="card-title"> Model {index + 1} </h2>
              <p>Formula: {model.purpose_properties.formula}</p>
              {/* <div className="badge badge-outline">Behavioral</div>
            <div className="badge badge-outline">User Interface</div> */}
              {/* <figure>
              <img src=""></img>
            </figure> */}
              <button
                className="btn  text-white bg-secondary hover:bg-primary"
                onClick={() =>
                  navigate(`/model-details/${index + 1}`, {
                    state: { modelData: model },
                  })
                }
              >
                Show Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Models;
