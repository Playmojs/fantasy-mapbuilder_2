<script lang="ts">
	import type { SearchEntry } from '$lib/types';
	import { onMount } from 'svelte';
	import SearchInput from './SearchInput.svelte';
	import { store } from '../store.svelte';
	import { gotoMap } from '$lib/goto_map';
	import { push_article } from '$lib/article_stack';

	let hideDropdown = $state(false);

	let containerRef: HTMLDivElement;

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			hideDropdown = true;
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

	let dropdownItems = $state<SearchEntry[]>([]);
</script>

<div class="container" bind:this={containerRef}>
	<SearchInput
		searchDomain={Object.values(store.map_cache)
			.map((entry) => ({
				title: entry.title,
				img_src: '/assets/old_map.png',
				on_click: () => {
					hideDropdown = true;
					gotoMap(entry.id);
				}
			}))
			.concat(
				Object.values(store.article_cache).map((entry) => ({
					title: entry.title,
					img_src: '/assets/Parchment.png',
					on_click: () => {
						hideDropdown = true;
						push_article(entry.id, false);
					}
				}))
			)}
		bind:filtered={dropdownItems}
		oninput={() => {
			hideDropdown = false;
		}}
	></SearchInput>
	{#if !hideDropdown && dropdownItems.length > 0}
		<div class="dropdown-content">
			<ul class="item-list">
				{#each Object.values(dropdownItems) as entry}
					<li class="item">
						<a class="item-link" onclick={() => entry.on_click()}>
							<span class="item-text">{entry.title}</span>
							<img src={entry.img_src} alt="Search entry icon" class="item-icon" />
						</a>
					</li>
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
