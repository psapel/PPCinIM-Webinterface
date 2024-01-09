import MetaDataIMM from "./MetaDataIMM";
import immJson from "./json/InjectionMoldingMachine-v2.json";
import moldJson from "./json/InjectionMold-v2.json";
import hrdJson from "./json/HotRunnerDevice-v2.json";
import tcuJson from "./json/TemperatureControlUnit-v2.json";

const AssetDsc = ({ machineType }: { machineType: string }) => {
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

  return (
    <>
      <div>
        <p>{machineType === "IMM" && `Max Clamping Force: ${clampingForce}`}</p>
        <p>
          {machineType === "Mold" && `Larger Mold Dimension: ${largerMoldDim}`}
        </p>
        <p>
          {machineType === "HRD" && `Max Heating Power: ${maxHeatingPower}`}
        </p>
        <p>
          {machineType === "TCU" && `Max Pump Pressure: ${maxPumpPressure}`}
        </p>

        <button
          className="btn"
          onClick={() => document.getElementById("my_modal_2").showModal()}
        >
          more details
        </button>
        <dialog id="my_modal_2" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg"></h3>
            <p className="py-4">
              {machineType === "IMM" && (
                <MetaDataIMM machineType="IMM" dataType="MaxClampingForce" />
              )}
              {machineType === "Mold" && (
                <MetaDataIMM
                  machineType="Mold"
                  dataType="LargerMoldDimension"
                />
              )}
              {machineType === "HRD" && (
                <MetaDataIMM machineType="HRD" dataType="MaxHeatingPower" />
              )}
              {machineType === "TCU" && (
                <MetaDataIMM machineType="TCU" dataType="MaxPumpPressure" />
              )}
            </p>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
      <div>
        <p>{machineType === "IMM" && `Max Opening Stroke: ${openingStroke}`}</p>
        <p>{machineType === "Mold" && `Mold Depth: ${moldDepth}`} </p>
        <p>
          {machineType === "HRD" &&
            `Max Operating Temperature: ${maxOperatingTemperature}`}
        </p>
        <p>
          {machineType === "TCU" && `Max Heating Capacity: ${maxHeatingCap}`}
        </p>
        <button
          className="btn"
          onClick={() => document.getElementById("my_modal_3").showModal()}
        >
          more details
        </button>
        <dialog id="my_modal_3" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg"></h3>
            <p className="py-4">
              {machineType === "IMM" && (
                <MetaDataIMM machineType="IMM" dataType="MaxOpeningStroke" />
              )}
              {machineType === "Mold" && (
                <MetaDataIMM machineType="Mold" dataType="MoldDepth" />
              )}
              {machineType === "HRD" && (
                <MetaDataIMM
                  machineType="HRD"
                  dataType="MaxOperatingTemperature"
                />
              )}
              {machineType === "TCU" && (
                <MetaDataIMM machineType="TCU" dataType="MaxHeatingCapacity" />
              )}
            </p>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
      <div>
        <p>
          {machineType === "Mold" &&
            `Smaller Mold Dimension: ${smallerMoldDim}`}
        </p>

        <p>{machineType === "TCU" && `Coolant: ${coolant}`} </p>
        <button
          className="btn"
          onClick={() => document.getElementById("my_modal_4").showModal()}
        >
          more details
        </button>
        <dialog id="my_modal_4" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg"></h3>
            <p className="py-4">
              {machineType === "Mold" && (
                <MetaDataIMM
                  machineType="Mold"
                  dataType="SmallerMoldDimension"
                />
              )}

              {machineType === "TCU" && (
                <MetaDataIMM machineType="TCU" dataType="Coolant" />
              )}
            </p>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
      <div>
        <p>{machineType === "Mold" && `Coolant: ${coolant1}`} </p>

        <button
          className="btn"
          onClick={() => document.getElementById("my_modal_5").showModal()}
        >
          more details
        </button>
        <dialog id="my_modal_5" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg"></h3>
            <p className="py-4">
              {machineType === "Mold" && (
                <MetaDataIMM machineType="Mold" dataType="Coolant" />
              )}
            </p>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
      <div>
        <p>{machineType === "Mold" && `Shot Volume: ${shotVolume}`} </p>
        <button
          className="btn"
          onClick={() => document.getElementById("my_modal_6").showModal()}
        >
          more details
        </button>
        <dialog id="my_modal_6" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg"></h3>
            <p className="py-4">
              {machineType === "Mold" && (
                <MetaDataIMM machineType="Mold" dataType="ShotVolume" />
              )}
            </p>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </>
  );
};

export default AssetDsc;
