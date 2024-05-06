import { useNavigate, useLocation } from "react-router-dom";
import "./Models.css";
import { useState } from "react";

const Modeldetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modelData, modelName, modelId, formula } = location.state;
  const [showDetails, setShowDetails] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);

  const handleDelete = async () => {
    const response = await fetch(
      `http://localhost:5005/delete_model/${modelId}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      console.log("Model deleted");
      navigate("/models");
    } else {
      console.log("Error deleting asset");
    }
  };

  console.log("modelData", modelData);
  console.log("modelName", modelName);
  console.log("modelId", modelId);

  console.log("formula", formula);

  const modelType =
    modelData.assetAdministrationShells[0].assetInformation.assetType;

  const purposeProperties1 = modelData.submodels[0].submodelElements
    .find((el) => el.idShort === "PurposeProperties")
    .value.find((el) => el.idShort === "MachineEnvironment").value;

  const purposeProperties2 = modelData.submodels[0].submodelElements
    .find((el) => el.idShort === "PurposeProperties")
    .value.find((el) => el.idShort === "SchedulingConstraints").value;

  const purposeProperties3 = modelData.submodels[0].submodelElements
    .find((el) => el.idShort === "PurposeProperties")
    .value.find((el) => el.idShort === "SchedulingObjectiveFunction").value;

  return (
    <div className="page">
      <button
        className="btn btn-circle btn-outline"
        onClick={() => navigate("/models")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="modeldetailsbox">
        <p>
          <strong>Name: </strong>
          {modelName}
        </p>
        <p>
          <strong>Model Type: </strong>
          {modelType}
        </p>
        <p>
          <strong>Formula: </strong>
          {formula}
        </p>
        <br></br>
        <br></br>
        <p>Purpose Properties</p>
        <hr
          style={{
            borderColor: "rgba(0, 0, 0, 0.2)",
            borderWidth: 0.05,
            height: 0.05,
            width: "100%",
            borderStyle: "solid",
            margin: "10px 0",
          }}
        />
        <p>
          <strong>Machine Environment: </strong>
          {purposeProperties1}
        </p>
        <br></br>
        <p>
          <strong>Scheduling Constraints: </strong>
          {purposeProperties2}
        </p>
        <br></br>
        <p>
          <strong>Scheduling Objective Function: </strong>
          {purposeProperties3}
        </p>
        <br></br>
        <br></br>
        <p>Input Data</p>
        <hr
          style={{
            borderColor: "rgba(0, 0, 0, 0.2)",
            borderWidth: 0.05,
            height: 0.05,
            width: "100%",
            borderStyle: "solid",
            margin: "10px 0",
          }}
        />
        <p>
          <strong>Job Name </strong>

          <button
            className="btn btn-xs text-white bg-secondary hover:bg-primary ml-2"
            onClick={() => setShowDetails(!showDetails)}
          >
            +
          </button>
          {showDetails && (
            <div className="plusDetail">
              <br></br>
              <p>
                <strong>Identifier: </strong>
                {
                  modelData.submodels[0].submodelElements.find(
                    (el) => el.idShort === "InputData"
                  ).value[0].value.keys[1].value
                }
              </p>
              <p>
                <strong>Source: </strong>
                {
                  modelData.submodels[0].submodelElements.find(
                    (el) => el.idShort === "InputData"
                  ).value[0].value.keys[0].value
                }
              </p>
              <br></br>
            </div>
          )}
        </p>

        <br></br>
        <p>
          <strong>Job Duration </strong>
          <button
            className="btn btn-xs text-white bg-secondary hover:bg-primary ml-2"
            onClick={() => setShowJobDetails(!showJobDetails)}
          >
            +
          </button>
          {showJobDetails && (
            <div className="plusDetail">
              <br></br>
              <p>
                <strong>Identifier: </strong>
                {
                  modelData.submodels[0].submodelElements.find(
                    (el) => el.idShort === "InputData"
                  ).value[1].value.keys[1].value
                }
              </p>
              <p>
                <strong>Source: </strong>
                {
                  modelData.submodels[0].submodelElements.find(
                    (el) => el.idShort === "InputData"
                  ).value[1].value.keys[0].value
                }
              </p>
              <br></br>
            </div>
          )}
        </p>
        <br></br>
        <br></br>
        <p>Processing</p>
        <hr
          style={{
            borderColor: "rgba(0, 0, 0, 0.2)",
            borderWidth: 0.05,
            height: 0.05,
            width: "100%",
            borderStyle: "solid",
            margin: "10px 0",
          }}
        />
        <p>
          <p>
            <strong>Preprocessing:</strong>{" "}
            {
              modelData.submodels[0].submodelElements.find(
                (el) => el.idShort === "Preprocessing"
              ).value[0].value
            }
          </p>
          <br></br>
          <p>
            <strong>Postprocessing:</strong>{" "}
            {
              modelData.submodels[0].submodelElements.find(
                (el) => el.idShort === "Postprocessing"
              ).value[0].value
            }
          </p>
        </p>
        <button className="btn-delete" onClick={handleDelete}>
          <span>&#128465;</span>
        </button>
      </div>
    </div>
  );
};

export default Modeldetails;
