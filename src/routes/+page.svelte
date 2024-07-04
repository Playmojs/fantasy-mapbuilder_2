<script lang="ts">
	import Map from '../components/Map.svelte';
	import Informatic from '../components/Informatic.svelte';

	let markers = [
		{ position: { x: 30, y: 50 }, image: '/assets/marker.png', map_id: 'map1' },
		{ position: { x: 60, y: 20 }, image: '/assets/marker.png', map_id: 'map2' }
	];

	let selectedMapId: string | null = null;
	let informaticText = 'Click a marker to see information.';
	let editable = false;

	function handleMarkerClick(event: CustomEvent) {
		selectedMapId = event.detail.mapId;
		informaticText = `Information for map ID: ${selectedMapId}`; // Fetch and update the text based on the clicked marker
		editable = false; // Disable editing mode after clicking
	}

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
	on:markerClick={handleMarkerClick}
/>

{#if selectedMapId}
	<Informatic
		text={informaticText}
		{editable}
		on:toggleEditable={toggleEditable}
		on:requestChangeMap={requestChangeMap}
	/>
{/if}
