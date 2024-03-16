import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Assets = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // const assetTypeToMachineType = {
  //   "Hot Runner Device": "Hot Runner Device",
  //   "Injection Molding Machine": "Injection Molding Machine",
  //   Mold: "Mold",
  //   "Temperature Control Unit": "Temperature Control Unit",
  // };

  const fetchAssets = async () => {
    const url = searchQuery
      ? `http://localhost:5002/api/search_assets?q=${searchQuery}`
      : "http://localhost:5002/api/get_assets";

    try {
      const response = await fetch(url);
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [searchQuery]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div>
      <div className="flex justify-center m-4">
        <input
          type="text"
          placeholder="Search"
          className="input input-bordered input-secondary w-full max-w-xs ml-auto"
          value={searchQuery}
          onChange={handleSearchChange}
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
          assets.map(
            (asset, index) =>
              (asset.assetName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
                asset.assetType
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                asset.assetCategories.some((category) =>
                  category.toLowerCase().includes(searchQuery.toLowerCase())
                )) && (
                <div className="flex justify-center flex-wrap m-4" key={index}>
                  <div className="card w-96 bg-gray-100 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title">{asset.assetName}</h2>
                      <div className="badge badge-outline">
                        {asset.assetType}
                      </div>
                      <div className="flex flex-row space-x-3">
                        {asset.assetCategories.map((category, index) => (
                          <div key={index} className="badge badge-outline">
                            {category}
                          </div>
                        ))}
                      </div>
                      {/* <figure>
                        <img src=""></img>
                      </figure> */}
                      <button
                        className="btn  text-white bg-secondary hover:bg-primary rounded"
                        onClick={() =>
                          navigate(`/asset-details/${asset.assetType}`, {
                            state: { asset },
                          })
                        }
                      >
                        Show Details
                      </button>
                    </div>
                  </div>
                </div>
              )
          )
        ) : (
          <div>No assets found.</div>
        )}
      </div>
    </div>
  );
};

export default Assets;
