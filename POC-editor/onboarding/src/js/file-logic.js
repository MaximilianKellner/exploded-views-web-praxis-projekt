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

// Exp-config Format Überprüfung
export async function validateConfigFile(file) {
    try {
        const text = await file.text();
        const config = JSON.parse(text);
        
        if (!config || typeof config !== 'object') return false;
        if (!config.objects || typeof config.objects !== 'object') return false;

        for (const key in config.objects) {
            const obj = config.objects[key];
            if (typeof obj !== 'object') return false;
            
            // level: number
            if (typeof obj.level !== 'number') return false;
            
            // expDirection: [x, y, z] (numbers)
            if (!Array.isArray(obj.expDirection) || obj.expDirection.length !== 3) return false;
            if (obj.expDirection.some(n => typeof n !== 'number')) return false;
            
            // speedMultiplier: number
            if (typeof obj.speedMultiplier !== 'number') return false;
            
            // sequence: number
            if (typeof obj.sequence !== 'number') return false;
        }
        
        return true;
    } catch (error) {
        console.error("Validation error:", error);
        return false;
    }
}
