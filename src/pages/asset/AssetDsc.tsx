import MetaDataIMM from "./MetaDataIMM";
import immJson from "./json/InjectionMoldingMachine-v2.json";
import moldJson from "./json/InjectionMold-v2.json";
import hrdJson from "./json/HotRunnerDevice-v2.json";
import tcuJson from "./json/TemperatureControlUnit-v2.json";
import "./Asset.css";
import { useState } from "react";

const ToggleButton = ({ show, setShow, text }) => (
  <button
    className="btn btn-xs text-white bg-secondary hover:bg-primary ml-2"
    onClick={() => setShow(!show)}
  >
    {show ? "-" : "+"}
  </button>
);

const AssetDsc = ({ machineType }: { machineType: string }) => {
  const json = {
    IMM: immJson,
    Mold: moldJson,
    HRD: hrdJson,
    TCU: tcuJson,
  }[machineType];

  let clampingForce;
  let openingStroke;
  let maxHeatingPower;
  let maxOperatingTemperature;
  let maxPumpPressure;
  let moldDepth;
  let largerMoldDim;
  let smallerMoldDim;
  let coolant1;
  let shotVolume;
  let maxHeatingCap;
  let coolant;

  if (machineType === "IMM") {
    clampingForce = json.submodels[0].submodelElements
      .find((el) => el.idShort === "TechnicalProperties")
      .value.find((el) => el.idShort === "ClampingUnitTechnicalProperties")
      .value.find((el) => el.idShort === "BasicData")
      .value.find((el) => el.idShort === "MaxClampingForce").value;

    openingStroke = json.submodels[0].submodelElements
      .find((el) => el.idShort === "TechnicalProperties")
      .value.find((el) => el.idShort === "ClampingUnitTechnicalProperties")
      .value.find((el) => el.idShort === "BasicData")
      .value.find((el) => el.idShort === "MaxOpeningStroke").value;
  }

  if (machineType === "HRD") {
    maxHeatingPower = json.submodels[0].submodelElements[0].value.find(
      (el) => el.idShort === "MaxHeatingPower"
    ).value;

    maxOperatingTemperature = json.conceptDescriptions.find(
      (el) => el.idShort === "MaxOperatingTemperature"
    ).value;
  }

  if (machineType === "Mold") {
    largerMoldDim = json.submodels[0].submodelElements[0].value
      .find((el) => el.idShort === "DimAndWeight")
      .value.find((el) => el.idShort === "InjectionMold")
      .value.find((el) => el.idShort === "LargerMoldDimension").value;

    moldDepth = json.submodels[0].submodelElements[0].value
      .find((el) => el.idShort === "DimAndWeight")
      .value.find((el) => el.idShort === "InjectionMold")
      .value.find((el) => el.idShort === "MoldDepth").value;

    smallerMoldDim = json.submodels[0].submodelElements[0].value
      .find((el) => el.idShort === "DimAndWeight")
      .value.find((el) => el.idShort === "InjectionMold")
      .value.find((el) => el.idShort === "SmallerMoldDimension").value;

    coolant1 = json.submodels[0].submodelElements[0].value
      .find((el) => el.idShort === "TemperingSystem")
      .value.find((el) => el.idShort === "Coolant").value[0].text;

    shotVolume = json.submodels[0].submodelElements[0].value
      .find((el) => el.idShort === "Cavity")
      .value.find((el) => el.idShort === "ShotVolume").value;
  }

  if (machineType === "TCU") {
    maxPumpPressure = json.submodels[0].submodelElements[0].value.find(
      (el) => el.idShort === "MaxPumpPressure"
    ).value;

    maxHeatingCap = json.submodels[0].submodelElements[0].value.find(
      (el) => el.idShort === "MaxHeatingCapacity"
    ).value;

    coolant = json.submodels[0].submodelElements[0].value
      .find((el) => el.idShort === "Channels")
      .value.find((el) => el.idShort === "Coolant").value[0].text;
  }

  const [showDetails, setShowDetails] = useState(false);
  const [showDetails2, setShowDetails2] = useState(false);
  const [showDetails3, setShowDetails3] = useState(false);
  const [showDetails4, setShowDetails4] = useState(false);
  const [showDetails5, setShowDetails5] = useState(false);

  return (
    <div className=" flex flex-col items-start">
      <div>
        {machineType === "IMM" && (
          <>
            <p>
              Max Clamping Force: {clampingForce}
              <ToggleButton
                show={showDetails}
                setShow={setShowDetails}
                text="Show Details"
              />
            </p>
            {showDetails && (
              <div className="py-4 asset-description">
                <MetaDataIMM machineType="IMM" dataType="MaxClampingForce" />
              </div>
            )}

            <p>
              Max Opening Stroke: {openingStroke}
              <ToggleButton
                show={showDetails2}
                setShow={setShowDetails2}
                text="Show Details"
              />
            </p>
            {showDetails2 && (
              <div className="py-4 asset-description">
                <MetaDataIMM machineType="IMM" dataType="MaxOpeningStroke" />
              </div>
            )}
          </>
        )}
      </div>

      <div>
        {machineType === "HRD" && (
          <>
            <p>
              Max Heating Power: {maxHeatingPower}
              <ToggleButton
                show={showDetails}
                setShow={setShowDetails}
                text="Show Details"
              />
            </p>
            {showDetails && (
              <div className="py-4 asset-description">
                <MetaDataIMM machineType="HRD" dataType="MaxHeatingPower" />
              </div>
            )}

            <p>
              Max Operating Temperature: {maxOperatingTemperature}
              <ToggleButton
                show={showDetails2}
                setShow={setShowDetails2}
                text="Show Details"
              />
            </p>
            {showDetails2 && (
              <div className="py-4 asset-description">
                <MetaDataIMM
                  machineType="HRD"
                  dataType="MaxOperatingTemperature"
                />
              </div>
            )}
          </>
        )}
      </div>

      <div>
        {machineType === "Mold" && (
          <>
            <p>
              Larger Mold Dimension: {largerMoldDim}
              <ToggleButton
                show={showDetails}
                setShow={setShowDetails}
                text="Show Details"
              />
            </p>
            {showDetails && (
              <div className="py-4 asset-description">
                <MetaDataIMM
                  machineType="Mold"
                  dataType="LargerMoldDimension"
                />
              </div>
            )}
            <p>
              Mold Depth: {moldDepth}
              <ToggleButton
                show={showDetails2}
                setShow={setShowDetails2}
                text="Show Details"
              />
            </p>
            {showDetails2 && (
              <div className="py-4 asset-description">
                <MetaDataIMM machineType="Mold" dataType="MoldDepth" />
              </div>
            )}
            <p>
              Smaller Mold Dimension: {smallerMoldDim}
              <ToggleButton
                show={showDetails3}
                setShow={setShowDetails3}
                text="Show Details"
              />
            </p>
            {showDetails3 && (
              <div className="py-4 asset-description">
                <MetaDataIMM
                  machineType="Mold"
                  dataType="SmallerMoldDimension"
                />
              </div>
            )}
            <p>
              Coolant: {coolant1}
              <ToggleButton
                show={showDetails4}
                setShow={setShowDetails4}
                text="Show Details"
              />
            </p>
            {showDetails4 && (
              <div className="py-4 asset-description">
                <MetaDataIMM machineType="Mold" dataType="Coolant" />
              </div>
            )}
            <p>
              Shot Volume: {shotVolume}
              <ToggleButton
                show={showDetails5}
                setShow={setShowDetails5}
                text="Show Details"
              />
            </p>
            {showDetails5 && (
              <div className="py-4 asset-description">
                <MetaDataIMM machineType="Mold" dataType="ShotVolume" />
              </div>
            )}
          </>
        )}
      </div>

      <div>
        {machineType === "TCU" && (
          <>
            <p>
              Max Pump Pressure: {maxPumpPressure}
              <ToggleButton
                show={showDetails}
                setShow={setShowDetails}
                text="Show Details"
              />
            </p>
            {showDetails && (
              <div className="py-4 asset-description">
                <MetaDataIMM machineType="TCU" dataType="MaxPumpPressure" />
              </div>
            )}
            <p>
              Max Heating Capacity: {maxHeatingCap}
              <ToggleButton
                show={showDetails2}
                setShow={setShowDetails2}
                text="Show Details"
              />
            </p>
            {showDetails2 && (
              <div className="py-4 asset-description">
                <MetaDataIMM machineType="TCU" dataType="MaxHeatingCapacity" />
              </div>
            )}
            <p>
              Coolant: {coolant}
              <ToggleButton
                show={showDetails3}
                setShow={setShowDetails3}
                text="Show Details"
              />
            </p>
            {showDetails3 && (
              <div className="py-4 asset-description">
                <MetaDataIMM machineType="TCU" dataType="Coolant" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AssetDsc;
