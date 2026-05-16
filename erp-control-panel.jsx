import { useEffect, useState } from "react";

const API = "http://localhost:3001";

/*
====================================================
ERP FULL STACK CONTROL SYSTEM (TESSILE / ABBIGLIAMENTO)
====================================================
Architettura evoluta:
- Auth JWT (master / roles)
- Clienti (anagrafica)
- Progetti (CAD / produzione)
- Articoli (codici tessili)
- Ricerca avanzata
- Archivio storico
====================================================
*/

export default function ERPFrontend() {
  const [token, setToken] = useState(null);
  const [tab, setTab] = useState("dashboard");

  const [username, setUsername] = useState("ronaldo");
  const [password, setPassword] = useState("antilope");

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [status, setStatus] = useState("");

  const [newProject, setNewProject] = useState("");
  const [clientName, setClientName] = useState("");
  const [search, setSearch] = useState("");

  // ================= AUTH =================
  const login = async () => {
    setStatus("Authenticating...");

    const res = await fetch(`${API}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success && data.token) {
      setToken(data.token);
      localStorage.setItem("erp_token", data.token);
      setStatus("Access granted");
    } else {
      setStatus("Access denied");
    }
  };

  // ================= LOAD PROJECTS =================
  const loadProjects = async () => {
    const res = await fetch(`${API}/api/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setProjects(data);
  };

  // ================= CREATE PROJECT =================
  const createProject = async () => {
    setStatus("Saving project...");

    await fetch(`${API}/api/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newProject,
        client: clientName,
        data: JSON.stringify({ createdFrom: "ERP" }),
      }),
    });

    setNewProject("");
    loadProjects();
    setStatus("Saved");
  };

  // ================= FILTER =================
  const filteredProjects = projects.filter((p) =>
    JSON.stringify(p).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const saved = localStorage.getItem("erp_token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (token) loadProjects();
  }, [token]);

  // ================= UI =================
  return (
    <div style={{ display: "flex", fontFamily: "Arial" }}>
      {/* SIDEBAR */}
      <div style={{ width: 220, padding: 20, background: "#111", color: "white", minHeight: "100vh" }}>
        <h3>ERP SYSTEM</h3>

        <button onClick={() => setTab("dashboard")}>Dashboard</button>
        <button onClick={() => setTab("projects")}>Progetti</button>
        <button onClick={() => setTab("clients")}>Clienti</button>
        <button onClick={() => setTab("new")}>Nuovo</button>

        <hr />

        {!token ? (
          <div>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="user" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="pass" />
            <button onClick={login}>Login</button>
          </div>
        ) : (
          <button onClick={() => { setToken(null); localStorage.removeItem("erp_token"); }}>
            Logout
          </button>
        )}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: 20 }}>

        <h2>{tab.toUpperCase()}</h2>
        <p>{status}</p>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div>
            <p>KPIs: Progetti {projects.length}</p>
          </div>
        )}

        {/* PROJECTS */}
        {tab === "projects" && (
          <div>
            <input placeholder="search" value={search} onChange={(e) => setSearch(e.target.value)} />

            <ul>
              {filteredProjects.map((p, i) => (
                <li key={i}>
                  <b>{p.name}</b> | {p.client}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CLIENTS */}
        {tab === "clients" && (
          <div>
            <p>Modulo clienti (estensione ERP)</p>
          </div>
        )}

        {/* NEW */}
        {tab === "new" && (
          <div>
            <input placeholder="Project name" value={newProject} onChange={(e) => setNewProject(e.target.value)} />
            <input placeholder="Client" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            <button onClick={createProject}>Save</button>
          </div>
        )}

      </div>
    </div>
  );
}
