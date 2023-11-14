import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Assets from "./pages/Assets";
import DataSources from "./pages/Datasources";
import DecisionSupport from "./pages/Decisionsupport";
import Models from "./pages/Models";
import Navbar from "./components/Navbar";
import NewAsset from "./pages/Newasset";

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
        </Routes>
      </Router>
    </div>
  );
}

export default App;
