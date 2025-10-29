/**
 * Asteroid 333005 Haberle - 3D Orbital Visualization Module
 * Uses Three.js to render interactive solar system with asteroid orbit
 *
 * Features:
 * - Accurate orbital mechanics and positions
 * - Labels that track celestial bodies and stay readable
 * - Correct relative sizes (Sun > Jupiter > Earth > Mars > Asteroid)
 * - Jupiter positioned correctly on its 5.2 AU orbital path
 * - Realistic procedural textures for all celestial bodies:
 *   - Sun: Radial gradient with granulation effects and glow
 *   - Earth: Blue oceans, green continents, white polar ice caps
 *   - Mars: Red surface with craters and dust storms
 *   - Jupiter: Horizontal bands, Great Red Spot, storm systems
 *   - Asteroid: Rocky grey surface with craters
 * - Planetary rotation (Earth, Mars, Jupiter spin on axes)
 * - Realistic axial tilts (Earth: 23.5°, Mars: 25.2°, Jupiter: 3.1°)
 * - Asteroid tumbling motion
 * - Interactive camera controls (zoom, pan, rotate)
 * - Real-time distance calculations
 */

// Module-level variables
let scene, camera, renderer, controls;
let asteroidMesh, earthMesh, marsMesh, jupiterMesh, sunMesh;
let asteroidOrbit, earthOrbit, marsOrbit, jupiterOrbit;
let labels = {}; // Store label references

// Orbital elements for 333005 Haberle
const haberleOrbital = {
    a: 3.1347518,      // Semi-major axis (AU)
    e: 0.0600504,      // Eccentricity
    i: 17.31772,       // Inclination (degrees)
    omega: 74.45764,   // Argument of perihelion (degrees)
    Omega: 165.56543,  // Longitude of ascending node (degrees)
    M0: 133.58151,     // Mean anomaly at epoch (degrees)
    n: 0.17758210,     // Mean motion (degrees/day)
    epoch: 2460600.5   // Epoch JD
};

// Realistic relative sizes (scaled for visibility)
const SIZES = {
    sun: 0.20,        // Sun (reference)
    jupiter: 0.10,    // Jupiter (largest planet)
    earth: 0.035,     // Earth
    mars: 0.025,      // Mars (smaller than Earth)
    asteroid: 0.015   // Asteroid (smallest)
};

export function initThreeJS() {
    try {
        const container = document.getElementById('orbit-container');
        if (!container) {
            console.error('Orbit container not found');
            showError('Visualization container not found');
            return;
        }

        const canvas = document.getElementById('orbit-canvas');
        if (!canvas) {
            console.error('Canvas element not found');
            showError('Canvas element not found');
            return;
        }

        // Check for WebGL support
        if (!isWebGLAvailable()) {
            showError('WebGL is not supported in your browser. Please use a modern browser with WebGL support.');
            return;
        }

        // Check if THREE is loaded
        if (typeof THREE === 'undefined') {
            console.error('Three.js library not loaded');
            showError('3D graphics library failed to load. Please refresh the page.');
            return;
        }

        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000814);

        // Camera setup
        const aspect = container.clientWidth / container.clientHeight;
        camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        camera.position.set(6, 4, 6);

        // Renderer setup
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: false
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit to 2x for performance

        // Add OrbitControls
        if (typeof THREE.OrbitControls === 'undefined') {
            console.error('OrbitControls not loaded');
            showError('Camera controls failed to load');
            return;
        }

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 2;
        controls.maxDistance = 50;
        controls.target.set(0, 0, 0);

        // Improved lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        const sunLight = new THREE.PointLight(0xffffff, 2.5);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        scene.add(sunLight);

        // Add starfield
        createStarfield();

        // Create Sun with realistic appearance
        sunMesh = createSun();
        scene.add(sunMesh);

        // Create orbits and planets
        createOrbits();
        createPlanets();

        // Setup reset button
        const resetBtn = document.getElementById('reset-view');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                camera.position.set(6, 4, 6);
                controls.target.set(0, 0, 0);
                controls.update();
            });
        }

        // Hide loading message and show success
        hideLoading();

        // Start animation
        animate();

        console.log('Three.js visualization initialized successfully');

    } catch (error) {
        console.error('Error initializing Three.js:', error);
        showError(`Failed to initialize 3D visualization: ${error.message}`);
    }
}

function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext &&
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

function showError(message) {
    const loadingMsg = document.getElementById('loading-message');
    if (loadingMsg) {
        loadingMsg.innerHTML = `
            <div style="color: #ff6b6b; padding: 2rem; background: rgba(255, 107, 107, 0.1); border-radius: 8px; border: 2px solid #ff6b6b;">
                <h3 style="margin: 0 0 1rem 0;">⚠️ Visualization Error</h3>
                <p style="margin: 0;">${message}</p>
            </div>
        `;
        loadingMsg.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingMsg = document.getElementById('loading-message');
    if (loadingMsg) {
        loadingMsg.style.display = 'none';
    }
}

function createProceduralTexture(width, height, drawFunction) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    drawFunction(context, width, height);
    return new THREE.CanvasTexture(canvas);
}

function createSunTexture() {
    return createProceduralTexture(512, 512, (ctx, w, h) => {
        // Create radial gradient for sun
        const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
        gradient.addColorStop(0, '#FFFF88');
        gradient.addColorStop(0.5, '#FFD700');
        gradient.addColorStop(0.8, '#FFA500');
        gradient.addColorStop(1, '#FF8C00');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Add surface detail (solar granulation effect)
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const radius = Math.random() * 15 + 5;
            const opacity = Math.random() * 0.3;
            const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
            glow.addColorStop(0, `rgba(255, 200, 100, ${opacity})`);
            glow.addColorStop(1, 'rgba(255, 200, 100, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, w, h);
        }
    });
}

function createSun() {
    const geometry = new THREE.SphereGeometry(SIZES.sun, 32, 32);
    const texture = createSunTexture();

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        emissive: 0xFDB813,
        emissiveIntensity: 0.8
    });

    const sun = new THREE.Mesh(geometry, material);

    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(SIZES.sun * 1.15, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFAA00,
        transparent: true,
        opacity: 0.4,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sun.add(glow);

    return sun;
}

function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.015,
        transparent: true,
        opacity: 0.8
    });

    const starsVertices = [];
    for (let i = 0; i < 5000; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

function createOrbits() {
    // Earth orbit (1 AU)
    earthOrbit = createOrbitLine(1, 0, 0, 0x4A90E2);
    scene.add(earthOrbit);

    // Mars orbit (1.52 AU)
    marsOrbit = createOrbitLine(1.52, 0, 1.85, 0xCD5C5C);
    scene.add(marsOrbit);

    // Asteroid 333005 Haberle orbit
    asteroidOrbit = createOrbitLine(
        haberleOrbital.a,
        haberleOrbital.e,
        haberleOrbital.i,
        0xFF6B35,
        haberleOrbital.omega,
        haberleOrbital.Omega
    );
    scene.add(asteroidOrbit);

    // Jupiter orbit (5.2 AU, simplified circular orbit in XZ plane)
    jupiterOrbit = createOrbitLine(5.2, 0, 0, 0xD4A76A);
    scene.add(jupiterOrbit);
}

function createOrbitLine(a, e, i, color, omega = 0, Omega = 0) {
    const points = [];
    const segments = 256;

    for (let j = 0; j <= segments; j++) {
        const nu = (j / segments) * Math.PI * 2;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));

        const x_orbital = r * Math.cos(nu);
        const y_orbital = r * Math.sin(nu);

        const omega_rad = omega * Math.PI / 180;
        const Omega_rad = Omega * Math.PI / 180;
        const i_rad = i * Math.PI / 180;

        const x_perihelion = x_orbital * Math.cos(omega_rad) - y_orbital * Math.sin(omega_rad);
        const y_perihelion = x_orbital * Math.sin(omega_rad) + y_orbital * Math.cos(omega_rad);

        const x = x_perihelion * (Math.cos(Omega_rad) * Math.cos(omega_rad) - Math.sin(Omega_rad) * Math.sin(omega_rad) * Math.cos(i_rad))
                - y_perihelion * (Math.cos(Omega_rad) * Math.sin(omega_rad) + Math.sin(Omega_rad) * Math.cos(omega_rad) * Math.cos(i_rad));

        const y = x_perihelion * Math.sin(Omega_rad) * Math.sin(i_rad)
                + y_perihelion * Math.cos(Omega_rad) * Math.sin(i_rad);

        const z = x_perihelion * (Math.sin(Omega_rad) * Math.cos(omega_rad) + Math.cos(Omega_rad) * Math.sin(omega_rad) * Math.cos(i_rad))
                - y_perihelion * (Math.sin(Omega_rad) * Math.sin(omega_rad) - Math.cos(Omega_rad) * Math.cos(omega_rad) * Math.cos(i_rad));

        points.push(new THREE.Vector3(x, y, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: color,
        opacity: 0.6,
        transparent: true
    });
    return new THREE.Line(geometry, material);
}

function createEarthTexture() {
    return createProceduralTexture(512, 512, (ctx, w, h) => {
        // Base ocean blue
        ctx.fillStyle = '#0066CC';
        ctx.fillRect(0, 0, w, h);

        // Add continents (landmasses)
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const width = Math.random() * 80 + 40;
            const height = Math.random() * 60 + 30;
            ctx.beginPath();
            ctx.ellipse(x, y, width, height, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add white polar caps
        const polarGradientTop = ctx.createRadialGradient(w/2, 0, 0, w/2, 0, h/4);
        polarGradientTop.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        polarGradientTop.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = polarGradientTop;
        ctx.fillRect(0, 0, w, h/4);

        const polarGradientBottom = ctx.createRadialGradient(w/2, h, 0, w/2, h, h/4);
        polarGradientBottom.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        polarGradientBottom.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = polarGradientBottom;
        ctx.fillRect(0, h*3/4, w, h/4);
    });
}

function createMarsTexture() {
    return createProceduralTexture(512, 512, (ctx, w, h) => {
        // Base reddish surface
        ctx.fillStyle = '#CD5C5C';
        ctx.fillRect(0, 0, w, h);

        // Add darker craters and features
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const radius = Math.random() * 20 + 5;
            const darkness = Math.random() * 0.4;
            ctx.fillStyle = `rgba(100, 50, 50, ${darkness})`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add lighter dust storms/features
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const radius = Math.random() * 30 + 10;
            const lightness = Math.random() * 0.3;
            ctx.fillStyle = `rgba(220, 180, 150, ${lightness})`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Polar ice caps
        const polarTop = ctx.createRadialGradient(w/2, 0, 0, w/2, 0, h/5);
        polarTop.addColorStop(0, 'rgba(255, 240, 240, 0.8)');
        polarTop.addColorStop(1, 'rgba(255, 240, 240, 0)');
        ctx.fillStyle = polarTop;
        ctx.fillRect(0, 0, w, h/5);
    });
}

function createJupiterTexture() {
    return createProceduralTexture(512, 512, (ctx, w, h) => {
        // Base color
        ctx.fillStyle = '#C88B3A';
        ctx.fillRect(0, 0, w, h);

        // Add horizontal bands
        const bandCount = 15;
        for (let i = 0; i < bandCount; i++) {
            const y = (i / bandCount) * h;
            const bandHeight = h / bandCount;

            // Alternate between lighter and darker bands
            if (i % 2 === 0) {
                ctx.fillStyle = `rgba(220, 180, 140, ${0.3 + Math.random() * 0.2})`;
            } else {
                ctx.fillStyle = `rgba(140, 100, 70, ${0.2 + Math.random() * 0.2})`;
            }
            ctx.fillRect(0, y, w, bandHeight);
        }

        // Add the Great Red Spot
        const spotX = w * 0.4;
        const spotY = h * 0.4;
        const spotGradient = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, 40);
        spotGradient.addColorStop(0, 'rgba(200, 80, 60, 0.8)');
        spotGradient.addColorStop(0.7, 'rgba(180, 100, 80, 0.5)');
        spotGradient.addColorStop(1, 'rgba(180, 100, 80, 0)');
        ctx.fillStyle = spotGradient;
        ctx.beginPath();
        ctx.ellipse(spotX, spotY, 50, 35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Add smaller storm systems
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const radius = Math.random() * 15 + 5;
            const opacity = Math.random() * 0.4;
            const stormGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            stormGradient.addColorStop(0, `rgba(255, 240, 220, ${opacity})`);
            stormGradient.addColorStop(1, 'rgba(255, 240, 220, 0)');
            ctx.fillStyle = stormGradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function createAsteroidTexture() {
    return createProceduralTexture(256, 256, (ctx, w, h) => {
        // Rocky grey base
        ctx.fillStyle = '#777777';
        ctx.fillRect(0, 0, w, h);

        // Add craters
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const radius = Math.random() * 10 + 2;
            ctx.fillStyle = `rgba(50, 50, 50, ${Math.random() * 0.5 + 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add surface detail
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const size = Math.random() * 2 + 1;
            ctx.fillStyle = `rgba(${120 + Math.random() * 50}, ${100 + Math.random() * 40}, ${90 + Math.random() * 40}, 0.5)`;
            ctx.fillRect(x, y, size, size);
        }
    });
}

function createPlanets() {
    // Earth - Blue planet with continents and clouds
    const earthGeometry = new THREE.SphereGeometry(SIZES.earth, 32, 32);
    const earthTexture = createEarthTexture();
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        emissive: 0x112244,
        emissiveIntensity: 0.05,
        shininess: 30,
        specular: 0x333333
    });
    earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthMesh.rotation.z = 23.5 * Math.PI / 180; // Earth's axial tilt
    scene.add(earthMesh);
    labels.earth = createLabel("Earth", earthMesh);

    // Mars - Red planet with surface features
    const marsGeometry = new THREE.SphereGeometry(SIZES.mars, 32, 32);
    const marsTexture = createMarsTexture();
    const marsMaterial = new THREE.MeshPhongMaterial({
        map: marsTexture,
        emissive: 0x331111,
        emissiveIntensity: 0.05,
        shininess: 10
    });
    marsMesh = new THREE.Mesh(marsGeometry, marsMaterial);
    marsMesh.rotation.z = 25.2 * Math.PI / 180; // Mars's axial tilt
    scene.add(marsMesh);
    labels.mars = createLabel("Mars", marsMesh);

    // Jupiter - Gas giant with bands and Great Red Spot
    const jupiterGeometry = new THREE.SphereGeometry(SIZES.jupiter, 32, 32);
    const jupiterTexture = createJupiterTexture();
    const jupiterMaterial = new THREE.MeshPhongMaterial({
        map: jupiterTexture,
        emissive: 0x332211,
        emissiveIntensity: 0.05,
        shininess: 40
    });
    jupiterMesh = new THREE.Mesh(jupiterGeometry, jupiterMaterial);
    jupiterMesh.rotation.z = 3.1 * Math.PI / 180; // Jupiter's slight tilt
    scene.add(jupiterMesh);
    labels.jupiter = createLabel("Jupiter", jupiterMesh);

    // Asteroid 333005 Haberle - Rocky body with craters
    const asteroidGeometry = new THREE.SphereGeometry(SIZES.asteroid, 16, 16);
    const asteroidTexture = createAsteroidTexture();
    const asteroidMaterial = new THREE.MeshPhongMaterial({
        map: asteroidTexture,
        emissive: 0xFF6B35,
        emissiveIntensity: 0.3,
        shininess: 5
    });
    asteroidMesh = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    scene.add(asteroidMesh);
    labels.asteroid = createLabel("333005 Haberle", asteroidMesh);
}

function createLabel(text, meshObject) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 256;

    // No background - fully transparent
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw text with subtle shadow for readability
    context.shadowColor = 'rgba(0, 0, 0, 0.8)';
    context.shadowBlur = 16;
    context.shadowOffsetX = 4;
    context.shadowOffsetY = 4;

    context.fillStyle = '#ffffff';
    context.font = 'Bold 96px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 512, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 1.0,
        depthTest: false // Always visible
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2, 0.5, 1);

    // Store reference to parent mesh
    sprite.userData.parentMesh = meshObject;
    sprite.userData.offset = new THREE.Vector3(0, 0.2, 0);

    scene.add(sprite);
    return sprite;
}

function updateLabels() {
    // Update all labels to follow their parent objects
    Object.values(labels).forEach(label => {
        if (label && label.userData.parentMesh) {
            const parent = label.userData.parentMesh;
            label.position.copy(parent.position);
            label.position.add(label.userData.offset);

            // Make label face camera
            label.quaternion.copy(camera.quaternion);
        }
    });
}

function updatePlanetPositions() {
    const currentJD = getJulianDate();

    // Update Earth (simplified circular orbit)
    const earthAngle = (currentJD - 2451545.0) * 0.01720279 * Math.PI / 180;
    earthMesh.position.x = Math.cos(earthAngle);
    earthMesh.position.z = Math.sin(earthAngle);
    earthMesh.position.y = 0;
    earthMesh.rotation.y += 0.002; // Earth rotation

    // Update Mars (simplified)
    const marsAngle = (currentJD - 2451545.0) * 0.00914 * Math.PI / 180;
    marsMesh.position.x = 1.52 * Math.cos(marsAngle);
    marsMesh.position.z = 1.52 * Math.sin(marsAngle);
    marsMesh.position.y = 0.03;
    marsMesh.rotation.y += 0.0019; // Mars rotation (slightly slower than Earth)

    // Update Jupiter (FIXED: now on correct orbital path at 5.2 AU)
    const jupiterAngle = (currentJD - 2451545.0) * 0.00145 * Math.PI / 180;
    jupiterMesh.position.x = 5.2 * Math.cos(jupiterAngle);
    jupiterMesh.position.z = 5.2 * Math.sin(jupiterAngle);
    jupiterMesh.position.y = 0; // On orbital plane
    jupiterMesh.rotation.y += 0.004; // Jupiter rotation (faster than Earth)

    // Update asteroid position
    const asteroidPos = calculateOrbitalPosition(haberleOrbital, currentJD);
    asteroidMesh.position.set(asteroidPos.x, asteroidPos.y, asteroidPos.z);
    asteroidMesh.rotation.y += 0.01; // Asteroid tumbling
    asteroidMesh.rotation.x += 0.005;

    // Rotate the Sun slowly
    sunMesh.rotation.y += 0.0005;

    // Update info overlay
    const dateElement = document.getElementById('current-date');
    const distanceElement = document.getElementById('asteroid-distance');
    if (dateElement) {
        const now = new Date();
        dateElement.textContent = `Date: ${now.toLocaleDateString()}`;
    }
    if (distanceElement) {
        const distanceToEarth = asteroidMesh.position.distanceTo(earthMesh.position);
        distanceElement.textContent = `Distance to Earth: ${distanceToEarth.toFixed(2)} AU`;
    }

    // Update labels to follow objects
    updateLabels();
}

function getJulianDate(date = new Date()) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const second = date.getUTCSeconds();

    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y +
                Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    const jd = jdn + (hour - 12) / 24 + minute / 1440 + second / 86400;
    return jd;
}

function calculateOrbitalPosition(elements, jd) {
    const daysSinceEpoch = jd - elements.epoch;
    const M = (elements.M0 + elements.n * daysSinceEpoch) * Math.PI / 180;

    let E = M;
    for (let i = 0; i < 10; i++) {
        E = M + elements.e * Math.sin(E);
    }

    const nu = 2 * Math.atan2(
        Math.sqrt(1 + elements.e) * Math.sin(E / 2),
        Math.sqrt(1 - elements.e) * Math.cos(E / 2)
    );

    const r = elements.a * (1 - elements.e * Math.cos(E));
    const x_orbital = r * Math.cos(nu);
    const y_orbital = r * Math.sin(nu);

    const omega_rad = elements.omega * Math.PI / 180;
    const Omega_rad = elements.Omega * Math.PI / 180;
    const i_rad = elements.i * Math.PI / 180;

    const x_perihelion = x_orbital * Math.cos(omega_rad) - y_orbital * Math.sin(omega_rad);
    const y_perihelion = x_orbital * Math.sin(omega_rad) + y_orbital * Math.cos(omega_rad);

    const x = x_perihelion * (Math.cos(Omega_rad) * Math.cos(omega_rad) - Math.sin(Omega_rad) * Math.sin(omega_rad) * Math.cos(i_rad))
            - y_perihelion * (Math.cos(Omega_rad) * Math.sin(omega_rad) + Math.sin(Omega_rad) * Math.cos(omega_rad) * Math.cos(i_rad));

    const y = x_perihelion * Math.sin(Omega_rad) * Math.sin(i_rad)
            + y_perihelion * Math.cos(Omega_rad) * Math.sin(i_rad);

    const z = x_perihelion * (Math.sin(Omega_rad) * Math.cos(omega_rad) + Math.cos(Omega_rad) * Math.sin(omega_rad) * Math.cos(i_rad))
            - y_perihelion * (Math.sin(Omega_rad) * Math.sin(omega_rad) - Math.cos(Omega_rad) * Math.cos(omega_rad) * Math.cos(i_rad));

    return { x, y, z };
}

function animate() {
    try {
        requestAnimationFrame(animate);

        if (controls) {
            controls.update();
        }

        updatePlanetPositions();

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    } catch (error) {
        console.error('Error in animation loop:', error);
        // Don't request next frame if there's an error
    }
}

function handleResize() {
    const container = document.getElementById('orbit-container');
    if (!container || !camera || !renderer) return;

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener('resize', handleResize);

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeJS);
} else {
    initThreeJS();
}

export default {
    initThreeJS,
    handleResize
};