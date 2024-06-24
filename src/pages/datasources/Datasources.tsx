import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Datasources = () => {
  const navigate = useNavigate();
  const [datasources, setDatasources] = useState([]);

  const fetchDatasources = async () => {
    const url = "http://localhost:5005/datasource2";

    try {
      const response = await fetch(url);
      const data = await response.json();
      setDatasources(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching datasources:", error);
    }
  };

  useEffect(() => {
    fetchDatasources();
  }, []);

  return (
    <div>
      <div className="flex justify-center m-4">
        <input
          type="text"
          placeholder="Search"
          className="input input-bordered input-primary w-full max-w-xs ml-auto"
        />
        <button
          className="btn  text-white bg-secondary hover:bg-primary mr-3 ml-auto"
          onClick={() => navigate("/new-data-connector")}
        >
          Create New Data Connector
        </button>
      </div>

      <div className="flex justify-center flex-wrap m-4">
        {datasources.length > 0 ? (
          datasources.map((datasource) => {
            const name = datasource.dataSourceName;

            return (
              <div className="card w-96 bg-base-100 shadow-xl m-4">
                <div className="card-body">
                  <h2 className="card-title">{name}</h2>
                  <button
                    className="btn text-white bg-secondary hover:bg-primary"
                    onClick={() =>
                      navigate(
                        `/data-details/${encodeURIComponent(
                          datasource.dataSourceId
                        )}`,
                        {
                          state: {
                            datasourceData: datasource.dataSourceData,
                            datasourceName: datasource.dataSourceName,
                            datasourceId: datasource.dataSourceId,
                            datasourceType: datasource.dataSourceType,
                          },
                        }
                      )
                    }
                  >
                    Show Details
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p>No datasources found.</p>
        )}
      </div>
    </div>
  );
};

export default Datasources;
