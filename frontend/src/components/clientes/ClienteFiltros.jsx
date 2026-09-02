import { useState, useEffect } from "react";

function ClienteFiltros({ onBuscar }) {
  const [texto, setTexto] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onBuscar(texto);
    }, 400);

    return () => clearTimeout(timer);
  }, [texto]);

  return (
    <div className="form-grupo" style={{ maxWidth: "320px" }}>
      <label>Buscar por DNI, nombre o apellido</label>
      <input
        type="text"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Ej: Pérez, 42479076..."
      />
    </div>
  );
}

export default ClienteFiltros;