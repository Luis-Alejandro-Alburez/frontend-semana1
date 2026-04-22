/* import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Cargando...");
  const [dbTime, setDbTime] = useState("");

  useEffect(() => {
    // Reemplaza con la URL de tu backend desplegado
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    fetch(`${API_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setMessage("Error al conectar con el backend"));

    fetch(`${API_URL}/api/db-test`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDbTime(`Base de datos conectada: ${data.time}`);
        else setDbTime("Error conectando a la base de datos");
      })
      .catch(() => setDbTime("Error conectando a la base de datos"));
  }, []);

  return (
    <div className="App">
      <h1>{message}</h1>
      <p>{dbTime}</p>
    </div>
  );
}

export default App;
 */

import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Cargar tareas al iniciar
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle }),
      });
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      const updatedTask = await res.json();
      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/api/tasks/${id}`, { method: "DELETE" });
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
    }
  };

  if (loading) return <div>Cargando tareas...</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Lista de Tareas</h1>
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
          style={{ padding: "8px 16px", marginLeft: "8px" }}
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
