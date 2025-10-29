// Fade-in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply animation to publications and projects
document.querySelectorAll('.publication, .project').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

// Microscope image cross-fade animation
// The CSS animation handles the fade, but this provides optional control
const microscopeOverlay = document.querySelector('.microscope-overlay');

// Optional: You can control the animation timing here
// Current animation is set to 6 seconds in CSS (3s fade in, 3s fade out)
// To adjust timing, modify the animation duration in styles.css

// Optional: Pause animation on hover (uncomment if desired)
/*
const heroHeader = document.querySelector('.hero-header');
if (heroHeader && microscopeOverlay) {
    heroHeader.addEventListener('mouseenter', () => {
        microscopeOverlay.style.animationPlayState = 'paused';
    });
    heroHeader.addEventListener('mouseleave', () => {
        microscopeOverlay.style.animationPlayState = 'running';
    });
}
*/

// 8-bit Asteroid Animation with Variable Movement
document.addEventListener('DOMContentLoaded', function() {
    // Only show asteroid on the main page (index.html or root)
    const currentPath = window.location.pathname;
    const isMainPage = currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/');

    if (!isMainPage) {
        return; // Don't show asteroid on other pages
    }

    // Create the floating asteroid element
    const asteroidLink = document.createElement('a');
    asteroidLink.href = 'asteroid.html';
    asteroidLink.className = 'floating-asteroid variable-motion';
    asteroidLink.title = 'Asteroid 333005 Haberle';
    asteroidLink.setAttribute('aria-label', 'Link to Asteroid 333005 Haberle page');

    // Create the asteroid sprite image
    const asteroidSprite = document.createElement('img');
    asteroidSprite.src = 'assets/images/optimized/asteroid_sprite.png';
    asteroidSprite.alt = 'Asteroid 333005 Haberle';
    asteroidSprite.className = 'asteroid-sprite';
    asteroidSprite.width = 200;
    asteroidSprite.height = 200;
    asteroidLink.appendChild(asteroidSprite);

    // Add to the page
    document.body.appendChild(asteroidLink);

    // Arc trajectory parameters
    let currentArc = null;
    let progress = 0;
    let animationId = null;

    // Generate random arc trajectory
    function generateRandomArc() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Randomly choose entry side (0=left, 1=right, 2=top, 3=bottom)
        const entrySide = Math.floor(Math.random() * 4);
        let startX, startY, endX, endY, controlX, controlY;

        // Generate start and end points on opposite or adjacent sides
        switch(entrySide) {
            case 0: // Enter from left
                startX = -250;
                startY = Math.random() * height;
                endX = width + 250;
                endY = Math.random() * height;
                // Control point creates the arc
                controlX = width * (0.3 + Math.random() * 0.4);
                controlY = height * (Math.random() > 0.5 ? -0.2 : 1.2);
                break;
            case 1: // Enter from right
                startX = width + 250;
                startY = Math.random() * height;
                endX = -250;
                endY = Math.random() * height;
                controlX = width * (0.3 + Math.random() * 0.4);
                controlY = height * (Math.random() > 0.5 ? -0.2 : 1.2);
                break;
            case 2: // Enter from top
                startX = Math.random() * width;
                startY = -250;
                endX = Math.random() * width;
                endY = height + 250;
                controlX = width * (Math.random() > 0.5 ? -0.2 : 1.2);
                controlY = height * (0.3 + Math.random() * 0.4);
                break;
            case 3: // Enter from bottom
                startX = Math.random() * width;
                startY = height + 250;
                endX = Math.random() * width;
                endY = -250;
                controlX = width * (Math.random() > 0.5 ? -0.2 : 1.2);
                controlY = height * (0.3 + Math.random() * 0.4);
                break;
        }

        // Random duration between 4-8 seconds
        const duration = 4000 + Math.random() * 4000;

        return {
            startX, startY,
            endX, endY,
            controlX, controlY,
            duration,
            startTime: Date.now()
        };
    }

    // Quadratic bezier curve calculation
    function getQuadraticBezierPoint(t, start, control, end) {
        const u = 1 - t;
        return u * u * start + 2 * u * t * control + t * t * end;
    }

    // Animation function
    function animateAsteroid() {
        if (!currentArc) {
            // Wait 2-5 seconds before next arc
            const delay = 2000 + Math.random() * 3000;
            setTimeout(() => {
                currentArc = generateRandomArc();
                progress = 0;
                animateAsteroid();
            }, delay);
            return;
        }

        const elapsed = Date.now() - currentArc.startTime;
        progress = elapsed / currentArc.duration;

        if (progress >= 1) {
            // Arc complete, generate new one after delay
            currentArc = null;
            animateAsteroid();
            return;
        }

        // Calculate position on bezier curve
        const x = getQuadraticBezierPoint(
            progress,
            currentArc.startX,
            currentArc.controlX,
            currentArc.endX
        );
        const y = getQuadraticBezierPoint(
            progress,
            currentArc.startY,
            currentArc.controlY,
            currentArc.endY
        );

        // Apply position (offset by 100px to center the 200px asteroid)
        asteroidLink.style.left = (x - 100) + 'px';
        asteroidLink.style.top = (y - 100) + 'px';

        requestAnimationFrame(animateAsteroid);
    }

    // Start the animation with initial delay
    setTimeout(() => {
        currentArc = generateRandomArc();
        animateAsteroid();
    }, 1000);

    // Handle window resize
    window.addEventListener('resize', () => {
        // Reset arc on resize to avoid weird behavior
        currentArc = null;
        progress = 0;
    });
});
