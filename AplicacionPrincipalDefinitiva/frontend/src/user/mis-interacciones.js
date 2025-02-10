import React, { useState, useEffect } from "react";
import {FaComments, FaUser, FaSignOutAlt, FaRobot } from "react-icons/fa";
import "../styles/mis_interacciones.css";

function MisInteracciones() {
    const [interacciones, setInteracciones] = useState([]);
    const [emociones, setEmociones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const idSesion = localStorage.getItem("id_sesion");
            console.log("ID Sesión:", idSesion); // Debug log

            if (!idSesion) {
                setError("No se encontró una sesión activa");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/emotions?id_sesion=${idSesion}`);
                const data = await response.json();
                
                console.log("Datos recibidos:", data); // Debug log
                console.log("Emociones recibidas:", data.emociones); // Debug log

                if (response.ok) {
                    setInteracciones(data.interacciones || []);
                    setEmociones(data.emociones || []);
                    
                    // Debug logs después de establecer el estado
                    console.log("Estado de emociones:", data.emociones);
                    console.log("Longitud de emociones:", data.emociones?.length);
                } else {
                    setError(data.error || "Error al obtener los datos");
                }
            } catch (err) {
                console.error('Error en la petición:', err);
                setError("Error al conectar con el servidor");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("id_sesion");
        localStorage.removeItem("nombre_usuario");
        window.location.href = "/login";
    };

    const handleChatbotRedirect = () => {
        const sessionId = localStorage.getItem("id_sesion");
        const userName = localStorage.getItem("nombre_usuario");
        const rol = localStorage.getItem("role");
        if (sessionId && userName) {
            window.location.href = `http://localhost:3002?session_id=${sessionId}&nombre_usuario=${encodeURIComponent(
                userName
            )}&role=${encodeURIComponent(rol)}`;
        } else {
            alert("No se encuentra la sesión, por favor inicie sesión.");
        }
    };

    const navigateTo = (path) => {
        window.location.href = path;
    };

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand" onClick={() => navigateTo("/menu_usuario")}> Mi Proyecto AI</div>
                    <ul className="navbar-menu">
                        <li className="navbar-item" onClick={() => navigateTo("/mis-interacciones")}>
                            <FaComments /> Mis Interacciones
                        </li>
                        <li className="navbar-item" onClick={handleChatbotRedirect}>
                            <FaRobot /> Chatbot
                        </li>
                        <li className="navbar-item" onClick={() => navigateTo("/user/ActualizaUser")}>
                            <FaUser /> Mi Cuenta
                        </li>
                        <li className="navbar-item logout" onClick={handleLogout}>

                            <FaSignOutAlt /> Cerrar Sesión
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Main Content */}
            <div className="interacciones-box">
                {console.log("Estado actual de emociones:", emociones)} {/* Debug log */}
                {loading ? (
                    <p className="loading">Cargando...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    <>
                        {/* Tabla de Emociones */}
                        {console.log("Longitud de emociones antes del render:", emociones.length)} {/* Debug log */}
                        {emociones && emociones.length > 0 ? (
                            <div className="emociones-table-container">
                                <h2>Resumen de Emociones Detectadas</h2>
                                <table className="interacciones-table">
                                    <thead>
                                        <tr>
                                            <th>Emoción</th>
                                            <th>Intensidad</th>
                                            <th>Fecha y Hora</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {emociones.map((emocion, index) => {
                                            console.log("Renderizando emoción:", emocion); // Debug log
                                            return (
                                                <tr key={index}>
                                                    <td>{emocion.emocion}</td>
                                                    <td>{emocion.intensidad}%</td>
                                                    <td>{new Date(emocion.timestamp).toLocaleString()}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No hay emociones registradas.</p>
                        )}

                        {/* Tabla de Interacciones existente */}
                        {interacciones.length > 0 ? (
                            <div className="interacciones-table-container">
                                <h2>Historial de Conversación</h2>
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
                        ) : (
                            <p>No hay interacciones registradas.</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default MisInteracciones;



