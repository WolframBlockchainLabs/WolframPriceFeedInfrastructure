function traverseObject(obj, callback) {
    function traverseRecursive(currentObject, path) {
        Object.keys(currentObject).forEach((key) => {
            const currentPath = path.concat(key);

            const updateValue = (newValue) => {
                let target = obj;
                for (let i = 0; i < currentPath.length - 1; i++) {
                    target = target[currentPath[i]];
                }
                target[currentPath[currentPath.length - 1]] = newValue;
            };

            const result = callback({
                key,
                value: currentObject[key],
                currentPath,
            });

            if (result !== undefined) {
                updateValue(result);
            }

            if (
                currentObject[key] !== null &&
                typeof currentObject[key] === 'object'
            ) {
                traverseRecursive(currentObject[key], currentPath);
            }
        });
    }

    traverseRecursive(obj, []);

    return obj;
}

export default traverseObject;
