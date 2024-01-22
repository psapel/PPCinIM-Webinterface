import { useNavigate } from "react-router-dom";

const Assets = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-center m-4">
        <input
          type="text"
          placeholder="Search"
          className="input input-bordered input-secondary w-full max-w-xs ml-auto"
        />
        <button
          className="btn  text-white bg-secondary hover:bg-primary mr-3 ml-auto"
          onClick={() => navigate("/new-asset")}
        >
          Create New Asset
        </button>
      </div>
      <div className="flex justify-center flex-wrap mt-3 rounded-10 w-full mx-auto m-5 p-5">
        <div className="flex justify-center flex-wrap m-4 ">
          <div className="card w-96 bg-gray-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                {" "}
                ARBURG A520
                <div className="badge badge-outline">Injection</div>
                <div className="badge badge-outline">Optics</div>
              </h2>
              <figure>
                <img src=""></img>
              </figure>
              <button
                className="btn  text-white bg-secondary hover:bg-primary rounded"
                onClick={() => navigate("/asset-details/IMM")}
              >
                Show Details
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center flex-wrap m-4">
          <div className="card w-96 bg-gray-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                {" "}
                NAME
                <div className="badge badge-outline">Mold</div>
                <div className="badge badge-outline">Optics</div>
              </h2>
              <figure>
                <img src=""></img>
              </figure>
              <button
                className="btn  text-white bg-secondary hover:bg-primary rounded"
                onClick={() => navigate("/asset-details/Mold")}
              >
                Show Details
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center flex-wrap m-4">
          <div className="card w-96 bg-gray-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                {" "}
                NAME
                <div className="badge badge-outline">
                  Temperature Control Unit
                </div>
                <div className="badge badge-outline">Optics</div>
              </h2>
              <figure>
                <img src=""></img>
              </figure>
              <button
                className="btn text-white bg-secondary hover:bg-primary rounded"
                onClick={() => navigate("/asset-details/TCU")}
              >
                Show Details
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center flex-wrap m-4">
          <div className="card w-96 bg-gray-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                {" "}
                NAME
                <div className="badge badge-outline">Hot Runner Device</div>
                <div className="badge badge-outline">Optics</div>
              </h2>
              <figure>
                <img src=""></img>
              </figure>
              <button
                className="btn  text-white bg-secondary hover:bg-primary rounded"
                onClick={() => navigate("/asset-details/HRD")}
              >
                Show Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assets;
