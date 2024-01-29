import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Newasset = () => {
  const navigate = useNavigate();
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("");
  const [assetData, setAssetData] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      setAssetData(data);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log({
      assetName,
      assetType,
      assetData,
    });
    navigate("/assets");
  };

  return (
    <form onSubmit={handleSubmit} className="m-4 flex-col flex items-center">
      <div className="m-4 flex-col flex items-center">
        <button
          className="btn btn-circle btn-outline"
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
        <div className="my-3">
          Asset Name:
          <div>
            <input
              type="text"
              placeholder="Asset Name"
              className="input input-bordered input-secondary w-full max-w-xs"
            />
          </div>
        </div>
        <div className="my-3">
          Asset Type:
          <div>
            <select className="select select-secondary w-full max-w-xs">
              <option disabled selected>
                Asset Type
              </option>
              <option>Injection Molding Machine</option>
              <option>Mold</option>
              <option>Temperature Control Unit</option>
              <option>Hot Runner Device</option>
            </select>
          </div>
        </div>
        <div className="my-3">
          Asset Administration Shell
          <div>
            <input
              type="file"
              className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <div>
          <button className="btn btn-wide  text-white bg-secondary hover:bg-primary my-3">
            Create
          </button>
        </div>
      </div>
    </form>
  );
};

export default Newasset;
