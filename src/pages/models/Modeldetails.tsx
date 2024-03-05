import { useNavigate, useLocation } from "react-router-dom";
import "./Models.css";
import { categories } from "../decisionsupport/Decisionsupport";

const Modeldetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modelData } = location.state;

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
          <strong>Machine Environment: </strong>
          {
            modelData.purpose_properties[
              "https://www.iop.rwth-aachen.de/PPC/1/1/machineEnvironment"
            ]
          }
        </p>
        <br></br>
        <p>
          <strong>Scheduling Constraints: </strong>
          {
            modelData.purpose_properties[
              "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingConstraints"
            ]
          }
        </p>
        <br></br>
        <p>
          <strong>Scheduling Objective Function: </strong>
          {
            modelData.purpose_properties[
              "https://www.iop.rwth-aachen.de/PPC/1/1/schedulingObjectiveFunction"
            ]
          }
        </p>
        <br></br>
        <p>
          <strong>Formula: </strong>
          {modelData.purpose_properties.formula}
        </p>
        <br></br>
        <p>
          <strong>Job Name ID: </strong>
          {modelData.input_data[0].job_name.id}
        </p>
        <br></br>
        <p>
          <strong>Job Name DB: </strong>
          {modelData.input_data[0].job_name.db}
        </p>
        <br></br>
        <p>
          <strong>Job Duration ID: </strong>
          {modelData.input_data[1].job_duration.id}
        </p>
        <br></br>
        <p>
          <strong>Job Duration DB: </strong>
          {modelData.input_data[1].job_duration.db}
        </p>
      </div>
    </div>
  );
};

export default Modeldetails;
