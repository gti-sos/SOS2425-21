<script>
	import { dev } from '$app/environment';

	let baseAPI = '/api/v1';
	if (dev) {
		baseAPI = 'http://localhost:16078/api/v1';
	}

	const team = [
		{
			name: 'Andrea Gómez Balmaseda',
			frontend: '/public-transit-stats',
			api: `${baseAPI}/public-transit-stats`,
			postman: 'https://documenter.getpostman.com/view/41997974/2sB2cSi4as',
			dataset: 'public-transit-stats',
			integration: '/integrations/AGB'
		},
		{
			name: 'Laura Eraso Lorenzo',
			frontend: '/home-buying-selling-stats',
			api: `${baseAPI}/home-buying-selling-stats`,
			postman: 'https://documenter.getpostman.com/view/42241739/2sB2cUANcY',
			dataset: 'home-buying-selling-stats',
			integration: ''
		},
		{
			name: 'Paula Ruiz Gardón',
			frontend: '/cultural-event',
			api: `${baseAPI}/cultural-event`,
			postman: 'https://documenter.getpostman.com/view/42397783/2sB2cUBNpz',
			dataset: 'cultural-event',
			integration: ''
		}
	];

	const github = 'https://github.com/gti-sos/SOS2425-21';
</script>

<div class="container">
	<h1>Proyecto SOS2425 - Grupo 21</h1>

	<a class="button-link" href="/analytics">Ver integración grupal</a>

	<h2>Miembros del equipo y sus recursos</h2>
	{#each team as member}
		<div class="team-card">
			<div class="team-name">{member.name}</div>
			<div class="resource">Frontend: <a href={member.frontend}>{member.frontend}</a></div>
			<div class="resource">API: <a href={member.api}>{member.api}</a></div>
			<div class="resource">Postman: <a href={member.postman}>Documentación</a></div>
			<div class="resource">Dataset: {member.dataset}</div>
			{#if member.integration}
				<div class="resource">
					Integraciones: <a href={member.integration}>{member.integration}</a>
				</div>
			{/if}
		</div>
	{/each}

	<h2>Repositorio del equipo</h2>
	<a class="button-link" href={github}>Ver en GitHub</a>
</div>

<style>
	.container {
		max-width: 900px;
		margin: auto;
		padding: 2rem;
		font-family: 'Segoe UI', sans-serif;
	}

	h1 {
		font-size: 2.2rem;
		margin-bottom: 1rem;
		text-align: center;
		color: #2c3e50;
	}

	h2 {
		font-size: 1.5rem;
		margin-top: 2rem;
		color: #34495e;
	}

	.team-card {
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		transition: transform 0.2s;
	}

	.team-card:hover {
		transform: translateY(-4px);
	}

	.team-name {
		font-weight: 600;
		font-size: 1.2rem;
		margin-bottom: 0.5rem;
		color: #2d3436;
	}

	.resource {
		margin: 0.3rem 0;
	}

	.resource a {
		color: #2980b9;
		text-decoration: none;
	}

	.resource a:hover {
		text-decoration: underline;
	}

	.button-link {
		display: inline-block;
		background-color: #2980b9;
		color: #fff;
		padding: 0.5rem 1rem;
		margin-top: 1rem;
		border-radius: 6px;
		text-decoration: none;
		transition: background-color 0.3s;
	}

	.button-link:hover {
		background-color: #1c5980;
	}
</style>