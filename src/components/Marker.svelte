<script lang="ts">
	export let position: { x: number; y: number };
	export let image: string;
	export let mapId: string;

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('click', { mapId });
	}
</script>

<button class="marker" style="top: {position.y}%; left: {position.x}%" on:click={handleClick}>
	<div class="marker-image" style="background-image: url({image})"></div>
</button>

<style>
	.marker {
		position: absolute;
		width: 100px;
		height: 100px;
		border-radius: 50%;
		cursor: pointer;
		transform: translate(-50%, -50%);
	}

	.marker-image {
		position: relative;
		bottom: 200%;
		background-size: contain;
		background-repeat: no-repeat;
		pointer-events: none;
		width: 200px;
		height: 200px;
		background-origin: initial;
	}
</style>
