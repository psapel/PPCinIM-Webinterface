import { useNavigate } from "react-router-dom";
import React from 'react';

const Newmodel = () => {
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    try {
      await axios.post('http://localhost:5005/api/create_model', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Redirect or show success message after successful submission
      // Example: navigate('/models'); // Assuming navigate is available from React Router
    } catch (error) {
      console.error('Error creating model:', error);
      // Handle error
    }
  };


  return (
    <div className="m-4 flex-col flex items-center">
      <button
        className="btn btn-circle btn-outline"
        onClick={() => navigate("/models")}
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
      <div className="my-3">
        Model Name:
        <div>
          <input
            type="text"
            placeholder="Model Name"
            className="input input-bordered input-secondary w-full max-w-xs"
          />
        </div>
      </div>
      <div className="my-3">
        Model Type:
        <div>
          <select className="select select-secondary w-full max-w-xs">
            <option disabled selected>
              Model Type
            </option>
            <option>Production Scheduling</option>
            <option>Engineering</option>
            <option>Simulation</option>
            <option>Behavior</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div className="my-3">
        Model Image:
        <div>
          <input
            type="file"
            className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
          />
        </div>
      </div>
      <div className="my-3">
        Model File:
        <div>
          <input
            type="file"
            className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
          />
        </div>
      </div>
      <div className="my-3">
        Asset Administration Shell (AASX):
        <div>
          <input
            type="file"
            className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
          />
        </div>
      </div>
      <div>
        <button className="btn btn-wide  text-white bg-secondary hover:bg-primary my-3">
          Create
        </button>
      </div>
    </div>
  );
};

export default Newmodel;
