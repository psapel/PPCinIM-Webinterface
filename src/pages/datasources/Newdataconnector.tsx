import { useNavigate } from "react-router-dom";

const Newmodel = () => {
  const navigate = useNavigate();

  return (
    <div className="m-4 flex-col flex items-center">
      <button
        className="btn btn-circle btn-outline"
        onClick={() => navigate("/data-sources")}
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
        Data Connector Name:
        <div>
          <input
            type="text"
            placeholder="Data Connector Name"
            className="input input-bordered input-secondary w-full max-w-xs"
          />
        </div>
      </div>
      <div className="my-3">
        Data Connector Type:
        <div>
          <select className="select select-secondary w-full max-w-xs">
            <option disabled selected>
              Data Connector Type
            </option>
            <option>SPARQL</option>
            <option>SQL</option>
            <option>Odoo</option>
            <option>MongoDB</option>
          </select>
        </div>
      </div>
      <div className="my-3">
        Data Connector Image:
        <div>
          <input
            type="file"
            className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
          />
        </div>
      </div>
      <div>
        <button className="btn btn-wide  text-white bg-secondary hover:bg-primary my-3">
          Create
        </button>
      </div>
    </div>
  );
};

export default Newmodel;
