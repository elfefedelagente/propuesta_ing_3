import { useState, useEffect } from "react";
import { listarClientes } from "../../api/clientes";
import { listarProductos } from "../../api/productos";
import { crearVenta } from "../../api/ventas";

function VentaForm({ onVentaCreada, refrescarProductos }) {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  const [clienteId, setClienteId] = useState("");
  const [items, setItems] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState("1");

  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function cargarDatos() {
    try {
      const [clientesData, productosData] = await Promise.all([
        listarClientes(),
        listarProductos(),
      ]);
      setClientes(clientesData.filter((c) => c.estado));
      setProductos(productosData.filter((p) => p.estado));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoDatos(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, [refrescarProductos]);

  function agregarItem() {
    if (!productoSeleccionado) return;

    const cantidad = Number(cantidadSeleccionada);
    if (isNaN(cantidad) || cantidad <= 0) return;

    const producto = productos.find((p) => p.id === Number(productoSeleccionado));

    setItems((prev) => {
      const yaExiste = prev.find((i) => i.producto_id === producto.id);
      if (yaExiste) {
        return prev.map((i) =>
          i.producto_id === producto.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        );
      }
      return [...prev, { producto_id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad }];
    });

    setProductoSeleccionado("");
    setCantidadSeleccionada("1");
  }

  function quitarItem(productoId) {
    setItems((prev) => prev.filter((i) => i.producto_id !== productoId));
  }

  const totalEstimado = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!clienteId) {
      setError("Seleccioná un cliente");
      return;
    }
    if (items.length === 0) {
      setError("Agregá al menos un producto");
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        cliente_id: Number(clienteId),
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      };
      const ventaCreada = await crearVenta(payload);
      setClienteId("");
      setItems([]);
      await cargarDatos();
      onVentaCreada(ventaCreada);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (cargandoDatos) return <p>Cargando clientes y productos...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grupo">
        <label>Cliente</label>
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">-- Seleccionar cliente --</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} {c.apellido} (DNI {c.dni})
            </option>
          ))}
        </select>
      </div>

      <div className="form-grupo">
        <label>Agregar producto</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">-- Seleccionar producto --</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — ${p.precio.toFixed(2)} (stock: {p.stock})
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={cantidadSeleccionada}
            onChange={(e) => setCantidadSeleccionada(e.target.value)}
            style={{ width: "80px" }}
          />
          <button type="button" onClick={agregarItem}>
            Agregar
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <table style={{ marginBottom: "1rem" }}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.producto_id}>
                <td>{i.nombre}</td>
                <td>{i.cantidad}</td>
                <td>${(i.precio * i.cantidad).toFixed(2)}</td>
                <td>
                  <button type="button" onClick={() => quitarItem(i.producto_id)}>
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2}><strong>Total estimado</strong></td>
              <td colSpan={2}><strong>${totalEstimado.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      )}

      {error && <p className="error-texto">{error}</p>}

      <button type="submit" disabled={enviando}>
        {enviando ? "Guardando..." : "Registrar venta"}
      </button>
    </form>
  );
}

export default VentaForm;