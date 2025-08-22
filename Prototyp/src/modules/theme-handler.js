export function toggleDarkMode(isDarkmode) {
    const root = document.documentElement;
    
    if (isDarkmode) {
        // Dark Mode Werte anwenden
        root.style.setProperty('--primary', 'var(--c-d-primary)');
        root.style.setProperty('--header', 'var(--c-d-header)');
        root.style.setProperty('--body-text', 'var(--c-d-body-text)');
        root.style.setProperty('--accent', 'var(--c-d-accent)');
        root.style.setProperty('--invert-value', '0');
    } else {
        // Light Mode Werte anwenden
        root.style.setProperty('--primary', 'var(--c-l-primary)');
        root.style.setProperty('--header', 'var(--c-l-header)');
        root.style.setProperty('--body-text', 'var(--c-l-body-text)');
        root.style.setProperty('--accent', 'var(--c-l-accent)');
        root.style.setProperty('--invert-value', '1');
    }
}