import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const Assets = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);

  const assetTypeToMachineType = {
    "Hot Runner Device": "HRD",
    "Injection Molding Machine": "IMM",
    Mold: "Mold",
    "Temperature Control Unit": "TCU",
  };

  useEffect(() => {
    const fetchAssets = async () => {
      const response = await fetch("http://localhost:5000/api/get_assets");
      const data = await response.json();
      setAssets(data);
    };
    fetchAssets();
  }, []);

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
        {assets && assets.length > 0 ? (
          assets.map((asset, index) => (
            <div className="flex justify-center flex-wrap m-4" key={index}>
              <div className="card w-96 bg-gray-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">
                    {asset.assetName}
                    <div className="badge badge-outline">{asset.assetType}</div>
                    <div className="flex flex-col">
                      {asset.assetCategories.map((category, index) => (
                        <div key={index} className="badge badge-outline">
                          {category}
                        </div>
                      ))}
                    </div>
                  </h2>
                  <button
                    className="btn  text-white bg-secondary hover:bg-primary rounded"
                    onClick={() =>
                      navigate(
                        `/asset-details/${
                          assetTypeToMachineType[asset.assetType]
                        }`
                      )
                    }
                  >
                    Show Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>No assets found.</div>
        )}
      </div>
    </div>
  );
};

export default Assets;
