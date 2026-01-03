const uploadOverlay = document.getElementById('onboarding-screen');
const uploadBoxes = document.querySelectorAll('.upload-box');
const closeBtns = document.querySelectorAll('.close-btn');

export function initUI(onFilesReceived, onReset) {
    // File inputs
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const box = e.target.closest('.upload-box');
                expandBox(box);
                onFilesReceived(e.target.files);
            }
        });
        
        // Prevent double click from triggering box click
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

export function resetBoxes() {
    uploadBoxes.forEach(box => {
        box.classList.remove('expanded');
        box.classList.remove('collapsed');
        
        // Clear inputs
        const inputs = box.querySelectorAll('input[type="file"]');
        inputs.forEach(input => input.value = '');
    });
}

export function hideOverlay() {
    uploadOverlay.classList.add('hidden');
    setTimeout(() => {
        uploadOverlay.style.display = 'none';
    }, 500);
}
