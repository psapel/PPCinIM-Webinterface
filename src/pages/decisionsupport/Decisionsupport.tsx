import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Decisionsupport.css";

const categories = [
  {
    title: "α - Machine Environments",
    criteria: [
      {
        name: "Single machine (1)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/singleMachine",
      },
      {
        name: "Identical machines in parallel (Pm)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/parallelMachines",
      },
      {
        name: "Machines in parallel with different speeds (Qm)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/uniformMachines",
      },
      {
        name: "Unrelated machines in parallel (Rm)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/unrelatedMachines",
      },
      {
        name: "Flow shop (Fm)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/flowShop",
      },
      {
        name: "Flexible flow shop (FFc)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/flexibleFlowShop",
      },
      {
        name: "Job shop (Jm)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/jobShop",
      },
      {
        name: "Flexible job shop (FJc)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/flexibleJobShop",
      },
      {
        name: "Open shop (Om)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/openShop",
      },
    ],
    isRadio: true,
  },
  {
    title: "β - Scheduling Constraints",
    criteria: [
      {
        name: "Release dates (rj)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/releaseDates",
      },
      {
        name: "Preemptions (prmp)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/preemptions",
      },
      {
        name: "Precedence constraints (prec)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/precedence",
      },
      {
        name: "Sequence dependent setup times (si,j)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/seqDepSetup",
      },
      {
        name: "Job families (fmls)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/jobFamilies",
      },
      {
        name: "Batch processing (batch(b))",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/batch",
      },
      {
        name: "Breakdown (brkdwn)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/breakdown",
      },
      {
        name: "Machine eligibility restrictions (Mj)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/maschEligibility",
      },
      {
        name: "Permutation (prmu)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/permutation",
      },
      {
        name: "Blocking (block)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/blocking",
      },
      {
        name: "No-wait (nwt)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/noWait",
      },
      {
        name: "Recirculation (rcrc)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/recirculation",
      },
      {
        name: "oprtr (oprtr)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/oprtr",
      },
      {
        name: "Tardiness Penalty (LCj)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/tardinessPenalty",
      },
    ],
  },
  {
    title: "γ - Objective Function",
    criteria: [
      {
        name: "Makespan (Cmax)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/maxCompletionTime",
      },
      {
        name: "Maximum Lateness (Lmax)",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/maxLateness",
      },
      {
        name: "Total weighted completion time (Σ(wjCj))",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/weightedSumCompletionTime",
      },
      {
        name: "Total completion time (ΣCj)",
        url: "http://www.iop.rwth-aachen.de/PPC/1/1/sumCompletionTime",
      },
      {
        name: "Total tardiness (Σ(Tj))",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/sumTardiness",
      },
      {
        name: "Total weighted tardiness (Σ(wjTj))",
        url: "https://www.iop.rwth-aachen.de/PPC/1/1/weightedSumTardiness",
      },
      {
        name: "Total earliness for each job (Σ(Ej))",
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
    setSelectedCriteria({
      ...selectedCriteria,
      [event.target.value]: event.target.checked,
    });
  };

  const handleRadioChange = (event) => {
    setSelectedEnvironment(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("selected criteria", selectedCriteria);
    console.log("selected environment", selectedEnvironment);
  
    try {
      const response = await fetch('http://localhost:5000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          machine_environment: selectedEnvironment,
          scheduling_constraints: Object.keys(selectedCriteria),
          scheduling_objective_function: [],
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Filtered Models from Backend:", data.filteredModels);
  
        navigate('/filtered-model', { state: { filteredModels: data.filteredModels } });
      } else {
        console.error('Failed to fetch filtered models from the backend');
      }
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
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