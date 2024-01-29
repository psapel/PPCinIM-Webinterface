import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Decisionsupport.css";

const Decisionsupport = () => {
  const navigate = useNavigate();
  const [selectedCriteria, setSelectedCriteria] = useState({});

  const handleCheckboxChange = (event) => {
    setSelectedCriteria({
      ...selectedCriteria,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const filteredModels = models.filter((model) =>
      Object.entries(selectedCriteria).every(
        ([key, value]) => !value || model[key] === value
      )
    );
    navigate("/filtered-model", { state: { filteredModels } });
  };

  const categories = [
    {
      title: "α - Machine Environments",
      criteria: [
        "Single Machine",
        "Identical machinese in parallel",
        "Machines in parallel with different speeds",
        "Unrelated machines in parallel",
        "Flow shop",
        "Flexible Flow shop",
        "Job shop",
        "Flexible Job shop",
        "Open shop",
      ],
    },
    {
      title: "β - Scheduling Constraints",
      criteria: [
        "Release Dates",
        "Preemptions",
        "Precedence Constraints",
        "Sequence dependent setup times",
        "Job families",
        "Batch Processing",
        "Breakdown",
        "Machine eligibilty restrictions",
        "Permutation",
        "Blocking",
        "No-Wait",
        "Recirculation",
        "oprtr",
        "Tardiness Penalty",
      ],
    },
    {
      title: "γ - Objective Function",
      criteria: [
        "Makespan",
        "Maximum Lateness",
        "Total weighted completion time",
        "Total completion time",
        "Total tardiness",
        "Total weighted tardiness",
        "Total earliness for each job",
      ],
    },
  ];

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
                  <div className="form-control w-52" key={criterion}>
                    <label className="cursor-pointer label">
                      <span className="label-text">{criterion}</span>
                      <input
                        type="checkbox"
                        name={criterion}
                        className="toggle toggle-xs"
                        checked={selectedCriteria[criterion] || false}
                        onChange={handleCheckboxChange}
                      />
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
