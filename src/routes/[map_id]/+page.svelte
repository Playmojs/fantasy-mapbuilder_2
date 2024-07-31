<script context="module" lang="ts">
	interface marker {
		position: { x: number; y: number };
		id: number;
		image: string | null;
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
		title: string;
	}

	interface article {
		id: number;
		text: string;
		article_image: string | null;
	}

	let maps: { [id: number]: map } = {
		0: {
			id: 0,
			image: '/assets/magil.png',
			parent_image: '/assets/map.jpg',
			parent_id: 1,
			marker_ids: [],
			informatic_id: 0,
			title: 'Magil'
		},
		1: {
			id: 1,
			image: '/assets/map.jpg',
			parent_image: null,
			parent_id: null,
			marker_ids: [0, 1],
			informatic_id: 1,
			title: 'Second Realm'
		},
		2: {
			id: 2,
			image: '/assets/magil.png',
			parent_image: '/assets/map.jpg',
			parent_id: 1,
			marker_ids: [],
			informatic_id: 0,
			title: 'Magil'
		},
		3: {
			id: 3,
			image: '/assets/map.jpg',
			parent_image: null,
			parent_id: null,
			marker_ids: [0, 1],
			informatic_id: 1,
			title: 'Second Realm'
		},
		4: {
			id: 4,
			image: '/assets/magil.png',
			parent_image: '/assets/map.jpg',
			parent_id: 1,
			marker_ids: [],
			informatic_id: 0,
			title: 'Magil'
		},
		5: {
			id: 5,
			image: '/assets/map.jpg',
			parent_image: null,
			parent_id: null,
			marker_ids: [0, 1],
			informatic_id: 1,
			title: 'Second Realm'
		},
		6: {
			id: 6,
			image: '/assets/magil.png',
			parent_image: '/assets/map.jpg',
			parent_id: 1,
			marker_ids: [],
			informatic_id: 0,
			title: 'Magil'
		},
		7: {
			id: 7,
			image: '/assets/map.jpg',
			parent_image: null,
			parent_id: null,
			marker_ids: [0, 1],
			informatic_id: 1,
			title: 'Second Realm'
		},
		8: {
			id: 8,
			image: '/assets/magil.png',
			parent_image: '/assets/map.jpg',
			parent_id: 1,
			marker_ids: [],
			informatic_id: 0,
			title: 'Magil'
		},
		9: {
			id: 9,
			image: '/assets/map.jpg',
			parent_image: null,
			parent_id: null,
			marker_ids: [0, 1],
			informatic_id: 1,
			title: 'Second Realm'
		},
		10: {
			id: 10,
			image: '/assets/magil.png',
			parent_image: '/assets/map.jpg',
			parent_id: 1,
			marker_ids: [],
			informatic_id: 0,
			title: 'Magil'
		},
		11: {
			id: 11,
			image: '/assets/map.jpg',
			parent_image: null,
			parent_id: null,
			marker_ids: [0, 1],
			informatic_id: 1,
			title: 'Second Realm'
		},
		12: {
			id: 12,
			image: '/assets/magil.png',
			parent_image: '/assets/map.jpg',
			parent_id: 1,
			marker_ids: [],
			informatic_id: 0,
			title: 'Magil'
		},
		13: {
			id: 13,
			image: '/assets/map.jpg',
			parent_image: null,
			parent_id: null,
			marker_ids: [0, 1],
			informatic_id: 1,
			title: 'Second Realm'
		},
		14: {
			id: 14,
			image: '/assets/magil.png',
			parent_image: '/assets/map.jpg',
			parent_id: 1,
			marker_ids: [],
			informatic_id: 0,
			title: 'Magil'
		},
		15: {
			id: 15,
			image: '/assets/map.jpg',
			parent_image: null,
			parent_id: null,
			marker_ids: [0, 1],
			informatic_id: 1,
			title: 'Second Realm'
		},
		16: {
			id: 16,
			image: '/assets/magil.png',
			parent_image: '/assets/map.jpg',
			parent_id: 1,
			marker_ids: [],
			informatic_id: 0,
			title: 'Magil'
		},
		17: {
			id: 17,
			image: '/assets/map.jpg',
			parent_image: null,
			parent_id: null,
			marker_ids: [0, 1],
			informatic_id: 1,
			title: 'Second Realm'
		}
	};

	const markers: { [id: number]: marker } = {
		0: {
			id: 0,
			image: null,
			position: { x: 42.73, y: 56.59 },
			query_id: 0,
			informatic: false
		},
		1: {
			id: 1,
			image: null,
			position: { x: 38.1, y: 59.46 },
			query_id: 2,
			informatic: true
		}
	};

	const articles: { [id: number]: article } = {
		0: { id: 0, text: '#Magil \n This is Magil', article_image: '/assets/magil_image.jpg' },
		1: { id: 1, text: '#Second Realm \n This is the second Realm', article_image: null },
		2: { id: 2, text: 'This is a portal :)', article_image: null }
	};
</script>

<script lang="ts">
	import Map from '../../components/Map.svelte';
	import Informatic from '../../components/Informatic.svelte';
	import Toolbar from '../../components/Toolbar.svelte';
	import ParentMap from '../../components/ParentMap.svelte';
	import Modal from '../../components/Modal.svelte';
	import MapGrid from '../../components/EntityGrid.svelte';
	import { set_informatic, toggle_informatic } from '../../store';

	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let map_id: number = +$page.params.map_id;

	let current_map: map = maps[map_id];
	const current_markers = current_map.marker_ids.map((id) => markers[id]);

	let set_informatic_text: any;
	$: set_informatic_text = $set_informatic;
	let current_informatic_id: number;

	onMount(() => {
		function toggle_informatic_by_id(id: number) {
			if (id !== current_informatic_id) {
				set_informatic_text(articles[id].text, articles[id].article_image);
				current_informatic_id = id;
			} else {
				set_informatic_text(articles[current_map.informatic_id].text, articles[id].article_image);
				current_informatic_id = current_map.informatic_id;
			}
		}

		toggle_informatic.set(toggle_informatic_by_id);

		toggle_informatic_by_id(current_map.informatic_id);
	});

	let show_modal: boolean = false;

	const choose_map = () => {
		show_modal = true;
		console.log(show_modal);
	};

	const handle_map_select = (id: number) => {
		current_map.parent_id = id;
		current_map.parent_image = maps[id].image;
		show_modal = false;
	};
</script>

<Map markers={current_markers} image={current_map.image} />
<ParentMap parent_id={current_map.parent_id} parent_image={current_map.parent_image} {choose_map} />
<Modal visible={show_modal} close={() => (show_modal = false)}>
	<MapGrid entities={Object.values(maps)} selectMap={handle_map_select} />
</Modal>

<Informatic />
<Toolbar />
