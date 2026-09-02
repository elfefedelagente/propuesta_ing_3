import { useState, useEffect } from "react";
import FiltroPanel from "../comunes/FiltroPanel";

function ProductoFiltros({ onBuscar }) {
  const [texto, setTexto] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onBuscar(texto);
    }, 400);

    return () => clearTimeout(timer);
  }, [texto]);

  return (
    <FiltroPanel>
      <div className="form-grupo" style={{ maxWidth: "320px" }}>
        <label>Buscar por nombre o SKU</label>
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej: Yerba, SKU-00042..."
        />
      </div>
    </FiltroPanel>
  );
}

export default ProductoFiltros;