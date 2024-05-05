import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Newmodel = () => {
  const navigate = useNavigate();
  const [modelName, setModelName] = useState("");
  const [modelType, setModelType] = useState("");
  const [modelData, setModelData] = useState(null);
  const [modelAasx, setModelAasx] = useState(null);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  const handleFileChange = (event, setData) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      setData(data);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const dataToSend = {
      modelName,
      modelType,
      modelData,
      modelAasx,
      modelImage: selectedImage,
    };

    try {
      const response = await fetch("http://localhost:5005/testmodel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        console.log("Model created successfully");
        navigate("/models");
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.error || "Error creating model");
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
          onClick={() => navigate("/models")}
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
          Model Name:
          <div>
            <input
              type="text"
              placeholder="Model Name"
              className="input input-bordered input-secondary w-full max-w-xs"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
          </div>
        </div>
        <div className="my-3">
          Model Type:
          <div>
            <select
              className="select select-secondary w-full max-w-xs"
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
            >
              <option disabled selected>
                Model Type
              </option>
              <option>Production Scheduling</option>
              <option>Engineering</option>
              <option>Simulation</option>
              <option>Behavior</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div className="my-3">
          Model Image:
          <div>
            <input
              type="file"
              className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
              onChange={(event) => handleFileChange(event, setSelectedImage)}
            />
          </div>
        </div>
        <div className="my-3">
          Model File:
          <div>
            <input
              type="file"
              className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
              onChange={(event) => handleFileChange(event, setModelData)}
            />
          </div>
        </div>
        <div className="my-3">
          Asset Administration Shell (AASX):
          <div>
            <input
              type="file"
              className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
              onChange={(event) => handleFileChange(event, setModelAasx)}
            />
          </div>
        </div>
        <div>
          <button className="btn btn-wide  text-white bg-secondary hover:bg-primary my-3">
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

export default Newmodel;
