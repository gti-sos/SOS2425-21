<script>
	const links = [
		{ href: '/', label: 'Inicio' },
		{ href: '/public-transit-stats', label: 'Viajes en autobús urbano' },
		{ href: '/home-buying-selling-stats', label: 'Compraventa de viviendas' },
		{ href: '/cultural-event', label: 'Eventos culturales' }
	];
</script>

<nav>
	<div class="brand">Grupo 21 - SOS</div>
	<div class="nav-links">
		{#each links as link}
			<a href={link.href}>{link.label}</a>
		{/each}
	</div>
</nav>

<style>
	nav {
		background-color: #1e3a8a;
		color: white;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		flex-wrap: wrap;
		font-family: 'Segoe UI', sans-serif;
	}

	.brand {
		font-size: 1.4rem;
		font-weight: bold;
	}

	.nav-links {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.nav-links a {
		color: white;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	.nav-links a:hover {
		color: #a5c1ff;
	}

	@media (max-width: 640px) {
		nav {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.8rem;
		}

		.nav-links {
			flex-direction: column;
			gap: 0.5rem;
			width: 100%;
		}
	}
</style>
