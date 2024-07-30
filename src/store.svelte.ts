
class Store {
    edit_mode = $state(false);
    non_map_informatic_id = $state<number | null>(null)
}

export const store = new Store()
