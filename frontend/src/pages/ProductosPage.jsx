import {useState, useEffect} from "react";
import {listarProductos, darDeBajaProducto} from "../api/productos";
import ProductoForm from "../components/productos/ProductoForm";
import ProductoFiltros from "../components/productos/ProductoFiltros";

function ProductosPage() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState("");

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

    function handleProductoCreado(nuevoProducto) {
        setProductos((prev) => [...prev, nuevoProducto]);
    }

    async function handleBaja(id) {
        try {
            const productoActualizado = await darDeBajaProducto(id);
            setProductos((prev) =>
                prev.map((p) => (p.id === id ? productoActualizado : p))
            );
        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <div className="contenedor">
            <h1>Productos</h1>
            <ProductoForm onProductoCreado={handleProductoCreado} />
            <hr style={{ margin: "2rem 0", borderColor: "var(--color-borde)" }} />
            <ProductoFiltros onBuscar={setBusqueda} />
            {cargando && <p>Cargando productos...</p>}
            {error && <p className="error-texto">{error}</p>}

            {!cargando && !error && productos.length === 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                </thead>
                </tr>

                </table>
            )}
        </div>
    );
}