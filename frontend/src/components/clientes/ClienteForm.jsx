import { useState } from "react";
import { crearCliente } from "../../api/clientes";

const PATRON_SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;
const PATRON_TELEFONO = /^[0-9]+$/;
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DNI_MAX_DIGITOS = 8;
const TELEFONO_MAX_DIGITOS = 13;

function soloDigitos(texto) {
  return texto.replace(/\D/g, "");
}

function soloLetras(texto) {
  return texto.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, "");
}

function bloquearTeclasNoNumericas(e) {
  const teclasPermitidas = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
  if (teclasPermitidas.includes(e.key) || e.ctrlKey || e.metaKey) return;
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
}

function bloquearTeclasNoLetras(e) {
  const teclasPermitidas = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
  if (teclasPermitidas.includes(e.key) || e.ctrlKey || e.metaKey) return;
  if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]$/.test(e.key)) {
    e.preventDefault();
  }
}

const VALORES_INICIALES = {
  dni: "",
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
};

function ClienteForm({ onClienteCreado }) {
  const [valores, setValores] = useState(VALORES_INICIALES);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorServidor, setErrorServidor] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value }));
  }

  function handleChangeDigitos(e, maxDigitos) {
    const { name, value } = e.target;
    const soloNumeros = soloDigitos(value).slice(0, maxDigitos);
    setValores((prev) => ({ ...prev, [name]: soloNumeros }));
  }

  function handleChangeLetras(e) {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: soloLetras(value) }));
  }

  function validar() {
    const nuevosErrores = {};

    if (!valores.dni.trim()) {
      nuevosErrores.dni = "El DNI es obligatorio";
    } else if (valores.dni.length < 7) {
      nuevosErrores.dni = "El DNI debe tener entre 7 y 8 dígitos";
    }

    if (!PATRON_SOLO_LETRAS.test(valores.nombre)) {
      nuevosErrores.nombre = "El nombre solo debe contener letras";
    }

    if (!PATRON_SOLO_LETRAS.test(valores.apellido)) {
      nuevosErrores.apellido = "El apellido solo debe contener letras";
    }

    if (!PATRON_EMAIL.test(valores.email)) {
      nuevosErrores.email = "El email no tiene un formato válido";
    }

    if (!valores.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else if (!PATRON_TELEFONO.test(valores.telefono)) {
      nuevosErrores.telefono = "El teléfono solo debe contener números";
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

    setEnviando(true);
    try {
      const clienteCreado = await crearCliente(valores);
      setValores(VALORES_INICIALES);
      onClienteCreado(clienteCreado);
    } catch (err) {
      setErrorServidor(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grupo">
        <label>DNI</label>
        <input
          name="dni"
          inputMode="numeric"
          value={valores.dni}
          onChange={(e) => handleChangeDigitos(e, DNI_MAX_DIGITOS)}
          onKeyDown={bloquearTeclasNoNumericas}
          maxLength={DNI_MAX_DIGITOS}
        />
        {errores.dni && <span className="error-texto">{errores.dni}</span>}
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
        <label>Apellido</label>
        <input
          name="apellido"
          value={valores.apellido}
          onChange={handleChangeLetras}
          onKeyDown={bloquearTeclasNoLetras}
        />
        {errores.apellido && <span className="error-texto">{errores.apellido}</span>}
      </div>

      <div className="form-grupo">
        <label>Email</label>
        <input name="email" value={valores.email} onChange={handleChange} />
        {errores.email && <span className="error-texto">{errores.email}</span>}
      </div>

      <div className="form-grupo">
        <label>Teléfono</label>
        <input
          name="telefono"
          inputMode="numeric"
          value={valores.telefono}
          onChange={(e) => handleChangeDigitos(e, TELEFONO_MAX_DIGITOS)}
          onKeyDown={bloquearTeclasNoNumericas}
          maxLength={TELEFONO_MAX_DIGITOS}
        />
        {errores.telefono && <span className="error-texto">{errores.telefono}</span>}
      </div>

      {errorServidor && <p className="error-texto">{errorServidor}</p>}

      <button type="submit" disabled={enviando}>
        {enviando ? "Guardando..." : "Registrar cliente"}
      </button>
    </form>
  );
}

export default ClienteForm;