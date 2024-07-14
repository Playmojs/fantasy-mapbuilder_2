<script>
    let scale = 0.6;
    let originX = 0;
    let originY = 0;
    let startX = 0;
    let startY = 0;
    let isPanning = false;
    let transformStyle = '';

    $: transformStyle = `translate(${originX}px, ${originY}px) scale(${scale})`;

    function handleWheel(event) {
        event.preventDefault();
        const delta = event.deltaY * -0.001;
        const newScale = Math.min(Math.max(0.6, scale + delta), 3);

        const rect = event.currentTarget.getBoundingClientRect();
        const offsetX = (event.clientX - rect.left) / rect.width;
        const offsetY = (event.clientY - rect.top) / rect.height;

        const dx = offsetX * (scale - newScale);
        const dy = offsetY * (scale - newScale);

        originX += dx * rect.width;
        originY += dy * rect.height;

        scale = newScale;

        console.log(`Scale: ${scale}, OriginX: ${originX}, OriginY: ${originY}`);
    }

    function handleMouseDown(event) {
        event.preventDefault();
        isPanning = true;
        startX = event.clientX - originX;
        startY = event.clientY - originY;

        console.log(`Mouse Down - StartX: ${startX}, StartY: ${startY}`);
    }

    function handleMouseMove(event) {
        event.preventDefault();
        if (!isPanning) return;
        originX = event.clientX - startX;
        originY = event.clientY - startY;

        console.log(`Mouse Move - OriginX: ${originX}, OriginY: ${originY}`);
    }

    function handleMouseUp() {
        event.preventDefault();
        isPanning = false;
        console.log('Mouse Up');
    }
</script>



 <div
    class="container"
    on:wheel={handleWheel}
    on:mousedown={handleMouseDown}
    on:mousemove={handleMouseMove}
    on:mouseup={handleMouseUp}
    on:mouseleave={handleMouseUp}
    role="application"
    aria-label="Zoom and Pan Container"

    style="transform: {transformStyle};"
>
    <img
    src="/assets/magil.png"
    alt="Zoomable and Pannable"
    class="image"
    aria-label="Zoomable and Pannable Element"
    />
</div>

