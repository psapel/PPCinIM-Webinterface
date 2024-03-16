import { useNavigate } from "react-router-dom";
import "./Productionplanning.css";

const ProductionPlanning = () => {
  const navigate = useNavigate();

  const handleButtonClick = async (queryType: string) => {
    navigate(`/results/${queryType}`);
  };

  return (
    <div className="container">
      <h1 className="resultsfont">Technical Capability Tester </h1>
      <br></br>
      <br></br>
      <button
        className="btn text-white bg-secondary hover:bg-primary rounded"
        style={{ margin: "10px auto" }}
        onClick={() => handleButtonClick("query1")}
      >
        Temperature Control Unit
      </button>

      <button
        className="btn text-white bg-secondary hover:bg-primary rounded"
        style={{ margin: "10px auto" }}
        onClick={() => handleButtonClick("query2")}
      >
        Handling Device
      </button>

      <button
        className="btn text-white bg-secondary hover:bg-primary rounded"
        style={{ margin: "10px auto" }}
        onClick={() => handleButtonClick("query3")}
      >
        Injection Molding Machine
      </button>
    </div>
  );
};

export default ProductionPlanning;
