import chista        from '../../chista.js';
import SeoItemShow   from '../../../../use-cases/admin/seo/Show.js';
import SeoItemsList  from '../../../../use-cases/admin/seo/List.js';
import SeoItemCreate from '../../../../use-cases/admin/seo/Create.js';
import SeoItemUpdate from '../../../../use-cases/admin/seo/Update.js';
import SeoItemDelete from '../../../../use-cases/admin/seo/Delete.js';

export default {
    show   : chista.makeUseCaseRunner(SeoItemShow, (req) => ({ ...req.params })),
    list   : chista.makeUseCaseRunner(SeoItemsList, req => ({ ...req.query, ...req.params })),
    create : chista.makeUseCaseRunner(SeoItemCreate, req => ({  ...req.body })),
    update : chista.makeUseCaseRunner(SeoItemUpdate, req => ({ ...req.body, ...req.params })),
    delete : chista.makeUseCaseRunner(SeoItemDelete, req => ({ ...req.body, ...req.params }))
};
