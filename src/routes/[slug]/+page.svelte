<script context="module" lang="ts">
	interface marker {
		position: {x: number, y: number};
		id: number;
		image: string;
		map_id: number;
	}

	interface map {
		id: number;
		image: string;
		parent_image: string | null;
		parent_id: number | null;
		marker_ids: number[];
	}

  	let maps: {[id: number]: map} = 
	{
		0: {id: 0, image: "/assets/magil.png", parent_image: "/assets/map.jpg", parent_id: 1, marker_ids:[]},
		1: {id: 1, image: "/assets/map.jpg", parent_image: null, parent_id: null, marker_ids:[0]}
	}

	const markers:  {[id: number]: marker} = {
		0: {id: 0, image: "/assets/marker.png", position: { x: 42, y: 56 }, map_id: 0}
	}
</script>


<script lang="ts">
	import Map from '../../components/Map.svelte';
	import Informatic from '../../components/Informatic.svelte';
	import Toolbar from '../../components/Toolbar.svelte';
	import ParentMap from '../../components/ParentMap.svelte';

	import { page } from '$app/stores';

	
	
	let id: number = +$page.params.slug
	
	let current_map: map = maps[id];
	const current_markers = current_map.marker_ids.map(id => markers[id]);
	
</script>

<Map
	markers = {current_markers}
	image = {current_map.image}
/>
<ParentMap
	parent_id = {current_map.parent_id}
	parent_image = {current_map.parent_image}
/>

<Informatic />
<Toolbar />