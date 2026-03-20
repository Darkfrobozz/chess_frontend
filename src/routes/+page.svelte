<script lang="ts">
	import Footer from '../components/Footer.svelte';
	import hassinen from '$lib/static/Hassinen-Barnen-Tumme.webp';
	import axios from 'axios';
	let name = 'http';
	type quote = {
		author: string;
		category: string;
		id: number;
		text: string;
	};
	async function send_http() {
		const options = {
			method: 'GET',
			url: 'https://famous-quotes4.p.rapidapi.com/random',
			params: {
				category: 'all',
				count: '2'
			},
			headers: {
				'x-rapidapi-key': '5bc7a6ba6amshef188c3a5075216p19c538jsnc98a8e74d352',
				'x-rapidapi-host': 'famous-quotes4.p.rapidapi.com'
			}
		};

		try {
			const response = await axios.request(options);
			name = (response.data as Array<quote>)[0].author;
		} catch (error) {
			console.error(error);
		}
	}
</script>

<div style="text-align: center;">
	<h1>Welcome to the Hassinen Site</h1>
	<img src={hassinen} alt="The Hassinen Family" />
	<p>Please play some <a href="/chess">chess</a></p>
	<button on:click={send_http}>testing {name}</button>
</div>

<Footer />
