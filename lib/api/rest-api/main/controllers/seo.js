import chista        from '../../chista.js';
import SeoItemShow   from '../../../../use-cases/main/seo/Show.js';
import SeoItemsList from '../../../../use-cases/main/seo/List.js';

export default {
    show : chista.makeUseCaseRunner(SeoItemShow, (req) => ({ url: req.params[0] })),
    list : chista.makeUseCaseRunner(SeoItemsList, req => ({ ...req.query, ...req.params }))
};
