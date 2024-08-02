<script lang="ts">
	import Footer from '../components/Footer.svelte';
	import hassinen from '$lib/Hassinen-Barnen-Tumme.webp';
</script>

<div style="text-align: center;">
	<h1>Welcome to the Hassinen Site</h1>
	<img src={hassinen} alt="The Hassinen Family" />
	<p>Please play some <a href="/chess">chess</a></p>
</div>

<Footer />
