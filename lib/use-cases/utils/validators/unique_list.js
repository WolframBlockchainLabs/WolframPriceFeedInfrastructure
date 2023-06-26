function unique_list() {
    return (list) => {
        if (list === undefined || list === '') return;
        if (!Array.isArray(list)) return 'FORMAT_ERROR';
        if (new Set(list).size !== list.length) return 'ITEMS_NOT_UNIQUE';

        return;
    };
}

export default unique_list;
