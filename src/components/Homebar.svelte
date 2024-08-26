<script lang="ts">
	import { store } from '../store.svelte';

	let main_items: { label: string; href: string }[] = [
		{ label: 'Home', href: '/' },
		{ label: 'Demo Project', href: '/1' }
	];

	let right_items: { label: string; href: string }[] = $derived(
		store.user
			? [{ label: 'Log Out', href: 'logout' }]
			: [
					{ label: 'Login', href: 'login' },
					{ label: 'Sign Up ', href: 'signup' }
				]
	);
</script>

<nav>
	<div class="left-buttons">
		{#each main_items as item}
			<a href={item.href}>{item.label}</a>
		{/each}
	</div>

	<div class="right-buttons">
		{#each right_items as item}
			<a href={item.href}>{item.label}</a>
		{/each}
	</div>
</nav>

<style>
	nav {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #333;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-around;
		align-items: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}

	.left-buttons,
	.right-buttons {
		display: flex;
		align-items: center;
	}

	.left-buttons a {
		margin-right: 2rem;
	}

	.right-buttons a {
		margin-left: 1rem;
	}

	a {
		color: white;
		text-decoration: none;
		font-weight: bold;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
