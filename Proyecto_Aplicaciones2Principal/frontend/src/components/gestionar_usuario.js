import React, { useState, useEffect } from "react";
import { FaHome, FaSignOutAlt, FaUserEdit, FaTrashAlt, FaLock } from "react-icons/fa";
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
                const response = await fetch(`http://localhost:5000/usuario?id_sesion=${idSesion}`);
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
            const response = await fetch("http://localhost:5000/usuario", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...usuario, id_sesion: localStorage.getItem("id_sesion") }),
            });
    
            if (response.ok) {
                showModal("Datos actualizados correctamente", "success");
            } else {
                const data = await response.json();
                if (response.status === 409) {
                    // Caso específico: Correo duplicado
                    showModal(data.error || "El correo ya está registrado con otro usuario", "error");
                } else {
                    // Otros errores
                    showModal(data.error || "Error al actualizar los datos", "error");
                }
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
            const response = await fetch("http://localhost:5000/usuario", {
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
                const response = await fetch(`http://localhost:5000/usuario?id_sesion=${idSesion}`, {
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

    const handleLogout = () => {
        localStorage.removeItem("id_sesion");
        window.location.href = "/login";
    };

    const handleMenu = () => {
        window.location.href = "/menu_usuario";
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
            {/* Modal para mensajes */}
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
    
            {/* Contenedor principal con barra lateral */}
            <div className="main-container">
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
                            <form onSubmit={handleUpdatePassword} className="password-form flex flex-col gap-4">
                                <label className="block">
                                    <span className="text-gray-700">Contraseña Actual:</span>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                                        required
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700">Nueva Contraseña:</span>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                                        required
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700">Confirmar Nueva Contraseña:</span>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                                        required
                                    />
                                </label>
                                <button
                                    type="submit"
                                    style={{ backgroundColor: '#269b31' }}
                                    className="text-white px-4 py-2 rounded flex items-center justify-center"
                                >
                                    <FaLock className="mr-2" /> Cambiar Contraseña
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
        </div>
    );
    
}

export default GestionarUsuario;
