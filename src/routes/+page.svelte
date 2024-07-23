<script lang="ts">
	import Map from '../components/Map.svelte';
	import Informatic from '../components/Informatic.svelte';

	let markers = [
		{ position: { x: 30, y: 50 }, image: '/assets/marker.png', map_id: 'map1' },
		{ position: { x: 60, y: 20 }, image: '/assets/marker.png', map_id: 'map2' }
	];

	let selectedMapId: string | null = null;
	let informaticText = 'Test-informatic';
	let editable = false;

	function setInformaticText(newText: string) {
		informaticText = newText;
	}

	function toggleEditable() {
		editable = !editable;
	}

	async function requestChangeMap() {
		// Placeholder for change map logic
		return true;
	}
</script>

<Map
	{markers}
	image="/assets/magil.png"
	parentImage="/assets/map.jpg"
	parentId={selectedMapId}
/>

<Informatic />
