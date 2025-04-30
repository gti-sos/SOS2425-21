<svelte:head>
  <title>Integración EMT Madrid</title>
</svelte:head>

<script>
    // @ts-nocheck
    import { onMount } from "svelte";
    import cors from "cors";

    let emtLines = [];
    let error = "";

    const CLIENT_ID = "f155064f-2a6a-471a-a58b-1ff5c20073de";
    const API_KEY = "372A9A442CE9DAAB45199A7ADE056A59C91D30088F689859207ADA0D154BAFF448F2859797039AE7E26DD5A436CDE10B7FA8ED144FD30CBB58FB5F8E26871E6D";

    async function fetchEMTLines() {
        try {
            const response = await fetch("https://openapi.emtmadrid.es/v1/transport/busemtmad/lines/info/ALL", {
                method: "GET",
                headers: {
                    "X-ClientId": CLIENT_ID,
                    "X-ApiKey": API_KEY
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            const result = await response.json();
            emtLines = result.data;
            console.log("Datos de líneas EMT:", emtLines);
        } catch (err) {
            console.error("Error al obtener datos de EMT:", err);
            error = err.message;
        }
    }

    onMount(() => {
        fetchEMTLines();
    });
</script>

{#if error}
  <p>Error al cargar datos: {error}</p>
{:else if emtLines.length}
  <h2>Líneas de Autobús de EMT Madrid</h2>
  <ul>
    {#each emtLines as line}
      <li>
        <strong>{line.label}</strong>: {line.name} ({line.headerA} → {line.headerB})
      </li>
    {/each}
  </ul>
{:else}
  <p>Cargando datos...</p>
{/if}
