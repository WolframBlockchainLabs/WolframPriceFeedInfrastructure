import chista    from '../../chista.js';
import List      from '../../../../use-cases/admin/userSessions/List.js';
import Delete    from '../../../../use-cases/admin/userSessions/Delete.js';
import DeleteAll from '../../../../use-cases/admin/userSessions/DeleteAll.js';

export default {
    list      : chista.makeUseCaseRunner(List, req => ({ ...req.query, ...req.params })),
    delete    : chista.makeUseCaseRunner(Delete, req => ({ ...req.body, ...req.params })),
    deleteAll : chista.makeUseCaseRunner(DeleteAll, req => ({ ...req.body, ...req.params }))
};
