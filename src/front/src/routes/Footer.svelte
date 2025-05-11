<footer class="footer">
	<div class="footer-container">
		<p>© 2025 SOS2425 - Grupo 21 · Universidad de Sevilla</p>
		<div class="footer-links">
			<a href="/">Inicio</a>
			<a href="/about">Conócenos</a>
			<a href="/analytics">Integración</a>
			<a href="https://github.com/gti-sos/SOS2425-21" target="_blank" rel="noopener noreferrer">GitHub</a>
		</div>
	</div>
</footer>

<style>
	.footer {
		background: linear-gradient(135deg, #1e3a8a 10%, #60a5fa 100%);
		color: white;
		padding: 2rem 1rem;
		margin-top: 4rem;
		font-family: 'Segoe UI', sans-serif;
	}

	.footer-container {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.8rem;
		text-align: center;
	}

	.footer p {
		margin: 0;
		font-size: 0.95rem;
	}

	.footer-links {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.footer-links a {
		color: white;
		text-decoration: none;
		font-weight: 500;
		transition: opacity 0.3s;
	}

	.footer-links a:hover {
		opacity: 0.8;
		text-decoration: underline;
	}
</style>
