import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ListaUsuarios() {
  const navigate = useNavigate();
  const sessionId = localStorage.getItem("id_sesion");

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/lista_usuarios", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await response.json();
      console.log("Datos recibidos del servidor:", data);

      if (!Array.isArray(data)) {
        throw new Error("Los datos recibidos no son un array de usuarios");
      }

      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setError(error.message || "No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const eliminar_usuario = async (id_usuario) => {
    const confirmar = window.confirm("¿Estás seguro de eliminar este usuario?");
    if (!confirmar) return;
    try {
      const response = await fetch("http://localhost:5000/lista_usuarios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar Usuario");
      }

      const data = await response.json();
      console.log(data.message);
      setUsuarios((prevUsuarios) =>
        prevUsuarios.filter((u) => u.id_usuario !== id_usuario)
      );
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      setError(error.message || "No se pudo eliminar el usuario");
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <nav className="bg-blue-500 text-white shadow-sm">
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
              className="hover:underline cursor-pointer text-red-300"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </li>
          </ul>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Gestión de Usuarios</h1>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>

        {loading && (
          <p className="text-gray-500 text-center">Cargando usuarios...</p>
        )}
        {error && (
          <p className="text-red-500 text-center bg-red-50 p-4 rounded mb-4">
            {error}
          </p>
        )}
        {!loading && !error && filteredUsuarios.length > 0 && (
          <div className="flex flex-col mt-4">
            <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow-sm rounded-lg">
                  <table className="min-w-full text-left text-sm font-light">
                    <thead className="border-b bg-white font-medium">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-gray-700">ID</th>
                        <th scope="col" className="px-6 py-4 text-gray-700">Nombre</th>
                        <th scope="col" className="px-6 py-4 text-gray-700">Correo</th>
                        <th scope="col" className="px-6 py-4 text-gray-700">Rol</th>
                        <th scope="col" className="px-6 py-4 text-center text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsuarios.map((usuario, index) => (
                        <tr
                          key={usuario.id_usuario}
                          className={`border-b hover:bg-gray-50 transition duration-200 ${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }`}
                        >
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-700">
                            {usuario.id_usuario}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                            {usuario.nombre}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                            {usuario.correo}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                            {usuario.rol}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-center">
                            <button
                              onClick={() => eliminar_usuario(usuario.id_usuario)}
                              className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition duration-200"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {!loading && !error && filteredUsuarios.length === 0 && (
          <p className="text-gray-500 text-center mt-6">
            No hay usuarios registrados.
          </p>
        )}
      </div>
    </div>
  );
}

export default ListaUsuarios;