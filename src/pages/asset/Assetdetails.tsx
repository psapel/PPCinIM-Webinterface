import { useNavigate, useParams } from "react-router-dom";
import AssetDsc from "./AssetDsc";
import immJson from "./json/InjectionMoldingMachine-v2.json";
import moldJson from "./json/InjectionMold-v2.json";
import hrdJson from "./json/HotRunnerDevice-v2.json";
import tcuJson from "./json/TemperatureControlUnit-v2.json";
import "./Asset.css";

const AssetDetails = () => {
  const navigate = useNavigate();
  const { machineType } = useParams();

  let json;
  if (machineType === "IMM") {
    json = immJson;
  } else if (machineType === "Mold") {
    json = moldJson;
  } else if (machineType === "HRD") {
    json = hrdJson;
  } else if (machineType === "TCU") {
    json = tcuJson;
  }

  const manufacturer = json.submodels
    .find((el) => el.idShort === "Nameplate")
    ?.submodelElements.find((el) => el.idShort === "ManufacturerName")
    .value[0].text;

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
        <p>Name:</p>
        <br></br>
        <p>Manufacturer:{manufacturer}</p>
        <br></br>
        <AssetDsc machineType={machineType as string} />
      </div>
    </div>
  );
};

export default AssetDetails;
