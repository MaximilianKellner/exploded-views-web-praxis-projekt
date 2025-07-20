import { Pane } from 'tweakpane';


export function initTweakpane(config,) {
    const pane = new Pane({
        title: 'Scene Controls',
    });

    // --- Animation Einstellungen ---
    const animationFolder = pane.addFolder({ title: 'Animation', expanded: true });
    // Definiere die Variable im config-Objekt, damit sie global ausgelesen werden kann
    if (!config.animationConfig) config.animationConfig = {};
    if (typeof config.animationConfig.expFactor !== 'number') config.animationConfig.expFactor = 0;

    animationFolder.addBinding(
        config.animationConfig,
        'expFactor',
        { label: 'Progress', min: 0, max: 1, step: 0.01 }
    );

    const triggerAnimationButton = animationFolder.addButton(
        {
            title: 'Start Animation',
            label: 'Start'
        });

    triggerAnimationButton.on('click', () => {
        console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAA');
    });

    return pane;
}