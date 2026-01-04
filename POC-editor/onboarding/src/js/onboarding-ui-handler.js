const uploadOverlay = document.getElementById('onboarding-screen');
const uploadBoxes = document.querySelectorAll('.upload-box');
const closeBtns = document.querySelectorAll('.close-btn');

// Bilder vorladen
const preloadImages = () => {
    const images = ['./icon/check.svg', './icon/error_round.svg'];
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
};

export function initUI(onFilesReceived, onReset, onValidate) {
    preloadImages();

    // Inputs zurücksetzen --> Cache Break
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.value = '';
    });

    // File inputs
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const box = e.target.closest('.upload-box');
                const btn = e.target.closest('.file-upload-btn');
                const icon = btn.querySelector('.file-upload-icon');
                const img = icon.querySelector('img');
                const textSpan = btn.querySelector('.file-upload-text');

                // Ausgangs src/text speichern
                if (img && !img.dataset.originalSrc) img.dataset.originalSrc = img.getAttribute('src');
                if (textSpan && !textSpan.dataset.originalText) textSpan.dataset.originalText = textSpan.textContent.trim();

                // Format Überprüfung
                let isValid = true;
                if (onValidate) {
                    isValid = await onValidate(file);
                }

                if (isValid) {
                    // Erfolg anzeigen
                    if (icon) {
                        icon.classList.remove('error');
                        icon.classList.add('success');
                    }
                    if (img) img.src = './icon/check.svg';
                    if (textSpan) textSpan.textContent = file.name;

                    expandBox(box);
                    
                    // Alle Inputs der Box müssen gefüllt sein
                    const allInputs = box.querySelectorAll('input[type="file"]');
                    let allFilled = true;
                    const collectedFiles = [];

                    allInputs.forEach(inp => {
                        if (inp.files.length === 0) {
                            allFilled = false;
                        } else {
                            const inpBtn = inp.closest('.file-upload-btn');
                            const inpIcon = inpBtn.querySelector('.file-upload-icon');
                            if (inpIcon.classList.contains('error')) {
                                allFilled = false; 
                            }
                            collectedFiles.push(inp.files[0]);
                        }
                    });

                    if (allFilled) {
                        onFilesReceived(collectedFiles);
                    }

                } else {
                    // Error anzeigen
                    if (icon) {
                        icon.classList.remove('success');
                        icon.classList.add('error');
                    }
                    if (img) img.src = './icon/error_round.svg';
                    if (textSpan) textSpan.textContent = file.name; 
                    expandBox(box);
                }
            }
        });
        
        input.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Listeners für upload Boxen
    uploadBoxes.forEach(box => {
        box.addEventListener('click', (e) => {
            expandBox(box);
        });
    });

    // Listeners für Close buttons
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            resetBoxes();
            if (onReset) onReset();
        });
    });
}

function expandBox(activeBox) {
    uploadBoxes.forEach(box => {
        if (box === activeBox) {
            box.classList.add('expanded');
            box.classList.remove('collapsed');
        } else {
            box.classList.add('collapsed');
            box.classList.remove('expanded');
        }
    });
}

export function resetBoxes() {
    uploadBoxes.forEach(box => {
        box.classList.remove('expanded');
        box.classList.remove('collapsed');
        
        // Clear inputs
        const inputs = box.querySelectorAll('input[type="file"]');
        inputs.forEach(input => input.value = '');

        // Reset icons
        const icons = box.querySelectorAll('.file-upload-icon');
        icons.forEach(icon => {
            icon.classList.remove('success');
            icon.classList.remove('error');
            
            // Checkboy Icon --> Upload Icon
            const img = icon.querySelector('img');
            if (img && img.dataset.originalSrc) {
                img.src = img.dataset.originalSrc;
            }
        });

        // Reset text
        const texts = box.querySelectorAll('.file-upload-text');
        texts.forEach(text => {
            if (text.dataset.originalText) {
                text.textContent = text.dataset.originalText;
            }
        });
    });
}

export function hideOverlay() {
    uploadOverlay.classList.add('hidden');
    setTimeout(() => {
        uploadOverlay.style.display = 'none';
    }, 500);
}
