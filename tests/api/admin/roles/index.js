import create  from './create.js';
import update  from './update.js';
import list    from './list.js';
import show    from './show.js';
import destroy from './delete.js';

export default [
    ...create,
    ...update,
    ...list,
    ...show,
    ...destroy
];
