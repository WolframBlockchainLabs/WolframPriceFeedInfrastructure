import list       from './list.js';
import destroy    from './delete.js';
import destroyAll from './deleteAll.js';

export default [
    ...list,
    ...destroy,
    ...destroyAll
];
