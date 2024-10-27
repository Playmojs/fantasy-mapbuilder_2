<script lang="ts">
	import type { SearchEntry } from '$lib/types';
	import { onMount } from 'svelte';

	let {
		searchDomain,
		filtered = $bindable(),
		oninput
	}: {
		searchDomain: SearchEntry[];
		filtered: SearchEntry[];
		oninput?: (event: Event) => void;
	} = $props();

	let searchTerm = $state('');
	let searchInput: HTMLInputElement;

	const searchFilter = (entry: SearchEntry, term: string) => {
		return term.length !== 0 && entry.title.toLowerCase().includes(term.toLowerCase());
	};

	$effect(() => {
		filtered = searchDomain.filter((entry) => searchFilter(entry, searchTerm));
	});

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'p' && event.getModifierState('Control')) {
			event.preventDefault();
			searchInput?.focus();
		}
	};

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<input
	type="text"
	placeholder="Search... (ctrl + p)"
	autocomplete="off"
	class="search-input"
	bind:value={searchTerm}
	bind:this={searchInput}
	{oninput}
/>

<style>
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
</style>
