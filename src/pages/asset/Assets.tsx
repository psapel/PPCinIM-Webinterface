import { useNavigate } from "react-router-dom";

const Assets = () => {
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
          onClick={() => navigate("/new-asset")}
        >
          Create New Asset
        </button>
      </div>
      <div className="flex justify-center flex-wrap m-4">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">
              {" "}
              AIRBURG A520
              <div className="badge badge-outline">Injection</div>
              <div className="badge badge-outline">Optics</div>
            </h2>
            <figure>
              <img src=""></img>
            </figure>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/asset-details")}
            >
              Show Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assets;
