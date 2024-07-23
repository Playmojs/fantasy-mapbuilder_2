import { writable } from "svelte/store";

const edit_mode = writable<boolean>(false);

export default edit_mode;