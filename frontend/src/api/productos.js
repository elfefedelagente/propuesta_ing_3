import { apiFetch } from "./config";

export function listarProductos(busqueda = "") {
  const query = busqueda ? `?busqueda=${encodeURIComponent(busqueda)}` : "";
  return apiFetch(`/productos/${query}`);
}

export function crearProducto(datos) {
  return apiFetch("/productos/", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function modificarProducto(sku, datos) {
  return apiFetch(`/productos/sku/${sku}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export function darDeBajaProducto(sku) {
  return apiFetch(`/productos/sku/${sku}/baja`, {
    method: "PATCH",
  });
}