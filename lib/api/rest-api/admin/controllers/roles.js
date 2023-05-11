import chista  from '../../chista.js';
import Update  from '../../../../use-cases/admin/roles/Update.js';
import Show    from '../../../../use-cases/admin/roles/Show.js';
import Create  from '../../../../use-cases/admin/roles/Create.js';
import List    from '../../../../use-cases/admin/roles/List.js';
import Delete  from '../../../../use-cases/admin/roles/Delete.js';

export default {
    show   : chista.makeUseCaseRunner(Show, (req) => ({ ...req.query, ...req.params })),
    list   : chista.makeUseCaseRunner(List, req => ({ ...req.query, ...req.params })),
    create : chista.makeUseCaseRunner(Create, req => ({  ...req.body })),
    update : chista.makeUseCaseRunner(Update, req => ({ ...req.body, ...req.params })),
    delete : chista.makeUseCaseRunner(Delete, req => ({ ...req.body, ...req.params }))
};
