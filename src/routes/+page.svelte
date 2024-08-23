<script>
	import Homebar from '../components/Homebar.svelte';

	let homebarItems = [
		{ label: 'Home', href: '/', position: 'left' },
		{ label: 'Demo Project', href: '/1', position: 'left' },
		{ label: 'Login', href: '/login', position: 'right' },
		{ label: 'Signup', href: '/signup', position: 'right' }
	];
</script>

<main>
	<Homebar items={homebarItems} />
	<h2>Welcome to</h2>
	<h1>Fantasy Mapbuilder</h1>
	<div id="description_box">
		<h3>
			Our vision is to create a tool that can help you organize your fantasy world. Upload your maps
			and connect them with each other, and add articles so all your geographical and factual
			information is in one place. This is currently in development, but feel free to check out the
			demo project and play around!
		</h3>
	</div>
</main>

<style>
	main {
		text-align: center;
		padding: 2rem;
	}

	h1 {
		font-size: 7rem;
		color: white;
		font-family: 'Cormorant Garamond', serif;
		font-weight: bold;
		font-style: italic;
	}

	h2 {
		font-size: 4rem;
		color: white;
		font-family: 'Cormorant Garamond', serif;
	}

	#description_box {
		width: 30%;
		margin: auto;
	}

	h3 {
		font-size: 2rem;
		color: white;
		font-family: 'Cormorant Garamond', serif;
	}
</style>
