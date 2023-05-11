import chista            from './../../chista.js';
import { sessionRender } from './../../sessionRender.js';
import ActionsSubmit     from './../../../../use-cases/admin/actions/Submit.js';
import ActionsShow       from './../../../../use-cases/admin/actions/Show.js';

export default {
    submit         : chista.makeUseCaseRunner(ActionsSubmit, req => ({ ...req.body, ...req.params })),
    submitAndLogin : chista.makeUseCaseRunner(ActionsSubmit, req => ({
        ...req.body,
        ...req.params,
        useragent : { ...req.useragent, ip: req.clientIp }
    }), undefined, undefined, sessionRender),
    show : chista.makeUseCaseRunner(ActionsShow, req => ({ ...req.params }))
};
