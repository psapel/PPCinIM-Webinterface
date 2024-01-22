import { useNavigate } from "react-router-dom";

const Decisionsupport = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex flex-wrap justify-center">
        <div className="card w-96 bg-base-100 shadow-xl m-4">
          <div className="card-body">
            <h2 className="card-title">&alpha; - Machine Environments</h2>
            <div className="flex flex-col">
              <div className="form-control w-52">
                <label className="cursor-pointer label">
                  <span className="label-text">Single Machine</span>
                  <input type="checkbox" className="toggle toggle-xs" checked />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="card w-96 bg-base-100 shadow-xl m-4">
          <div className="card-body">
            <h2 className="card-title">&beta; - Schedueling Constraints</h2>
            <div className="flex flex-col">
              <div className="form-control w-52">
                <label className="cursor-pointer label">
                  <span className="label-text">Single Machine</span>
                  <input type="checkbox" className="toggle toggle-xs" checked />
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="card w-96 bg-base-100 shadow-xl m-4">
          <div className="card-body">
            <h2 className="card-title">&gamma; - Objective Function</h2>
            <div className="flex flex-col">
              <div className="form-control w-52">
                <label className="cursor-pointer label">
                  <span className="label-text">Single Machine</span>
                  <input type="checkbox" className="toggle toggle-xs" checked />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          className="btn btn-wide  text-white bg-secondary hover:bg-primary"
          onClick={() => navigate("/model-catalogue")}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Decisionsupport;
