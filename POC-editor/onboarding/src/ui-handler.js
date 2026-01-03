const uploadOverlay = document.getElementById('onboarding-screen');
const uploadBoxes = document.querySelectorAll('.upload-box');
const closeBtns = document.querySelectorAll('.close-btn');

export function initUI(onFilesReceived, onReset) {
    // File inputs
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const box = e.target.closest('.upload-box');
                const btn = e.target.closest('.file-upload-btn');
                
                // Add success class to icon
                const icon = btn.querySelector('.file-upload-icon');
                if (icon) {
                    icon.classList.add('success');
                    
                    // Change icon image
                    const img = icon.querySelector('img');
                    if (img) {
                        if (!img.dataset.originalSrc) {
                            img.dataset.originalSrc = img.getAttribute('src');
                        }
                        img.src = './icon/check.svg';
                    }
                }

                // Update text with filename
                const textSpan = btn.querySelector('.file-upload-text');
                if (textSpan) {
                    if (!textSpan.dataset.originalText) {
                        textSpan.dataset.originalText = textSpan.textContent.trim();
                    }
                    textSpan.textContent = e.target.files[0].name;
                }

                expandBox(box);
                onFilesReceived(e.target.files);
            }
        });
        
        // Prevent input click from bubbling to box
        input.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Box click listeners
    uploadBoxes.forEach(box => {
        box.addEventListener('click', (e) => {
            expandBox(box);
        });
    });

    // Close buttons
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

export function resetBoxes() {{
            icon.classList.remove('success');
            
            // Reset icon image
            const img = icon.querySelector('img');
            if (img && img.dataset.originalSrc) {
                img.src = img.dataset.originalSrc;
            }
        }
    uploadBoxes.forEach(box => {
        box.classList.remove('expanded');
        box.classList.remove('collapsed');
        
        // Clear inputs
        const inputs = box.querySelectorAll('input[type="file"]');
        inputs.forEach(input => input.value = '');

        // Reset icons
        const icons = box.querySelectorAll('.file-upload-icon');
        icons.forEach(icon => icon.classList.remove('success'));

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
