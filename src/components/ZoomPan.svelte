<script lang="ts">
	import { onMount } from 'svelte';
	import { store } from '../store.svelte';

	export let parent_selector = '';

	let parent: any;
	let scale = 1;
	let current_x = 0;
	let current_y = 0;
	let start_x = 0;
	let start_y = 0;

	let initial_distance = 0;
	let initial_scale = 1;

	const min_scale = 0.5;
	const max_scale = 5;

	function handle_mouse_down(event: MouseEvent) {
		event.preventDefault();
		store.is_panning = true;
		start_x = event.clientX - current_x;
		start_y = event.clientY - current_y;
		window.addEventListener('mousemove', handle_mouse_move);
		window.addEventListener('mouseup', handle_mouse_up);
	}

	function handle_mouse_move(event: MouseEvent) {
		if (!store.is_panning) return;
		current_x = clamp(event.clientX - start_x, get_min_x(), 0);
		current_y = clamp(event.clientY - start_y, get_min_y(), get_max_y());
		update_transform();
	}

	function handle_mouse_up() {
		store.is_panning = false;
		window.removeEventListener('mousemove', handle_mouse_move);
		window.removeEventListener('mouseup', handle_mouse_up);
	}

	function handle_touch_start(event: TouchEvent) {
		if (event.touches.length === 1) {
			store.is_panning = true;
			start_x = event.touches[0].clientX - current_x;
			start_y = event.touches[0].clientY - current_y;
		} else if (event.touches.length === 2) {
			initial_distance = get_distance(event.touches[0], event.touches[1]);
			initial_scale = scale;
		}
	}

	function handle_touch_move(event: TouchEvent) {
		event.preventDefault();
		if (event.touches.length === 1 && store.is_panning) {
			current_x = clamp(event.touches[0].clientX - start_x, get_min_x(), 0);
			current_y = clamp(event.touches[0].clientY - start_y, get_min_y(), get_max_y());
		} else if (event.touches.length === 2) {
			store.is_panning = false;
			const new_distance = get_distance(event.touches[0], event.touches[1]);
			let new_scale = clamp(
				initial_scale * (new_distance / initial_distance),
				min_scale,
				max_scale
			);

			const center_x = (event.touches[0].clientX + event.touches[1].clientX) / 2;
			const center_y = (event.touches[0].clientY + event.touches[1].clientY) / 2;

			zoom_at(center_x, center_y, new_scale);
		}
		update_transform();
	}

	function handle_touch_end(event: TouchEvent) {
		if (event.touches.length === 0) {
			store.is_panning = false;
		}
	}

	function handle_wheel(event: WheelEvent) {
		event.preventDefault();
		const delta = Math.sign(event.deltaY);
		const new_scale = clamp(scale * (1 + delta * -0.1), min_scale, max_scale);
		zoom_at(event.clientX, event.clientY, new_scale);
		update_transform();
	}

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}

	function get_min_x() {
		return (
			window.innerWidth * (store.minimized ? 1 : store.informatic_width / 100) -
			parent.clientWidth * scale
		);
	}

	function get_min_y() {
		return window.innerHeight - parent.clientHeight * scale;
	}

	function get_max_y() {
		return 50; //Edit bar height
	}

	function get_distance(touch1: Touch, touch2: Touch) {
		return Math.sqrt(
			(touch1.clientX - touch2.clientX) ** 2 + (touch1.clientY - touch2.clientY) ** 2
		);
	}

	function zoom_at(x: number, y: number, new_scale: number) {
		let scale_ratio = new_scale / scale;
		scale = new_scale;
		current_x = clamp(-(x - current_x) * scale_ratio + x, get_min_x(), 0);
		current_y = clamp(-(y - current_y) * scale_ratio + y, get_min_y(), get_max_y());
	}

	function update_transform() {
		if (parent) {
			store.map_transform = { x: current_x, y: current_y, scale: scale };
			parent.style.transform = `translate(${current_x}px, ${current_y}px) scale(${scale})`;
		}
	}

	onMount(() => {
		parent = document.querySelector(parent_selector);
		if (parent) {
			parent.style.transformOrigin = `top left`;
			parent.addEventListener('mousedown', handle_mouse_down);
			parent.addEventListener('wheel', handle_wheel);
			parent.addEventListener('touchstart', handle_touch_start);
			parent.addEventListener('touchmove', handle_touch_move);
			parent.addEventListener('touchend', handle_touch_end);
		}
	});
</script>
