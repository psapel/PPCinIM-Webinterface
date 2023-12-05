import MetaDataIMM from "./MetaDataIMM";
import json from "./json/InjectionMoldingMachine-Example-new.json";

const AssetDsc = () => {
  const maxClampingForce = json.conceptDescriptions.find(
    (obj) => obj.idShort === "MaxClampingForce"
  )?.displayName[0].text;

  const maxOpeningStroke = json.conceptDescriptions.find(
    (obj) => obj.idShort === "MaxOpeningStroke"
  )?.displayName[0].text;

  return (
    <>
      <div>
        <p>{maxClampingForce}: </p>

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
              <MetaDataIMM dataType="MaxClampingForce" />
            </p>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
      <div>
        <p>{maxOpeningStroke}: </p>
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
              <MetaDataIMM dataType="MaxOpeningStroke" />
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
