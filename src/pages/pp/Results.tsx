import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const queryTypeMapping = {
  query1: "Temperature Control Unit Query",
  query2: "Handling Device Query",
  query3: "Injection Molding Machine Query",
};

const Results = () => {
  const { queryType } = useParams();
  const [responseData, setResponseData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:5000/${queryType}`, {
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
    <div>
      <div className="button">
        <button
          className="btn btn-circle btn-outline"
          onClick={() => navigate("/production-planning")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
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
    </div>
  );
};

export default Results;
