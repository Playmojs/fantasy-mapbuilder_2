<script lang="ts">
	import Homebar from '../components/Homebar.svelte';
	import { supabase } from '$lib/dtb';
	import { v4 as uuidv4 } from 'uuid';
	import { store } from '../store.svelte';

	let file: File | null = null;
</script>

<Homebar />
<main>
	<h2>Welcome to</h2>
	<h1>Fantasy Mapbuilder</h1>
	<div id="description_box">
		<h3>
			Our vision is to create a tool that can help you organize your fantasy world. Upload your maps
			and connect them with each other, and add articles so all your geographical and factual
			information is in one place.
		</h3>
	</div>
</main>

<style>
	main {
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	h1 {
		font-size: 7rem;
		margin: auto;
		color: white;
		font-family: 'Cormorant Garamond', serif;
		font-weight: bold;
		font-style: italic;
		margin-top: 10px;
	}

	h2 {
		padding-top: 50px;
		font-size: 4rem;
		margin: auto;
		color: white;
		font-family: 'Cormorant Garamond', serif;
	}

	#description_box {
		width: 500px;
		margin: auto;
		margin-top: 100px;
	}

	h3 {
		font-size: 2rem;
		color: white;
		font-family: 'Cormorant Garamond', serif;
	}

	@media (max-width: 1100px) {
		h1 {
			font-size: 5.5rem;
		}
		h2 {
			padding-top: 30px;
			font-size: 4rem;
		}
		#description_box {
			width: 400px;
			margin-top: 20px;
		}
		h3 {
			font-size: 1.5rem;
		}
	}

	@media (max-width: 950px) {
		h1 {
			font-size: 5rem;
		}
		h2 {
			font-size: 4rem;
		}
		#description_box {
			width: 300px;
			margin-top: 60px;
		}
		h3 {
			font-size: 1.5rem;
		}
	}

	@media (max-width: 700px) {
		main {
			margin-top: 100px;
		}
		h1 {
			font-size: 4rem;
		}
		h2 {
			font-size: 2.5rem;
		}
		#description_box {
			width: 200px;
			margin-top: 40px;
		}
		h3 {
			font-size: 1rem;
		}
	}

	@media (max-width: 550px) {
		h1 {
			font-size: 3rem;
		}
		h2 {
			font-size: 2rem;
		}
		#description_box {
			width: 200px;
			margin-top: 10px;
		}
		h3 {
			font-size: 0.8rem;
		}
	}
</style>
