/**
 * Main JavaScript Module Aggregator
 * Imports and initializes all JavaScript modules
 */

// Import modules based on the current page
const currentPath = window.location.pathname;
const pageName = currentPath.split('/').pop().replace('.html', '') || 'index';

console.log(`Loading modules for page: ${pageName}`);

// Common modules (used on all pages)
import '../../script.js';  // Original common functionality

// Page-specific module loading
switch(pageName) {
    case 'asteroid':
        // Three.js visualization module
        import('./modules/asteroid-visualization.js').then(module => {
            console.log('Asteroid visualization module loaded');
            // Module auto-initializes
        }).catch(err => {
            console.error('Failed to load asteroid visualization:', err);
        });
        break;

    case 'asteroid_editor':
        // Editor module
        import('./modules/asteroid-editor.js').then(module => {
            console.log('Asteroid editor module loaded');
            // Module auto-initializes
        }).catch(err => {
            console.error('Failed to load asteroid editor:', err);
        });
        break;

    case 'index':
    case '':
        // Index page specific modules
        console.log('Index page - common modules loaded');
        break;

    case 'publications':
        // Publications page specific modules
        console.log('Publications page - common modules loaded');
        break;

    default:
        console.log('Unknown page - loading only common modules');
}

// Export for potential future use
export default {
    pageName,
    currentPath
};