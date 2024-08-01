import { get } from "svelte/store";
import { maps, current_map_id } from "./data";
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
            console.log("inside func!")
            maps.update((maps) => {
                let map_id = get(current_map_id);
                maps[map_id].parent_id = id;
                id === null ? maps[map_id].parent_image = null : maps[map_id].parent_image = maps[id].image;
                store.show_modal = false;
                return maps;
            });
    }
};
