import { useNavigate } from "react-router-dom";

const Newmodel = () => {
  const navigate = useNavigate();

  return (
    <div className="m-4 flex-col flex items-center">
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
      <div className="my-3">
        Model Name:
        <div>
          <input
            type="text"
            placeholder="Model Name"
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
      </div>
      <div className="my-3">
        Model Type:
        <div>
          <select className="select select-primary w-full max-w-xs">
            <option disabled selected>
              Model Type
            </option>
            <option disabled selected>
              Behavioral
            </option>
            <option>Optimisation</option>
            <option>Simulation</option>
            <option>Random</option>
            <option>Script</option>
            <option>User Interface</option>
            <option>Query Selector</option>
            <option>Input Provider</option>
            <option disabled selected>
              Structural
            </option>
            <option>SPARQL</option>
            <option>Ontology</option>
          </select>
        </div>
      </div>
      <div className="my-3">
        Model Data Source (Optional):
        <div>
          <select className="select select-primary w-full max-w-xs">
            <option disabled selected>
              Model Data Source
            </option>
            <option>localhost</option>
            <option>GraphDB</option>
            <option>Test SQL</option>
            <option>Odoo - IKV</option>
          </select>
        </div>
      </div>
      <div className="my-3">
        Model Image:
        <div>
          <input
            type="file"
            className="file-input file-input-bordered file-input-primary w-full max-w-xs"
          />
        </div>
      </div>
      <div className="my-3">
        Model File:
        <div>
          <input
            type="file"
            className="file-input file-input-bordered file-input-primary w-full max-w-xs"
          />
        </div>
      </div>
      <div className="my-3">
        Configuration File (Optional):
        <div>
          <input
            type="file"
            className="file-input file-input-bordered file-input-primary w-full max-w-xs"
          />
        </div>
      </div>
      <div>
        <button className="btn btn-wide my-3">Create</button>
      </div>
    </div>
  );
};

export default Newmodel;
