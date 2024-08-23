<script lang="ts">
	export let items: { label: string; href: string; position: string }[] = [];
</script>

<nav>
	<div class="left-buttons">
		{#each items.filter((item) => item.position === 'left') as item}
			<a href={item.href}>{item.label}</a>
		{/each}
	</div>

	<div class="right-buttons">
		{#each items.filter((item) => item.position === 'right') as item}
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
		justify-content: space-between;
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
		margin-right: 2rem; /* Space out left-aligned buttons */
	}

	.right-buttons a {
		margin-left: 1rem; /* Keep login/signup buttons close to each other */
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
