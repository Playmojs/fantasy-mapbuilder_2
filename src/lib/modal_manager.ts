import { store } from '../store.svelte';
import dtb from './dtb';
import type { ChooseModalData, Modal, ModalEntity, UploadModal } from './types';
import { assert_unreachable } from './utils';


export function push_modal(modal: Modal): void {store.modals = [...store.modals, modal]}

export function pop_modal(): void {store.modals = store.modals.slice(0, -1)} // TODO: I think this copies the list - can this be avoided?

export function push_promise_modal(modal: Modal): Promise<void> {
    return new Promise((resolve, reject) => {
        modal.on_close = (success: boolean) => {
            if (success) {
                resolve()
            } else {
                reject();
            }
        };
        store.modals = [...store.modals, modal]
    });
};

export const choose_article_by_id: (value: {id: number | null}) => ModalEntity[] = (value) => {
    return Object.entries(store.article_cache).map(([id, article]) => {
        return {
            image:
                article.image && store.image_public_urls[article.image]
                    ? URL.createObjectURL(store.image_public_urls[article.image])
                    : '/assets/Parchment.png',
            title: article.title,
            on_click: () => {
                value.id = article.id;
            }
        };
    });
};

export const choose_existing_map: (value: {id: number | null}) => Promise<ModalEntity[]> = async (value) => {
    await dtb.fetch_all_from_project(store.project_id);
    return Object.entries(store.map_cache).map(([_, map]) => {
        return {
            image: URL.createObjectURL(store.image_public_urls[map.image]),
            title: map.title,
            on_click: () => {
                value.id = map.id
            }
        };
    });
};

export const add_article: ModalEntity =
{
	image: "/assets/plus.png",
	title: "Add Article",
	on_click: async () => { 
        const selected_marker = store.markers.find((marker) => marker.id === store.selected_marker);
        if (selected_marker === undefined) {
            assert_unreachable("Selected marker doesn't exist");
            return;
        } 

        const response = await dtb.create_and_show_article(store.project_id);

        if (response !== undefined) {
            selected_marker.target_article_id = +response.id;
            selected_marker.target_map_id = null;
            dtb.update_marker(selected_marker);
        }}
}

export const choose_no_article: (value: {id: null | number}) => ModalEntity = (value) => {
    return{
        image: "/assets/minus.png",
        title: "Don't Link To Article",
        on_click: () => { value.id = null; }
    }
}

export const link_article: (value: {id: number | null}) => Promise<void> = async (value) => {
    await push_promise_modal({
        type: 'choose_modal',
        data: { Articles: [choose_no_article(value)].concat(choose_article_by_id(value))},
        use_search: true
    });
}

export const get_new_map_data: (value: {file: File | null, title: string, article_id: number | null}) => Promise<void> = (value) => {
    let modal: UploadModal = {type: 'upload_modal',
        data: {
            submit_func: (file: File | null, title: string, article_id: number | null) => {
                if(file === null || title === ''){return}
                else{return {file, title, article_id}}
            },
            validation_func(file: Blob | File | null, title: string) {
                return file !== null && title !== '';
            },
            link_func: link_article,
            button_title: 'Create Map',
            initial_image_blob: null,
            initial_map_title: '',
            initial_link: null,
            allow_no_file: false}};

    return push_promise_modal(modal)
}

export type map_or_article = {
    article_id: number | null;
    map_id: number | null;
}

export const choose_map_or_article: (value: {map_id: number | null, article_id: number| null}) => ChooseModalData = (value) => {
    return{
        Maps:  Object.entries(store.map_cache).map(([_, map]) => {
            return {
                image: URL.createObjectURL(store.image_public_urls[map.image]),
                title: map.title,
                on_click: () => {
                    value.map_id = map.id
                    value.article_id = null
                }
            };
        }),
        Articles: Object.entries(store.article_cache).map(([_, article]) => {
            return {
                image:
                    article.image && store.image_public_urls[article.image]
                        ? URL.createObjectURL(store.image_public_urls[article.image])
                        : '/assets/Parchment.png',
                title: article.title,
                on_click: () => {
                    value.map_id = null;
                    value.article_id = article.id;
                }
            };
        })
    }
}