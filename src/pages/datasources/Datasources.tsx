import { useNavigate } from "react-router-dom";
import odoo from "./jsonFiles/odoo.json";

const datasources = [odoo];
const Datasources = () => {
  const navigate = useNavigate();
  const name = odoo.assetAdministrationShells[0].displayName[0].text;
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
          onClick={() => navigate("/new-data-connector")}
        >
          Create New Data Connector
        </button>
      </div>
      <div className="flex justify-center flex-wrap m-4">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title"> {name}</h2>
            {/* <figure>
              <img src=""></img>
            </figure> */}
            <button
              className="btn  text-white bg-secondary hover:bg-primary"
              onClick={() =>
                navigate(`/data-details/${encodeURIComponent(name)}`, {
                  state: { data: odoo },
                })
              }
            >
              Show Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Datasources;
