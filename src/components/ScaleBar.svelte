<script lang='ts'>
    // let {start_pos, end_pos, scale}: {start_pos: {x: number, y: number}, end_pos: {x: number, y: number}, scale: number} = $props()
    let start_pos = {x: 500, y: 500};
    let end_pos = {x: 1000, y: 1000};
    let scale = 1;
</script>

<svg>
    <text>{scale}</text>
    <line x1={`${start_pos.x}`} y1={`${start_pos.y}`} x2={`${end_pos.x}`} y2={`${end_pos.y}`} stroke='black'/>
</svg>

<style>
    svg{
        position: absolute;
        z-index: 100;
    }
</style>