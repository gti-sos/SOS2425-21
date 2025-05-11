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
			integration: '/integrations/AGB',
			video: 'https://youtu.be/tAId_8VpFZY'
		},
		{
			name: 'Laura Eraso Lorenzo',
			frontend: '/home-buying-selling-stats',
			api: `${baseAPI}/home-buying-selling-stats`,
			postman: 'https://documenter.getpostman.com/view/42241739/2sB2cUANcY',
			dataset: 'home-buying-selling-stats',
			integration: '/integrations/LEL',
			video: 'https://youtu.be/Gbh01UiOz1U?si=8MNJBMs4ir4j2xoP'
		},
		{
			name: 'Paula Ruiz Gardón',
			frontend: '/cultural-event',
			api: `${baseAPI}/cultural-event`,
			postman: 'https://documenter.getpostman.com/view/42397783/2sB2cUBNpz',
			dataset: 'cultural-event',
			integration: '/integrations/PRG',
			video: 'https://youtu.be/Z1Am7-SceyE'
		}
	];

	const github = 'https://github.com/gti-sos/SOS2425-21';
</script>

<section class="hero">
	<h1>📦 Recursos del Proyecto - Grupo SOS2425-21</h1>
	<p>Integración de APIs y frontends de Andrea, Laura y Paula</p>
</section>

<section class="grid-container">
	{#each team as member, i}
		<div class="card fade" style="--delay: {i * 0.1}s">
			<h2>👤 {member.name}</h2>
			<ul>
				<li><a href={member.frontend}>🌐 Frontend</a></li>
				<li><a href={member.api}>🛠️ API</a></li>
				<li><a href={member.postman}>📄 Documentación</a></li>
				<li>📊 Dataset: {member.dataset}</li>
				{#if member.integration}
					<li><a href={member.integration}>🔗 Integración</a></li>
				{/if}
				<li><a href={member.video}>🎥 Video</a></li>
			</ul>
		</div>
	{/each}

	<div class="card fade" style="--delay: 0.4s">
		<h2>📁 Repositorio</h2>
		<a href={github}>Ver en GitHub</a>
	</div>

	<div class="card fade" style="--delay: 0.5s">
		<h2>📈 Integración grupal</h2>
		<a href="/analytics">Ver dashboard</a>
	</div>
</section>

<style>
	:root {
		--primary: #1e3a8a;
		--bg: #f9fafb;
		--card: #ffffff;
		--text: #1f2937;
	}

	body {
		margin: 0;
		background-color: var(--bg);
		font-family: 'Segoe UI', sans-serif;
		color: var(--text);
	}

	.hero {
		text-align: center;
		padding: 1rem 1rem;
		background: linear-gradient(135deg, #1e3a8a 10%, #60a5fa 100%);
		color: white;
	}

	.hero h1 {
		font-size: 2.2rem;
		margin: 0;
	}

	.hero p {
		font-size: 1.1rem;
		margin-top: 0.5rem;
	}

	.grid-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
		padding: 4rem 3rem;
		place-items: center;
		box-sizing: border-box;
	}

	.card {
		background: var(--card);
		border-radius: 1rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		padding: 1.5rem;
		width: 100%;
		max-width: 400px;
		min-height: 180px;
		opacity: 0;
		transform: translateY(30px);
		animation: fadeInUp 0.6s ease forwards;
		animation-delay: var(--delay);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.card:hover {
		transform: scale(1.03);
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
	}

	h2 {
		color: var(--primary);
		margin-top: 0;
		font-size: 1.2rem;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0;
	}

	ul li {
		margin-bottom: 0.4rem;
		font-size: 0.95rem;
	}

	a {
		color: var(--primary);
		text-decoration: none;
		font-weight: 500;
	}

	a:hover {
		text-decoration: underline;
	}

	@keyframes fadeInUp {
		0% {
			opacity: 0;
			transform: translateY(30px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
