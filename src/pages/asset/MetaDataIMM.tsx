const MetaDataIMM = ({
  dataType,
  assetData,
}: {
  dataType: string;
  assetData: any;
}) => {
  const concept = assetData?.conceptDescriptions.find(
    (obj) => obj.idShort === dataType
  );

  const descriptionClamp = concept?.description?.[0]?.text;

  const dataSpecContent =
    concept?.embeddedDataSpecifications?.[0]?.dataSpecificationContent;
  const unitClamp = dataSpecContent?.unit;
  const unitSym = dataSpecContent?.symbol;
  const valueFormat = dataSpecContent?.valueFormat;

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
