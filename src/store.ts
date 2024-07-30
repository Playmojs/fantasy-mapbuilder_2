import { writable } from "svelte/store";

const edit_mode = writable<boolean>(false);

export const set_informatic=writable((text: string, article_image: string) => {});
export const toggle_informatic=writable((id: number) => {});

export default edit_mode;