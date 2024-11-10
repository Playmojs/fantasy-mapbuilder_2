<script lang='ts'>
	import { keywords } from '$lib/keyword_manager';
	import MarkerWindow from './MarkerWindow.svelte';
  
  // Function to handle `/map` and `/article` cases
  function handleMap(id: number) {
    alert(`Map function called with ID: ${id}`);
  }

  function handleArticle(id: number) {
    alert(`Article function called with ID: ${id}`);
  }

  const {href, title, text, raw, tokens}: {href: string, title: string | null, text: string, raw: string, tokens: any} = $props()
  
  let id = $state<number | null>(null)
  let active_key = $state<string>('')
  let hover = $state<boolean>(false)

  $effect(()=>{
    let match: RegExpMatchArray | null;
    id = null
    Object.entries(keywords).forEach(([key, {regex}]) => {
      if ((match = regex.exec(href))){
        id = +match[1]
        active_key = key
      }
      regex.lastIndex = 0;
    })
  })
</script>

{#if id !== null}
  <a
    onclick={()=>{if (id !== null){keywords[active_key].on_click(id)}}}
    onmouseenter={() => {
      hover = true;
    }}
    onmouseleave={() => {
      hover = false;
    }}
    
    >{text}
    {#if hover}
     <div id="marker_wrapper">
		  <MarkerWindow map_id={active_key == 'map' ? id: null} article_id={active_key == 'article' ? id: null} scale={1}/>
      </div>
	  {/if}
  </a>
{/if}


<style>
  a{
    position: relative;
    font-style:oblique;
    font-weight: bold;
    cursor: pointer;
  }

  #marker_wrapper{
    position: absolute;
    left: 50%;
    bottom: 100%;
    font-size: large;
    height: fit-content;
  }
</style>
