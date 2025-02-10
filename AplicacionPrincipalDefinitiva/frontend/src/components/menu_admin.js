import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pie, Line } from "react-chartjs-2";
import { FaChartPie, FaUsers, FaChartLine } from "react-icons/fa";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

function MenuAdmin() {
  const navigate = useNavigate();
  const sessionId = localStorage.getItem("id_sesion");

  const [estadisticas, setEstadisticas] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const response = await fetch("http://localhost:5000/estadisticas", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Error al obtener las estadísticas");
        }

        const data = await response.json();
        setEstadisticas(data);
      } catch (err) {
        console.error("Error al obtener estadísticas:", err);
        setError("No se pudieron cargar las estadísticas");
      }
    };

    fetchEstadisticas();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_sesion: sessionId }),
      });
      localStorage.removeItem("id_sesion");
      localStorage.removeItem("nombre_usuario");
      localStorage.removeItem("role");
      window.location.href = "/login";
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  const dataPie = estadisticas && {
    labels: estadisticas.usuarios_por_emocion.map((item) => item.emocion_predominante),
    datasets: [
      {
        label: "Usuarios por Emoción Predominante",
        data: estadisticas.usuarios_por_emocion.map((item) => item.usuarios),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        hoverOffset: 4,
      },
    ],
  };

  const dataLine = estadisticas && {
    labels: estadisticas.tendencias_emocionales.map((item) => item.fecha),
    datasets: [
      {
        label: "Frecuencia de Emociones",
        data: estadisticas.tendencias_emocionales.map((item) => item.frecuencia),
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Menú Superior */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto flex justify-between items-center p-4">
          <div className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
            Administrador
          </div>
          <ul className="flex space-x-6">
            <li className="hover:underline cursor-pointer" onClick={() => navigate("/gestion_usuario_admin")}>
              Gestionar Usuarios
            </li>
            <li className="hover:underline cursor-pointer" onClick={() => navigate("/visualizar_estadisticas_admin")}>
              Visualizar Estadísticas
            </li>
            <li className="hover:underline cursor-pointer" onClick={() => navigate("/configuracion-app")}>
              Mi Cuenta
            </li>
            <li className="hover:underline cursor-pointer text-red-400" onClick={handleLogout}>
              Cerrar Sesión
            </li>
          </ul>
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className="container mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-bold mb-4">Dashboard del Administrador</h2>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded shadow">{error}</p>}
        {estadisticas ? (
          <>
            {/* Tarjetas de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow-md p-6 rounded-lg flex items-center space-x-4">
                <FaChartLine className="text-blue-600 text-4xl" />
                <div>
                  <h3 className="text-lg font-semibold">Total de Sesiones</h3>
                  <p className="text-2xl font-bold">{estadisticas.total_sesiones}</p>
                </div>
              </div>
              <div className="bg-white shadow-md p-6 rounded-lg flex items-center space-x-4">
                <FaUsers className="text-green-600 text-4xl" />
                <div>
                  <h3 className="text-lg font-semibold">Usuarios por Emoción</h3>
                  <p className="text-2xl font-bold">{estadisticas.usuarios_por_emocion.length}</p>
                </div>
              </div>
              <div className="bg-white shadow-md p-6 rounded-lg flex items-center space-x-4">
                <FaChartPie className="text-yellow-600 text-4xl" />
                <div>
                  <h3 className="text-lg font-semibold">Emoción Predominante</h3>
                  <p className="text-2xl font-bold">{estadisticas.emocion_predominante.emocion}</p>
                </div>
              </div>
            </div>

            {/* Gráficos mejorados */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              {/* Gráfico de Pastel */}
              <div className="bg-white shadow-md p-6 rounded-lg flex flex-col items-center">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Usuarios por Emoción</h3>
                <div className="w-full h-[400px] flex justify-center">
                  <Pie data={dataPie} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>

              {/* Gráfico de Líneas */}
              <div className="bg-white shadow-md p-6 rounded-lg flex flex-col items-center">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Tendencias Emocionales</h3>
                <div className="w-full h-[400px] flex justify-center">
                  <Line data={dataLine} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </>
        ) : (
          !error && <p className="text-gray-500">Cargando estadísticas...</p>
        )}
      </div>
    </div>
  );
}

export default MenuAdmin;
