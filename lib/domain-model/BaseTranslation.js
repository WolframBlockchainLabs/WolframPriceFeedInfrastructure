import Base from './Base.js';

export default class BaseTranslation extends Base {
    static LANGS = [ 'en' ];

    static DEFAULT_LANG = 'en';

    static setLangConfig(config) {
        this.LANGS = config.list;
        this.DEFAULT_LANG = config.default;
    }
}
