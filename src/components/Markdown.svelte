<script lang="ts">
  import { marked } from 'marked';
  import { keywords } from '$lib/keyword_manager';
  import { store } from '../store.svelte';

  const { source }: { source: string } = $props();

  // Custom renderer: annotate keyword links with data attributes
  const renderer = new marked.Renderer();
  renderer.link = ({ href, title, text }) => {
    for (const [key, { regex }] of Object.entries(keywords)) {
      const match = regex.exec(href ?? '');
      regex.lastIndex = 0;
      if (match) {
        return `<a data-keyword-key="${key}" data-keyword-id="${match[1]}" class="keyword-link">${text}</a>`;
      }
    }
    return `<a href="${href}">${text}</a>`;
  };

  const html = $derived(marked(source, { renderer }));

  function handleClick(e: MouseEvent) {
    const a = (e.target as HTMLElement).closest('a[data-keyword-key]');
    if (!a) return;
    const key = a.getAttribute('data-keyword-key')!;
    const id = Number(a.getAttribute('data-keyword-id'));
    keywords[key].on_click(id);
  }

  function handleMouseenter(e: MouseEvent) {
    const a = (e.target as HTMLElement).closest('a[data-keyword-key]');
    if (!a) return;
    const key = a.getAttribute('data-keyword-key')!;
    const id = Number(a.getAttribute('data-keyword-id'));
    store.informatic_marker_window = {
      x: 0, y: 0,
      map_id: key === 'map' ? id : null,
      article_id: key === 'article' ? id : null
    };
  }

  function handleMouseleave(e: MouseEvent) {
    const a = (e.target as HTMLElement).closest('a[data-keyword-key]');
    if (!a) return;
    store.informatic_marker_window = null;
  }
</script>

<div
  onclick={handleClick}
  onmouseover={handleMouseenter}
  onmouseleave={handleMouseleave}
  class="markdown-body"
  aria-label="Clickable Text"
>
  {@html html}
</div>

<style>
  .markdown-body :global(a.keyword-link) {
    position: relative;
    font-style: oblique;
    font-weight: bold;
    cursor: pointer;
  }
</style>