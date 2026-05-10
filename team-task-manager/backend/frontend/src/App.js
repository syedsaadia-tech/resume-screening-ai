import React, { useState, useEffect } from "react";

function App() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");

  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  const [tasks, setTasks] = useState([]);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskProject, setTaskProject] = useState("");
  const [taskUser, setTaskUser] = useState("");
  const [taskStatus, setTaskStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState("");

  // 🔐 AUTH
  const handleAuth = async () => {
    const url =
      mode === "login"
        ? "http://127.0.0.1:8000/api/login/"
        : "http://127.0.0.1:8000/api/signup/";

    const body =
      mode === "login"
        ? { username, password }
        : { username, password, role };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (res.ok) {
      if (mode === "login") {
        setToken(data.access);
        setIsLoggedIn(true);

        // ✅ store role
        localStorage.setItem("role", data.role);
        setUserRole(data.role);
      } else {
        alert("Signup successful!");
        setMode("login");
      }
    } else {
      alert(JSON.stringify(data));
    }
  };

  // 📁 FETCH TASKS
  const fetchTasks = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/tasks/", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTasks(await res.json());
  };

  const createTask = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/create-task/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: taskTitle,
        status: taskStatus,
        due_date: dueDate,
        project_id: taskProject,
        assigned_to: taskUser
      })
    });

    if (res.ok) {
      fetchTasks();
      setTaskTitle("");
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const logout = () => {
    setToken("");
    setIsLoggedIn(false);
    setUserRole("");
    localStorage.removeItem("role");
  };

  // 🔐 LOGIN UI
  if (!isLoggedIn) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h2 style={{ textAlign: "center" }}>🚀 Task Manager</h2>

          <input
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          {mode === "signup" && (
            <select onChange={(e) => setRole(e.target.value)} style={styles.input}>
              <option value="member">User</option>
              <option value="admin">Admin</option>
            </select>
          )}

          <button onClick={handleAuth} style={styles.button}>
            {mode === "login" ? "Login" : "Signup"}
          </button>

          <p
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            style={styles.link}
          >
            Switch to {mode === "login" ? "Signup" : "Login"}
          </p>
        </div>
      </div>
    );
  }

  // 🧠 DASHBOARD
  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2>🚀</h2>
        <p>{userRole.toUpperCase()}</p>
        <button onClick={logout} style={styles.logout}>Logout</button>
      </div>

      <div style={styles.main}>
        <h1>📊 Dashboard</h1>

        {/* ADMIN VIEW */}
        {userRole === "admin" && (
          <>
            <h2>All Tasks (Admin)</h2>

            <div style={styles.grid}>
              {tasks.map((t) => (
                <div key={t.id} style={styles.taskCard}>
                  <h3>{t.title}</h3>
                  <p><b>User:</b> {t.assigned_to_username}</p>
                  <p><b>Project:</b> {t.project_name}</p>
                  <p>Status: {t.status}</p>
                </div>
              ))}
            </div>

            <div style={styles.section}>
              <h2>Create Task</h2>

              <div style={styles.inlineForm}>
                <input placeholder="Title" onChange={(e)=>setTaskTitle(e.target.value)} style={styles.input}/>
                <input placeholder="User ID" onChange={(e)=>setTaskUser(e.target.value)} style={styles.input}/>
                <input placeholder="Project ID" onChange={(e)=>setTaskProject(e.target.value)} style={styles.input}/>
                <input type="date" onChange={(e)=>setDueDate(e.target.value)} style={styles.input}/>

                <select onChange={(e)=>setTaskStatus(e.target.value)} style={styles.input}>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>

                <button onClick={createTask} style={styles.button}>Add</button>
              </div>
            </div>
          </>
        )}

        {/* MEMBER VIEW */}
        {userRole === "member" && (
          <>
            <h2>My Tasks</h2>

            <div style={styles.grid}>
              {tasks
                .filter(t => t.assigned_to_username === username)
                .map((t) => (
                  <div key={t.id} style={styles.taskCard}>
                    <h3>{t.title}</h3>
                    <p><b>Project:</b> {t.project_name}</p>
                    <p>Status: {t.status}</p>
                    <p>Due: {t.due_date}</p>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// 🎨 STYLES
const styles = {
  center:{
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    height:"100vh",
    background:"linear-gradient(135deg,#e0e7ff,#f8fafc)"
  },
  container:{display:"flex",height:"100vh",fontFamily:"Segoe UI"},
  sidebar:{
    width:"80px",
    background:"#1e293b",
    color:"white",
    padding:"20px",
    display:"flex",
    flexDirection:"column",
    justifyContent:"space-between"
  },
  main:{flex:1,padding:"30px",background:"#f1f5f9"},
  card:{
    background:"white",
    padding:"25px",
    borderRadius:"12px",
    width:"320px",
    boxShadow:"0 10px 25px rgba(0,0,0,0.08)"
  },
  input:{
    width:"100%",
    padding:"12px",
    margin:"8px 0",
    borderRadius:"8px",
    border:"1px solid #e2e8f0"
  },
  button:{
    padding:"12px",
    background:"#2563eb",
    color:"white",
    border:"none",
    borderRadius:"8px",
    cursor:"pointer",
    fontWeight:"bold"
  },
  logout:{
    background:"#ef4444",
    color:"white",
    padding:"10px",
    border:"none",
    borderRadius:"6px"
  },
  grid:{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",
    gap:"20px"
  },
  section:{marginTop:"30px"},
  taskCard:{
    background:"white",
    padding:"18px",
    borderRadius:"12px",
    boxShadow:"0 6px 15px rgba(0,0,0,0.05)"
  },
  inlineForm:{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
    gap:"12px"
  },
  link:{
    color:"#2563eb",
    cursor:"pointer",
    marginTop:"10px",
    textAlign:"center"
  }
};

export default App;