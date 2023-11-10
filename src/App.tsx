import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Assets from "./pages/Assets";
import DataSources from "./pages/Datasources";
import DecisionSupport from "./pages/Decisionsupport";
import Models from "./pages/Models";
import Navbar from "./components/Navbar";
// import SideMenu from "./components/Sidemenu";

function App() {
  return (
    <div>
      <Router>
        <Navbar />
        {/* <SideMenu/> */}
        <Routes>
          <Route path="/" element={<Assets />} />
          <Route path="/" element={<DecisionSupport />} />
          <Route path="/" element={<Models />} />
          <Route path="/" element={<DataSources />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
