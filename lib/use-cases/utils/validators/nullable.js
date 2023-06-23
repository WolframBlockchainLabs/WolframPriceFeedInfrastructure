import util from 'livr/lib/util.js';

function nullable() {
    return (value, params, outputArr) => {
        if (util.isNoValue(value)) return;
        if (!util.isPrimitiveValue(value)) return 'FORMAT_ERROR';

        if ([null, 'null'].indexOf(value) >= 0) {
            outputArr.push(null);
        }
    };
}

export default nullable;
