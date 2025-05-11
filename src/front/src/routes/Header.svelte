<script>
	let showDropdown = false;

	const links = [
		{ label: 'Inicio', href: '/' },
		{ label: 'APIs', href: '#', dropdown: true },
		{ label: 'Integración', href: '/analytics' },
		{ label: 'Equipo', href: '/about' },
		{ label: 'GitHub', href: 'https://github.com/gti-sos/SOS2425-21', external: true }
	];

	const apiLinks = [
		{ label: '🚍 Public Transit', href: '/public-transit-stats', testid: 'link-public-transit' },
		{ label: '🏠 Home Sales', href: '/home-buying-selling-stats', testid: 'link-home-buying' },
		{ label: '🎭 Cultural Events', href: '/cultural-event', testid: 'link-cultural-event' }
	];

	function toggleDropdown() {
		showDropdown = !showDropdown;
	}

	function closeDropdown() {
		showDropdown = false;
	}
</script>

<svelte:window on:click={closeDropdown} />

<header class="main-header">
	<div class="container">
		<h1 class="logo">Grupo 21 · SOS2425</h1>
		<nav class="nav">
			{#each links as link}
				{#if link.dropdown}
					<div class="nav-item" on:click|stopPropagation={toggleDropdown}>
						<span class="nav-link">{link.label} ▾</span>
						{#if showDropdown}
							<div class="dropdown" on:click|stopPropagation>
								{#each apiLinks as api}
									<a
										class="dropdown-link"
										href={api.href}
										data-testid={api.testid}
									>
										{api.label}
									</a>
								{/each}
							</div>
						{/if}
					</div>
				{:else}
					<a
						class="nav-link"
						href={link.href}
						target={link.external ? '_blank' : '_self'}
						rel={link.external ? 'noopener noreferrer' : null}
					>
						{link.label}
					</a>
				{/if}
			{/each}
		</nav>
	</div>
</header>

<style>
	.main-header {
		background: linear-gradient(135deg, #1e3a8a 10%, #60a5fa 100%);
		color: white;
		padding: 1.2rem 2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 0;
		z-index: 1000;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: 0.5px;
		margin: 0;
	}

	.nav {
		display: flex;
		gap: 1.5rem;
		position: relative;
	}

	.nav-item {
		position: relative;
		cursor: pointer;
	}

	.nav-link {
		color: white;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.3s ease;
		position: relative;
	}

	.nav-link::after {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0;
		width: 0%;
		height: 2px;
		background-color: white;
		transition: width 0.3s ease;
	}

	.nav-link:hover::after {
		width: 100%;
	}

	.nav-link:hover {
		color: #dbeafe;
	}

	.dropdown {
		position: absolute;
		top: 2.5rem;
		left: 0;
		background-color: white;
		color: #1e3a8a;
		border-radius: 0.5rem;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		padding: 0.5rem 0.75rem;
		min-width: 200px;
		z-index: 999;
	}

	.dropdown-link {
		text-decoration: none;
		color: #1e3a8a;
		font-weight: 500;
		padding: 0.5rem;
		border-radius: 0.4rem;
		transition: background-color 0.2s;
	}

	.dropdown-link:hover {
		background-color: #eef2ff;
	}

	@media (max-width: 768px) {
		.nav {
			flex-direction: column;
			align-items: flex-start;
			margin-top: 1rem;
		}
	}
</style>
