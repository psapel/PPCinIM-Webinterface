import { useNavigate, useLocation } from "react-router-dom";
import "./Datasources.css";

const Datadetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state.data;

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
        {data.assetAdministrationShells.map((shell, index) => (
          <div key={index}>
            <h2>{shell.idShort}</h2>
            <p>Display Name: {shell.displayName[0]?.text}</p>
            <p>Version: {shell.administration?.version}</p>
            <p>Revision: {shell.administration?.revision}</p>
            <p>ID: {shell.id}</p>
            <p>Asset Kind: {shell.assetInformation?.assetKind}</p>
            <p>Global Asset ID: {shell.assetInformation?.globalAssetId}</p>
            <p>Asset Type: {shell.assetInformation?.assetType}</p>
            <h3>Submodels:</h3>
            {shell.submodels.map((submodel, submodelIndex) => (
              <div key={submodelIndex}>
                <p>Type: {submodel.type}</p>
                <p>Value: {submodel.keys[0]?.value}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Datadetails;
