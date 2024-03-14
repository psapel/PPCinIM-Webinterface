import { useNavigate, useLocation } from "react-router-dom";
import "./Models.css";
import { useState } from "react";
import { categories } from "../decisionsupport/Decisionsupport";
import { urlToNameMapping } from "../decisionsupport/Decisionsupport";

const Modeldetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modelData, modelName } = location.state;
  const [showDetails, setShowDetails] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);

  console.log("modelData", modelData);
  console.log("components", categories);

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
        </p>
        <p>
          <strong>Formula: </strong>
          {modelData.purpose_properties.formula}
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
          {
            urlToNameMapping[
              modelData.purpose_properties[
                "https://www.iop.rwth-aachen.de/PPC/1/1/machineEnvironment"
              ] as keyof typeof urlToNameMapping
            ]
          }
        </p>
        <br></br>
        <p>
          <strong>Scheduling Constraints: </strong>
          {Array.isArray(
            modelData.purpose_properties[
              "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints"
            ]
          )
            ? modelData.purpose_properties[
                "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints"
              ]
                .map((url) => urlToNameMapping[url])
                .join(", ")
            : urlToNameMapping[
                modelData.purpose_properties[
                  "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints"
                ]
              ]}
        </p>
        <br></br>
        <p>
          <strong>Scheduling Objective Function: </strong>
          {modelData.purpose_properties[
            "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction"
          ]
            .map((url) => urlToNameMapping[url])
            .join(", ")}
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
                {modelData.input_data[0].job_name.id}
              </p>
              <p>
                <strong>Source: </strong>
                {modelData.input_data[0].job_name.db}
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
                {modelData.input_data[1].job_duration.id}
              </p>
              <p>
                <strong>Source: </strong>
                {modelData.input_data[1].job_duration.db}
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
            <strong>Preprocessing:</strong> {modelData.preprocess}
          </p>
          <br></br>
          <p>
            <strong>Postprocessing:</strong> {modelData.postprocess}
          </p>
        </p>
      </div>
    </div>
  );
};

export default Modeldetails;
