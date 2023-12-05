import json from "./json/InjectionMoldingMachine-Example-new.json";

const MetaDataIMM = ({ dataType }: { dataType: string }) => {
  const concept = json.conceptDescriptions.find(
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
