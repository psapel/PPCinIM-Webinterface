import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Assets from "./pages/Assets";
import DataSources from "./pages/Datasources";
import DecisionSupport from "./pages/Decisionsupport";
import Models from "./pages/Models";
import Navbar from "./components/Navbar";
import NewAsset from "./pages/Newasset";
import NewModel from "./pages/Newmodel";
import NewDataConnector from "./pages/Newdataconnector";

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
        </Routes>
      </Router>
    </div>
  );
}

export default App;
