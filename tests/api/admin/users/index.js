import create  from './create.js';
import update  from './update.js';
import list    from './list.js';
import show    from './show.js';
import action  from './sendActivation.js';

export default [
    ...create,
    ...update,
    ...list,
    ...show,
    ...action
];
