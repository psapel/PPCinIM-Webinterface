const Newasset = () => {
  return (
    <div className="m-4 flex-col flex items-center">
      <div className="my-3">
        Model Name
        <div>
          <input
            type="text"
            placeholder="Model Name"
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
      </div>
      <div className="my-3">
        Asset Type
        <div>
          <select className="select select-bordered w-full max-w-xs">
            <option disabled selected>
              Asset Type
            </option>
            <option>Injection Molding Machine</option>
            <option>Mold</option>
            <option>Temperature Control Unit</option>
            <option>Hot Runner Device</option>
          </select>
        </div>
      </div>
      <div className="my-3">
        Asset Administration Shell
        <div>
          <input
            type="file"
            className="file-input file-input-bordered file-input-primary w-full max-w-xs"
          />
        </div>
      </div>
      <div>
        <button className="btn btn-wide my-3">Create</button>
      </div>
    </div>
  );
};

export default Newasset;
