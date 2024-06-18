import MetaDataIMM from "./MetaDataIMM";
import "./Asset.css";
import { useState } from "react";

const ToggleButton = ({ show, setShow }) => (
  <button
    className="btn btn-xs text-white bg-secondary hover:bg-primary ml-2"
    onClick={() => setShow(!show)}
  >
    {show ? "-" : "+"}
  </button>
);

const AssetDsc = ({
  machineType,
  assetData,
}: {
  machineType: string;
  assetData: {
    submodels: {
      submodelElements: {
        idShort: string;
        value: any[];
      }[];
    }[];
    conceptDescriptions: any[];
  };
}) => {
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
  let handlingDevice;

  if (machineType === "InjectionMoldingMachine") {
    clampingForce = assetData.submodels[0].submodelElements
      .find((el) => el.idShort === "TechnicalProperties")
      .value.find((el) => el.idShort === "ClampingUnitTechnicalProperties")
      .value.find((el) => el.idShort === "BasicData")
      .value.find((el) => el.idShort === "MaxClampingForce").value;

    openingStroke = assetData.submodels[0].submodelElements
      .find((el) => el.idShort === "TechnicalProperties")
      .value.find((el) => el.idShort === "ClampingUnitTechnicalProperties")
      .value.find((el) => el.idShort === "BasicData")
      .value.find((el) => el.idShort === "MaxOpeningStroke").value;
  }

  if (machineType === "HotRunnerSystem") {
    maxHeatingPower = assetData.submodels[0].submodelElements[0].value.find(
      (el) => el.idShort === "MaxHeatingPower"
    ).value;

    maxOperatingTemperature =
      assetData.submodels[0].submodelElements[0].value.find(
        (el) => el.idShort === "MaxOperatingTemperature"
      ).value;
  }

  if (machineType === "InjectionMold") {
    largerMoldDim = assetData.submodels[0].submodelElements[0].value
      .find((el) => el.idShort === "DimAndWeight")
      .value.find((el) => el.idShort === "InjectionMold")
      .value.find((el) => el.idShort === "LargerMoldDimension").value;

    moldDepth = assetData.submodels[0].submodelElements[0].value
      .find((el) => el.idShort === "DimAndWeight")
      .value.find((el) => el.idShort === "InjectionMold")
      .value.find((el) => el.idShort === "MoldDepth").value;

    smallerMoldDim = assetData.submodels[0].submodelElements[0].value
      .find((el) => el.idShort === "DimAndWeight")
      .value.find((el) => el.idShort === "InjectionMold")
      .value.find((el) => el.idShort === "SmallerMoldDimension").value;

    coolant1 = assetData.submodels[0].submodelElements[0].value
      .find((el) => el.idShort === "TemperingSystem")
      .value.find((el) => el.idShort === "Coolant").value[0].text;

    shotVolume = assetData.submodels[0].submodelElements[0].value
      .find((el) => el.idShort === "Cavity")
      .value.find((el) => el.idShort === "ShotVolume").value;
  }

  if (machineType === "TemperatureControlUnit") {
    maxPumpPressure = assetData.submodels[0].submodelElements[0].value.find(
      (el) => el.idShort === "MaxPumpPressure"
    ).value;

    maxHeatingCap = assetData.submodels[0].submodelElements[0].value.find(
      (el) => el.idShort === "MaxHeatingCapacity"
    ).value;

    coolant = assetData.submodels[0].submodelElements[0].value
      .find((el) => el.idShort === "Channels")
      .value.find((el) => el.idShort === "Coolant").value[0].text;
  }

  if (machineType === "HandlingDevice") {
    handlingDevice = assetData.submodels[0].submodelElements
      .find((el) => el.idShort === "TechnicalProperties")
      ?.value.find((el) => el.idShort === "HandlingDevice").value;
  }

  const [showDetails, setShowDetails] = useState(false);
  const [showDetails2, setShowDetails2] = useState(false);
  const [showDetails3, setShowDetails3] = useState(false);
  const [showDetails4, setShowDetails4] = useState(false);
  const [showDetails5, setShowDetails5] = useState(false);

  console.log("assetData", assetData);

  return (
    <div className=" flex flex-col items-start">
      {machineType === "InjectionMoldingMachine" && (
        <div>
          <p>
            <strong>Max Clamping Force: </strong>
            {clampingForce}
            <ToggleButton
              show={showDetails}
              setShow={setShowDetails}
              text="Show Details"
            />
          </p>
          {showDetails && (
            <div className="py-4 asset-description">
              <MetaDataIMM
                assetData={assetData}
                machineType="InjectionMoldingMachine"
                dataType="MaxClampingForce"
              />
            </div>
          )}
          <br></br>
          <p>
            <strong>Max Opening Stroke: </strong>
            {openingStroke}
            <ToggleButton
              show={showDetails2}
              setShow={setShowDetails2}
              text="Show Details"
            />
          </p>
          {showDetails2 && (
            <div className="py-4 asset-description">
              <MetaDataIMM
                assetData={assetData}
                machineType="InjectionMoldingMachine"
                dataType="MaxOpeningStroke"
              />
            </div>
          )}
        </div>
      )}

      {machineType === "HotRunnerSystem" && (
        <div>
          <p>
            <strong>Max Heating Power: </strong>
            {maxHeatingPower}
            <ToggleButton
              show={showDetails}
              setShow={setShowDetails}
              text="Show Details"
            />
          </p>
          {showDetails && (
            <div className="py-4 asset-description">
              <MetaDataIMM
                assetData={assetData}
                machineType="HotRunnerSystem"
                dataType="MaxHeatingPower"
              />
            </div>
          )}
          <br></br>
          <p>
            <strong> Max Operating Temperature: </strong>
            {maxOperatingTemperature}
            <ToggleButton
              show={showDetails2}
              setShow={setShowDetails2}
              text="Show Details"
            />
          </p>
          {showDetails2 && (
            <div className="py-4 asset-description">
              <MetaDataIMM
                assetData={assetData}
                machineType="HotRunnerSystem"
                dataType="MaxOperatingTemperature"
              />
            </div>
          )}
        </div>
      )}

      {machineType === "InjectionMold" && (
        <div>
          <p>
            <strong> Larger Mold Dimension:</strong> {largerMoldDim}
            <ToggleButton
              show={showDetails}
              setShow={setShowDetails}
              text="Show Details"
            />
          </p>
          {showDetails && (
            <div className="py-4 asset-description">
              <MetaDataIMM
                assetData={assetData}
                machineType="InjectionMold"
                dataType="LargerMoldDimension"
              />
            </div>
          )}
          <br></br>
          <p>
            <strong> Mold Depth: </strong>
            {moldDepth}
            <ToggleButton
              show={showDetails2}
              setShow={setShowDetails2}
              text="Show Details"
            />
          </p>
          {showDetails2 && (
            <div className="py-4 asset-description">
              <MetaDataIMM
                assetData={assetData}
                machineType="InjectionMold"
                dataType="MoldDepth"
              />
            </div>
          )}
          <br></br>
          <p>
            <strong> Smaller Mold Dimension:</strong> {smallerMoldDim}
            <ToggleButton
              show={showDetails3}
              setShow={setShowDetails3}
              text="Show Details"
            />
          </p>
          {showDetails3 && (
            <div className="py-4 asset-description">
              <MetaDataIMM
                assetData={assetData}
                machineType="InjectionMold"
                dataType="SmallerMoldDimension"
              />
            </div>
          )}
          <br></br>
          <p>
            <strong> Coolant: </strong>
            {coolant1}
            <ToggleButton
              show={showDetails4}
              setShow={setShowDetails4}
              text="Show Details"
            />
          </p>
          {showDetails4 && (
            <div className="py-4 asset-description">
              <MetaDataIMM
                assetData={assetData}
                machineType="InjectionMold"
                dataType="Coolant"
              />
            </div>
          )}
          <br></br>
          <p>
            <strong> Shot Volume:</strong> {shotVolume}
            <ToggleButton
              show={showDetails5}
              setShow={setShowDetails5}
              text="Show Details"
            />
          </p>
          {showDetails5 && (
            <div className="py-4 asset-description">
              <MetaDataIMM
                assetData={assetData}
                machineType="InjectionMold"
                dataType="ShotVolume"
              />
            </div>
          )}
        </div>
      )}

      {machineType === "TemperatureControlUnit" && (
        <div>
          <p>
            <strong> Max Pump Pressure:</strong> {maxPumpPressure}
            <ToggleButton
              show={showDetails}
              setShow={setShowDetails}
              text="Show Details"
            />
          </p>
          {showDetails && (
            <div className="py-4 asset-description">
              <MetaDataIMM
                assetData={assetData}
                machineType="TemperatureControlUnit"
                dataType="MaxPumpPressure"
              />
            </div>
          )}
          <br></br>
          <p>
            <strong> Max Heating Capacity:</strong> {maxHeatingCap}
            <ToggleButton
              show={showDetails2}
              setShow={setShowDetails2}
              text="Show Details"
            />
          </p>
          {showDetails2 && (
            <div className="py-4 asset-description">
              <MetaDataIMM
                assetData={assetData}
                machineType="TemperatureControlUnit"
                dataType="MaxHeatingCapacity"
              />
            </div>
          )}
          <br></br>
          <p>
            <strong> Coolant: </strong> {coolant}
            <ToggleButton
              show={showDetails3}
              setShow={setShowDetails3}
              text="Show Details"
            />
          </p>
          {showDetails3 && (
            <div className="py-4 asset-description">
              <MetaDataIMM
                assetData={assetData}
                machineType="TemperatureControlUnit"
                dataType="Coolant"
              />
            </div>
          )}
        </div>
      )}

      {machineType === "HandlingDevice" && (
        <div>
          <p>
            <strong> Handling Device:</strong> {handlingDevice}
            <ToggleButton
              show={showDetails}
              setShow={setShowDetails}
              text="Show Details"
            />
          </p>
          {showDetails && (
            <div className="py-4 asset-description">
              <MetaDataIMM
                assetData={assetData}
                machineType="HandlingDevice"
                dataType="handlingDevice"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssetDsc;
