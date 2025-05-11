<script>
	import { dev } from '$app/environment';
</script>

<section class="hero">
	<h1>🚀 Service Oriented Systems 2024/2025</h1>
	<p>Universidad de Sevilla — Grupo SOS2425-21</p>
</section>

<section class="grid-container">
	<div class="card fade" style="--delay: 0s">
		<h2>👨‍🏫 Lecturer</h2>
		<a href="https://github.com/pafmon" target="_blank">Pablo Fernández</a>
	</div>

	<div class="card fade" style="--delay: 0.1s">
		<h2>👥 Team</h2>
		<ul>
			<li><a href="https://github.com/andgombal" target="_blank">Andrea Gómez Balmaseda</a></li>
			<li><a href="https://github.com/laueralor" target="_blank">Laura Eraso Lorenzo</a></li>
			<li><a href="https://github.com/pauruigar6" target="_blank">Paula Ruiz Gardón</a></li>
		</ul>
	</div>

	<div class="card fade" style="--delay: 0.2s">
		<h2>🧠 Project</h2>
		<p>
			Analyzes the relationship between urban transport, cultural events, and housing market activity in Spain.
		</p>
	</div>

	<div class="card fade" style="--delay: 0.3s">
		<h2>📂 Repository</h2>
		<a href="https://github.com/orgs/gti-sos/teams/sos2425-21" target="_blank">gti-sos/SOS2425-21</a>
	</div>

	<div class="card fade" style="--delay: 0.4s">
		<h2>🌐 Deployment</h2>
		<a href="https://sos2425-21.onrender.com" target="_blank">sos2425-21.onrender.com</a>
	</div>

	<div class="card fade" style="--delay: 0.5s">
		<h2>📡 APIs</h2>
		<ul>
			<li>
				<a href="https://sos2425-21.onrender.com/api/v1/public-transit-stats/docs" target="_blank">
					Public Transit Stats API
				</a> — Andrea
			</li>
			<li>
				<a href="https://sos2425-21.onrender.com/api/v1/home-buying-selling-stats/docs" target="_blank">
					Home Buying & Selling Stats API
				</a> — Laura
			</li>
			<li>
				<a href="https://sos2425-21.onrender.com/api/v1/cultural-event/docs" target="_blank">
					Cultural Events Stats API
				</a> — Paula
			</li>
		</ul>
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
		padding: 2rem 1rem;
		background: linear-gradient(135deg, #1e3a8a 10%, #60a5fa 100%);
		color: white;
	}

	.hero h1 {
		font-size: 2.5rem;
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
		min-height: calc(100vh - 200px);
	}

	.card {
		background: var(--card);
		border-radius: 1rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		padding: 1.5rem;
		width: 100%;
		max-width: 420px;
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

	p {
		line-height: 1.6;
		margin: 0.5rem 0;
	}

	a {
		color: var(--primary);
		text-decoration: none;
		font-weight: 500;
	}

	a:hover {
		text-decoration: underline;
	}

	ul {
		padding-left: 1rem;
		margin: 0.5rem 0;
	}

	ul li {
		margin-bottom: 0.3rem;
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
