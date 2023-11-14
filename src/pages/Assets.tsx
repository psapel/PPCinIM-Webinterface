import { useNavigate } from "react-router-dom";

const Assets = () => {
  const navigate = useNavigate();

  return (
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
  );
};

export default Assets;
