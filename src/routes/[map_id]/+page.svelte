<script context="module" lang="ts">
	interface marker {
		position: {x: number, y: number};
		id: number;
		image: string;
		query_id: number;
		informatic: boolean;
	}

	interface map {
		id: number;
		image: string;
		parent_image: string | null;
		parent_id: number | null;
		marker_ids: number[];
		informatic_id: number;
	}

	interface information {
		id: number;
		text: string;
	}

  	let maps: {[id: number]: map} = 
	{
		0: {id: 0, image: "/assets/magil.png", parent_image: "/assets/map.jpg", parent_id: 1, marker_ids:[], informatic_id: 0},
		1: {id: 1, image: "/assets/map.jpg", parent_image: null, parent_id: null, marker_ids:[0, 1], informatic_id: 1}
	}

	const markers:  {[id: number]: marker} = {
		0: {id: 0, image: "/assets/marker.png", position: { x: 42, y: 56 }, query_id: 0, informatic: false},
		1: {id: 1, image: "/assets/marker.png", position: { x: 38, y: 60 }, query_id: 2, informatic: true}
	}

	const informations: {[id: number]: information} = {
		0: {id: 0, text: "#Magil \n This is Magil"},
		1: {id: 1, text: "#Second Realm \n This is the second Realm"},
		2: {id: 2, text: "This is a portal :)"}
	}

</script>


<script lang="ts">
	import Map from '../../components/Map.svelte';
	import Informatic from '../../components/Informatic.svelte';
	import Toolbar from '../../components/Toolbar.svelte';
	import ParentMap from '../../components/ParentMap.svelte';
	import {set_informatic, toggle_informatic} from '../../store'

	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	
	
	let map_id: number = +$page.params.map_id
	
	let current_map: map = maps[map_id];
	const current_markers = current_map.marker_ids.map(id => markers[id]);

	let set_informatic_text: any;
	$: set_informatic_text = $set_informatic;
	let current_informatic_id: number;

	onMount(() => {

	function toggle_informatic_by_id(id: number)
	{
		if (id !== current_informatic_id){
			set_informatic_text(informations[id].text);
			current_informatic_id = id;
		} else 
		{
			set_informatic_text(informations[current_map.informatic_id].text);
			current_informatic_id = current_map.informatic_id;
		}
	}

	toggle_informatic.set(toggle_informatic_by_id)

	toggle_informatic_by_id(current_map.informatic_id)
	});
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