import { useNavigate } from "react-router-dom";

const AssetDetails = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center m-4">
      <button
        className="btn btn-circle btn-outline mb-4"
        onClick={() => navigate("/assets")}
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
      <div>
        <p>Name:</p>
        <p>Manufacturer:</p>
        <p>Maximum Clamping Force:</p>
        <p>Maximum Opening Stroke:</p>
      </div>
    </div>
  );
};

export default AssetDetails;
