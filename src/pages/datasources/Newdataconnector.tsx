import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Newdataconnector = () => {
  const navigate = useNavigate();
  const [dataSourceName, setDataSourceName] = useState("");
  const [dataSourceType, setDataSourceType] = useState("");
  const [dataSourceData, setDataSourceData] = useState(null);
  const [error, setError] = useState(null);

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
      dataSourceName,
      dataSourceType,
      dataSourceData,
    };

    try {
      const response = await fetch("http://localhost:5005/datasource", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        console.log("Data source created successfully");
        navigate("/data-sources");
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.error || "Error creating data source");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to connect to the server");
    }
  };

  return (
    <div className="m-4 flex-col flex items-center">
      <button
        className="btn btn-circle btn-outline"
        onClick={() => navigate("/data-sources")}
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
      <form onSubmit={handleSubmit} className="m-4 flex-col flex items-center">
        <div className="my-3">
          Data Connector Name:
          <div>
            <input
              type="text"
              placeholder="Data Connector Name"
              className="input input-bordered input-secondary w-full max-w-xs"
              value={dataSourceName}
              onChange={(e) => setDataSourceName(e.target.value)}
            />
          </div>
        </div>
        <div className="my-3">
          Data Connector Type:
          <div>
            <select
              className="select select-secondary w-full max-w-xs"
              value={dataSourceType}
              onChange={(e) => setDataSourceType(e.target.value)}
            >
              <option disabled selected>
                Data Connector Type
              </option>
              <option>SPARQL</option>
              <option>SQL</option>
              <option>Odoo</option>
              <option>MongoDB</option>
            </select>
          </div>
        </div>
        <div className="my-3">
          Data Connector Json:
          <div>
            <input
              type="file"
              className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
              onChange={(e) => handleFileChange(event, setDataSourceData)}
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="btn btn-wide text-white bg-secondary hover:bg-primary my-3"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default Newdataconnector;
