import { createReadStream } from 'fs';
import { rmdir }            from 'fs/promises';
import FormData             from 'form-data';
import faker                from 'faker';
import News                 from './../../../../lib/domain-model/News.js';

export default [
    {
        label  : 'Positive: admin news create form data',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const form = new FormData();

            form.append('status', News.STATUS_PUBLISHED);
            form.append('category', News.CATEGORY_REVIEWS);
            form.append('publishTill', 'null');
            form.append('publishedAt', '2021-08-07T21:00:00.000Z');
            form.append('previewImg', createReadStream(new URL('./preview.png', import.meta.url)));

            form.append('translations[ru][lang]', 'ru');
            form.append('translations[ru][title]', faker.lorem.sentence());
            form.append('translations[ru][previewContent]', faker.lorem.sentence());
            form.append('translations[ru][content]', faker.lorem.text());
            form.append('translations[ru][seoContent]', faker.lorem.text());
            form.append('translations[ru][metaTitle]', faker.lorem.sentence());
            form.append('translations[ru][metaKeywords]', faker.lorem.sentence());
            form.append('translations[ru][metaDescription]', faker.lorem.sentence());

            form.append('translations[ua][lang]', 'ua');
            form.append('translations[ua][title]', faker.lorem.sentence());
            form.append('translations[ua][previewContent]', faker.lorem.sentence());
            form.append('translations[ua][content]', faker.lorem.text());
            form.append('translations[ua][seoContent]', faker.lorem.text());
            form.append('translations[ua][metaTitle]', faker.lorem.sentence());
            form.append('translations[ua][metaKeywords]', faker.lorem.sentence());
            form.append('translations[ua][metaDescription]', faker.lorem.sentence());

            const result = await adminAPI.asUser(user).postFormData('/news', form);

            t.is(result.status, 1);
            t.truthy(result.data);
            t.is(result.data.publishTill, null);
            t.is(result.data.publishedAt, '2021-08-07T21:00:00.000Z');
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    },
    {
        label  : 'Positive: admin news create form data (auto published date)',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const form = new FormData();

            form.append('status', News.STATUS_PUBLISHED);
            form.append('category', News.CATEGORY_REVIEWS);
            form.append('publishTill', 'null');
            form.append('publishedAt', 'null');
            form.append('previewImg', createReadStream(new URL('./preview.png', import.meta.url)));

            form.append('translations[ru][lang]', 'ru');
            form.append('translations[ru][title]', faker.lorem.sentence());
            form.append('translations[ru][previewContent]', faker.lorem.sentence());
            form.append('translations[ru][content]', faker.lorem.text());
            form.append('translations[ru][seoContent]', faker.lorem.text());
            form.append('translations[ru][metaTitle]', faker.lorem.sentence());
            form.append('translations[ru][metaKeywords]', faker.lorem.sentence());
            form.append('translations[ru][metaDescription]', faker.lorem.sentence());

            form.append('translations[ua][lang]', 'ua');
            form.append('translations[ua][title]', faker.lorem.sentence());
            form.append('translations[ua][previewContent]', faker.lorem.sentence());
            form.append('translations[ua][content]', faker.lorem.text());
            form.append('translations[ua][seoContent]', faker.lorem.text());
            form.append('translations[ua][metaTitle]', faker.lorem.sentence());
            form.append('translations[ua][metaKeywords]', faker.lorem.sentence());
            form.append('translations[ua][metaDescription]', faker.lorem.sentence());

            const result = await adminAPI.asUser(user).postFormData('/news', form);

            t.is(result.status, 1);
            t.truthy(result.data);
            t.is(result.data.publishTill, null);
            t.truthy(Date.parse(result.data.publishedAt) > 0);
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    },
    {
        label  : 'Positive: admin news create json',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const result = await adminAPI.asUser(user).post('/news', {
                status       : News.STATUS_DRAFT,
                category     : News.CATEGORY_REVIEWS,
                publishTill  : '2021-12-19',
                translations : {
                    'ru' : {
                        lang            : 'ru',
                        title           : faker.lorem.sentence(),
                        previewContent  : faker.lorem.sentence(),
                        content         : faker.lorem.text(),
                        seoContent      : faker.lorem.text(),
                        metaTitle       : faker.lorem.sentence(),
                        metaKeywords    : faker.lorem.sentence(),
                        metaDescription : faker.lorem.sentence()
                    },
                    'ua' : {
                        lang  : 'ua',
                        title : faker.lorem.sentence()
                    }
                }
            });

            t.is(result.status, 1);
            t.truthy(result.data);
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    },
    {
        label  : 'Negative: admin news create equal dates',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const form = new FormData();

            form.append('status', News.STATUS_PUBLISHED);
            form.append('category', News.CATEGORY_REVIEWS);
            form.append('publishTill', '2021-12-19');
            form.append('publishedAt', '2021-12-19');
            form.append('previewImg', createReadStream(new URL('./preview.png', import.meta.url)));

            form.append('translations[ru][lang]', 'ru');
            form.append('translations[ru][title]', faker.lorem.sentence());
            form.append('translations[ru][previewContent]', faker.lorem.sentence());
            form.append('translations[ru][content]', faker.lorem.text());
            form.append('translations[ru][seoContent]', faker.lorem.text());
            form.append('translations[ru][metaTitle]', faker.lorem.sentence());
            form.append('translations[ru][metaKeywords]', faker.lorem.sentence());
            form.append('translations[ru][metaDescription]', faker.lorem.sentence());

            form.append('translations[ua][lang]', 'ua');
            form.append('translations[ua][title]', faker.lorem.sentence());
            form.append('translations[ua][previewContent]', faker.lorem.sentence());
            form.append('translations[ua][content]', faker.lorem.text());
            form.append('translations[ua][seoContent]', faker.lorem.text());
            form.append('translations[ua][metaTitle]', faker.lorem.sentence());
            form.append('translations[ua][metaKeywords]', faker.lorem.sentence());
            form.append('translations[ua][metaDescription]', faker.lorem.sentence());


            const result = await adminAPI.asUser(user).postFormData('/news', form);

            t.is(result.status, 0);
            t.is(result.error.fields['data/publishTill'], 'DATE_TOO_LOW');
            t.is(result.error.fields['data/publishedAt'], 'DATE_TOO_HIGH');
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    },
    {
        label  : 'Negative: admin news create with broken picture',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const form = new FormData();

            form.append('status', News.STATUS_PUBLISHED);
            form.append('category', News.CATEGORY_REVIEWS);
            form.append('publishTill', '2021-12-19');
            form.append('previewImg', createReadStream(new URL('./brokenPreview.jpg', import.meta.url)));

            form.append('translations[ru][lang]', 'ru');
            form.append('translations[ru][title]', faker.lorem.sentence());
            form.append('translations[ru][previewContent]', faker.lorem.sentence());
            form.append('translations[ru][content]', faker.lorem.text());
            form.append('translations[ru][seoContent]', faker.lorem.text());
            form.append('translations[ru][metaTitle]', faker.lorem.sentence());
            form.append('translations[ru][metaKeywords]', faker.lorem.sentence());
            form.append('translations[ru][metaDescription]', faker.lorem.sentence());

            form.append('translations[ua][lang]', 'ua');
            form.append('translations[ua][title]', faker.lorem.sentence());
            form.append('translations[ua][previewContent]', faker.lorem.sentence());
            form.append('translations[ua][content]', faker.lorem.text());
            form.append('translations[ua][seoContent]', faker.lorem.text());
            form.append('translations[ua][metaTitle]', faker.lorem.sentence());
            form.append('translations[ua][metaKeywords]', faker.lorem.sentence());
            form.append('translations[ua][metaDescription]', faker.lorem.sentence());

            form.append('translations[en][lang]', 'en');
            form.append('translations[en][title]', faker.lorem.sentence());

            const result = await adminAPI.asUser(user).postFormData('/news', form);

            t.is(result.status, 0);
            t.is(result.error.code, 'IMAGE_UPLOADING_ERROR');
            t.is(result.error.fields.previewImg, 'IMAGE_UPLOADING_ERROR');
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    },
    {
        label  : 'Negative: admin news create without all translations',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const result = await adminAPI.asUser(user).post('/news', {
                status       : News.STATUS_DRAFT,
                category     : News.CATEGORY_REVIEWS,
                publishTill  : '2021-12-19',
                translations : {
                    'ru' : {
                        lang            : 'ru',
                        title           : faker.lorem.sentence(),
                        previewContent  : faker.lorem.sentence(),
                        content         : faker.lorem.text(),
                        seoContent      : faker.lorem.text(),
                        metaTitle       : faker.lorem.sentence(),
                        metaKeywords    : faker.lorem.sentence(),
                        metaDescription : faker.lorem.sentence()
                    }
                }
            });

            t.is(result.status, 0);
            t.is(result.error.code, 'FORMAT_ERROR');
            t.is(result.error.fields['data/translations/ua'], 'REQUIRED');
        }
    },
    {
        label  : 'Negative: admin news create without required fields',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const result = await adminAPI.asUser(user).post('/news', {});

            t.is(result.status, 0);
            t.is(result.error.code, 'FORMAT_ERROR');
        }
    },
    {
        label  : 'Negative: admin news create without permissions',
        before : async ({ factory }) => {
            const { id: roleId } = await factory.createRole('test');

            const user = await factory.createActiveUser({ roleId });

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).post('/news', {
                titleUa          : faker.lorem.words(),
                titleRu          : faker.lorem.words(),
                status           : News.STATUSES[0],
                category         : News.CATEGORIES[0],
                isMain           : true,
                previewImg       : faker.image.imageUrl(),
                previewContentUa : faker.lorem.sentence(),
                previewContentRu : faker.lorem.sentence(),
                contentUa        : faker.lorem.text(),
                contentRu        : faker.lorem.text()
            });

            t.is(res.status, 0);
            t.is(res.error.code, 'ACTION_FORBIDDEN');
        }
    }
];
