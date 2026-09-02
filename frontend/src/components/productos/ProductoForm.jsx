import {useState} from "react";
import {crearProducto} from "../../api/productos";

const PATRON_SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;
const VALORES_INICIALES = {
    nombre: "",
    precio: "",
    stock: ""
};

function ProductoForm({ onProductoCreado }) {
    const [valores, setValores] = useState(VALORES_INICIALES);
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [errorServidor, setErrorServidor] = useState(null);

    function handleChange(e) {
        const { name, value } = e.target;
        setValores((prev) => ({ ...prev, [name]: value }));
    }

    function validar() {
        const nuevosErrores = {};
        if (!valores.nombre.trim()) {
            nuevosErrores.nombre = "El nombre es obligatorio";
        }
        if (!PATRON_SOLO_LETRAS.test(valores.nombre)) { 
            nuevosErrores.nombre = "El nombre solo puede contener letras y espacios";
        }
        if (!valores.precio.trim()) {
            nuevosErrores.precio = "El precio es obligatorio";
        } else if (parseFloat(valores.precio) <= 0) {
            nuevosErrores.precio = "El precio debe ser un número positivo";
        }
        if (!valores.stock.trim()) {
            nuevosErrores.stock = "El stock es obligatorio";
        } else if (parseInt(valores.stock) < 0) {
            nuevosErrores.stock = "El stock no puede ser un número negativo";
        }
        return nuevosErrores;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErrorServidor(null);

        const nuevosErrores = validar();
        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
            return;
        }

        try {
            setEnviando(true);
            const nuevoProducto = await crearProducto(valores);
            onProductoCreado(nuevoProducto);
            setValores(VALORES_INICIALES);
        } catch (err) {
            setErrorServidor(err.message);
        } finally {
            setEnviando(false);
        }
    }
    return (
        <form onSubmit={handleSubmit} className="formulario">
            <div className="form-group">
                <label htmlFor="nombre">Nombre:</label>
                <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={valores.nombre}
                    onChange={handleChange}
                    className={errores.nombre ? "form-control is-invalid" : "form-control"}
                />
                {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
            </div>
            <div className="form-group">
                <label htmlFor="precio">Precio:</label>
                <input
                    type="number"
                    id="precio"
                    name="precio"
                    value={valores.precio}
                    onChange={handleChange}
                    className={errores.precio ? "form-control is-invalid" : "form-control"}
                />
                {errores.precio && <div className="invalid-feedback">{errores.precio}</div>}
            </div>
            <div className="form-group">
                <label htmlFor="stock">Stock:</label>
                <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={valores.stock}
                    onChange={handleChange}
                    className={errores.stock ? "form-control is-invalid" : "form-control"}
                />
                {errores.stock && <div className="invalid-feedback">{errores.stock}</div>}
            </div>
            {errorServidor && (
                <div className="alert alert-danger" role="alert">
                    {errorServidor}
                </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={enviando}>
                {enviando ? "Enviando..." : "Crear Producto"}
            </button>
        </form> 
    );
}

export default ProductoForm;