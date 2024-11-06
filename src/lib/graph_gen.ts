import { store } from "../store.svelte"



export function generate_map_graph(): {[map_id: number]: number[]}{
    
    let graph: {[map_id: number]: number[]} = {};
    let duplicate: {[duplicate_id: number]: number[]} = {};
    
    let map_order: number[] = [];
    let map_layer: {[layer: number]: number[]} = {};
    
    function prune_graph_by_layer(layer: number){
        // This function is a mess. Can it be simplified?
        
        // Iterate over each map in this layer. This layer will not be changed.
        map_layer[layer].forEach(map_id => {
            if(graph[map_id].length === 0){return}

            graph[map_id].forEach(child_id =>
                {
                if(map_order.includes(child_id)){return}

                // Check if the map's child should be added to the next layer
                if(duplicate[child_id].length > 1){
                    const parent_id = store.map_cache[child_id].parent_id

                    /* The map's child is added to the next layer if no other map points to this child, 
                    if this map is the child's parent-map or if the child's parent-map doesn't link to the child with a marker.*/
                    
                    // The keep_parent represents the proper parent for the child - regardless if it is this map or another.
                    const keep_parent = parent_id !== null && graph[parent_id].includes(child_id) ? parent_id : map_id;
                    
                    // Remove links between child and illegitimate parents
                    duplicate[child_id].forEach(parent_duplicate=> {
                        if (parent_duplicate === keep_parent){return}
                        graph[parent_duplicate] = graph[parent_duplicate].filter(target => {return target !== child_id}
                        )
                    })
                    duplicate[child_id] = [keep_parent];

                    // Return if this map is not the true parent, so the child is placed in the right layer
                    if(keep_parent !== map_id){return}
                }

                // Place child in the right layer
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