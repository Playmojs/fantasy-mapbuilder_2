import { store } from "../store.svelte"
import type { ModalEntity } from "./types"
import { invert_many_to_many } from "./utils"

export const getModalEntityMaps = () => {
    return []
}

export const getModalEntityArticles = () => {
    return []
}

type Theme = {
    image: string | null,
    title: string
}

export const theme_entities: {[id: number]: Theme} = {
    0: {image: null, title: 'No Theme'},
    1: {image: '/assets/brickwall_2.jpg', title: 'Building'},
    2: {image: '/assets/BG3.jpg', title: 'Magic'},
    3: {image: '/assets/BG2.jpg', title: 'Plants'},
    4: {image: '/assets/BG4.jpg', title: 'Rocks'},
    5: {image: '/assets/BG1.jpg', title: 'Dark'},
    6: {image: '/assets/Character.png', title: 'Character'},
    7: {image: '/assets/Location.jpg', title: 'Location'},
    8: {image: '/assets/Magic2.jpg', title: 'Magic2'},
    9: {image: '/assets/Culture.png', title: 'Culture'},
    10: {image: '/assets/Religion.jpg', title: 'Religion'},
}

export const get_modal_entity_themes: (value: {id: number, title: string}) => ModalEntity[] = (value) => {
    return Object.entries(theme_entities).map(([id, theme]) => {
        return {title: theme.title, image: theme.image, on_click: () => {value.id = +id; value.title = theme.title  } }
    })
}

type DerivedUnits={units: {[derived_unit: string]: number}, conversion_factor: number}
export const units: {[unit: string]: DerivedUnits} = {Metric: {units: {m: 1, km: 1000}, conversion_factor: 1000}, Imperial: {units: {ft: 1, miles: 5480}, conversion_factor: 3000}}