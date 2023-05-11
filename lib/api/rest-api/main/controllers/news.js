import chista   from '../../chista.js';
import NewsList from '../../../../use-cases/main/news/List.js';
import NewsShow from '../../../../use-cases/main/news/Show.js';

export default {
    list : chista.makeUseCaseRunner(NewsList, req => ({ ...req.query, ...req.params })),
    show : chista.makeUseCaseRunner(NewsShow, req => ({ slug: req.params.slug }))
};
