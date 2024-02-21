import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Decisionsupport.css";
import jsonDocument_0 from "./jsonModels/jsonDocument_0.json";
import jsonDocument_1 from "./jsonModels/jsonDocument_1.json";
import jsonDocument_2 from "./jsonModels/jsonDocument_2.json";
import jsonDocument_3 from "./jsonModels/jsonDocument_3.json";
import jsonDocument_4 from "./jsonModels/jsonDocument_4.json";
import jsonDocument_5 from "./jsonModels/jsonDocument_5.json";
import jsonDocument_6 from "./jsonModels/jsonDocument_6.json";
import jsonDocument_7 from "./jsonModels/jsonDocument_7.json";
import jsonDocument_8 from "./jsonModels/jsonDocument_8.json";
import jsonDocument_9 from "./jsonModels/jsonDocument_9.json";
import jsonDocument_10 from "./jsonModels/jsonDocument_10.json";
import jsonDocument_11 from "./jsonModels/jsonDocument_11.json";
import jsonDocument_12 from "./jsonModels/jsonDocument_12.json";
import jsonDocument_13 from "./jsonModels/jsonDocument_13.json";
import jsonDocument_14 from "./jsonModels/jsonDocument_14.json";
import jsonDocument_15 from "./jsonModels/jsonDocument_15.json";
import jsonDocument_16 from "./jsonModels/jsonDocument_16.json";

const models = [
  jsonDocument_0,
  jsonDocument_1,
  jsonDocument_2,
  jsonDocument_3,
  jsonDocument_4,
  jsonDocument_5,
  jsonDocument_6,
  jsonDocument_7,
  jsonDocument_8,
  jsonDocument_9,
  jsonDocument_10,
  jsonDocument_11,
  jsonDocument_12,
  jsonDocument_13,
  jsonDocument_14,
  jsonDocument_15,
  jsonDocument_16,
];

const categories = [
  {
    title: "α - Machine Environments",
    criteria: [
      {
        name: "Single Machine",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/singleMachine",
      },
      {
        name: "Identical machines in parallel",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/parallelMachines",
      },
      {
        name: "Machines in parallel with different speeds",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/",
      },
      {
        name: "Unrelated machines in parallel",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/unrelatedMachines",
      },
      {
        name: "Flow shop",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/flowShop",
      },
      {
        name: "Flexible Flow shop",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/flexibleFlowShop",
      },
      {
        name: "Job shop",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/jobShop",
      },
      {
        name: "Flexible Job shop",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/flexibleJobShop",
      },
      {
        name: "Open shop",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/openShop",
      },
    ],
    isRadio: true,
  },
  {
    title: "β - Scheduling Constraints",
    criteria: [
      {
        name: "Release Dates",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/releaseDates",
      },
      {
        name: "Preemptions",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/preemptions",
      },
      {
        name: "Precedence Constraints",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/precedenceConstraints",
      },
      {
        name: "Sequence dependent setup times",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/seqDepSetup",
      },
      {
        name: "Job families",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/jobFamilies",
      },
      {
        name: "Batch Processing",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/batch",
      },
      {
        name: "Breakdown",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/breakdown",
      },
      {
        name: "Machine eligibilty restrictions",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/maschEligibility",
      },
      {
        name: "Permutation",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/permutation",
      },
      {
        name: "Blocking",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/blocking",
      },
      { name: "No-Wait", url: "https://www.iop.rwth-aachen.de/PPC/1/1/noWait" },
      {
        name: "Recirculation",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/recirculation",
      },
      { name: "oprtr", url: "https://www.iop.rwth-aachen.de/PPC/1/1/oprtr" },
      {
        name: "Tardiness Penalty",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/tardinessPenalty",
      },
    ],
  },
  {
    title: "γ - Objective Function",
    criteria: [
      {
        name: "Makespan",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/makespan",
      },
      {
        name: "Maximum Lateness",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/maxCompletionTime",
      },
      {
        name: "Total weighted completion time",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/weightedSumCompletionTime",
      },
      {
        name: "Total completion time",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/maxCompletionTime",
      },
      {
        name: "Total tardiness",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/sumTardiness",
      },
      {
        name: "Total weighted tardiness",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/weightedSumTardiness",
      },
      {
        name: "Total earliness for each job",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/sumEarliness",
      },
    ],
  },
];

const Decisionsupport = () => {
  const navigate = useNavigate();
  const [selectedCriteria, setSelectedCriteria] = useState({});
  const [selectedEnvironment, setSelectedEnvironment] = useState("");

  const handleCheckboxChange = (event) => {
    console.log(event);
    setSelectedCriteria({
      ...selectedCriteria,
      [event.target.value]: event.target.checked,
    });
  };

  const handleRadioChange = (event) => {
    setSelectedEnvironment(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const filteredModels = models.filter((model) => {
      // Check if selected criteria is true
      return Object.keys(selectedCriteria).some((criterionUrl) => {
        const grahamNotationValues = Object.values(model.GrahamNotation);
        const urls = grahamNotationValues
          .flatMap((value) => (Array.isArray(value) ? value : []))
          .concat(
            grahamNotationValues.filter(
              (value) => typeof value === "string" && value.startsWith("http")
            )
          );
        return urls.includes(criterionUrl);
      });
    });
    console.log("selected criteria", selectedCriteria);
    console.log("selected environment", selectedEnvironment);
    console.log("filtered models", filteredModels);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center">
        {categories.map((category) => (
          <div
            className="card w-96 bg-base-100 shadow-xl m-4"
            key={category.title}
          >
            <div className="card-body">
              <h2 className="card-title">{category.title}</h2>
              <div className="flex flex-col">
                {category.criteria.map((criterion) => (
                  <div className="form-control w-52" key={criterion.name}>
                    <label className="cursor-pointer label">
                      <span className="label-text">{criterion.name}</span>
                      {category.isRadio ? (
                        <input
                          type="radio"
                          name={category.title}
                          value={criterion.url}
                          className="radio radio-xs"
                          checked={selectedEnvironment === criterion.url}
                          onChange={handleRadioChange}
                        />
                      ) : (
                        <input
                          type="checkbox"
                          name={criterion.name}
                          value={criterion.url}
                          className="toggle toggle-xs"
                          checked={selectedCriteria[criterion.url] || false}
                          onChange={handleCheckboxChange}
                        />
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          className="btn btn-wide  text-white bg-secondary hover:bg-primary"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Decisionsupport;
