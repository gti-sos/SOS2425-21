<script lang="ts">
    import { onMount } from "svelte";
    import { dev } from "$app/environment";
    import { Button, Table, Alert, Input } from "@sveltestrap/sveltestrap";
    import { goto } from "$app/navigation";

    // Interfaz de los datos de transporte
    interface TransitStat {
        province: string;
        year: number;
        ticket_price: number;
        total_trips: number;
        route_length: number;
    }

    const DEVEL_HOST = "http://localhost:16078";
    let API = "/api/v1/public-transit-stats";
    if (dev) {
        API = DEVEL_HOST + API;
    }

    let transitData: TransitStat[] = [];
    let filtro: string = "";
    let mensaje: string = "";
    let tipoMensaje: "success" | "danger" = "success";

    // Nuevos datos para crear
    let nuevaProvincia: string = "";
    let nuevoAnio: string = "";
    let nuevoPrecio: string = "";
    let nuevosViajes: string = "";
    let nuevaLongitud: string = "";

    async function cargarDatos(): Promise<void> {
        mensaje = "";
        let url = API;
        if (filtro.trim()) {
            url += `?province=${encodeURIComponent(filtro.trim())}`;
        }
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Error al obtener los datos.");
            const data = await res.json();

            // Si está paginado (viene con { data: [...] }), extraemos solo los datos
            transitData = Array.isArray(data) ? data : data.data;
        } catch (err) {
            mostrarError("No se pudieron cargar los datos.");
        }
    }

    async function crearDato(): Promise<void> {
        mensaje = "";
        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    year: parseInt(nuevoAnio),
                    province: nuevaProvincia,
                    ticket_price: parseFloat(nuevoPrecio),
                    total_trips: parseInt(nuevosViajes),
                    route_length: parseFloat(nuevaLongitud)
                })
            });

            if (res.status === 201) {
                mostrarExito("Dato creado correctamente.");
                limpiarFormulario();
                cargarDatos();
            } else if (res.status === 409) {
                mostrarError("Ya existe un dato con esa provincia y año.");
            } else {
                mostrarError("Error al crear el dato.");
            }
        } catch (err) {
            mostrarError("No se pudo crear el dato.");
        }
    }

    async function borrarDato(province: string, year: number): Promise<void> {
        mensaje = "";
        try {
            const res = await fetch(`${API}/${province}/${year}`, {
                method: "DELETE"
            });

            if (res.status === 200) {
                mostrarExito("Dato eliminado correctamente.");
                cargarDatos();
            } else if (res.status === 404) {
                mostrarError(`No se encontró el dato con provincia '${province}' y año '${year}'.`);
            } else {
                mostrarError("Error al eliminar el dato.");
            }
        } catch {
            mostrarError("No se pudo eliminar el dato.");
        }
    }

    async function borrarTodo(): Promise<void> {
        mensaje = "";
        try {
            const res = await fetch(API, { method: "DELETE" });
            if (res.status === 200) {
                mostrarExito("Todos los datos han sido eliminados.");
                cargarDatos();
            } else {
                mostrarError("Error al eliminar todos los datos.");
            }
        } catch {
            mostrarError("No se pudo eliminar la información.");
        }
    }

    function limpiarFormulario(): void {
        nuevaProvincia = "";
        nuevoAnio = "";
        nuevoPrecio = "";
        nuevosViajes = "";
        nuevaLongitud = "";
    }

    function mostrarExito(msg: string): void {
        mensaje = msg;
        tipoMensaje = "success";
    }

    function mostrarError(msg: string): void {
        mensaje = msg;
        tipoMensaje = "danger";
    }

    function editarDato(dato: TransitStat): void {
        goto(`/editar/${dato.province}/${dato.year}`);
    }

    onMount(cargarDatos);
</script>