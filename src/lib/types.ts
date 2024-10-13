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

export type ModalType = 'upload_modal' | 'choose_modal' | 'confirm_modal'

export type UploadModalData = {
	submit_func: (file: File | null, title: string) => void;
	validation_func: (file: File | Blob | null, title: string) => boolean;
	link_func: (() => void) | null;
	button_title: string;
	initial_map_title: string | null;
	initial_image_blob: Blob | null;
	initial_link: number | null;
	allow_no_file: boolean;
};

export type UploadModal = {
	type: "upload_modal",
	data: UploadModalData
}

export type ConfirmModalData = {
	confirm_function: () => void;
	text: string;
}

export type ConfirmModal = {
	type: "confirm_modal";
	data: ConfirmModalData;
}

export type ChooseModalData ={ [modal_tab: string]: ModalEntity[]; };


export type ChooseModal = {
	type: 'choose_modal',
	data: ChooseModalData
}

export const add_article: ModalEntity =
{
	image: "/assets/plus.png",
	title: "Add Article",
	func: async () => { await dtb.create_and_show_article();}
}

export const no_article_link: ModalEntity =
{
	image: "/assets/minus.png",
	title: "Don't Link To Article",
	func: () => {store.map_article_link = null;}
}

export type Folder = "maps" | "articles"
export type Modal = ChooseModal | UploadModal | ConfirmModal