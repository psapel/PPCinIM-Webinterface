import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Decisionsupport.css";

export const categories = [
  {
    title: "α - Machine Environments",
    criteria: [
      {
        name: "Single machine (1)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/singleMachine",
      },
      {
        name: "Identical machines in parallel (Pm)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/parallelMachines",
      },
      {
        name: "Machines in parallel with different speeds (Qm)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/uniformMachines",
      },
      {
        name: "Unrelated machines in parallel (Rm)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/unrelatedMachines",
      },
      {
        name: "Flow shop (Fm)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/flowShop",
      },
      {
        name: "Flexible flow shop (FFc)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/flexibleFlowShop",
      },
      {
        name: "Job shop (Jm)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/jobShop",
      },
      {
        name: "Flexible job shop (FJc)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/flexibleJobShop",
      },
      {
        name: "Open shop (Om)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/openShop",
      },
    ],
    isRadio: true,
  },
  {
    title: "β - Scheduling Constraints",
    criteria: [
      {
        name: "Release dates (rj)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/releaseDates",
      },
      {
        name: "Preemptions (prmp)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/preemptions",
      },
      {
        name: "Precedence constraints (prec)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/precedence",
      },
      {
        name: "Sequence dependent setup times (si,j)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/seqDepSetup",
      },
      {
        name: "Job families (fmls)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/jobFamilies",
      },
      {
        name: "Batch processing (batch(b))",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/batch",
      },
      {
        name: "Breakdown (brkdwn)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/breakdown",
      },
      {
        name: "Machine eligibility restrictions (Mj)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/maschEligibility",
      },
      {
        name: "Permutation (prmu)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/permutation",
      },
      {
        name: "Blocking (block)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/blocking",
      },
      {
        name: "No-wait (nwt)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/noWait",
      },
      {
        name: "Recirculation (rcrc)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/recirculation",
      },
      {
        name: "oprtr (oprtr)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/oprtr",
      },
      {
        name: "Tardiness Penalty (LCj)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/tardinessPenalty",
      },
    ],
  },
  {
    title: "γ - Objective Function",
    criteria: [
      {
        name: "Makespan (Cmax)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/maxCompletionTime",
      },
      {
        name: "Maximum Lateness (Lmax)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/maxLateness",
      },
      {
        name: "Total weighted completion time (Σ(wjCj))",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/weightedSumCompletionTime",
      },
      {
        name: "Total completion time (ΣCj)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/sumCompletionTime",
      },
      {
        name: "Total tardiness (Σ(Tj))",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/sumTardiness",
      },
      {
        name: "Total weighted tardiness (Σ(wjTj))",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/weightedSumTardiness",
      },
      {
        name: "Total earliness for each job (Σ(Ej))",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/sumEarliness",
      },
    ],
  },
];

export const urlToNameMapping = categories.reduce((acc, category) => {
  category.criteria.forEach((item) => {
    acc[item.url] = item.name;
  });
  return acc;
}, {});

const Decisionsupport = () => {
  const navigate = useNavigate();
  const [selectedCriteria, setSelectedCriteria] = useState({});
  const [selectedObjectiveCriteria, setSelectedObjectiveCriteria] = useState(
    {}
  );
  const [selectedEnvironment, setSelectedEnvironment] = useState("");

  const handleCheckboxChange = (event) => {
    if (event.target.checked) {
      setSelectedCriteria({
        ...selectedCriteria,
        [event.target.value]: event.target.checked,
      });
    } else {
      const newSelectedCriteria = { ...selectedCriteria };
      delete newSelectedCriteria[event.target.value];
      setSelectedCriteria(newSelectedCriteria);
    }
  };

  const handleObjectiveCheckboxChange = (event) => {
    if (event.target.checked) {
      setSelectedObjectiveCriteria({
        ...selectedObjectiveCriteria,
        [event.target.value]: event.target.checked,
      });
    } else {
      const newSelectedObjectiveCriteria = { ...selectedObjectiveCriteria };
      delete newSelectedObjectiveCriteria[event.target.value];
      setSelectedObjectiveCriteria(newSelectedObjectiveCriteria);
    }
  };
  const handleRadioChange = (event) => {
    setSelectedEnvironment(event.target.value);
  };

  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new URLSearchParams();

      const schedulingConstraints = Object.keys(selectedCriteria);
      const objectiveFunctionCriteria = Object.keys(selectedObjectiveCriteria);

      formData.append("machine", selectedEnvironment);

      schedulingConstraints.forEach((constraint) => {
        formData.append("checked[]", constraint);
      });

      objectiveFunctionCriteria.forEach((criterion) => {
        formData.append("checking[]", criterion);
      });

      const response = await fetch("http://localhost:5005/api/mapping", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (response.ok) {
        const text = await response.text();
        try {
          const filteredModels = JSON.parse(text);
          if (
            filteredModels === "No matching model found." ||
            filteredModels.length === 0
          ) {
            setErrorMessage("No matching models found");
          } else {
            navigate("/filtered-model", { state: { filteredModels } });
          }
        } catch {
          if (text === "No matching model found.") {
            setErrorMessage("No matching models found");
            console.log(errorMessage);
          }
        }
      } else {
        throw new Error(`Request failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.message || "An error occurred");
    }

    console.log("selected criteria", selectedCriteria);
    console.log("selected environment", selectedEnvironment);
    console.log("selected objective criteria", selectedObjectiveCriteria);
    console.log(errorMessage);
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
                      ) : category.title === "γ - Objective Function" ? (
                        <input
                          type="checkbox"
                          name={criterion.name}
                          value={criterion.url}
                          className="toggle toggle-xs"
                          checked={
                            selectedObjectiveCriteria[criterion.url] || false
                          }
                          onChange={handleObjectiveCheckboxChange}
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
      <div className="flex flex-col gap-3 justify-center items-center">
        <button
          className="btn btn-wide  text-white bg-secondary hover:bg-primary"
          onClick={handleSubmit}
        >
          Submit
        </button>
        {errorMessage && (
          <div className="text-xl text-red-500">
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Decisionsupport;
