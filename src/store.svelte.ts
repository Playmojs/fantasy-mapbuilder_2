
class Store {
    edit_mode = $state(false);
    minimized = $state(false);
    informatic_width = $state(66);
    non_map_informatic_id = $state<number | null>(null)
}

export const store = new Store()
