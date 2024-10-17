<script lang='ts'>
	import { gotoMap } from '$lib/goto_map';
    import { marked } from 'marked';
	import { store } from '../store.svelte';
	import MarkerWindow from './MarkerWindow.svelte';
  
  // Function to handle `/map` and `/article` cases
  function handleMap(id: number) {
    alert(`Map function called with ID: ${id}`);
  }

  function handleArticle(id: number) {
    alert(`Article function called with ID: ${id}`);
  }

  const {href, title, text}: {href: string, title: string | undefined, text: string} = $props()
  
  type Keyword = {
    regex: RegExp,
    on_click: (id: number)=> void
  }

  let keywords: {[key: string]: Keyword} = {
    'map': {regex: /\/map=(\d+)+/i,
      on_click: (id: number)=>{gotoMap(id)}
    },
    'article': {regex: /\/article=(\d+)+/i,
      on_click: (id: number)=>{store.article = store.article_cache[id]}
    }
  }

  let id = $state<number | null>(null)
  let active_key = $state<string>('')
  let hover = $state<boolean>(false)

  $effect(()=>{
    let match: RegExpMatchArray | null;
    id = null
    Object.entries(keywords).forEach(([key, {regex, on_click}]) => {
      if ((match = href.match(regex))){
        id = +match[1]
        active_key = key
      }
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
    <!-- {#if hover}
		  <MarkerWindow map_id={active_key == 'map' ? id: null} article_id={active_key == 'article' ? id: null} scale={1}/>
	  {/if} -->
  </a>
{/if}


<style>
  a{
    font-style:oblique;
    font-weight: bold;
    font-size: 1.3rem;
    cursor: pointer;
  }
</style>
