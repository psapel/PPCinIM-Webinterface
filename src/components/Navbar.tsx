import { Link, useNavigate } from "react-router-dom";
import logo from "./logo.jpg";
import ioplogo from "./ioplogo.jpg";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link to={`/`}>About</Link>
            </li>
            <li>
              <Link to={`/assets`}>Assets</Link>
            </li>
            {/* <li>
              <Link to={`/data-sources`}>Data Sources</Link>
            </li> */}
            <li>
              <Link to={`/decision-support`}>Production Scheduling</Link>
            </li>
            <li>
              <Link to={`/models`}>Models</Link>
            </li>
            <li>
              <Link to={`/production-planning`}>Production Planning</Link>
            </li>
          </ul>
        </div>
        <a className="" onClick={() => navigate("/")}>
          <img src={logo} alt="Logo" className="navbar-logo" />
        </a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to={`/`}>About</Link>
          </li>
          <li>
            <Link to={`/assets`}>Assets</Link>
          </li>
          {/* <li>
            <Link to={`/data-sources`}>Data Sources</Link>
          </li> */}
          <li>
            <Link to={`/decision-support`}>Production Scheduling</Link>
          </li>
          <li>
            <Link to={`/models`}>Models</Link>
          </li>
          <li>
            <Link to={`/production-planning`}>Production Planning</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <a className="" onClick={() => navigate("/")}>
          <img src={ioplogo} alt="IOP Logo" className="navbar-logoiop" />
        </a>
      </div>
    </div>
  );
};

export default Navbar;
