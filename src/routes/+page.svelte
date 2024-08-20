<script>
	import { goto } from '$app/navigation';
</script>

<div class="container">
	<h1>Fantasy Mapbuilder Prototype</h1>
	<p>
		Fantasy Mapbuilder is a world building tool. It is in very early stages of development. This
		demo shows a single example project with public write access. Please don't overload our free
		Supabase account.
	</p>
	<button on:click={() => goto('/1')}>Yes, I will be kind</button>
</div>

<style>
	.container {
		background-color: #fff;
		padding: 20px 30px;
		border-radius: 10px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		text-align: center;
		max-width: 500px;
		width: 100%;
	}

	h1 {
		color: #2c3e50;
		margin-bottom: 15px;
	}

	p {
		margin-bottom: 20px;
		line-height: 1.6;
	}

	button {
		background-color: #3498db;
		color: white;
		padding: 10px 20px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-size: 16px;
		transition: background-color 0.3s ease;
	}

	button:hover {
		background-color: #2980b9;
	}
</style>
