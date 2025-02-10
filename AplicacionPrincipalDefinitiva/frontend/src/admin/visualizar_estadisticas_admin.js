import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import para navegar
import { Pie, Bar, Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
} from "chart.js";
import jsPDF from "jspdf";
import "jspdf-autotable";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
);

function VisualizarEstadisticas() {
  // ========== Manejo de navegación y sesión ==========
  const navigate = useNavigate();
  const sessionId = localStorage.getItem("id_sesion");

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

  // ========== ESTADOS ==========
  const [filtros, setFiltros] = useState({ inicio: "", fin: "", emocion: "", agrupacion: "day" });
  const [emocionMulti, setEmocionMulti] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [error, setError] = useState(null);
  const [selecciones, setSelecciones] = useState({
    incluirTendencias: true,
    incluirUsuarios: true,
    comentarios: ""
  });

  // Referencias a los gráficos para PDF
  const refBarChart = useRef();
  const refPieChart = useRef();
  const refOrigenChart = useRef();

  // ========== FETCH DATOS ==========
  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const params = new URLSearchParams();
        if (filtros.inicio) params.append("inicio", filtros.inicio);
        if (filtros.fin) params.append("fin", filtros.fin);
        if (filtros.emocion) params.append("emocion", filtros.emocion);
        if (filtros.agrupacion) params.append("agrupacion", filtros.agrupacion);
        emocionMulti.forEach((emo) => params.append("emocionMulti", emo));

        const url = `http://localhost:5000/admin/visualiza_estadisticas?${params.toString()}`;
        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) throw new Error("Error al obtener las estadísticas");
        const data = await response.json();
        setEstadisticas(data);
      } catch (err) {
        console.error("Error al obtener estadísticas:", err);
        setError("No se pudieron cargar las estadísticas");
      }
    };
    fetchEstadisticas();
  }, [filtros, emocionMulti]);

  // ========== MANEJADORES ==========
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  const handleCheckboxChange = (emo) => {
    if (emocionMulti.includes(emo)) {
      setEmocionMulti(emocionMulti.filter((item) => item !== emo));
    } else {
      setEmocionMulti([...emocionMulti, emo]);
    }
  };

  const handleSeleccionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelecciones({ ...selecciones, [name]: type === "checkbox" ? checked : value });
  };

  // ========== EXPORTAR PDF ==========
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte Personalizado de Estadísticas", 10, 10);

    if (selecciones.comentarios) {
      doc.setFontSize(12);
      doc.text(`Comentarios: ${selecciones.comentarios}`, 10, 20);
    }

    // Ejemplo: exportar bar/pie charts
    if (selecciones.incluirTendencias && refBarChart.current) {
      const barImage = refBarChart.current.toBase64Image();
      doc.text("Gráfico de Tendencias Emocionales", 10, 30);
      doc.addImage(barImage, "PNG", 10, 40, 180, 80);
    }

    if (selecciones.incluirUsuarios && refPieChart.current) {
      const pieImage = refPieChart.current.toBase64Image();
      const posicionY = selecciones.incluirTendencias ? 130 : 40;
      doc.text("Gráfico de Usuarios por Emoción", 10, posicionY);
      doc.addImage(pieImage, "PNG", 10, posicionY + 10, 180, 80);
    }

    doc.save("reporte_personalizado.pdf");
  };

  // ========== RENDER ==========
  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;
  if (!estadisticas) return <p className="text-gray-500 text-center mt-4">Cargando estadísticas...</p>;

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* ========== MENÚ SUPERIOR ========== */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto flex justify-between items-center p-4">
          <div
            className="text-2xl font-bold cursor-pointer"
            onClick={() => navigate("/")}
          >
            Administrador
          </div>
          <ul className="flex space-x-6">
            <li
              className="hover:underline cursor-pointer"
              onClick={() => navigate("/admin/gestion_usuario_admin")}
            >
              Gestionar Usuarios
            </li>
            <li
              className="hover:underline cursor-pointer"
              onClick={() => navigate("/admin/visualizar_estadisticas_admin")}
            >
              Visualizar Estadísticas
            </li>
            <li
              className="hover:underline cursor-pointer text-red-400"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </li>
          </ul>
        </div>
      </nav>

      {/* ========== CONTENIDO PRINCIPAL ========== */}
      <div className="container mx-auto p-8 bg-gray-100 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">Visualización de Estadísticas</h1>

        {/* ========== FILTROS ========== */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Emoción (Single)</label>
              <select
                name="emocion"
                onChange={handleFiltroChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Todas</option>
                <option value="feliz">Feliz</option>
                <option value="triste">Tristeza</option>
                <option value="enojado">Enojo</option>
                <option value="sorprendido">Sorpresa</option>
                <option value="neutro">Neutro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Agrupación</label>
              <select
                name="agrupacion"
                onChange={handleFiltroChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                value={filtros.agrupacion}
              >
                <option value="day">Día</option>
                <option value="month">Mes</option>
                <option value="year">Año</option>
              </select>
            </div>
          </div>

          {/* Emociones Multi-Line */}
          <div className="mt-4">
            <label className="block text-sm font-bold text-gray-600 mb-2">Emociones (Multi-Line)</label>
            <div className="flex flex-wrap gap-4">
              {["feliz", "triste", "enojado", "sorprendido", "neutro"].map((emo) => (
                <label key={emo} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={emo}
                    checked={emocionMulti.includes(emo)}
                    onChange={() => handleCheckboxChange(emo)}
                  />
                  <span>{emo}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Gráfico de Pastel (Distribución por Origen) */}
        <div className="grid grid-cols-1 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Distribución por Origen (%)</h2>
            <div className="w-full flex justify-center">
              <Pie
                data={{
                  labels: estadisticas.distribucion_origen.map((item) => item.origen),
                  datasets: [
                    {
                      data: estadisticas.distribucion_origen.map((item) => item.porcentaje),
                      backgroundColor: [
                        "#ffc107",
                        "#17a2b8",
                        "#28a745",
                        "#dc3545",
                        "#6f42c1",
                        "#fd7e14"
                      ],
                      hoverBackgroundColor: [
                        "#ffca2c",
                        "#3fc5d7",
                        "#3ddc8c",
                        "#f25d5d",
                        "#9b6fc9",
                        "#ff9651"
                      ]
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          let label = context.label || "";
                          let value = context.parsed;
                          return `${label}: ${value}%`;
                        }
                      }
                    }
                  }
                }}
                ref={refOrigenChart}
                width={300}
                height={300}
              />
            </div>
          </div>
        </div>

        {/* Gráfico de Líneas (Intensidad Promedio) */}
        <div className="grid grid-cols-1 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Intensidad Promedio ({filtros.agrupacion})
            </h2>
            <div className="w-full h-96 flex justify-center">
              <Line
                data={{
                  labels: estadisticas.line_chart_data.map((item) => item.fecha_agrupada),
                  datasets: [
                    {
                      label: "Intensidad Promedio",
                      data: estadisticas.line_chart_data.map((item) => item.intensidad_promedio),
                      fill: true,
                      borderColor: "rgba(54, 162, 235, 1)",
                      backgroundColor: "rgba(54, 162, 235, 0.2)"
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      suggestedMin: 0,
                      suggestedMax: 1
                    }
                  }
                }}
                ref={refBarChart} // referencia para exportar PDF
              />
            </div>
          </div>
        </div>

        {/* NUEVO: Radar Chart (Origen vs Emoción) */}
        {estadisticas.radar_data && estadisticas.radar_data.length > 0 && (
          <RadarOrigenEmocion dataRadar={estadisticas.radar_data} />
        )}

        {/* Opciones de Reporte */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Personalización del Reporte</h2>
          <label className="flex items-center mb-3">
            <input
              type="checkbox"
              name="incluirTendencias"
              checked={selecciones.incluirTendencias}
              onChange={handleSeleccionChange}
              className="mr-2"
            />
            Incluir Gráfico de Tendencias
          </label>
          <label className="flex items-center mb-3">
            <input
              type="checkbox"
              name="incluirUsuarios"
              checked={selecciones.incluirUsuarios}
              onChange={handleSeleccionChange}
              className="mr-2"
            />
            Incluir Gráfico de Usuarios
          </label>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">Comentarios</label>
            <textarea
              name="comentarios"
              value={selecciones.comentarios}
              onChange={handleSeleccionChange}
              rows="3"
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={exportarPDF}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md text-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Generar Reporte
          </button>
        </div>
      </div>
    </div>
  );
}

/** Sub-componente: RadarOrigenEmocion */
function RadarOrigenEmocion({ dataRadar }) {
  // Lista fija de emociones para que el radar no se colapse
  const ALL_EMOTIONS = ["feliz", "triste", "enojado", "sorprendido", "neutro"];

  // Orígenes únicos que vengan en la data
  const origenesUnicos = Array.from(new Set(dataRadar.map(d => d.origen)));

  // Para cada origen, construimos un dataset
  const colors = [
    "rgba(255,99,132,0.6)",
    "rgba(54,162,235,0.6)",
    "rgba(255,206,86,0.6)",
    "rgba(75,192,192,0.6)",
    "rgba(153,102,255,0.6)",
    "rgba(255,159,64,0.6)"
  ];

  const datasets = origenesUnicos.map((orig, idx) => {
    const c = colors[idx % colors.length];
    // Recorremos la lista completa ALL_EMOTIONS y rellenamos con 0 si no hay datos
    const dataArr = ALL_EMOTIONS.map(emo => {
      const row = dataRadar.find(x => x.origen === orig && x.emocion === emo);
      return row ? row.total_usuarios : 0;
    });

    return {
      label: orig,
      data: dataArr,
      backgroundColor: c,
      borderColor: c.replace("0.6", "1"),
      borderWidth: 2,
      fill: true
    };
  });

  // El eje radial (labels) siempre será ALL_EMOTIONS
  const radarData = {
    labels: ALL_EMOTIONS,
    datasets
  };

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        suggestedMin: 0
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Radar: Origen vs Emoción</h2>
      <div style={{ width: "500px", margin: "0 auto" }}>
        <Radar data={radarData} options={radarOptions} />
      </div>
    </div>
  );
}

export default VisualizarEstadisticas;
