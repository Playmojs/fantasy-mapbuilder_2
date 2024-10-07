import { store } from "../store.svelte";
import type { Database } from "./database.types";
import dtb from "$lib/dtb"

export enum SearchParam {
	informatic_id = 'informatic'
}

export enum TargetType {
	Marker,
	Map,
	Informatic,
	ParentMap
}

export type MarkerData = Database["public"]["Tables"]["marker"]["Row"];
export type MapData = Database["public"]["Tables"]["map"]["Row"];
export type Article = Database["public"]["Tables"]["article"]["Row"];
export type Project = Database["public"]["Tables"]["project"]["Row"];

export type ModalEntity = {
	image: string | null;
	title: string;
	func: () => void;
}

export type MapOptionsData = {
	func: (file: File | null, title: string) => void;
	button_title: string;
	initial_map_title: string;
	initial_image_blob: Blob | null;
};

export type ConfirmModal = {
	confirm_function: () => void;
	text: string;
}

export type ModalData =
	{ [modal_tab: string]: ModalEntity[]; };

export const add_article: ModalEntity =
{
	image: "/assets/plus.png",
	title: "Add Article",
	func: async () => { await dtb.create_and_show_article() }
}