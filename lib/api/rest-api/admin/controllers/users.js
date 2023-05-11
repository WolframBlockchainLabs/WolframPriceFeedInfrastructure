import chista         from '../../chista.js';
import Update         from '../../../../use-cases/admin/users/Update.js';
import Show           from '../../../../use-cases/admin/users/Show.js';
import Create         from '../../../../use-cases/admin/users/Create.js';
import List           from '../../../../use-cases/admin/users/List.js';
import SendActivation from '../../../../use-cases/admin/users/SendActivation.js';
import ResetPassword  from '../../../../use-cases/admin/users/ResetPassword.js';

export default {
    show           : chista.makeUseCaseRunner(Show, (req) => ({ ...req.query, ...req.params })),
    list           : chista.makeServiceRunner(List, req => ({ ...req.query, ...req.params })),
    create         : chista.makeUseCaseRunner(Create, req => ({  ...req.body })),
    update         : chista.makeUseCaseRunner(Update, req => ({ ...req.body, ...req.params })),
    sendActivation : chista.makeUseCaseRunner(SendActivation, req => ({ ...req.body, ...req.params })),
    resetPassword  : chista.makeUseCaseRunner(ResetPassword, req => ({ ...req.body }))
};
