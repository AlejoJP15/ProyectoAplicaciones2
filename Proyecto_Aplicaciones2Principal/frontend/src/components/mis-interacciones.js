import React, { useState, useEffect } from "react";
import { FaHome, FaSignOutAlt } from "react-icons/fa";
import "../styles/mis_interacciones.css"; // Estilo personalizado

function MisInteracciones() {
    const [interacciones, setInteracciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false); // Control del modal

    useEffect(() => {
        const fetchInteracciones = async () => {
            const idSesion = localStorage.getItem("id_sesion");
            if (!idSesion) {
                setError("No se encontró una sesión activa");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/mis-interacciones?id_sesion=${idSesion}`);
                const data = await response.json();

                if (response.ok) {
                    if (data.interacciones && data.interacciones.length > 0) {
                        setInteracciones(data.interacciones);
                    } else {
                        // Mostrar el modal si no hay interacciones
                        setIsModalVisible(true);
                    }
                } else {
                    setError(data.message || "Error al obtener interacciones");
                }
            } catch (err) {
                setError("Error al conectar con el servidor");
            } finally {
                setLoading(false);
            }
        };

        fetchInteracciones();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("id_sesion");
        localStorage.removeItem("nombre_usuario");
        window.location.href = "/login";
    };

    const handleMenu = () => {
        window.location.href = "/menu_usuario";
    };

    const handleGoToChatbot = () => {
        setIsModalVisible(false); // Cerrar el modal
        window.location.href = "/menu_usuario"; // Redirige al menú principal/chatbot
    };

    if (loading) return <p>Cargando...</p>;

    return (
        <div className="mis-interacciones-container">
            {/* Modal para mensajes */}
            {isModalVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-bold text-red-600 mb-4">Sin Interacciones</h2>
                        <p className="text-gray-700 mb-6">
                            No tienes interacciones aún. Ve al chatbot para iniciar una conversación.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={handleGoToChatbot}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Ir al Chatbot
                            </button>
                            <button
                                onClick={() => setIsModalVisible(false)}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Menú lateral */}
            <aside className="sidebar">
                <h2 className="sidebar-title">Opciones</h2>
                <button onClick={handleMenu} className="sidebar-button">
                    <FaHome className="sidebar-icon" /> Menú Principal
                </button>
                <button onClick={handleLogout} className="sidebar-button">
                    <FaSignOutAlt className="sidebar-icon" /> Cerrar Sesión
                </button>
            </aside>

            {/* Cuadro desplazable */}
            <div className="interacciones-box">
                <h1 className="interacciones-title">Mis Interacciones</h1>
                {error && <p className="error-message">{error}</p>}
                <div className="interacciones-table-container">
                    <table className="interacciones-table">
                        <thead>
                            <tr>
                                <th>Remitente</th>
                                <th>Mensaje</th>
                                <th>Fecha y Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            {interacciones.map((interaccion, index) => (
                                <tr key={index}>
                                    <td>{interaccion.tipo_mensaje === "ChatGPT" ? "BOT" : "Tú"}</td>
                                    <td>{interaccion.mensaje}</td>
                                    <td>{new Date(interaccion.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default MisInteracciones;
