<script lang="ts">
	import Map from '../../components/Map.svelte';
	import { store } from '../../store.svelte';
	import Informatic from '../../components/Informatic.svelte';
	import Toolbar from '../../components/Toolbar.svelte';
	import ParentMap from '../../components/ParentMap.svelte';
	import { page } from '$app/stores';
	import {
		MarkerType,
		SearchParam,
		type Information,
		type MapData,
		type MarkerData
	} from '$lib/types';

	let maps: { [id: number]: MapData } = {
		0: {
			id: 0,
			image: '/assets/magil.png',
			parent_image: '/assets/map.jpg',
			parent_id: 1,
			marker_ids: [],
			informatic_id: 0
		},
		1: {
			id: 1,
			image: '/assets/map.jpg',
			parent_image: null,
			parent_id: null,
			marker_ids: [0, 1],
			informatic_id: 1
		}
	};

	const markers: { [id: number]: MarkerData } = {
		0: {
			id: 0,
			image: null,
			position: { x: 42.73, y: 56.59 },
			query_id: 0,
			type: MarkerType.Map
		},
		1: {
			id: 1,
			image: null,
			position: { x: 38.1, y: 59.46 },
			query_id: 2,
			type: MarkerType.Informatic
		}
	};

	const informations: { [id: number]: Information } = {
		0: { id: 0, text: '#Magil \n This is Magil' },
		1: { id: 1, text: '#Second Realm \n This is the second Realm' },
		2: { id: 2, text: 'This is a portal :)' }
	};

	let current_map = $derived(maps[+$page.params.map_id]);
	let current_markers = $derived(current_map.marker_ids.map((id) => markers[id]));
	let text = $derived(informations[store.non_map_informatic_id ?? current_map.informatic_id].text);
</script>

<Map markers={current_markers} image={current_map.image} />
<ParentMap parent_id={current_map.parent_id} parent_image={current_map.parent_image} />
<Informatic {text} />
<Toolbar />
