import chista               from '../../chista.js';
import Create               from '../../../../use-cases/admin/sessions/Create.js';
import Confirm              from '../../../../use-cases/admin/sessions/Confirm.js';
import Check                from '../../../../use-cases/admin/sessions/Check.js';
import List                 from '../../../../use-cases/admin/sessions/List.js';
import Delete               from '../../../../use-cases/admin/sessions/Delete.js';
import { sessionRender }    from './../../sessionRender.js';
import { middlewareRender } from './../../middlewareRender.js';

export default {
    create        : chista.makeUseCaseRunner(Create, req => ({ ...req.body }), undefined, undefined, sessionRender),
    list          : chista.makeUseCaseRunner(List, req => ({ ...req.query, ...req.params })),
    confirm       : chista.makeUseCaseRunner(Confirm, req => ({ ...req.body })),
    delete        : chista.makeUseCaseRunner(Delete, req => ({ ...req.body, ...req.params })),
    deleteCurrent : chista.makeUseCaseRunner(Delete, req => ({ sessionId: req.session.id })),
    check         : chista.makeUseCaseRunner(Check, req => ({
        session : {
            context : req.session.context
        }
    }), undefined, undefined, middlewareRender),
    csrf : (req, res) => res.send({ csrf: req.csrfToken() })
};
