import CategoryModal from '../components/modals/CategoryModal.svelte';
import { store } from '../store.svelte';
import { get_modal_entity_themes, theme_entities } from './data.svelte';
import dtb from './dtb';
import type { ChooseModalData, ModalType, ModalEntity, UploadModal, CategoryModalData, Category, CompositeModal } from './types';
import { assert_unreachable, invert_many_to_many } from './utils';


export function push_modal(modal: ModalType): void {store.modals = [...store.modals, modal]}

export function pop_modal(): void {store.modals = store.modals.slice(0, -1)} // TODO: I think this copies the list - can this be avoided?

export function push_promise_modal(modal: ModalType): Promise<void> {
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

export const choose_article_by_id: (value: {id: number | null, title: string}) => ModalEntity[] = (value) => {
    return Object.entries(store.article_cache).map(([id, article]) => {
        return {
            image:
                article.image && store.image_public_urls[article.image]
                    ? URL.createObjectURL(store.image_public_urls[article.image])
                    : '/assets/Parchment.png',
            title: article.title,
            on_click: () => {
                value.id = article.id;
                value.title = `Article: ${article.title}`;
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

export const link_article: (value: {id: number | null, title: string}) => Promise<void> = async (value) => {
    await push_promise_modal({
        type: 'choose_modal',
        data: { Articles: [choose_no_article(value)].concat(choose_article_by_id(value))},
        use_search: true
    });
}

export const get_new_map_data: (value: {file: File | null, title: string, article_id: number | null}) => Promise<void> = (value) => {
    let modal: UploadModal = {type: 'upload_modal',
        data: {
            submit_func: async (file: File | null, title: string, article_id: number | null) => {
                if(file === null || title === ''){return}
                value.file = file;
                value.title = title;
                value.article_id = article_id;
            },
            validation_func(file: Blob | File | null, title: string) {
                return file !== null && title !== '';
            },
            link_func: link_article,
            button_title: 'Create Map',
            initial_image_blob: null,
            initial_map_title: '',
            initial_link: {id: null, title: ""},
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

export const get_article_to_category_modal: (article_id: number) => CategoryModalData = (article_id: number) => {
    return {
        child_id: article_id,
        parent_to_children_ids: store.article_category_links,
        add_child_to_parent: (category_id: number) => {return dtb.insert_article_category_link(store.project_id, category_id, article_id)},
        remove_child_from_parent: (category_id: number) => {return dtb.delete_article_category_link(store.project_id, category_id, article_id)},
        async toggle_main_func(parent_id) {
            let article = await dtb.get_article(store.project_id, article_id);
            if(!article){return;}
            const new_main_category_id: number | null = parent_id === article.main_category ? null : parent_id;
            article.main_category = new_main_category_id;
            dtb.update_article(article);
        },
    }
}

export const get_category_to_category_modal: (child_category_id: number) => CategoryModalData = (child_category_id: number) => {
    return {
        child_id: child_category_id,
        parent_to_children_ids: store.category_links,
        add_child_to_parent: (parent_category_id: number) => {return dtb.insert_category_link (store.project_id, parent_category_id, child_category_id)},
        remove_child_from_parent: (parent_category_id: number) => {return dtb.delete_category_link (store.project_id, parent_category_id, child_category_id)},
        toggle_main_func: null
    }
}



export const get_inverse_category_to_category_modal: (parent_category_id: number) => CategoryModalData = (parent_category_id: number) => {
    return {
        child_id: parent_category_id,
        parent_to_children_ids: store.category_links,
        add_child_to_parent: (child_category_id: number) => {return dtb.insert_category_link(store.project_id, parent_category_id, child_category_id)},
        remove_child_from_parent: (child_category_id: number) => {return dtb.delete_category_link(store.project_id, parent_category_id, child_category_id)},
        toggle_main_func: null,
        inverted: true
    }
}

export const get_add_category_modal: (value: {id: number | null}) => UploadModal = (value) => {
    return {type: 'upload_modal',
        data: {
            submit_func: async (file: File | null, title: string, theme_id: number | null) => {
                if(file !== null || title === '' || title === 'Add Category'){return}
                const response = await dtb.create_category(store.project_id, title, theme_id ?? 0);
                if(response===undefined){return}
                else{value.id = response.id;}
            },
            validation_func(file: Blob | File | null, title: string) {
                return title !== '';
            },
            link_func: async (val) => {await push_promise_modal({type: 'choose_modal', data: {Themes: get_modal_entity_themes(val)}, use_search: true})},
            button_title: 'Create Category',
            initial_image_blob: null,
            initial_map_title: '',
            initial_link: {id: null, title: ""},
            allow_no_file: null}};
}

export const edit_category_modal: (category: Category) => UploadModal = (category: Category) => {
    return {type: 'upload_modal',
        data: {
            submit_func: async (file: File | null, title: string, theme_id: number | null) => {
                if(title === '' || title === 'Add Category'){return}
                category.name = title;
                category.theme_id = theme_id ?? 0
                await dtb.update_category(category)
            },
            validation_func(file: Blob | File | null, title: string, link_id: number | null) {
                return title !== '' && !(title === category.name && link_id === category.theme_id);
            },
            link_func: async (val) => {await push_promise_modal({type: 'choose_modal', data: {Themes: get_modal_entity_themes(val)}, use_search: true})},
            button_title: 'Update Category',
            initial_image_blob: null,
            initial_map_title: category.name,
            initial_link: {id: category.theme_id, title: theme_entities[category.theme_id].title},
            allow_no_file: null}};
 }

 export const get_composite_category_modal: (category: Category) => CompositeModal = (category: Category) => {
    return({
        type: 'composite_modal',
        data: {
            'Category Data': edit_category_modal(category),
            'Parent Categories': {type: 'category_modal', data: get_category_to_category_modal(category.id)},
            'Child Categories': {type: 'category_modal', data: get_inverse_category_to_category_modal(category.id)}
        }
    })
 }