<script lang="ts">
  // @ts-nocheck
  import { onMount } from 'svelte';
  import { dev } from '$app/environment';

  // Configuración del proxy (si lo tuvieras)
  const DEVEL_HOST = "http://localhost:16078";
  let API = "/api/v1/home-buying-selling-stats";
  if (dev) {
    API = DEVEL_HOST + API;
  }

  // Estado para los datos de Idealista
  let idealista: Array<{
    locationId: string;
    name: string;
    subTypeText: string;
  }> = [];
  let cargandoIdealista = true;
  let errorIdealista: string | null = null;

  onMount(async () => {
    const RAPIDAPI_HOST = 'idealista7.p.rapidapi.com';
    const RAPIDAPI_KEY  = '30dc95fca9msh69341c1646ebba5p10258ajsne34d0462ecf4';


    const params = new URLSearchParams({
      locationId:   '0-EU-ES-28',
      location:     'es',
      propertyType: 'homes',
      operation:    'sale'
    });

    try {
      const res = await fetch(
        `https://idealista7.p.rapidapi.com/getlocations?locationId=0-EU-ES-28&location=es&propertyType=homes&operation=sale`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-host': RAPIDAPI_HOST,
            'x-rapidapi-key':  RAPIDAPI_KEY
          }
        }
      );

      if (!res.ok) {
        throw new Error(`Idealista API error: ${res.status}`);
      }

      const body = await res.json();
      idealista = body.locations.map((loc: any) => ({
        locationId: loc.locationId,
        name:       loc.name,
        subTypeText: loc.subTypeText
      }));
    } catch (err: any) {
      console.error(err);
      errorIdealista = err.message;
    } finally {
      cargandoIdealista = false;
    }
  });
</script>

<h1>Integración de APIs</h1>

<nav class="links">
  <a href="/integrations/LEL/g10-registrations-stats">Integración Grupo 10</a>
  <a href="/integrations/LEL/g20-fines">Integración Grupo 20</a>
  <a href="/integrations/LEL/g11-autonomy-dependences-application">Integracion Grupo 12</a>
  <a href="/integrations/LEL/fotocasa">Fotocasa</a>
  <a href="/integrations/LEL/eurostat">Eurostat</a>
</nav>

<hr>

<section class="idealista-section">
  <h2>Datos de Idealista</h2>

  {#if cargandoIdealista}
    <p>Cargando datos de Idealista…</p>
  {:else if errorIdealista}
    <p class="error">Error al cargar Idealista: {errorIdealista}</p>
  {:else if idealista.length > 0}
    <table class="styled-table">
      <thead>
        <tr>
          <th>Location ID</th>
          <th>Nombre</th>
          <th>Tipo/Subtipo</th>
        </tr>
      </thead>
      <tbody>
        {#each idealista as loc}
          <tr>
            <td>{loc.locationId}</td>
            <td>{loc.name}</td>
            <td>{loc.subTypeText}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>No se encontraron sublocations en Idealista.</p>
  {/if}
</section>

<style>
  h1 {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 1rem;
  }

  .links {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }

  .links a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
  }
  .links a:hover {
    text-decoration: underline;
  }

  .idealista-section {
    max-width: 900px;
    margin: 0 auto;
    padding: 1.5rem;
    background: #fafafa;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .idealista-section h2 {
    margin-bottom: 1rem;
    color: #111827;
  }

  .error {
    color: #dc2626;
    font-weight: bold;
  }

  .styled-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
    min-width: 400px;
  }

  .styled-table thead tr {
    background-color: #3b82f6;
    color: #ffffff;
    text-align: left;
  }

  .styled-table th,
  .styled-table td {
    padding: 12px 15px;
    border: 1px solid #e5e7eb;
  }

  .styled-table tbody tr {
    border-bottom: 1px solid #e5e7eb;
  }

  .styled-table tbody tr:nth-of-type(even) {
    background-color: #f3f4f6;
  }

  .styled-table tbody tr:last-of-type {
    border-bottom: 2px solid #3b82f6;
  }

  .styled-table tbody tr:hover {
    background-color: #e0e7ff;
  }
</style>
