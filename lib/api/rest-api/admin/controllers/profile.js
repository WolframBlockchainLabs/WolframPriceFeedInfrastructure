import keyBy         from 'lodash/keyBy.js';
import chista        from '../../chista.js';
import Update        from '../../../../use-cases/admin/profile/Update.js';
import Show          from '../../../../use-cases/admin/profile/Show.js';

export default {
    show   : chista.makeUseCaseRunner(Show, () => ({})),
    update : chista.makeServiceRunner(Update, req => ({ data: { ...req.body }, files: keyBy(req.files || [], 'fieldname') }))
};
