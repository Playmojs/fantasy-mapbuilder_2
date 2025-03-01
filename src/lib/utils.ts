import { store } from "../store.svelte";

export const assert = (condition: boolean, message: string) => {
    if (!condition) {
        console.error(message);
        console.trace();
    }
}

export const assert_unreachable = (message: string) => {
    assert(false, message);
}

export const invert_many_to_many = (list: {[from: number]: number[]}) => {
    const inverted_list: {[from: number]: number[]} = {}
    Object.entries(list).forEach(([from, tos]) => {
        tos.forEach(to => {
            if(to in inverted_list){
                inverted_list[to].push(+from)
            }
            else{
                inverted_list[to] = [+from]
            }
        })
    })
    return inverted_list;
}

export function get_screen_height(): number{
    if (store.mobile_layout){
        return window.screen.height
    }
    return window.innerHeight
}

export function get_screen_width(): number{
    if (store.mobile_layout){
        return window.screen.width
    }
    return window.innerWidth
}