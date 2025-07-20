function parseSceneForAnimatedObjects(scene) {
    const animatedObjects = [];
    scene.traverse((object) => {
        if (object.isMesh && object.animations && object.animations.length > 0) {
            animatedObjects.push(object);
        }
    });
    return animatedObjects;
}