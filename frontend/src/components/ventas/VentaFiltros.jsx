// src/components/ventas/VentaFiltros.jsx
import { useState, useEffect } from "react";
import FiltroPanel from "../comunes/FiltroPanel";

const DNI_MAX_DIGITOS = 8;

function VentaFiltros({ onFiltrar }) {
  const [dni, setDni] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  function handleChangeDni(e) {
    setDni(e.target.value.replace(/\D/g, "").slice(0, DNI_MAX_DIGITOS));
  }

  function bloquearTeclasNoNumericas(e) {
    const teclasPermitidas = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
    if (teclasPermitidas.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltrar({
        dni_cliente: dni || undefined,
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [dni, fechaDesde, fechaHasta]);

  return (
    <FiltroPanel>
      <div className="barra-acciones">
        <div className="form-grupo">
          <label>DNI del cliente</label>
          <input
            value={dni}
            inputMode="numeric"
            onChange={handleChangeDni}
            onKeyDown={bloquearTeclasNoNumericas}
            maxLength={DNI_MAX_DIGITOS}
          />
        </div>
        <div className="form-grupo">
          <label>Desde</label>
          <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
        </div>
        <div className="form-grupo">
          <label>Hasta</label>
          <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
        </div>
      </div>
    </FiltroPanel>
  );
}

export default VentaFiltros;