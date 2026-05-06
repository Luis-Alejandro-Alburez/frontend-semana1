import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Capturar token de la URL (al volver de Google) o del localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      setToken(tokenFromUrl);
      // Limpiar la URL (quitar el token)
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const storedToken = localStorage.getItem("token");
      if (storedToken) setToken(storedToken);
    }
  }, []);

  // Decodificar el token para obtener datos del usuario y verificar validez
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // Verificar que el token tenga email y no haya expirado
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.email && payload.exp && payload.exp > currentTime) {
          setUser({ name: payload.name, email: payload.email });
        } else {
          console.warn("Token inválido o expirado, cerrando sesión.");
          logout();
        }
      } catch (error) {
        console.error("Error decodificando token:", error);
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  // Cargar tareas solo si hay token
  useEffect(() => {
    if (token) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401) logout();
        throw new Error("Error al cargar tareas");
      }
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      if (!res.ok) {
        if (res.status === 401) logout();
        throw new Error("Error al crear tarea");
      }
      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
      setNewTaskTitle("");
    } catch (error) {
      console.error("Error al crear tarea:", error);
    }
  };

  const toggleComplete = async (task) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!res.ok) {
        if (res.status === 401) logout();
        throw new Error("Error al actualizar tarea");
      }
      const updatedTask = await res.json();
      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401) logout();
        throw new Error("Error al eliminar tarea");
      }
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setTasks([]);
    setLoading(false);
    // Recargar la página para resetear completamente el estado (opcional)
    // window.location.reload();
  };

  // Si no hay token, mostrar pantalla de login
  if (!token) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Bienvenido a Tareas App</h1>
        <button
          onClick={loginWithGoogle}
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        >
          Iniciar sesión con Google
        </button>
      </div>
    );
  }

  if (loading) return <div>Cargando tareas...</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Lista de Tareas</h1>
        <div>
          <span style={{ marginRight: "10px" }}>
            Hola, {user?.name} ({user?.email})
          </span>
          <button
            onClick={logout}
            style={{
              padding: "6px 12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      <form onSubmit={createTask}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Nueva tarea..."
          style={{ padding: "8px", width: "70%" }}
        />
        <button
          type="submit"
          style={{ padding: "8px 16px", marginLeft: "8px", cursor: "pointer" }}
        >
          Agregar
        </button>
      </form>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              margin: "10px 0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(task)}
            />
            <span
              style={{
                flex: 1,
                textDecoration: task.completed ? "line-through" : "none",
              }}
            >
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              style={{
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
