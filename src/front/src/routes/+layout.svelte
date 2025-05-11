<script>
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import 'bootstrap/dist/css/bootstrap.min.css'; // solo aquí

	let name = 'Vault';
</script>

<Header></Header>
<hr />
<slot></slot>
<hr />
<Footer></Footer>
