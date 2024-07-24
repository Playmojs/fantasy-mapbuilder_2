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

	import edit_mode from '../store'
	let editable: boolean;
	$: editable = $edit_mode;

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
		map.addEventListener('mouseenter', () => {
			map_zoom.resume();
		});

		map.addEventListener('mouseleave', () => {
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

	function get_relative_movement(x: number, y: number)
	{
		let rect = map.getBoundingClientRect();
		let rel_x = Math.max(0, Math.min((x - rect.x)/rect.width * 100, 100));
		let rel_y = Math.max(0, Math.min((y - rect.y)/rect.height * 100, 100));
		let position: {x: number, y: number} = {x: rel_x, y: rel_y};
		return position;
		
	}

</script>

<div id="map-container" bind:this={mapContainer}>
	<img id="map" alt="Map" bind:this={map} />
	{#each markers as marker (marker.map_id)}
		<Marker
			position={marker.position}
			image={marker.image}
			mapId={marker.map_id}
			get_relative_movement={get_relative_movement}
		/>
	{/each}
</div>
<img id="parent_map" class:edit_mode ={editable} bind:this={parentMap} alt="Parent Map" />

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
		top: 0%;
		right: 80%;
		width: 20%;
		height: auto;
		z-index: 10;
		cursor: pointer;
	}
	#parent_map.edit_mode {
		top: 7%;
	}
</style>
