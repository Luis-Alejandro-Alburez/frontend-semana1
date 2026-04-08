import { useState, useEffect } from "react";
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
