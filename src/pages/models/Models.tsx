import { useNavigate } from "react-router-dom";

const Models = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-center m-4">
        <input
          type="text"
          placeholder="Search"
          className="input input-bordered input-primary w-full max-w-xs ml-auto"
        />
        <button
          className="btn btn-primary mr-3 ml-auto"
          onClick={() => navigate("/new-model")}
        >
          Create New Model
        </button>
      </div>

      <div className="flex justify-center flex-wrap m-4">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title"> OptModelSelector</h2>
            <div className="badge badge-outline">Behavioral</div>
            <div className="badge badge-outline">User Interface</div>
            <figure>
              <img src=""></img>
            </figure>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/model-details")}
            >
              Show Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Models;
