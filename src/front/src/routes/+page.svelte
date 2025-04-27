<script>
    import { dev } from '$app/environment';
  
    // Aquí, configuramos el base URL para las APIs dependiendo de si estamos en desarrollo o producción
    let baseAPI = "/api/v1"; // Para producción
    if (dev) {
      baseAPI = "http://localhost:16078/api/v1"; // Para desarrollo
    }
  
    const team = [
      {
        name: "Andrea Gómez Balmaseda",
        frontend: "/public-transit-stats",
        api: `${baseAPI}/public-transit-stats`,
        postman: "https://documenter.getpostman.com/view/41997974/2sB2cSi4as",
        dataset: "public-transit-stats"
      },
      {
        name: "Laura Eraso Lorenzo",
        frontend: "/home-buying-selling-stats",
        api: `${baseAPI}/home-buying-selling-stats`,
        postman: "https://documenter.getpostman.com/view/42241739/2sB2cUANcY",
        dataset: "home-buying-selling-stats"
      },
      {
        name: "Paula Ruiz Gardón",
        frontend: "/cultural-event-stats",
        api: `${baseAPI}/cultural-event-stats`,
        postman: "https://documenter.getpostman.com/view/42397783/2sB2cUBNpz",
        dataset: "cultural-event-stats"
      },
    ];
  
    const github = "https://github.com/gti-sos/SOS2425-21";
  </script>
  
  <h1>Proyecto SOS2425 - Grupo 21</h1>
  
  <h2>Miembros del equipo y sus recursos</h2>
  <ul>
    {#each team as member}
      <li>
        <strong>{member.name}</strong><br>
        Frontend: <a href="{member.frontend}">{member.frontend}</a><br>
        API: <a href="{member.api}">{member.api}</a><br>
        Postman: <a href="{member.postman}">Documentación</a><br>
        Dataset: {member.dataset}
      </li>
      <br>
    {/each}
  </ul>
  
  <h2>Repositorio del equipo</h2>
  <a href="{github}">{github}</a>
  