import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

function App() {
  const [mode, setMode] = useState("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");

  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [tasks, setTasks] = useState([]);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskProject, setTaskProject] = useState("");
  const [taskUser, setTaskUser] = useState("");
  const [taskStatus, setTaskStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState("");

  // ✅ LOAD TOKEN ON START
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  // 🔐 AUTH
  const handleAuth = async () => {
    const url =
      mode === "login"
        ? `${API_URL}/api/login/`
        : `${API_URL}/api/signup/`;

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
        localStorage.setItem("token", data.access); // ✅ FIX
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
    const res = await fetch(`${API_URL}/api/tasks/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("TASKS:", data);
    setTasks(data);
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
    // eslint-disable-next-line
  }, [token]);

  // ✅ CREATE TASK
  const createTask = async () => {
    if (!taskTitle || !taskProject || !taskUser || !dueDate) {
      alert("Please fill in all fields!");
      return;
    }

    console.log("TOKEN:", token);

    const res = await fetch(`${API_URL}/api/create-task/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: taskTitle,
        status: taskStatus,
        due_date: dueDate,
        description: "",
        project_id: parseInt(taskProject),
        assigned_to: parseInt(taskUser)
      })
    });

    const data = await res.json();
    console.log("RESPONSE:", data);

    if (res.ok) {
      alert("Task created successfully!");
      fetchTasks();
      setTaskTitle("");
      setTaskProject("");
      setTaskUser("");
      setDueDate("");
      setTaskStatus("Pending");
    } else {
      alert("Error: " + JSON.stringify(data));
    }
  };

  const logout = () => {
    setToken("");
    setIsLoggedIn(false);
    localStorage.removeItem("token");
  };

  // 🔐 LOGIN PAGE
  if (!isLoggedIn) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h2>🚀 TaskFlow</h2>

          <input placeholder="Username" onChange={(e)=>setUsername(e.target.value)} style={styles.input}/>
          <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} style={styles.input}/>

          {mode === "signup" && (
            <select onChange={(e)=>setRole(e.target.value)} style={styles.input}>
              <option value="member">User</option>
              <option value="admin">Admin</option>
            </select>
          )}

          <button onClick={handleAuth} style={styles.button}>
            {mode === "signup" ? "Sign Up" : "Login"}
          </button>

          <p onClick={()=>setMode(mode==="signup"?"login":"signup")} style={styles.link}>
            {mode==="signup" ? "Already registered? Login" : "Don’t have an account? Sign Up"}
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
        <button onClick={logout} style={styles.logout}>Logout</button>
      </div>

      <div style={styles.main}>
        <h2>📊 Dashboard</h2>

        {/* ✅ STATUS FILTER */}
        <div style={styles.kanban}>
          <Column title="🟥 Pending" tasks={tasks.filter(t => t.status === "Pending")} status="Pending" setTaskStatus={setTaskStatus} setTaskTitle={setTaskTitle} setTaskProject={setTaskProject} setTaskUser={setTaskUser} setDueDate={setDueDate} createTask={createTask} />
          <Column title="🟧 In Progress" tasks={tasks.filter(t => t.status === "In Progress")} status="In Progress" setTaskStatus={setTaskStatus} setTaskTitle={setTaskTitle} setTaskProject={setTaskProject} setTaskUser={setTaskUser} setDueDate={setDueDate} createTask={createTask} />
          <Column title="🟩 Completed" tasks={tasks.filter(t => t.status === "Completed")} status="Completed" setTaskStatus={setTaskStatus} setTaskTitle={setTaskTitle} setTaskProject={setTaskProject} setTaskUser={setTaskUser} setDueDate={setDueDate} createTask={createTask} />
        </div>

        {/* CREATE TASK */}
        <div style={styles.section}>
          <h3>Create Task</h3>

          <div style={styles.inlineForm}>
            <input placeholder="Title" value={taskTitle} onChange={(e)=>setTaskTitle(e.target.value)} style={styles.input}/>
            <input placeholder="User ID" value={taskUser} onChange={(e)=>setTaskUser(e.target.value)} style={styles.input}/>
            <input placeholder="Project ID" value={taskProject} onChange={(e)=>setTaskProject(e.target.value)} style={styles.input}/>
            <input type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} style={styles.input}/>

            <select value={taskStatus} onChange={(e)=>setTaskStatus(e.target.value)} style={styles.input}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <button onClick={createTask} style={styles.button}>Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// COLUMN
function Column({ title, tasks, status, setTaskStatus, setTaskTitle, setTaskProject, setTaskUser, setDueDate, createTask }) {
  const handleQuickAdd = () => {
    setTaskStatus(status);
    // Focus on title input (optional enhancement)
  };

  return (
    <div style={styles.column}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <h3>{title}</h3>
        <button onClick={handleQuickAdd} style={{...styles.button, padding: "5px 10px", fontSize: "12px"}}>+</button>
      </div>
      {tasks.map(t => (
        <div key={t.id} style={styles.taskCard}>
          <h4>{t.title}</h4>
          <p>{t.project_name}</p>
          <small>Assigned to: {t.assigned_to_username}</small>
        </div>
      ))}
    </div>
  );
}

// STYLES
const styles = {
  center:{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh"},
  container:{display:"flex",height:"100vh"},
  sidebar:{width:"80px",background:"#1e293b",color:"white",padding:"20px"},
  main:{flex:1,padding:"30px"},
  card:{background:"white",padding:"30px",borderRadius:"10px",width:"300px"},
  input:{width:"100%",padding:"10px",margin:"5px 0"},
  button:{padding:"10px",background:"#2563eb",color:"white",border:"none",cursor:"pointer"},
  logout:{background:"red",color:"white",padding:"10px"},
  section:{marginTop:"30px"},
  taskCard:{background:"white",padding:"10px",marginTop:"10px"},
  inlineForm:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"10px"},
  link:{color:"blue",cursor:"pointer",textAlign:"center"},
  kanban:{display:"flex",gap:"20px",marginBottom:"20px"},
  column:{flex:1,background:"#e2e8f0",padding:"10px"}
};

export default App;