import "./About.css"; // import the CSS file

function About() {
  return (
    <div className="text">
      <h1 className="title">
        Demonstrator „Production Planning and Scheduling in Injection Molding”
        (PPCinIM)
      </h1>
      <p className="content">
        Cluster Research Domain A: IoP Infrastructure<br></br>Workstream A.II –
        Foundations of Digital Shadows{" "}
      </p>
      <p className="content1">
        The Internet of Production must consistently manage the Digital Shadow
        infrastructure as a knowledge graph of heterogeneous data stores and
        agents, offer formal mappings, and generate code for efficient data
        integration and exchange.<br></br>
        <br></br> In this demonstrator, we show a possible infrastructure for
        the Internet of Production considering the functional, physical, and
        conceptual perspective for Digital Shadows in production. We utilize
        standardized Asset Administration Shells (AAS) that ensure a common data
        format and their data definitions and semantics originated from ECLASS,
        a decentralized, open data dictionary. Considering data definitions from
        open data dictionaries such as ECLASS ensures FAIR data and models,
        meaning these elements are <span className="greentextbold">F</span>
        indable, <span className="greentextbold">A</span>ccessible,{" "}
        <span className="greentextbold">I</span>nteroperable, and{" "}
        <span className="greentextbold">R</span>eusable. The AAS we created
        comprise technical assets from the injection molding domain as well as
        the characteristics of the production scheduling models. With the help
        of our developed PPCinIM ontology, we enabled the interconnection of
        these AAS. Furthermore, we built an architecture for a model catalog and
        implemented an example containing production scheduling models suitable
        for scheduling an injection molding shopfloor.<br></br>
        <br></br> By using standardized, registered data definitions, we achieve
        a modular and scalable infrastructure. <br></br>
        <br></br>The demonstrator focuses on the task of production planning and
        control of an injection molding shopfloor. Therefore, we implement two
        exemplary use cases:<br></br>
        <br></br> <span className="greentextbold">1. Production Planning:</span>{" "}
        Based on the specifications within a customer order, the system performs
        a technical capability check of all required assets. The result is a
        Digital Shadow containing the set of technically capable assets.
        <br></br>
        <br></br>{" "}
        <span className="greentextbold">2. Production Scheduling:</span> Based
        on the filter criteria regarding the current shopfloor configuration and
        optimization objective user sets, the system fetches the required data
        from an ERP, forwards the data to the selected model, and initiates the
        model processing. The result is a Digital Shadow containing the optimal
        schedule for the given jobs. <br></br>
        <br></br> <br></br>
        <p className="greentext">Contributors:</p>
        Patrick Sapel, IKV<br></br>Aymen Gannouni, WZL-MQ/IMA<br></br>Anna
        Garoufali, IKV<br></br>Priscillia Cynthia Wangi, IKV<br></br>Christian
        Hopmann, IKV<br></br>Robert H. Schmitt, WZL-MQ/IMA<br></br>
        <br></br> Institute for Plastics Processing (IKV) at RWTH Aachen
        University, Seffenter Weg 201, 52074 AachenInformation Management in
        Mechanical Engineering WZL-MQ/IMA, RWTH Aachen University,
        Dennewartstraße 27, 52068 Aachen, Germany <br></br>
        <br></br>Funded by the Deutsche Forschungsgemeinschaft (DFG, German
        Research Foundation) under Germany's Excellence Strategy – EXC-2023
        Internet of Production – 390621612.
      </p>
    </div>
  );
}

export default About;
