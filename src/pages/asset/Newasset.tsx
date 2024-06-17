import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Newasset = () => {
  const navigate = useNavigate();
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("");
  const [assetData, setAssetData] = useState(null);
  const [assetCategories, setAssetCategories] = useState([""]);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  const availableImage = [
    "images/imagetest.jpg",
    "images/imagetest2.jpg",
    "images/imagetest3.jpg",
    "images/arburg.jpg",
    "images/engel.jpg",
    "images/km.jpg",
    "images/sumitomo.jpg",
    "images/gwk.jpg",
    "images/oni.jpg",
  ];

  // const handleImageChange = (event) => {
  //   setSelectedImage(event.target.value);
  // };

  const handleAddCategory = () => {
    if (assetCategories.length < 4) {
      setAssetCategories([...assetCategories, ""]);
    }
  };

  const handleRemoveCategory = (index) => {
    const newAssetCategories = [...assetCategories];
    newAssetCategories.splice(index, 1);
    setAssetCategories(newAssetCategories);
  };

  const handleCategoryChange = (index, event) => {
    const newAssetCategories = [...assetCategories];
    newAssetCategories[index] = event.target.value;
    setAssetCategories(newAssetCategories);
  };

  const handleJsonFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      setAssetData(data);
    };
    reader.readAsText(file);
  };
  // const handleAasxFileChange = (event) => {
  //   const file = event.target.files[0];
  //   const reader = new FileReader();
  //   reader.onload = (event) => {
  //     const data = JSON.parse(event.target.result);
  //     setAssetData(data);
  //   };
  //   reader.readAsText(file);
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const dataToSend = {
      assetName,
      assetType,
      assetData,
      assetCategories,
      assetImage: selectedImage,
    };

    try {
      const response = await fetch("http://localhost:5005/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        console.log("Asset created successfully");
        navigate("/assets");
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.error || "Error creating asset");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to connect to the server");
    }
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
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
            />
          </div>
        </div>
        <div className="my-3">
          Asset Type:
          <div>
            <select
              className="select select-secondary w-full max-w-xs"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
            >
              <option disabled value="">
                Asset Type
              </option>
              <option value="InjectionMoldingMachine">
                Injection Molding Machine
              </option>
              <option value="InjectionMold">Mold</option>
              <option value="TemperatureControlUnit">
                Temperature Control Unit
              </option>
              <option value="Hot Runner Device">Hot Runner Device</option>
            </select>
          </div>
        </div>

        <div className="my-3">
          {assetCategories.map((category, index) => (
            <div key={index}>
              Asset Category:
              <div>
                <input
                  type="text"
                  placeholder="Asset Category"
                  className="input input-bordered input-secondary w-full max-w-xs"
                  value={category}
                  onChange={(event) => handleCategoryChange(index, event)}
                />
                {assetCategories.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-xs text-white bg-secondary hover:bg-primary ml-2"
                    onClick={() => handleRemoveCategory(index)}
                  >
                    -
                  </button>
                )}
              </div>
            </div>
          ))}
          {assetCategories.length < 4 && (
            <button
              type="button"
              className="btn btn-xs text-white bg-secondary hover:bg-primary ml-2"
              onClick={handleAddCategory}
            >
              +
            </button>
          )}
        </div>

        <div className="my-3">
          Image:
          <div>
            <select
              className="select select-secondary w-full max-w-xs"
              value={selectedImage}
              onChange={(e) => setSelectedImage(e.target.value)}
            >
              <option disabled value="">
                Select an image
              </option>
              {availableImage.map((image, index) => (
                <option key={index} value={image}>
                  {image}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="my-3">
          Asset Administration Shell Json
          <div>
            <input
              type="file"
              className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
              onChange={handleJsonFileChange}
            />
          </div>
        </div>
        {/* <div className="my-3">
          Asset Administration Shell Aasx
          <div>
            <input
              type="file"
              className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
              onChange={handleAasxFileChange}
            />
          </div>
        </div> */}
        <div>
          <button className="btn btn-wide text-white bg-secondary hover:bg-primary my-3">
            Create
          </button>
        </div>
        {error && (
          <div className="text-red-500">
            <p>{error}</p>
          </div>
        )}
      </div>
    </form>
  );
};

export default Newasset;
