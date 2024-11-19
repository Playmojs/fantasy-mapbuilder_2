import { store } from "../store.svelte"

export function generate_map_graph(): {[map_id: number]: number[]}{
    
    let graph: {[map_id: number]: number[]} = {};
    let duplicate: {[duplicate_id: number]: number[]} = {};
    
    let map_order: number[] = [];
    let map_layer: {[layer: number]: number[]} = {};
    
    function prune_graph_by_layer(layer: number){
        /* This function is a mess. Can it be simplified? */
        
        // Iterate over each map in this layer. This layer will not be changed.
        map_layer[layer].forEach(map_id => {
            if(graph[map_id].length === 0){return}

            graph[map_id].forEach(child_id =>
                {
                if(map_order.includes(child_id)){return}

                /* Check if the map is the legitimate parent for the child. 
                Each child map will have only a single legitimate parent, with the following priority:
                1. The parent is legitimate if it is the child's only parent
                2. If the child has multiple parents, the parent is legitimate if it is the child's parent_map (and the parent_map has a link to this child)
                3. If the child has multiple parents and no parent_map, the parent with the lowest map_layer is the legitimate one
                4. If it can't be decided in steps 1-4, it will be determined by chance. */

                // 1. Check if the child has multiple parents:
                if(duplicate[child_id].length > 1){

                    const parent_id = store.map_cache[child_id].parent_id
                    
                    // 2. & 3. Find the child's correct parent - it is either this map_id, which is sorted by layer (3.), or the parent_id if that is different (2.)
                    const keep_parent = parent_id !== null && graph[parent_id].includes(child_id) ? parent_id : map_id;
                    
                    // Prune links to illegitimate parents after the correct parent is established
                    duplicate[child_id].forEach(parent_duplicate=> {
                        if (parent_duplicate === keep_parent){return}
                        graph[parent_duplicate] = graph[parent_duplicate].filter(target => {return target !== child_id}
                        )
                    })

                    // If this works, each entry in the duplicate-object will be left with only a single entry.
                    duplicate[child_id] = [keep_parent];

                    // If this parent was illegitimate (the child had a different parent-map)
                    if(keep_parent !== map_id){return}
                }

                // Place the legitimate child in the next layer
                map_order.push(child_id); 
                map_layer[layer + 1] ? map_layer[layer + 1].push(child_id): map_layer[layer + 1] = [child_id];}
                )
        })
        if (map_layer[layer+1]) {prune_graph_by_layer(layer + 1)}
    }

    // Get all map-related links from cached markers, and remove instances where a marker refer to its own map or where multiple markers on the same map refer to other identical maps:

    Object.entries(store.marker_cache).forEach(
        ([map_id, markers]) => {
            graph[+map_id] = markers.map(marker => {return marker.target_map_id}).filter((value, index, array) => {return array.indexOf(value) === index && value !== +map_id}).filter(value => {return value !== null}) //filter twice to avoid lint error
            graph[+map_id].forEach(value => {duplicate[value] ? duplicate[value].push(+map_id) : duplicate[value] = [+map_id]})
    })

    // Prune the graph based on 1. the parent-map, assuming that there is a marker from the parent-map to the child-map, and 2. graph distance from the project's head map.
    const head_map_id = store.project_cache[store.project_id].head_map_id;
    map_layer[0] = [head_map_id];
    map_order.push(head_map_id)
    prune_graph_by_layer(0)

    return graph
}

export function generate_category_graph() {
    if(Object.keys(store.category_cache).length === 0){return {}}

    let category_ids: Set<number> = new Set(Object.entries(store.category_cache).map(([id, category]) => {return +id}));
    
    let non_orphan_ids: Set<number> = new Set();
        Object.values(store.category_links).forEach((child_ids) => {
            child_ids.forEach(child_id => non_orphan_ids.add(child_id))
        }
    )
    
    if(!category_ids.difference){return {}} // On debugging, this somehow returns true even though category_ids was instantiated and with a valid entry.
    let orphan_ids = category_ids.difference(non_orphan_ids)

    let graph = {...store.category_links};
    graph[-1] = Array.from(orphan_ids)
    return(graph)
}