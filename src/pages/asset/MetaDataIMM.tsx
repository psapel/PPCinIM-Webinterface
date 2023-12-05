import immJson from "./json/InjectionMoldingMachine-v2.json";
import moldJson from "./json/InjectionMold-v2.json";
import hrdJson from "./json/HotRunnerDevice-v2.json";
import tcuJson from "./json/TemperatureControlUnit-v2.json";

const MetaDataIMM = ({
  dataType,
  machineType,
}: {
  dataType: string;
  machineType: string;
}) => {
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

  const concept = json?.conceptDescriptions.find(
    (obj) => obj.idShort === dataType
  );

  const descriptionClamp = concept?.description?.[0]?.text;

  const dataSpecContent =
    concept?.embeddedDataSpecifications?.[0]?.dataSpecificationContent;
  const unitClamp = dataSpecContent?.unit;
  const unitSym = dataSpecContent?.symbol;
  const valueFormat = dataSpecContent?.valueFormat;

  // const descriptionClamp = json.conceptDescriptions?.find(
  //   (obj) => obj.idShort === dataType
  // )?.description[0]?.text;

  // const unitClamp = json.conceptDescriptions.find(
  //   (obj) => obj.idShort === dataType
  // )?.embeddedDataSpecifications[0]?.dataSpecificationContent.unit;

  // const unitSym = json.conceptDescriptions.find(
  //   (obj) => obj.idShort === dataType
  // )?.embeddedDataSpecifications[0]?.dataSpecificationContent.symbol;

  // const valueFormat = json.conceptDescriptions.find(
  //   (obj) => obj.idShort === dataType
  // )?.embeddedDataSpecifications[0]?.dataSpecificationContent.valueFormat;

  return (
    <>
      <p>Description: {descriptionClamp}</p>
      <p>Unit: {unitClamp} </p>
      <p>Symbol: {unitSym} </p>
      <p>Value Format: {valueFormat} </p>
    </>
  );
};

export default MetaDataIMM;
