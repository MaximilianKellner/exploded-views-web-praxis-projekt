export function getFilesFromList(files) {
    let glbFile = null;
    let jsonFile = null;

    for (const file of files) {
        if (file.name.toLowerCase().endsWith('.glb')) {
            glbFile = file;
        } else if (file.name.toLowerCase().endsWith('.json')) {
            jsonFile = file;
        }
    }
    return { glbFile, jsonFile };
}
