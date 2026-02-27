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
		background-color: var(--color-bg-secondary);
		height: 40px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding:  var(--space-md) var(--space-3xl);
		box-shadow: var(--shadow-lg);
		z-index: 1000;
	}

	.left-buttons,
	.right-buttons {
		display: flex;
		align-items: center;
	}

	a {
		color: var(--color-text-primary);
		text-shadow:var(--text-shadow-base);
		text-align: center;
		text-decoration: none;
		font-weight: bold;
		font-size: 1.2rem;
		padding: 0 var(--space-lg);
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

	@media (max-height: 700px) {
	nav {
		height: 50px;
		padding-top: var(--space-sm);
		padding-bottom: var(--space-sm);
	}
	
	a {
		font-size: var(--text-base);
	}
	}

	@media (max-height: 550px) {
	nav {
		height: 40px;
	}
	}
</style>
