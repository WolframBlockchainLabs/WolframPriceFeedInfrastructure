import create         from './create.js';
import confirm        from './confirm.js';
import list           from './list.js';
import destroy        from './delete.js';
import destroyCurrent from './deleteCurrent.js';

export default [
    ...create,
    ...confirm,
    ...list,
    ...destroy,
    ...destroyCurrent
];
