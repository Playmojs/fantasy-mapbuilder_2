import { store } from "../store.svelte";
import { TargetType } from "./types";
import { getCurrentMapId } from "./data.svelte";

class Target {
    update_target: TargetType = TargetType.ParentMap;
    update_id: number | null = null;
}
export const target = new Target;

export const bind_components = (id: number | null) => {
    switch (target.update_target) {
        case TargetType.ParentMap:
            store.maps[getCurrentMapId()].parent_id = id;
            if (id === null) {
                store.maps[getCurrentMapId()].parent_image = null;
            } else {
                store.maps[getCurrentMapId()].parent_image = store.maps[id].image;
            }

            break;
        case TargetType.Marker:
            if (target.update_id === null || id === null) { break; }
            store.markers[target.update_id].query_id = id;
            break;
    }
    store.show_modal = false;
};
