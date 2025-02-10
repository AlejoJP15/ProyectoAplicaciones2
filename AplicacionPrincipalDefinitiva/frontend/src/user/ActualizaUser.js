import React, { useState, useEffect } from "react";
import { FaHome, FaSignOutAlt, FaUserEdit, FaTrashAlt, FaLock, FaRobot, FaExchangeAlt } from "react-icons/fa";
import "../styles/gestionar_usuario.css";

function GestionarUsuario() {
    const [usuario, setUsuario] = useState({ nombre: "", email: "" });
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState({ message: "", type: "" });

    useEffect(() => {
        const fetchUsuario = async () => {
            const idSesion = localStorage.getItem("id_sesion");
            if (!idSesion) {
                showModal("No se encontró una sesión activa", "error");
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/update?id_sesion=${idSesion}`);
                const data = await response.json();

                if (response.ok) {
                    setUsuario(data.usuario);
                } else {
                    showModal(data.error || "Error al obtener datos del usuario", "error");
                }
            } catch (err) {
                showModal("Error al conectar con el servidor", "error");
            }
        };

        fetchUsuario();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...usuario, id_sesion: localStorage.getItem("id_sesion") }),
            });

            if (response.ok) {
                showModal("Datos actualizados correctamente", "success");
            } else {
                const data = await response.json();
                showModal(data.error || "Error al actualizar los datos", "error");
            }
        } catch (err) {
            showModal("Error al conectar con el servidor", "error");
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showModal("Las contraseñas no coinciden", "error");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_sesion: localStorage.getItem("id_sesion"),
                    password: password,
                    new_password: newPassword,
                }),
            });

            if (response.ok) {
                showModal("Contraseña actualizada correctamente", "success");
                setPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                const data = await response.json();
                showModal(data.error || "Error al actualizar la contraseña", "error");
            }
        } catch (err) {
            showModal("Error al conectar con el servidor", "error");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) {
            try {
                const idSesion = localStorage.getItem("id_sesion");
                const response = await fetch(`http://localhost:5000/update?id_sesion=${idSesion}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    localStorage.clear();
                    window.location.href = "/login";
                } else {
                    const data = await response.json();
                    showModal(data.error || "Error al eliminar la cuenta", "error");
                }
            } catch (err) {
                showModal("Error al conectar con el servidor", "error");
            }
        }
    };

    const handleMenu = () => {
        window.location.href = "/menu_usuario";
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

    const handleInteractions = () => {
        window.location.href = "/mis-interacciones";
    };

    const handleLogout = () => {
        localStorage.removeItem("id_sesion");
        window.location.href = "/login";
    };

    const showModal = (message, type) => {
        setModalContent({ message, type });
        setIsModalVisible(true);
        setTimeout(() => {
            setIsModalVisible(false);
        }, 3000);
    };

    return (
        <div className="gestionar-usuario-container">
            {/* Modal */}
            {isModalVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        className={`p-6 rounded-lg shadow-lg max-w-sm w-full ${
                            modalContent.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        }`}
                    >
                        <h2 className="text-lg font-bold">
                            {modalContent.type === "success" ? "Éxito" : "Error"}
                        </h2>
                        <p>{modalContent.message}</p>
                    </div>
                </div>
            )}

            {/* Menú superior */}
            <nav className="navbar">
                <div className="navbar-container">
                    <button onClick={handleMenu} className="navbar-item">
                        <FaHome /> Menú Principal
                    </button>
                    <button onClick={handleChatbotRedirect} className="navbar-item">
                        <FaRobot /> Ir al Chatbot
                    </button>
                    <button onClick={handleInteractions} className="navbar-item">
                        <FaExchangeAlt /> Mis Interacciones
                    </button>
                    <button onClick={handleLogout} className="navbar-item logout">
                        <FaSignOutAlt /> Cerrar Sesión
                    </button>
                </div>
            </nav>

            {/* Contenido principal */}
            <div className="usuario-box">
                <h1 className="usuario-title">Gestionar Mi Cuenta</h1>
                <div className="form-container">
                    {/* Formulario para actualizar datos */}
                    <div className="form-box">
                        <h2 className="form-title">Actualizar Datos</h2>
                        <form onSubmit={handleUpdate} className="usuario-form">
                            <label>
                                Nombre:
                                <input
                                    type="text"
                                    value={usuario.nombre}
                                    onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Email:
                                <input
                                    type="email"
                                    value={usuario.email}
                                    onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
                                    required
                                />
                            </label>
                            <button type="submit" className="usuario-button">
                                <FaUserEdit /> Actualizar Datos
                            </button>
                        </form>
                    </div>

                    {/* Formulario para cambiar contraseña */}
                    <div className="form-box">
                        <h2 className="form-title">Cambiar Contraseña</h2>
                        <form onSubmit={handleUpdatePassword} className="password-form">
                            <label>
                                Contraseña Actual:
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Nueva Contraseña:
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Confirmar Nueva Contraseña:
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </label>
                            <button type="submit" className="usuario-button">
                                <FaLock /> Cambiar Contraseña
                            </button>
                        </form>
                    </div>
                </div>

                {/* Botón para eliminar cuenta */}
                <div className="delete-container">
                    <button onClick={handleDelete} className="delete-button">
                        <FaTrashAlt /> Eliminar Cuenta
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GestionarUsuario;


