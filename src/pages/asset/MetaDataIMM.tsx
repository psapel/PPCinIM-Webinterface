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

  console.log("concept", concept);

  return (
    <>
      <p>
        <strong>Description:</strong> {descriptionClamp}
      </p>
      <p>
        <strong>Unit: </strong>
        {unitClamp}{" "}
      </p>
      <p>
        <strong>Symbol:</strong> {unitSym}{" "}
      </p>
      <p>
        <strong>Value Format:</strong> {valueFormat}{" "}
      </p>
    </>
  );
};

export default MetaDataIMM;
