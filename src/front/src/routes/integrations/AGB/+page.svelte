<script>
  // @ts-nocheck
  
  import { onMount } from 'svelte';
  
  let consorcioData = [];
  let cargandoConsorcio = true;
  
  onMount(async () => {
    try {
      const resConsorcio = await fetch('https://api.ctan.es/v1/Consorcios/7/consorcios');
      const json = await resConsorcio.json();
      consorcioData = json.consorcios; // acceder al array dentro del objeto
    } catch (err) {
      console.error("Error consorcio:", err);
    } finally {
      cargandoConsorcio = false;
    }
  });
  </script>
  
  <h1>Integración de APIs</h1>
  
  <section>
    <h2>Datos de Consorcios de Transporte</h2>
    {#if cargandoConsorcio}
      <p>Cargando datos de consorcios...</p>
    {:else}
      {#if consorcioData.length > 0}
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Nombre corto</th>
            </tr>
          </thead>
          <tbody>
            {#each consorcioData as consorcio}
              <tr>
                <td>{consorcio.idConsorcio}</td>
                <td>{consorcio.nombre}</td>
                <td>{consorcio.nombreCorto}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No se encontraron datos de consorcios.</p>
      {/if}
    {/if}
  </section>
  
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
  
    th, td {
      border: 1px solid #ccc;
      padding: 0.5rem;
      text-align: left;
    }
  
    th {
      background-color: #f4f4f4;
    }
  </style>
  