// src/pages/ClientesPage.jsx
import { useState, useEffect } from "react";
import { listarClientes, darDeBajaCliente } from "../api/clientes";
import { useToast } from "../context/ToastContext";
import ClienteForm from "../components/clientes/ClienteForm";
import ClienteFiltros from "../components/clientes/ClienteFiltros";

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const mostrarToast = useToast();

  useEffect(() => {
    cargarClientes(busqueda);
  }, [busqueda]);

  async function cargarClientes(filtro) {
    try {
      setCargando(true);
      const data = await listarClientes(filtro);
      setClientes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function handleClienteCreado() {
    cargarClientes(busqueda);
    mostrarToast("Cliente registrado correctamente", "exito");
  }

  async function handleBaja(dni) {
    try {
      const clienteActualizado = await darDeBajaCliente(dni);
      setClientes((prev) =>
        prev.map((c) => (c.dni === dni ? clienteActualizado : c))
      );
      mostrarToast("Cliente dado de baja", "info");
    } catch (err) {
      mostrarToast(err.message, "error");
    }
  }

  return (
    <div className="contenedor">
      <h1>Clientes</h1>

      <ClienteForm onClienteCreado={handleClienteCreado} />

      <hr className="separador" />

      <ClienteFiltros onBuscar={setBusqueda} />

      {cargando && <p>Cargando clientes...</p>}
      {error && <p className="error-texto">{error}</p>}

      {!cargando && !error && clientes.length === 0 && (
        <p>No se encontraron resultados.</p>
      )}

      {!cargando && !error && clientes.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Estado</th>
              <th></th>
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
                <td>
                  {cliente.estado && (
                    <button onClick={() => handleBaja(cliente.dni)}>
                      Dar de baja
                    </button>
                  )}
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