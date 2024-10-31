import { store } from "../store.svelte"
import type { ModalEntity } from "./types"

export const getModalEntityMaps = () => {
    return []
}

export const getModalEntityArticles = () => {
    return []
}

type Theme = {
    image: string,
    title: string
}

export const theme_entities: {[id: number]: Theme} = {
    0: {image: 'none', title: 'No Theme'},
    1: {image: '/assets/brickwall_2.jpg', title: 'Building'},
    2: {image: '/assets/magic.jpg', title: 'Magic'},
    3: {image: '/assets/plant_background.jpg', title: 'Plants'},
    4: {image: '', title: ''},
}

export const get_modal_entity_themes: (value: {id: number | null, title: string}) => ModalEntity[] = (value) => {
    return Object.entries(theme_entities).map(([id, theme]) => {
        return {title: theme.title, image: theme.image, on_click: () => {value.id = +id; value.title = theme.title} }
    })
}
