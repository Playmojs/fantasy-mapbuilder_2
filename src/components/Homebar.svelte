<script lang="ts">
	import { store } from '../store.svelte';

	let main_items: { label: string; href: string }[] = [
		{ label: 'Home', href: '/' },
		{ label: 'Browse projects', href: '/projects' }
	];

	let right_items: { label: string; href: string }[] = $derived(
		store.user
			? [
					{ label: 'My projects', href: '/my_projects' },
					{ label: 'User', href: '/user' },
					{ label: 'Log Out', href: '/logout' }
				]
			: [
					{ label: 'Login', href: '/login' },
					{ label: 'Sign Up ', href: '/signup' }
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
		position: relative;
		left: 0;
		right: 0;
		background-color: #333;
		height: 40px;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-right: 100px;
		padding-left: 100px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}

	.left-buttons,
	.right-buttons {
		display: flex;
		align-items: center;
	}

	.left-buttons a {
		margin-right: 3rem;
	}

	.right-buttons a {
		margin-left: 1.5rem;
	}

	a {
		color: white;
		text-decoration: none;
		font-weight: bold;
		font-size: 1.2rem;
	}

	a:hover {
		text-decoration: underline;
	}

	@media (max-width: 750px) {
		nav {
			padding-left: 60px;
			padding-right: 60px;
		}
		a {
			font-size: 1.1rem;
		}
	}

	@media (max-width: 550px) {
		nav {
			padding-left: 30px;
			padding-right: 30px;
		}
		a {
			font-size: 0.85rem;
		}
	}
</style>
