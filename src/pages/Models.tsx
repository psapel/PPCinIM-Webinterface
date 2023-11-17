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

      <div className="card w-96 bg-base-100 shadow-xl m-5">
        <figure>
          <img src="" alt="Pic" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">Model Name</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Show Details</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Models;
