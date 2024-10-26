<script lang="ts">
	import { push_article } from '$lib/article_stack';
	import type { MapData, Article } from '$lib/types';
	import { store } from '../store.svelte';
	import { onMount } from 'svelte';

	let searchTerm = $state('');
	let hideDropdown = $state(false);
	let searchInput: HTMLInputElement;
	let containerRef: HTMLDivElement;

	const searchFilter = (map: MapData | Article, term: String) => {
		if (!term) return false;
		const title = map.title.toLowerCase();
		const search = term.toLowerCase();
		return title.includes(search);
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			hideDropdown = true;
		}

		if (event.key === 'f' && event.getModifierState('Control')) {
			event.preventDefault();
			searchInput?.focus();
		}
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (containerRef && !containerRef.contains(event.target as Node)) {
			hideDropdown = true;
		}
	};

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="container" bind:this={containerRef}>
	<input
		type="text"
		placeholder="Search... (ctrl + f)"
		autocomplete="off"
		class="search-input"
		bind:value={searchTerm}
		bind:this={searchInput}
		onchange={() => (hideDropdown = false)}
		onfocus={() => (hideDropdown = false)}
	/>
	{#if !hideDropdown && searchTerm.length > 0}
		<div class="dropdown-content">
			<ul class="item-list">
				{#each Object.values(store.map_cache) as map}
					{#if searchFilter(map, searchTerm)}
						<li class="item">
							<a href={map.id.toString()} class="item-link">
								<span class="item-text">{map.title}</span>
								<img src={'/assets/old_map.png'} alt="Map icon" class="item-icon" />
							</a>
						</li>
					{/if}
				{/each}
				{#each Object.values(store.article_cache) as entry}
					{#if searchFilter(entry, searchTerm)}
						<li class="item">
							<a class="item-link" onclick={() => push_article(entry.id, false)}>
								<span class="item-text">{entry.title}</span>
								<img src={'/assets/Parchment.png'} alt="Article icon" class="item-icon" />
							</a>
						</li>
					{/if}
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.container {
		width: 100%;
		max-width: 300px;
		position: relative;
		box-sizing: border-box;
	}

	.search-input {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 16px;
		outline: none;
		box-sizing: border-box;
	}

	.search-input:focus {
		border-color: #4299e1;
		box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
	}

	.dropdown-content {
		position: absolute;
		top: 100%;
		left: 0;
		width: 100%;
		margin-top: 4px;
		background: white;
		border: 1px solid #ddd;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		z-index: 10;
		box-sizing: border-box;
	}

	.item-list {
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: 300px;
		overflow-y: auto;
	}

	.item {
		padding: 0;
		margin: 0;
	}

	.item-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		color: #333;
		text-decoration: none;
		transition: background-color 0.2s;
		cursor: pointer;
		min-height: 44px;
	}

	.item-link:hover {
		background-color: #f5f5f5;
	}

	.item-text {
		flex: 1;
		margin-right: 16px;
	}

	.item-icon {
		width: 32px;
		height: 32px;
		object-fit: contain;
		flex-shrink: 0;
	}

	.item:first-child .item-link {
		border-top-left-radius: 4px;
		border-top-right-radius: 4px;
	}

	.item:last-child .item-link {
		border-bottom-left-radius: 4px;
		border-bottom-right-radius: 4px;
	}
</style>
