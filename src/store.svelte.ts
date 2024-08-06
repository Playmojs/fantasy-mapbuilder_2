import { MarkerType, type Article, type MapData, type MarkerData, type ModalData} from "$lib/types";

class Store {
    edit_mode = $state(false);
    non_map_informatic_id = $state<number | null>(null)
    show_modal = $state(false);
    minimized = $state(false);
    is_panning = $state(false);
    selected_marker = $state<number | null>(null);
    informatic_width = $state(66);

    modal_data = $state<ModalData | null>(null);

    markers = $state<{ [id: number]: MarkerData }>({
        0: {
            id: 0,
            image: null,
            position: { x: 42.73, y: 56.59 },
            query_id: 0,
            type: MarkerType.Map
        },
        1: {
            id: 1,
            image: null,
            position: { x: 38.1, y: 59.46 },
            query_id: 2,
            type: MarkerType.Informatic
        }
    });

    articles = $state<{ [id: number]: Article }>({
        0: { id: 0, text: '# Magil \n This is Magil', image: '/assets/magil_image.jpg', title: "Magil" },
        1: { id: 1, text: '# Second Realm \n This is the second Realm', image: null, title: "Second Realm" },
        2: { id: 2, text: 'This is a portal :)', image: null, title: "Portal" }
    });

    maps = $state<{ [id: number]: MapData }>({
        0: {
            id: 0,
            image: '/assets/magil.png',
            parent_image: '/assets/map.jpg',
            parent_id: 1,
            marker_ids: [],
            informatic_id: 0,
            title: 'Magil'
        },
        1: {
            id: 1,
            image: '/assets/map.jpg',
            parent_image: null,
            parent_id: null,
            marker_ids: [0, 1],
            informatic_id: 1,
            title: 'Second Realm'
        },
        2: {
            id: 2,
            image: '/assets/magil.png',
            parent_image: '/assets/map.jpg',
            parent_id: 1,
            marker_ids: [],
            informatic_id: 0,
            title: 'Magil'
        },
        3: {
            id: 3,
            image: '/assets/map.jpg',
            parent_image: null,
            parent_id: null,
            marker_ids: [0, 1],
            informatic_id: 1,
            title: 'Second Realm'
        },
        4: {
            id: 4,
            image: '/assets/magil.png',
            parent_image: '/assets/map.jpg',
            parent_id: 1,
            marker_ids: [],
            informatic_id: 0,
            title: 'Magil'
        },
        5: {
            id: 5,
            image: '/assets/map.jpg',
            parent_image: null,
            parent_id: null,
            marker_ids: [0, 1],
            informatic_id: 1,
            title: 'Second Realm'
        },
        6: {
            id: 6,
            image: '/assets/magil.png',
            parent_image: '/assets/map.jpg',
            parent_id: 1,
            marker_ids: [],
            informatic_id: 0,
            title: 'Magil'
        },
        7: {
            id: 7,
            image: '/assets/map.jpg',
            parent_image: null,
            parent_id: null,
            marker_ids: [0, 1],
            informatic_id: 1,
            title: 'Second Realm'
        },
        8: {
            id: 8,
            image: '/assets/magil.png',
            parent_image: '/assets/map.jpg',
            parent_id: 1,
            marker_ids: [],
            informatic_id: 0,
            title: 'Magil'
        },
        9: {
            id: 9,
            image: '/assets/map.jpg',
            parent_image: null,
            parent_id: null,
            marker_ids: [0, 1],
            informatic_id: 1,
            title: 'Second Realm'
        },
        10: {
            id: 10,
            image: '/assets/magil.png',
            parent_image: '/assets/map.jpg',
            parent_id: 1,
            marker_ids: [],
            informatic_id: 0,
            title: 'Magil'
        },
        11: {
            id: 11,
            image: '/assets/map.jpg',
            parent_image: null,
            parent_id: null,
            marker_ids: [0, 1],
            informatic_id: 1,
            title: 'Second Realm'
        },
        12: {
            id: 12,
            image: '/assets/magil.png',
            parent_image: '/assets/map.jpg',
            parent_id: 1,
            marker_ids: [],
            informatic_id: 0,
            title: 'Magil'
        },
        13: {
            id: 13,
            image: '/assets/map.jpg',
            parent_image: null,
            parent_id: null,
            marker_ids: [0, 1],
            informatic_id: 1,
            title: 'Second Realm'
        },
        14: {
            id: 14,
            image: '/assets/magil.png',
            parent_image: '/assets/map.jpg',
            parent_id: 1,
            marker_ids: [],
            informatic_id: 0,
            title: 'Magil'
        },
        15: {
            id: 15,
            image: '/assets/map.jpg',
            parent_image: null,
            parent_id: null,
            marker_ids: [0, 1],
            informatic_id: 1,
            title: 'Second Realm'
        },
        16: {
            id: 16,
            image: '/assets/magil.png',
            parent_image: '/assets/map.jpg',
            parent_id: 1,
            marker_ids: [],
            informatic_id: 0,
            title: 'Magil'
        },
        17: {
            id: 17,
            image: '/assets/map.jpg',
            parent_image: null,
            parent_id: null,
            marker_ids: [0, 1],
            informatic_id: 1,
            title: 'Second Realm'
        }
    });
}


export const store = new Store()
