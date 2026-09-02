import { apiFetch } from "./config";

export function listarVentas({ dni_cliente, fecha_desde, fecha_hasta } = {}) {
  const params = new URLSearchParams();
  if (dni_cliente) params.append("dni_cliente", dni_cliente);
  if (fecha_desde) params.append("fecha_desde", fecha_desde);
  if (fecha_hasta) params.append("fecha_hasta", fecha_hasta);

  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/ventas/${query}`);
}

export function crearVenta(datos) {
  return apiFetch("/ventas/", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function modificarVenta(ventaId, datos) {
  return apiFetch(`/ventas/${ventaId}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export function anularVenta(ventaId) {
  return apiFetch(`/ventas/${ventaId}/anular`, {
    method: "PATCH",
  });
}