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
		width: calc(100% - 8rem);
		background-color: #333;
		height: 40px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 4rem 1rem 4rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.9);
		z-index: 1000;
	}

	.left-buttons,
	.right-buttons {
		display: flex;
		align-items: center;
	}

	a {
		color: var(--main_white);
		text-shadow: 5px 5px 5px rgb(10, 10, 10);
		text-align: center;
		text-decoration: none;
		font-weight: bold;
		font-size: 1.2rem;
		padding: 0px 20px;
	}

	a:hover {
		text-decoration: underline;
	}

	@media (max-width: 750px) {
		nav {
			width: calc(100% - 120px);
			padding-left: 60px;
			padding-right: 60px;
		}
		a {
			font-size: 1.1rem;
		}
	}

	@media (max-width: 550px) {
		nav {
			width: calc(100% - 60px);
			padding-left: 30px;
			padding-right: 30px;
		}

		a {
			font-size: 0.85rem;
			padding: 0px 10px;
		}
	}
</style>
