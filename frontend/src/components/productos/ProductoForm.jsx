import { useState } from "react";
import { crearProducto } from "../../api/productos";

function soloLetras(texto) {
  return texto.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, "");
}

function bloquearTeclasNoLetras(e) {
  const teclasPermitidas = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
  if (teclasPermitidas.includes(e.key) || e.ctrlKey || e.metaKey) return;
  if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]$/.test(e.key)) {
    e.preventDefault();
  }
}

const VALORES_INICIALES = {
  sku: "",
  nombre: "",
  marca: "",
  descripcion: "",
  precio: "",
  stock: "",
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

  function handleChangeLetras(e) {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: soloLetras(value) }));
  }

  function validar() {
    const nuevosErrores = {};

    if (!valores.sku.trim()) {
      nuevosErrores.sku = "El código/SKU es obligatorio";
    }
    if (!valores.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }
    if (!valores.marca.trim()) {
      nuevosErrores.marca = "La marca es obligatoria";
    }

    const precioNum = Number(valores.precio);
    if (valores.precio === "" || isNaN(precioNum) || precioNum <= 0) {
      nuevosErrores.precio = "El precio debe ser un número mayor a 0";
    }

    const stockNum = Number(valores.stock);
    if (valores.stock === "" || isNaN(stockNum) || stockNum <= 0) {
      nuevosErrores.stock = "El stock debe ser un número mayor a 0";
    }

    return nuevosErrores;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorServidor(null);

    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);
    try {
      const payload = {
        ...valores,
        precio: Number(valores.precio),
        stock: Number(valores.stock),
        descripcion: valores.descripcion.trim() || null,
      };
      const productoCreado = await crearProducto(payload);
      setValores(VALORES_INICIALES);
      onProductoCreado(productoCreado);
    } catch (err) {
      setErrorServidor(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grupo">
        <label>SKU</label>
        <input name="sku" value={valores.sku} onChange={handleChange} />
        {errores.sku && <span className="error-texto">{errores.sku}</span>}
      </div>

      <div className="form-grupo">
        <label>Nombre</label>
        <input
          name="nombre"
          value={valores.nombre}
          onChange={handleChangeLetras}
          onKeyDown={bloquearTeclasNoLetras}
        />
        {errores.nombre && <span className="error-texto">{errores.nombre}</span>}
      </div>

      <div className="form-grupo">
        <label>Marca</label>
        <input
          name="marca"
          value={valores.marca}
          onChange={handleChangeLetras}
          onKeyDown={bloquearTeclasNoLetras}
        />
        {errores.marca && <span className="error-texto">{errores.marca}</span>}
      </div>

      <div className="form-grupo">
        <label>Descripción</label>
        <input name="descripcion" value={valores.descripcion} onChange={handleChange} />
      </div>

      <div className="form-grupo">
        <label>Precio</label>
        <input
          type="number"
          step="0.01"
          name="precio"
          value={valores.precio}
          onChange={handleChange}
        />
        {errores.precio && <span className="error-texto">{errores.precio}</span>}
      </div>

      <div className="form-grupo">
        <label>Stock inicial</label>
        <input
          type="number"
          name="stock"
          value={valores.stock}
          onChange={handleChange}
        />
        {errores.stock && <span className="error-texto">{errores.stock}</span>}
      </div>

      {errorServidor && <p className="error-texto">{errorServidor}</p>}

      <button type="submit" disabled={enviando}>
        {enviando ? "Guardando..." : "Registrar producto"}
      </button>
    </form>
  );
}

export default ProductoForm;