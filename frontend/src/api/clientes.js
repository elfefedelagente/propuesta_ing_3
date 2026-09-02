import { apiFetch } from "./config";

export function listarClientes(busqueda = "") {
  const query = busqueda ? `?busqueda=${encodeURIComponent(busqueda)}` : "";
  return apiFetch(`/clientes/${query}`);
}

export function crearCliente(datos) {
  return apiFetch("/clientes/", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function modificarCliente(clienteId, datos) {
  return apiFetch(`/clientes/${clienteId}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export function darDeBajaCliente(dni) {
  return apiFetch(`/clientes/dni/${dni}/baja`, {
    method: "PATCH",
  });
}