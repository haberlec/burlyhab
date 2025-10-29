/**
 * Asteroid CSS Box-Shadow Pixel Editor Module
 * Interactive tool for creating pixel art using CSS box-shadow
 */

const canvas = document.getElementById('asteroidCanvas');
const ctx = canvas.getContext('2d');
const pixels = new Map(); // Store as "x,y" => color

let currentColor = '#000000';
let pixelSize = 5;
let isDrawing = false;

// Canvas settings
const canvasSize = 800;
let gridRange = 100; // -100 to +100
let scale = canvasSize / (gridRange * 2);

// Initialize
export function init() {
    drawGrid();
    updateColorButtons();
    setupEventListeners();
}

function drawGrid() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= canvasSize; i += scale * 10) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvasSize, i);
        ctx.stroke();
    }

    // Draw center crosshairs
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvasSize / 2, 0);
    ctx.lineTo(canvasSize / 2, canvasSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvasSize / 2);
    ctx.lineTo(canvasSize, canvasSize / 2);
    ctx.stroke();

    // Redraw all pixels
    pixels.forEach((color, coord) => {
        const [x, y] = coord.split(',').map(Number);
        drawPixel(x, y, color);
    });
}

function canvasToCoords(canvasX, canvasY) {
    const x = Math.floor((canvasX - canvasSize/2) / scale);
    const y = Math.floor((canvasY - canvasSize/2) / scale);
    return {x, y};
}

function coordsToCanvas(x, y) {
    return {
        x: x * scale + canvasSize/2,
        y: y * scale + canvasSize/2
    };
}

function drawPixel(x, y, color) {
    const canvasCoords = coordsToCanvas(x, y);
    ctx.fillStyle = color;
    ctx.fillRect(canvasCoords.x, canvasCoords.y, scale, scale);

    // Add pixel border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(canvasCoords.x, canvasCoords.y, scale, scale);
}

function addPixel(x, y) {
    const key = `${x},${y}`;
    if (pixels.has(key) && pixels.get(key) === currentColor) {
        // Remove pixel if clicking with same color
        pixels.delete(key);
    } else {
        pixels.set(key, currentColor);
    }
    drawGrid();
    updateCSS();
}

function exportCSS() {
    if (pixels.size === 0) {
        return '/* No pixels to export */';
    }

    const shadows = [];
    pixels.forEach((color, coord) => {
        const [x, y] = coord.split(',').map(Number);
        shadows.push(`${x * pixelSize}px ${y * pixelSize}px 0 0 ${color}`);
    });

    const css = `.asteroid-sprite::before {
    content: '';
    position: absolute;
    width: ${pixelSize}px;
    height: ${pixelSize}px;
    box-shadow:
        ${shadows.join(',\\n        ')};
}`;

    // Also update size display
    const sizeKB = (new Blob([css]).size / 1024).toFixed(2);
    document.getElementById('sizeDisplay').textContent = `Size: ${sizeKB} KB`;

    return css;
}

function updateCSS() {
    const css = exportCSS();
    document.getElementById('cssOutput').value = css;
    updatePreview(css);
}

function updatePreview(css) {
    const preview = document.querySelector('.asteroid-preview');
    if (!preview) return;

    // Remove old style if exists
    const oldStyle = document.getElementById('preview-style');
    if (oldStyle) oldStyle.remove();

    // Create new style element
    const style = document.createElement('style');
    style.id = 'preview-style';
    style.textContent = css.replace('.asteroid-sprite', '.asteroid-preview');
    document.head.appendChild(style);
}

function clearCanvas() {
    if (confirm('Clear all pixels?')) {
        pixels.clear();
        drawGrid();
        updateCSS();
    }
}

function saveToFile() {
    const css = exportCSS();
    const blob = new Blob([css], {type: 'text/css'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asteroid-sprite.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const css = e.target.result;
        importFromCSS(css);
    };
    reader.readAsText(file);
}

function importFromCSS(css) {
    // Parse box-shadow values
    const shadowMatch = css.match(/box-shadow:\s*([\s\S]*?);/);
    if (!shadowMatch) {
        alert('No valid box-shadow found in CSS');
        return;
    }

    pixels.clear();
    const shadows = shadowMatch[1].split(/,\s*(?=[-\d])/);

    shadows.forEach(shadow => {
        const match = shadow.trim().match(/(-?\d+)px\s+(-?\d+)px\s+\d+\s+\d+\s+(#[0-9a-f]{6}|rgb[^)]+\))/i);
        if (match) {
            const x = parseInt(match[1]) / pixelSize;
            const y = parseInt(match[2]) / pixelSize;
            const color = match[3];
            pixels.set(`${x},${y}`, color);
        }
    });

    drawGrid();
    updateCSS();
}

function fillShape() {
    // Find bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    pixels.forEach((color, coord) => {
        const [x, y] = coord.split(',').map(Number);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    });

    // Fill interior
    for (let y = minY + 1; y < maxY; y++) {
        let inside = false;
        let lastX = minX;

        for (let x = minX; x <= maxX; x++) {
            if (pixels.has(`${x},${y}`)) {
                if (!inside && x > lastX + 1) {
                    // Fill gap
                    for (let fx = lastX + 1; fx < x; fx++) {
                        pixels.set(`${fx},${y}`, currentColor);
                    }
                }
                inside = true;
                lastX = x;
            }
        }
    }

    drawGrid();
    updateCSS();
}

// Find transparent areas (holes)
function findTransparent() {
    const transparent = [];
    // Implementation would analyze pixel arrangement
    // to find interior transparent regions
    return transparent;
}

// Color palette buttons
function updateColorButtons() {
    const colorPicker = document.getElementById('colorPicker');
    if (colorPicker) {
        colorPicker.value = currentColor;
        colorPicker.addEventListener('change', (e) => {
            currentColor = e.target.value;
        });
    }
}

// Drawing helpers
function drawCircle(centerX, centerY, radius) {
    for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
            if (x*x + y*y <= radius*radius) {
                pixels.set(`${centerX + x},${centerY + y}`, currentColor);
            }
        }
    }
    drawGrid();
    updateCSS();
}

// Event listeners
function setupEventListeners() {
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const coords = canvasToCoords(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
        addPixel(coords.x, coords.y);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const coords = canvasToCoords(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
        addPixel(coords.x, coords.y);
    });

    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
    });

    // Button event listeners
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearCanvas);

    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveToFile);

    const loadBtn = document.getElementById('loadBtn');
    if (loadBtn) loadBtn.addEventListener('change', loadFromFile);

    const fillBtn = document.getElementById('fillBtn');
    if (fillBtn) fillBtn.addEventListener('click', fillShape);

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) exportBtn.addEventListener('click', () => {
        const css = exportCSS();
        navigator.clipboard.writeText(css).then(() => {
            alert('CSS copied to clipboard!');
        });
    });
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export functions for module use
export default {
    init,
    clearCanvas,
    saveToFile,
    loadFromFile,
    exportCSS,
    fillShape,
    drawCircle
};