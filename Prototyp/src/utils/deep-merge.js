/**
 *  Alternative zu NPM package. Diese Datei wird verwendet um die Konfigurationsdateien zu mergen.
 */

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

export function deepMerge(target, ...sources) {
    if (!sources.length) {
        return target;
    }
    const source = sources.shift();

    const output = { ...target };

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        }
    }

    return deepMerge(output, ...sources);
}
