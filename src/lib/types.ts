
export enum SearchParam {
	informatic_id = 'informatic'
}

export enum MarkerType {
	Informatic,
	Map,
}

export enum TargetType {
	Marker,
	Map,
	Informatic,
	ParentMap
}

export type MarkerData = {
	id: number;
	type: MarkerType;
	position: { x: number; y: number };
	image: string | null;
	query_id: number | null;
};

export type MapData = {
	id: number;
	image: string;
	parent_image: string | null;
	parent_id: number | null;
	marker_ids: number[];
	informatic_id: number;
	title: string;
};

export type Article = {
	id: number;
	text: string;
	image: string | null;
	title: string;
};

export type ModalEntity = {
	image: string | null;
	title: string;
	func: () => void;
}

export type ModalData = {
	entities: ModalEntity[];
};

export const add_map: ModalEntity =
{
	image: "/assets/plus.png",
	title: "Add Map",
	func: () => { console.log('Map added :)') }
}

export const add_article: ModalEntity =
{
	image: "/assets/plus.png",
	title: "Add Article",
	func: () => { console.log('Article added :)') }
}