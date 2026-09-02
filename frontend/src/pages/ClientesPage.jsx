// src/pages/ClientesPage.jsx
import { useState, useEffect } from "react";
import { listarClientes } from "../api/clientes";
import ClienteForm from "../components/clientes/ClienteForm";

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    try {
      setCargando(true);
      const data = await listarClientes();
      setClientes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function handleClienteCreado(nuevoCliente) {
    setClientes((prev) => [...prev, nuevoCliente]);
  }

  return (
    <div className="contenedor">
      <h1>Clientes</h1>

      <ClienteForm onClienteCreado={handleClienteCreado} />

      <hr style={{ margin: "2rem 0", borderColor: "var(--color-borde)" }} />

      {cargando && <p>Cargando clientes...</p>}
      {error && <p className="error-texto">{error}</p>}

      {!cargando && !error && (
        <table>
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.dni}</td>
                <td>{cliente.nombre}</td>
                <td>{cliente.apellido}</td>
                <td>{cliente.email}</td>
                <td>
                  <span className={`badge ${cliente.estado ? "badge-activo" : "badge-inactivo"}`}>
                    {cliente.estado ? "Activo" : "Inactivo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ClientesPage;