import { get } from "svelte/store";
import { maps, current_map_id, markers } from "./data";
import { store } from "../store.svelte";
import { TargetType } from "./types";

class Target {
    update_target: TargetType = TargetType.ParentMap;
    update_id: number | null = null;
}
export const target = new Target;

export const bind_components = (id: number | null) => {
    switch (target.update_target) {
        case TargetType.ParentMap:
            maps.update((maps) => {
                let map_id = get(current_map_id);
                maps[map_id].parent_id = id;
                id === null ? maps[map_id].parent_image = null : maps[map_id].parent_image = maps[id].image;
                return maps;
            });
        case TargetType.Marker:
            markers.update((markers) => {
                if(target.update_id === null || id === null){return markers;}
                markers[target.update_id].query_id=id;
                return markers;
            });
    }
    store.show_modal = false;
};
