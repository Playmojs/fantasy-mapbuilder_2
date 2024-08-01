<script lang="ts">
	import { onMount } from 'svelte';
	import panzoom from 'panzoom';
	import Marker from './Marker.svelte';
	import type { MarkerData } from '$lib/types';

	export let markers: MarkerData[];
	export let image: string;

	let mapContainer: HTMLDivElement;
	let map_: HTMLImageElement;

	onMount(() => {
		var map_zoom = panzoom(mapContainer, {
			bounds: true,
			boundsPadding: 0,
			initialZoom: 1,
			maxZoom: 3,
			minZoom: 0.7
		});
		map_.addEventListener('mouseenter', () => {
			map_zoom.resume();
		});

		map_.addEventListener('mouseleave', () => {
			map_zoom.pause();
		});
	});

	function get_relative_movement(x: number, y: number) {
		let rect = map_.getBoundingClientRect();
		let rel_x = Math.max(0, Math.min(((x - rect.x) / rect.width) * 100, 100));
		let rel_y = Math.max(0, Math.min(((y - rect.y) / rect.height) * 100, 100));
		let position: { x: number; y: number } = { x: rel_x, y: rel_y };
		return position;
	}
</script>

<div id="map-container" bind:this={mapContainer}>
	<img id="map" alt="Map" bind:this={map_} src={image} />
	{#each markers as marker (marker.id)}
		<Marker marker_data={marker} {get_relative_movement} />
	{/each}
</div>

<style>
	#map-container {
		position: relative;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}

	#map {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
