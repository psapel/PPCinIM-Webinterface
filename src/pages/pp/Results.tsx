import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const queryTypeMapping = {
  query1: "Temperature Control Unit Query",
  query2: "Handling Device Query",
  query3: "Injection Molding Machine Query",
};

const Results = () => {
  const { queryType } = useParams();
  const [responseData, setResponseData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:5002/${queryType}`, {
        method: "POST",
      });
      const data = await response.json();
      console.log("data", data);
      setResponseData(data);
    };

    fetchData();
  }, [queryType]);

  const queryName = queryTypeMapping[queryType];

  return (
    <div className="overflow-x-auto results">
      <h1 className="resultsfont">{queryName} Result</h1>
      {queryName === "Temperature Control Unit Query" && (
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>InquiryCoolant</th>
              <th>Coolant Comparison</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(responseData.data) &&
              responseData.data.length > 0 &&
              responseData.data.map((item, index) => (
                <tr key={index}>
                  <td>{item.InquiryCoolant}</td>
                  <td>
                    {Array.isArray(item.MatchingControlUnits) &&
                      item.MatchingControlUnits.map((unit, index) => (
                        <p key={index}>Matched with: {unit.idShort}</p>
                      ))}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      {queryName === "Handling Device Query" && (
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>InquiryHandlingDevice</th>
              <th>Handling Device Comparison</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(responseData.data) &&
              responseData.data.length > 0 &&
              responseData.data.map((item, index) => (
                <tr key={index}>
                  <td>{item.InquiryHandlingDevice}</td>

                  <td>
                    {Array.isArray(item.MatchingControlUnits) &&
                      item.MatchingControlUnits.map((unit, index) => (
                        <p key={index}>Matched with: {unit.idShort}</p>
                      ))}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      {queryName === "Injection Molding Machine Query" && (
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Injection Molding Machine ID</th>
              <th>Feasibility</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(responseData.data) &&
              responseData.data.map((record, index) => (
                <tr key={index}>
                  <td>{record.idShort}</td>
                  <td>{record.feasibility}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Results;
