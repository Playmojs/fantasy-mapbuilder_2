<script lang='ts'>
	import { onMount } from "svelte";
	import { store } from "../store.svelte";
    import {v4 as uuidv4} from 'uuid'
	import { units } from "$lib/data.svelte";

    let {path_nodes, scale, unit_group}: {path_nodes: {x: number, y: number}[], scale: number, unit_group: string} = $props()

    const id = uuidv4()
    
    let window_width = $state<number>(1);

    let path = $derived<string>(path_nodes.length < 2 ? '' : path_nodes.map((node, i) => {return(i === 0 ? 'M' : 'L').concat(`${node.x},${node.y}`)}).join(' '));

    let raw_length = $derived<number>(path_nodes.slice(1).map((node, index) => {return Math.sqrt(Math.pow(node.x - path_nodes[index].x, 2) + Math.pow(node.y - path_nodes[index].y, 2))}).reduce((total, distance) => total + distance, 0) / window_width);
    
    let unit_length = $derived<string>(find_appropriate_unit_and_round(scale*raw_length, 3 , unit_group))

    let text_pos = $derived.by<{x: number, y: number}>(()=> {
        const pos_xs = path_nodes.map(val => val.x);
        const pos_ys = path_nodes.map(val => val.y);
        return {x: (Math.max(...pos_xs) + Math.min(...pos_xs)) / 2, y: Math.min(...pos_ys)};
    })

    function find_appropriate_unit_and_round(value: number, n: number, unit_group: string){
        if (!units[unit_group]){return(`${round_to_n_counting_digits(value, n)}`)}
        const base_unit_length = value*units[unit_group].conversion_factor
        const unit: string = Object.entries(units[unit_group].units).reduce(([unit, val], [new_unit, new_value]) => {return Math.abs(Math.log10(base_unit_length / new_value) - 3) < Math.abs(Math.log10(base_unit_length / val) - 3) ? [new_unit, new_value] : [unit, val]})[0]
        return `${round_to_n_counting_digits(base_unit_length / units[unit_group].units[unit], n)} ${unit}`
    }

    function round_to_n_counting_digits(value: number, n: number): string{
        if (value === 0) return "0";
        
        const magnitude = Math.floor(Math.log10(Math.abs(value)));
        
        const scale = Math.pow(10, magnitude + 1 - n);
        
        return scale < 1 ? value.toPrecision(n) : `${Math.round(value/scale) * scale}`
    }
    
    onMount(()=>
    {
        window.addEventListener('resize', ()=>{window_width = window.innerWidth})
        window_width = window.innerWidth
    })

</script>

<svg>
    <text text-anchor="middle" x={text_pos.x} y={text_pos.y} dy="-10">
        {unit_length}
    </text>
    <path id={id} d={path} stroke='black' stroke-width=4px fill='none'/>
</svg>

<style>
    svg{
        position: absolute;
        top: 0%;
        left: 0%;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 100;
    }

    text{
        font-size: 30px;
        font-family: 'Cormorant Garamond';
        margin-bottom: 10px;
    }
</style>