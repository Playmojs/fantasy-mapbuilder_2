<script lang="ts">
	import type { SearchEntry } from '$lib/types';
	import { onMount } from 'svelte';
	import { on } from 'svelte/events';

	let {
		searchDomain,
		filtered = $bindable(),
		oninput,
		onfocus
	}: {
		searchDomain: SearchEntry[];
		filtered: SearchEntry[];
		oninput?: (event: Event) => void;
		onfocus?: () => void;
	} = $props();

	let searchTerm = $state('');
	let searchInput: HTMLInputElement;

	const searchFilter = (entry: SearchEntry, term: string) => {
		return entry.title.toLowerCase().includes(term.toLowerCase());
	};

	$effect(() => {
		filtered = searchDomain.filter((entry) => searchFilter(entry, searchTerm));
	});

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'p' && event.getModifierState('Control')) {
			event.preventDefault();
			if (onfocus) {
				onfocus();
			}
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
	{onfocus}
	onclick={onfocus}
/>

<style>
	.search-input {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid #ddd;
		border-radius: var(--radius-sm);
		font-size: 16px;
		outline: none;
		box-sizing: border-box;
	}

	.search-input:focus {
		border-color: var(--color-primary-dark);
		box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
	}
</style>
