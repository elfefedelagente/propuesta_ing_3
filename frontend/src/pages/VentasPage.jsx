// src/pages/VentasPage.jsx
import { useState, useEffect } from "react";
import { listarVentas, anularVenta } from "../api/ventas";
import { useToast } from "../context/ToastContext";
import VentaForm from "../components/ventas/VentaForm";
import VentaFiltros from "../components/ventas/VentaFiltros";

function VentasPage() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({});
  const [refrescarProductos, setRefrescarProductos] = useState(0);
  const mostrarToast = useToast();

  useEffect(() => {
    cargarVentas(filtros);
  }, [filtros]);

  async function cargarVentas(filtrosActuales) {
    try {
      setCargando(true);
      const data = await listarVentas(filtrosActuales);
      setVentas(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function handleVentaCreada() {
    cargarVentas(filtros);
    mostrarToast("Venta registrada correctamente", "exito");
  }

  async function handleAnular(ventaId) {
    try {
      await anularVenta(ventaId);
      cargarVentas(filtros);
      setRefrescarProductos((n) => n + 1);
      mostrarToast("Venta anulada, stock restituido", "info");
    } catch (err) {
      mostrarToast(err.message, "error");
    }
  }

  return (
    <div className="contenedor">
      <h1>Ventas</h1>

      <VentaForm onVentaCreada={handleVentaCreada} refrescarProductos={refrescarProductos} />

      <hr className="separador" />

      <VentaFiltros onFiltrar={setFiltros} />

      {cargando && <p>Cargando ventas...</p>}
      {error && <p className="error-texto">{error}</p>}

      {!cargando && !error && ventas.length === 0 && (
        <p>No se encontraron resultados.</p>
      )}

      {!cargando && !error && ventas.map((venta) => (
        <div key={venta.id} className="tarjeta-venta">
          <div className="tarjeta-venta-header">
            <div>
              <strong>Venta #{venta.id}</strong> — {new Date(venta.fecha).toLocaleString()}
              {" — "}
              <span className={`badge ${venta.estado === "Confirmada" ? "badge-activo" : "badge-inactivo"}`}>
                {venta.estado}
              </span>
            </div>
            <strong>Total: ${venta.total.toFixed(2)}</strong>
          </div>

          <table className="tabla-detalle">
            <thead>
              <tr>
                <th>Producto ID</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
              </tr>
            </thead>
            <tbody>
              {venta.detalles.map((d) => (
                <tr key={d.id}>
                  <td>{d.producto_id}</td>
                  <td>{d.cantidad}</td>
                  <td>${d.precio_unitario.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {venta.estado !== "Anulada" && (
            <button className="boton-anular" onClick={() => handleAnular(venta.id)}>
              Anular venta
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default VentasPage;