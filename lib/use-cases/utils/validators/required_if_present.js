import util from 'livr/lib/util.js';

function required_if_present(queryKey) {
    return (value, params) => {
        if (queryKey && params[queryKey] && util.isNoValue(value)) {
            return 'REQUIRED';
        }

        return;
    };
}

export default required_if_present;
