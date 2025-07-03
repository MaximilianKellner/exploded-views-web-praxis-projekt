import { updateLabelPointerSide } from './text-label-3d.js';

const labelDirectionSelect = document.getElementById('label-direction');

function updateLabelOrientations(labels) {
    const selectedValue = labelDirectionSelect.value;

    labels.forEach(label => {
        const { originalPosition, objectSize, labelWidth } = label.userData;

        // Position und Rotation für Neuberechnung zurücksetzen
        label.position.copy(originalPosition);
        label.rotation.set(0, 0, 0);

        switch (selectedValue) {
            case 'links/rechts':
                // Hier ist nichts zu tun, da die `originalPosition` bereits korrekt ist.
                // Wir müssen nur die pointerSide wieder korrekt setzen.
                const pointerSide = label.userData.direction === 'XNEG' ? 'right' : 'left';
                updateLabelPointerSide(label, pointerSide);
                break;

            case 'vorne':
                label.position.set(0, 0, Math.abs(originalPosition.x));
                label.rotation.y = Math.PI / 2;
                updateLabelPointerSide(label, 'right');
                break;

            case 'hinten':
                label.position.set(0, 0, -Math.abs(originalPosition.x));
                label.rotation.y = -Math.PI / 2;
                updateLabelPointerSide(label, 'right');
                break;

            case 'diagonal':
                const distance = Math.abs(originalPosition.x);
                const angle = Math.PI / 4; // 45°
                label.position.set(distance * Math.cos(angle), 0, distance * Math.sin(angle));
                label.rotation.y = -angle;
                updateLabelPointerSide(label, 'left');
                break;

            default:
                console.warn('Unbekannte Label-Richtung:', selectedValue);
                break;
        }
    });
}

export function initUI(labels) {
    if (!labelDirectionSelect) {
        console.error('Select-Element #label-direction nicht gefunden.');
        return;
    }

    labelDirectionSelect.addEventListener('change', () => {
        updateLabelOrientations(labels);
    });

    // Initiale Ausrichtung beim Laden einmalig anwenden, falls der Default nicht "links/rechts" ist
    if (labelDirectionSelect.value !== 'links/rechts') {
        updateLabelOrientations(labels);
    }
}