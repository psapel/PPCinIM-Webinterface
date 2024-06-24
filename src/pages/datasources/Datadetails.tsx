import { useNavigate, useLocation } from "react-router-dom";
import "./Datasources.css";

const Datadetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { datasourceData, datasourceName, datasourceId, datasourceType } =
    location.state;

  const handleDelete = async () => {
    const response = await fetch(
      `http://localhost:5005/delete_datasource/${datasourceId}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      console.log("Model deleted");
      navigate("/data-sources");
    } else {
      console.log("Error deleting data source");
    }
  };

  console.log("Datasource Data:", datasourceData);
  console.log("Datasource Name:", datasourceName);
  console.log("Datasource ID:", datasourceId);
  console.log("Datasource Type:", datasourceType);

  return (
    <div className="center-content">
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
      <div className="datadetailsbox">
        <p>
          <strong>Data Connector Name:</strong> {datasourceName}{" "}
        </p>
        <p>
          <strong>Data Connector Type:</strong> {datasourceType}
        </p>
        <p>
          <strong>URI of the Product:</strong>{" "}
          {
            datasourceData.submodels
              .find((el) => el.idShort === "SoftwareNameplate")
              .submodelElements.find(
                (el) => el.idShort === "SoftwareNameplateType"
              )
              .value.find((el) => el.idShort === "URIOfTheProduct").value
          }
        </p>
        <p>
          <strong>Manufacturer Name:</strong>{" "}
          {
            datasourceData.submodels
              .find((el) => el.idShort === "SoftwareNameplate")
              .submodelElements.find(
                (el) => el.idShort === "SoftwareNameplateType"
              )
              .value.find((el) => el.idShort === "ManufacturerName").value[0]
              .text
          }
        </p>
        <p>
          <strong>Database URL:</strong>
        </p>
        <p>
          <strong>Instance Name:</strong>{" "}
          {
            datasourceData.submodels
              .find((el) => el.idShort === "SoftwareNameplate")
              .submodelElements.find(
                (el) => el.idShort === "SoftwareNameplateInstance"
              )
              .value.find((el) => el.idShort === "InstanceName").value
          }
        </p>
        <p>
          <strong>Username:</strong>{" "}
          {
            datasourceData.submodels
              .find((el) => el.idShort === "UserAdministration")
              .submodelElements.find((el) => el.idShort === "Username").value
          }
        </p>
        <p>
          <strong>Password:</strong>{" "}
          {
            datasourceData.submodels
              .find((el) => el.idShort === "UserAdministration")
              .submodelElements.find((el) => el.idShort === "Password").value
          }
        </p>
        <button className="btn-delete" onClick={handleDelete}>
          <span>&#128465;</span>
        </button>
      </div>
    </div>
  );
};

export default Datadetails;
