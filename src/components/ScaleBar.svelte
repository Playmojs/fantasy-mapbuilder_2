<script lang='ts'>
	import { onMount } from "svelte";
	import { store } from "../store.svelte";
    import {v4 as uuidv4} from 'uuid'

    let {path_nodes, scale}: {path_nodes: {x: number, y: number}[], scale: number} = $props()

    const id = uuidv4()
    
    let window_width = $state<number>(1);

    let path = $derived<string>(path_nodes.length < 2 ? '' : path_nodes.map((node, i) => {return(i === 0 ? 'M' : 'L').concat(`${node.x},${node.y}`)}).join(' '));

    let line_length = $derived<number>(path_nodes.slice(1).map((node, index) => {return Math.sqrt(Math.pow(node.x - path_nodes[index].x, 2) + Math.pow(node.y - path_nodes[index].y, 2))}).reduce((total, distance) => total + distance, 0) / window_width);
    
    let scale_bar_text = $derived(round_to_three_counting_digits(scale * line_length))

    function round_to_three_counting_digits(value: number): number {
        if (value === 0) return 0;
        
        const magnitude = Math.floor(Math.log10(Math.abs(value)));
        
        const scale = Math.pow(10, magnitude - 2);
        
        return Math.round(value / scale) * scale;
    }
    
    onMount(()=>
    {
        window.addEventListener('resize', ()=>{window_width = window.innerWidth})
        window_width = window.innerWidth
    })

</script>

<svg>
    <text text-anchor="start" dy="-10">
        <textPath href="#{id}" startOffset="calc(100% - 100px)">{`${scale_bar_text}`}</textPath>
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
        font-size: 2rem;
        font-family: 'Cormorant Garamond';
        margin-bottom: 10px;
    }
</style>