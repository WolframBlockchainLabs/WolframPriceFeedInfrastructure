import { mkdir, rm }                from 'fs/promises';
import sharp                        from 'sharp';
import { slugify }                  from 'transliteration';
import { modelStoragePath, isFile } from './utils.js';

const RANDOM_MAX = 10000000;

export async function storeImage(modelId, file, config, modelName) {
    const { filepath, filename }  = getImageFilename(modelId, modelName);
    const { sizes, path } = config;

    for (const size of Object.keys(sizes)) {
        const { width, height, quality, fit } = sizes[size];

        await mkdir(`${path}/${size}/${filepath}`, { recursive: true });
        await sharp(file.buffer || file.path)
            .resize(width, height, {
                fit                : fit || sharp.fit.inside,
                withoutEnlargement : true
            })
            .jpeg({ quality })
            .toFile(`${path}/${size}/${filepath}/${filename}`);
    }

    return `${filepath}/${filename}`;
}

export async function removeImage(imagePath, config) {
    const { sizes, path } = config;

    for (const size of Object.keys(sizes)) {
        const filepath = `${path}/${size}/${imagePath}`;

        if (await isFile(filepath)) {
            await rm(filepath);
        }
    }
}

function getImageFilename(modelId, modelName) {
    const filepath = modelStoragePath(modelId);
    const filename = `${modelName ? slugify(modelName) : random()}.jpg`;

    return { filepath, filename };
}

function random() {
    return Math.floor(Math.random() * RANDOM_MAX);
}
