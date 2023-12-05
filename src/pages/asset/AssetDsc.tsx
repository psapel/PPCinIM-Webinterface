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
        <p>{machineType === "Mold" && "Random"}: </p>

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
