// src/pages/ProductosPage.jsx
import { useState, useEffect } from "react";
import { listarProductos, darDeBajaProducto } from "../api/productos";
import { useToast } from "../context/ToastContext";
import ProductoForm from "../components/productos/ProductoForm";
import ProductoFiltros from "../components/productos/ProductoFiltros";

function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const mostrarToast = useToast();

  useEffect(() => {
    cargarProductos(busqueda);
  }, [busqueda]);

  async function cargarProductos(filtro) {
    try {
      setCargando(true);
      const data = await listarProductos(filtro);
      setProductos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function handleProductoCreado() {
    cargarProductos(busqueda);
    mostrarToast("Producto registrado correctamente", "exito");
  }

  async function handleBaja(sku) {
    try {
      const productoActualizado = await darDeBajaProducto(sku);
      setProductos((prev) =>
        prev.map((p) => (p.sku === sku ? productoActualizado : p))
      );
      mostrarToast("Producto dado de baja", "info");
    } catch (err) {
      mostrarToast(err.message, "error");
    }
  }

  return (
    <div className="contenedor">
      <h1>Productos</h1>

      <ProductoForm onProductoCreado={handleProductoCreado} />

      <hr className="separador" />

      <ProductoFiltros onBuscar={setBusqueda} />

      {cargando && <p>Cargando productos...</p>}
      {error && <p className="error-texto">{error}</p>}

      {!cargando && !error && productos.length === 0 && (
        <p>No se encontraron resultados.</p>
      )}

      {!cargando && !error && productos.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.sku}</td>
                <td>{producto.nombre}</td>
                <td>{producto.marca}</td>
                <td>${producto.precio.toFixed(2)}</td>
                <td>{producto.stock}</td>
                <td>
                  <span className={`badge ${producto.estado ? "badge-activo" : "badge-inactivo"}`}>
                    {producto.estado ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  {producto.estado && (
                    <button onClick={() => handleBaja(producto.sku)}>
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

export default ProductosPage;