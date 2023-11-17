import { useNavigate } from "react-router-dom";

const Datasources = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center m-4">
      <button
        className="btn btn-primary mr-3 ml-auto"
        onClick={() => navigate("/new-data-connector")}
      >
        Create New Data Connector
      </button>
    </div>
  );
};

export default Datasources;
