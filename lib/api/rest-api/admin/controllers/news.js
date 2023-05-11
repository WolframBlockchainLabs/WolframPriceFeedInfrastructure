import keyBy           from 'lodash/keyBy.js';
import chista          from '../../chista.js';
import AdminNewsCreate from '../../../../use-cases/admin/news/Create.js';
import AdminNewsList   from '../../../../use-cases/admin/news/List.js';
import AdminNewsUpdate from '../../../../use-cases/admin/news/Update.js';
import AdminNewsDelete from '../../../../use-cases/admin/news/Delete.js';
import AdminNewsShow   from '../../../../use-cases/admin/news/Show.js';

export default {
    list   : chista.makeUseCaseRunner(AdminNewsList, req => ({ ...req.query, ...req.params })),
    show   : chista.makeUseCaseRunner(AdminNewsShow, req => ({ ...req.params })),
    create : chista.makeUseCaseRunner(AdminNewsCreate, req => {
        return {
            data  : { ...req.body },
            files : keyBy(req.files || [], 'fieldname')
        };
    }),
    update : chista.makeUseCaseRunner(AdminNewsUpdate, req => {
        return {
            data : {
                ...req.params,
                ...req.body
            },
            files : keyBy(req.files || [], 'fieldname')
        };
    }),
    delete : chista.makeUseCaseRunner(AdminNewsDelete, req => ({ ...req.params }))
};
