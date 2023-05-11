import chista from '../../chista.js';
import Create from '../../../../use-cases/main/contactRequests/Create.js';

export default {
    create : chista.makeUseCaseRunner(Create, req => ({ ...req.body }))
};
