<script lang="ts">
	import { onMount } from 'svelte';
	import Marker from './Marker.svelte';
	import type { MarkerData } from '$lib/types';
	import ZoomPan from './ZoomPan.svelte';
	import { getCurrentMapId } from '$lib/data.svelte';
	import { store } from '../store.svelte';

	let mapContainer: HTMLDivElement;
	let map_: HTMLImageElement;

	function get_relative_movement(x: number, y: number) {
		let rect = map_.getBoundingClientRect();
		let rel_x = Math.max(0, Math.min(((x - rect.x) / rect.width) * 100, 100));
		let rel_y = Math.max(0, Math.min(((y - rect.y) / rect.height) * 100, 100));
		let position: { x: number; y: number } = { x: rel_x, y: rel_y };
		return position;
	}

	const current_markers = $derived((store.maps[getCurrentMapId()]?.marker_ids ?? []).map((id) => store.markers[id]));
</script>

<div id="map-container" bind:this={mapContainer}>
	<ZoomPan parent_selector="#map-container" />
	<img id="map" alt="Map" bind:this={map_} src={store.maps[getCurrentMapId()].image} />
	{#each current_markers as marker (marker.id)}
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
