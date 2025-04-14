<script lang="ts">
    import { onMount } from "svelte";
    import { dev } from "$app/environment";
    import { Button, Table, Alert, Input } from "@sveltestrap/sveltestrap";
    import { goto } from "$app/navigation";

    const DEVEL_HOST = "http://localhost:16078";
    let API = "/api/v1/public-transit-stats";
    if (dev) {
        API = DEVEL_HOST + API;
    }

    let transitData = [];
    let filtro = "";
    let mensaje = "";
    let tipoMensaje = "success";

    // Nuevos datos para crear
    let nuevaProvincia = "";
    let nuevoAnio = "";
    let nuevoPrecio = "";
    let nuevosViajes = "";
    let nuevaLongitud = "";

    async function cargarDatos() {
        mensaje = "";
        let url = API;
        if (filtro.trim()) {
            url += `?province=${encodeURIComponent(filtro.trim())}`;
        }
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Error al obtener los datos.");
            transitData = await res.json();
        } catch (err) {
            mostrarError("No se pudieron cargar los datos.");
        }
    }

    async function crearDato() {
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

    async function borrarDato(province, year) {
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

    async function borrarTodo() {
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

    function limpiarFormulario() {
        nuevaProvincia = "";
        nuevoAnio = "";
        nuevoPrecio = "";
        nuevosViajes = "";
        nuevaLongitud = "";
    }

    function mostrarExito(msg: string) {
        mensaje = msg;
        tipoMensaje = "success";
    }

    function mostrarError(msg: string) {
        mensaje = msg;
        tipoMensaje = "danger";
    }

    function editarDato(dato) {
        goto(`/editar/${dato.province}/${dato.year}`);
    }

    onMount(cargarDatos);
</script>

<h2>Estadísticas de Transporte Público en España</h2>

{#if mensaje}
    <Alert color={tipoMensaje}>{mensaje}</Alert>
{/if}

<h4>Buscar por Provincia</h4>
<Input bind:value={filtro} placeholder="Ej: Sevilla" />
<Button class="mt-2 mb-3" on:click={cargarDatos} color="info">Buscar</Button>

<Table bordered responsive>
    <thead>
        <tr>
            <th>Provincia</th>
            <th>Año</th>
            <th>Precio del billete (€)</th>
            <th>Viajes totales</th>
            <th>Longitud de rutas (km)</th>
            <th>Acciones</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><Input bind:value={nuevaProvincia} placeholder="Nueva provincia" /></td>
            <td><Input bind:value={nuevoAnio} type="number" /></td>
            <td><Input bind:value={nuevoPrecio} type="number" step="0.01" /></td>
            <td><Input bind:value={nuevosViajes} type="number" /></td>
            <td><Input bind:value={nuevaLongitud} type="number" step="0.01" /></td>
            <td>
                <Button color="success" on:click={crearDato}>Añadir</Button>
            </td>
        </tr>
        {#each transitData as d}
            <tr>
                <td>{d.province}</td>
                <td>{d.year}</td>
                <td>{d.ticket_price}</td>
                <td>{d.total_trips}</td>
                <td>{d.route_length}</td>
                <td>
                    <Button color="primary" on:click={() => editarDato(d)}>Editar</Button>
                    <Button color="danger" class="ms-1" on:click={() => borrarDato(d.province, d.year)}>Borrar</Button>
                </td>
            </tr>
        {/each}
    </tbody>
</Table>

<Button color="danger" on:click={borrarTodo} class="mt-3">Eliminar todos los datos</Button>
