import util from 'livr/lib/util.js';

function date_less_then_field(field) {
    return (value, params) => {
        if (util.isNoValue(value)) return;
        if (!util.isPrimitiveValue(value)) return 'FORMAT_ERROR';

        const epochField = Date.parse(params[field]);
        const epoch = Date.parse(value);

        if (!epochField && epochField !== 0) return;
        if (!epoch && epoch !== 0) return 'WRONG_DATE';

        const thisDate = new Date(epoch);
        const comparedDate = new Date(epochField);

        if (thisDate >= comparedDate) return 'DATE_TOO_HIGH';

        return;
    };
}

export default date_less_then_field;
