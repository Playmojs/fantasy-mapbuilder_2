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
	<img class="marker-image" src={image} alt="Marker">
</button>

<style>
	.marker {
		position: absolute;
		width: 3%;
		height: 3%;
		border-radius: 50%;
		cursor: pointer;
		transform: translate(-50%, -50%);
	}

	.marker-image {
		position: relative;
		bottom: 100%;
		background-size: contain;
		background-repeat: no-repeat;
		pointer-events: none;
		width: 200%;
		height: auto;
		background-origin: initial;
	}
</style>
