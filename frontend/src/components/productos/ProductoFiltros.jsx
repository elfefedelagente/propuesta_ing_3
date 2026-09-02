import {UseState, useEffect} from "react";

function ProductoFiltros({ onBuscar }) {
    const [texto, setTexto] = useState("");

    UseEffect(() => {
        const timer = setTimeout(() => {
            onBuscar(texto);
        }, 400);
    return () => clearTimeout(timer);
    }, [texto]);

    return(
        <div className="form-grupo" style={{ maxWidth: "320px" }}>
            <label>Buscar por nombre o categoría</label>
            <input
                type="text"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Ej: Camiseta de Boquita, 42..."
            />
        </div>
    );
}
export default ProductoFiltros;