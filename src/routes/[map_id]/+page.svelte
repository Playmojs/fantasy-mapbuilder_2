<script lang="ts">
	import Map from '../../components/Map.svelte';
	import { store } from '../../store.svelte';
	import Informatic from '../../components/Informatic.svelte';
	import Toolbar from '../../components/Toolbar.svelte';
	import ParentMap from '../../components/ParentMap.svelte';
	import Modal from '../../components/Modal.svelte';
	import EntityGrid from '../../components/EntityGrid.svelte';
	import { MarkerType, ModalEntity, TargetType } from '../../lib/types';

	import { target } from '../../lib/bind_component';
	import { get } from 'svelte/store';

	let special_entities_ = $state<any[]>([]);

	let entity_type = $state<ModalEntity>(ModalEntity.Map);

	const open_modal = (target_type: TargetType, id: number | null, special_entities: any[]) => {
		switch (target_type) {
			case TargetType.Marker:
				if (id === null || !(id in store.markers)) {
					return;
				}
				switch (store.markers[id].type) {
					case MarkerType.Map:
						entity_type = ModalEntity.Map;
						break;
					case MarkerType.Informatic:
						entity_type = ModalEntity.Article;
						break;
				}
				break;

			case TargetType.ParentMap:
				entity_type = ModalEntity.Map;
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
	{#if entity_type === ModalEntity.Map}
		<EntityGrid {special_entities_} entities={Object.values(store.maps)} />
	{:else if entity_type === ModalEntity.Article}
		<EntityGrid {special_entities_} entities={Object.values(store.articles)} />
	{/if}
</Modal>
