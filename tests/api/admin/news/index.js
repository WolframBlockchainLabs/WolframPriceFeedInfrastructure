import list   from './list.js';
import create from './create.js';
import update from './update.js';
import show   from './show.js';
import remove from './delete.js';

export default [
    ...list,
    ...create,
    ...update,
    ...show,
    ...remove
];
