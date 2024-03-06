import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Assets from "./pages/asset/Assets";
import DataSources from "./pages/datasources/Datasources";
import DecisionSupport from "./pages/decisionsupport/Decisionsupport";
import Models from "./pages/models/Models";
import Navbar from "./components/Navbar";
import NewAsset from "./pages/asset/Newasset";
import NewModel from "./pages/models/Newmodel";
import NewDataConnector from "./pages/datasources/Newdataconnector";
import FilteredModelCatalogue from "./pages/decisionsupport/Filteredmodel";
import AssetDetails from "./pages/asset/AssetDetails";
import ModelDetails from "./pages/models/Modeldetails";
import DataDetails from "./pages/datasources/Datadetails";
import FilteredModel from "./pages/decisionsupport/Filteredmodel";
import Home from "./pages/Home";
import AboutPage from "./pages/About";
import ProductionPlanning from "./pages/pp/ProductionPlanning";
import Execution from "./pages/decisionsupport/Execution";

function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/assets" element={<Assets />} />
          <Route path="/decision-support" element={<DecisionSupport />} />
          <Route path="/models" element={<Models />} />
          <Route path="/data-sources" element={<DataSources />} />
          <Route path="/new-asset" element={<NewAsset />} />
          <Route path="/new-model" element={<NewModel />} />
          <Route path="/new-data-connector" element={<NewDataConnector />} />
          <Route path="/model-catalogue" element={<FilteredModelCatalogue />} />
          <Route
            path="/asset-details/:machineType/"
            element={<AssetDetails />}
          />
          <Route path="/model-details/:id" element={<ModelDetails />} />
          <Route path="/data-details" element={<DataDetails />} />
          <Route path="/filtered-model" element={<FilteredModel />} />
          <Route path="/execution-model" element={<Execution />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/production-planning" element={<ProductionPlanning />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
