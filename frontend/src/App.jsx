import { useState } from "react";
import ClientesPage from "./pages/ClientesPage";
import ProductosPage from "./pages/ProductosPage";
import VentasPage from "./pages/VentasPage";

const PAGINAS = [
  { id: "clientes", etiqueta: "Clientes" },
  { id: "productos", etiqueta: "Productos" },
  { id: "ventas", etiqueta: "Ventas" },
];

function App() {
  const [paginaActiva, setPaginaActiva] = useState("clientes");

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-titulo">Sistema</div>
        <nav className="sidebar-nav">
          {PAGINAS.map((pagina) => (
            <button
              key={pagina.id}
              className={paginaActiva === pagina.id ? "sidebar-boton sidebar-boton-activo" : "sidebar-boton"}
              onClick={() => setPaginaActiva(pagina.id)}
            >
              {pagina.etiqueta}
            </button>
          ))}
        </nav>
      </aside>

      <main className="contenido">
        {paginaActiva === "clientes" && <ClientesPage />}
        {paginaActiva === "productos" && <ProductosPage />}
        {paginaActiva === "ventas" && <VentasPage />}
      </main>
    </div>
  );
}

export default App;