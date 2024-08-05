<script lang="ts">
	import Map from '../../components/Map.svelte';
	import { store } from '../../store.svelte';
	import Informatic from '../../components/Informatic.svelte';
	import Toolbar from '../../components/Toolbar.svelte';
	import ParentMap from '../../components/ParentMap.svelte';
	import Modal from '../../components/Modal.svelte';
	import EntityGrid from '../../components/EntityGrid.svelte';
	import { MarkerType, TargetType } from '../../lib/types';
	import { maps, markers, articles } from '../../lib/data';

	import { target } from '../../lib/bind_component';
	import { get } from 'svelte/store';

	let special_entities_: any[];
	$: special_entities_;

	let entity_type: String;
	$: entity_type;

	const open_modal = (target_type: TargetType, id: number | null, special_entities: any[]) => {
		console.log(target_type);
		switch (target_type) {
			case TargetType.Marker:
				if (id === null || id! in markers) {
					return;
				}
				switch (get(markers)[id].type) {
					case MarkerType.Map:
						entity_type = 'map';
						break;
					case MarkerType.Informatic:
						entity_type = 'informatic';
						break;
				}
				break;

			case TargetType.ParentMap:
				entity_type = 'map';
				break;
		}

		target.update_target = target_type;
		target.update_id = id;
		special_entities_ = special_entities;
		store.show_modal = true;
	};
</script>

<Map />
<ParentMap change_parent_map={open_modal} />
<Informatic />
<Toolbar change_marker_target={open_modal} />
<Modal close={() => (store.show_modal = false)}>
	{#if entity_type === 'map'}
		<EntityGrid {special_entities_} entities={Object.values($maps)} />
	{:else if entity_type === 'informatic'}
		<EntityGrid {special_entities_} entities={Object.values($articles)} />
	{/if}
</Modal>
