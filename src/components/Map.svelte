<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import panzoom from 'panzoom';
	import Marker from './Marker.svelte';

	export let markers: any[] = [];
	export let image: string;
	export let parentImage: string | null = null;
	export let parentId: string | null = null;

	let mapContainer: HTMLDivElement;
	let map: HTMLImageElement;
	let parentMap: HTMLImageElement;

	const dispatch = createEventDispatcher();

	onMount(() => {
		map.src = image;

		map.onload = () => {
			if (parentImage) {
				parentMap.src = parentImage;
				parentMap.classList.remove('hidden');
			} else {
				parentMap.classList.add('hidden');
			}
		};

		var map_zoom = panzoom(mapContainer, {
			bounds: true,
			boundsPadding: 0,
			initialZoom: 1,
			maxZoom: 3,
			minZoom: 0.7
		});
		mapContainer.addEventListener('mouseenter', () => {
			map_zoom.resume();
		});

		mapContainer.addEventListener('mouseleave', () => {
			map_zoom.pause();
		});
	});

	onMount(() => {
		// Event delegation to handle marker clicks
		mapContainer.addEventListener('click', (event) => {
			const target = event.target as HTMLElement;
			if (target.matches('.marker')) {
				const mapId = target.getAttribute('data-map-id');
				if (mapId) {
					dispatch('markerClick', { mapId });
				}
			}
		});
	});

	function handleMarkerClick(event: any) {
		const { mapId } = event.detail;
		dispatch('markerClick', mapId);
	}
</script>

<div id="map-container" bind:this={mapContainer}>
	<img id="map" alt="Map" bind:this={map} />
	{#each markers as marker (marker.map_id)}
		<Marker
			position={marker.position}
			image={marker.image}
			mapId={marker.map_id}
			on:click={handleMarkerClick}
		/>
	{/each}
</div>
<img id="parent_map" class="hidden" bind:this={parentMap} alt="Parent Map" />

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

	#parent_map {
		position: fixed;
		top: 0;
		right: 80%;
		width: 20%;
		height: auto;
		z-index: 10;
		cursor: pointer;
	}

	.hidden {
		display: none;
	}
</style>
