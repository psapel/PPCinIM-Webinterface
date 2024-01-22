import { useNavigate } from "react-router-dom";
const Filteredmodel = () => {
  const navigate = useNavigate();
  return (
    <div>
      <button
        className="btn btn-circle btn-outline"
        onClick={() => navigate("/decision-support")}
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
      <div className="flex justify-center m-4">
        <div className="card w-96 bg-base-100 shadow-xl m-4">
          <div className="card-body">
            <h2 className="card-title">Model ID - 00</h2>
            <div className="flex flex-col">
              <div className="form-control w-52">
                <label className="cursor-pointer label">
                  <span className="label-text">Model ID - 00</span>
                  <input type="checkbox" className="toggle toggle-xs" checked />
                </label>
              </div>
            </div>
          </div>
          <button className="btn  text-white bg-secondary hover:bg-primary">
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filteredmodel;
