<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let parentMap: HTMLImageElement;

	import edit_mode from '../store';
	let editable: boolean;
	$: editable = $edit_mode;

	export let parent_image: string | null;
	export let parent_id: number | null;
	export let choose_map: any;

	onMount(() => {
		parentMap.addEventListener('click', () => parent_func(parent_id));
	});

	function parent_func(parent_id: number | null) {
		if (parent_id === null && editable) {
			choose_map();
		}
		if (parent_id !== null && !editable) {
			location.href = `/${parent_id}`;
		}
	}
</script>

<img
	src={parent_image ? parent_image : '/assets/parent_plus.png'}
	id="parent_map"
	class:edit_mode={editable}
	class:hidden={!parent_image && !editable}
	bind:this={parentMap}
	alt="Parent Map"
/>
<button id="edit_map" on:click={choose_map} class:hidden={!editable}> </button>

<style>
	#parent_map {
		position: fixed;
		top: 0%;
		right: 85%;
		width: 15%;
		height: auto;
		z-index: 10;
		cursor: pointer;
	}
	#parent_map.edit_mode {
		top: 7%;
	}

	.hidden {
		display: none;
	}

	#edit_map {
		position: fixed;
		left: 14.5%;
		top: 7%;
		width: 3%;
		height: 3%;
		background: url('/assets/cog.png') no-repeat center center;
		background-size: contain;
		background-color: transparent;
		border-color: transparent;
		cursor: pointer;
	}
</style>
