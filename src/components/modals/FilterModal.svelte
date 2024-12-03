<script lang="ts">
	import { type ChooseModalData, type FilterModalData, type ModalEntity} from '$lib/types';
	import { onMount } from 'svelte';
	import SearchInput from '../SearchInput.svelte';
	import ChooseModal from './ChooseModal.svelte';
	import GraphModal from './GraphModal.svelte';
	import Modal from './Modal.svelte';

	let{close, modal_data, on_close, use_search}:{close: any, modal_data: FilterModalData, on_close: ((success: boolean) => Promise<void> | void) | undefined, use_search: boolean} = $props()
        
    let propagate_filter = $state<boolean>(true)
    let intersect_filter = $state<boolean>(false)
    let invert_filter = $state<boolean>(false)
        
    let selected_graph_ids = $state<number[]>([])
    let selected_entities = $derived<[number, ModalEntity][]>(selected_graph_ids.map(id=>[id, modal_data.graph_data.graph_entities[id].entity]));
    
    
    function populate_child_ids(included_ids: number[], current_parent_id: number) {
        if(included_ids.includes(current_parent_id)){return}
        included_ids.push(current_parent_id)
        modal_data.graph_data.graph_entities[current_parent_id].children.forEach(id => populate_child_ids(included_ids, id))
    }
    
    function toggle_id(toggle_id: number){
        if (!(toggle_id in graph_images)){
            graph_images[toggle_id] = '/assets/eye_closed.png';
            return;
        }
        
        if (selected_graph_ids.includes(toggle_id)){
            selected_graph_ids = selected_graph_ids.filter(id => {return id !== toggle_id})
        }else{
            selected_graph_ids.push(toggle_id)
        }
    }
    
    // Filter graph ids is a list of lists - for each selected graph_id, there is a list of all graph_ids that will influence the final list of articles.
    let filter_graph_ids = $derived.by<number[][]>(() => {
        if (!propagate_filter){return selected_graph_ids.map(val => {return [val]})}
       
        let included_ids: number[][] = Array.from({ length: selected_graph_ids.length }, () => []);;
        selected_graph_ids.forEach((id, index) => populate_child_ids(included_ids[index], id))
        return included_ids
    })
    
    let filter_choose_ids = $derived.by<number[]>(() => {
        let arr = Array.from((intersect_filter ? filter_graph_ids : [filter_graph_ids.flat()])
            .map(list => {return new Set(list.map(graph_id => {return modal_data.filter_link[graph_id] ?? []}).flat())})
        .reduce((acc, set) => {return acc.intersection(set)}))
        if(invert_filter){arr = Object.keys(modal_data.choose_data).filter(choose_id=> {return !arr.includes(+choose_id)}).map(choose_id => {return +choose_id})}
        return arr
    })
    
    let filtered_choose_modal_data = $derived<ChooseModalData>({"Articles": filter_choose_ids.map(id => {return modal_data.choose_data[id]})})
        
    let graph_images = $derived<{[id: number]: string}>(Object.fromEntries(Object.keys(modal_data.graph_data.graph_entities).map(graph_id => {return [graph_id, filter_graph_ids.flat().includes(+graph_id) ? '/assets/eye.png' : '/assets/eye_closed.png']})))
   
    let superfluous_categories = $derived<number[]>(
        propagate_filter ? intersect_filter ? selected_graph_ids.filter(id => {return !!filter_graph_ids.some(list => {return list[0]===id && selected_graph_ids.some(other_id => other_id !== id && list.includes(other_id))})}) : 
        selected_graph_ids.filter(id => {return !!filter_graph_ids.some(list => {return list[0] !== id && list.includes(id)})}) :
        [])
    
    let graph_window: HTMLDivElement;
    let graph_rect = $state<DOMRect>({height: 0, width: 0, x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0, toJSON: () => {}});

    function set_window_rect(){
        graph_rect = graph_window?.getBoundingClientRect();
    }

    $effect(() => {
        if(!graph_window){return}
        selected_graph_ids.length;
        set_window_rect();
    })

</script>

<div id='main_modal'>
    {#if selected_graph_ids.length > 0}
        <div id='filtered_column'>
            <div id='filter_box'>
                <div id='filter_box_content'>
                {#each selected_entities as [id, entity]}
                    <div id='selected_entity'
                        class:superfluous={superfluous_categories.includes(id)}
                        style={entity.background_image ? `background-image: url("${entity.background_image}");`: ''}>
                        <p class='entity_title'>{entity.title}</p>
                        <span class="deselect" onclick={()=>{toggle_id(id)}}>&times;</span>
                    </div>
                {/each}
                </div>
            </div>
            <div id='button_row'>
                <button 
                    class:selected={propagate_filter}
                     style='background-image: url(/assets/tree.png);'
                     title='Include children of the selected categories'
                    onclick={()=>{propagate_filter= !propagate_filter}}></button>
                <button 
                    class:selected={intersect_filter}
                    style={`background-image: url(/assets/fantasy_${intersect_filter ? 'intersect' : 'union'}.png);`}
                    title='Only include articles with all of the categories above'
                    onclick={()=>{intersect_filter= !intersect_filter}}></button>
                <button 
                    class:selected={invert_filter}
                    title='Invert search'
                    style={`background-image: url(/assets/inverse.png);`}
                    onclick={()=>{invert_filter= !invert_filter}}></button>
            </div>
            <ChooseModal close={()=>{}} on_close={()=>{}} use_search={use_search} modal_data={filtered_choose_modal_data}/>
        </div>
    {/if}
    <div id='graph_modal' bind:this={graph_window}>
        <GraphModal close={()=>{}} on_close={()=>{}} use_search={false} modal_data={{...modal_data.graph_data, modal_event: {func: toggle_id, images: graph_images}}} window_rect={graph_rect}/>
    </div>
</div>

<style>
    #main_modal{
        position: relative;
        display: flex;
        width: 100%;
        height: 80vh;
    }

    #filtered_column{
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        top: -10px;
        width: 25%;
        height: 100%;
        padding: 10px 30px 0px 10px;
        border-right: 1px solid var(--main_white)
    }

    #filter_box{
        position: relative;
        width: 100%;
        flex: 0 0 20vh;
        overflow-y: auto;
        margin-bottom: 10px;
        background-color: rgb(100, 100, 100);
        border-radius: 15px;
        box-shadow: inset 5px 5px 5px rgb(40, 40, 40);
    }

    #filter_box_content{
        display: flex;
        flex-direction: column;
        align-items: start;
        row-gap: 10px;
        padding: 15px 15px 15px;

        color: var(--main_white);
    }
    
    #selected_entity{
        position: relative;
		display: flex;
        justify-content: end;
        align-items: center;
        font-size: x-large;
        
        width: 80%;
        cursor: default;
        padding: 10px 0px 10px 10px;
		border-radius: 10px;
        
		background-color: rgb(50, 50, 50);
		box-shadow: 5px 5px 5px rgb(40, 40, 40);
		background-position: top right;
        background-size: 100%;
    }

    #selected_entity.superfluous{
        opacity: 0.5;
        box-shadow: none;
    }
    
    .entity_title{
        position: relative;
        text-align: left;
        width: 100%;
        flex: 1;
        margin: 0px;
        padding-right: 10px;
    }

    .deselect{
        position: relative;
        cursor: pointer;
        flex: 0 0 20%;
        margin: 0px;
    }

    #button_row{
        width: 90%;
        display: flex;
        margin-bottom: 10px;
        gap: 5px;
    }

    #button_row > button{
        width: 30px;
        aspect-ratio: 1;
        background-color: rgb(80, 80, 80);
        border-radius: 5px;
        border: none;
        box-shadow: 3px 3px 5px rgb(10, 10, 10);

        background-size: contain;
		background-position: center center;
		background-repeat: no-repeat;
    }

    #button_row > button.selected, #button_row > button:active{
        background-color: rgb(40, 40, 40);
        box-shadow: inset 3px 3px 3px rgb(10, 10, 10);
    }

    #graph_modal{
        overflow: hidden;
        width: 100%;
    }

    #filter_box::-webkit-scrollbar {
		width: 12px;
	}

	#filter_box::-webkit-scrollbar-track {
		background: rgb(47, 47, 47);
		border-radius: 10px;
	}

	#filter_box::-webkit-scrollbar-thumb {
		background-color: #555;
	}

	#filter_box::-webkit-scrollbar-thumb:hover {
		background-color: #888;
	}
</style>
