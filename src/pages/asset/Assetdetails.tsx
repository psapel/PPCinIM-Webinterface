import { useNavigate, useLocation } from "react-router-dom";

import AssetDsc from "./AssetDsc";

import "./Asset.css";

const AssetDetails = () => {
  const navigate = useNavigate();
  const { asset } = useLocation().state;
  const machineType = asset.assetType;

  const manufacturer = asset.assetData.submodels
    .find((el) => el.idShort === "Nameplate")
    ?.submodelElements.find((el) => el.idShort === "ManufacturerName")
    .value[0].text;

  console.log("AssetDetails", asset);

  return (
    <div className="description-box flex flex-col items-center justify-center ">
      <button
        className="btn btn-circle btn-outline mb-4"
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
      <div className="textbox">
        <p>
          <strong>Name:</strong> {asset.assetName}{" "}
        </p>
        <br></br>
        <p>
          <strong>Manufacturer: </strong>
          {manufacturer}
        </p>
        <br></br>
        <AssetDsc
          machineType={machineType as string}
          assetData={asset.assetData}
        />
      </div>
    </div>
  );
};

export default AssetDetails;
