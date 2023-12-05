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

  // if (machineType === "IMM") {
  //   const maxClampingForce = json.conceptDescriptions.find(
  //     (obj) => obj.idShort === "MaxClampingForce"
  //   )?.displayName[0].text;

  //   const maxOpeningStroke = json.conceptDescriptions.find(
  //     (obj) => obj.idShort === "MaxOpeningStroke"
  //   )?.displayName[0].text;
  // } else if (machineType === "Mold") {
  //   const moldDepth = json.conceptDescriptions.find(
  //     (obj) => obj.idShort === "MoldDepth"
  //   )?.displayName[0].text;
  // }

  return (
    <>
      <div>
        <p>{machineType === "IMM" && "Max Clamping Force"}: </p>
        <p>{machineType === "Mold" && "Larger Mold Dimension"}: </p>
        <p>{machineType === "HRD" && "Max Heating Power"}: </p>
        <p>{machineType === "TCU" && "Max Pump Pressure"}: </p>

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
        <p>{machineType === "IMM" && "Max Opening Stroke"}: </p>
        <p>{machineType === "Mold" && "Mold Depth"}: </p>
        <p>{machineType === "HRD" && "Max Operating Temperature"}: </p>
        <p>{machineType === "TCU" && "Max Heating Capacity"}: </p>
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
        <p>{machineType === "Mold" && "Smaller Mold Dimension"}: </p>

        <p>{machineType === "TCU" && "Coolant"}: </p>
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
        <p>{machineType === "Mold" && "Coolant"}: </p>

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
        <p>{machineType === "Mold" && "Shot Volume"}: </p>
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
