/* =====================================================================
   particles.js - Lightweight background particle animation
   Renders floating particles on a fixed canvas behind the globe.
   ===================================================================== */

(function () {
    'use strict';

    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationId;
    let isGoldTheme = false;

    const PARTICLE_COUNT = window.innerWidth < 640 ? 25 : 70;
    const MAX_SPEED = 0.4;
    const isMobile = window.innerWidth < 640;

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : height + 10;
            this.radius = Math.random() * 1.8 + 0.4;
            this.speedY = -(Math.random() * MAX_SPEED + 0.15);
            this.speedX = (Math.random() - 0.5) * MAX_SPEED * 0.6;
            this.opacity = Math.random() * 0.35 + 0.05;
            this.fadeSpeed = Math.random() * 0.003 + 0.001;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.opacity -= this.fadeSpeed;

            if (this.opacity <= 0 || this.y < -10 || this.x < -10 || this.x > width + 10) {
                this.reset();
                this.y = height + 10;
                this.opacity = Math.random() * 0.35 + 0.05;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = isGoldTheme
                ? `rgba(245, 158, 11, ${this.opacity})`
                : `rgba(99, 102, 241, ${this.opacity})`;
            ctx.fill();
        }
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        if (isMobile) {
            ctx.clearRect(0, 0, width, height);
            for (const p of particles) {
                p.update();
                p.draw();
            }
            return;
        }
        ctx.clearRect(0, 0, width, height);
        for (const p of particles) {
            p.update();
            p.draw();
        }
        animationId = requestAnimationFrame(animate);
    }

    function setTheme(gold) {
        isGoldTheme = !!gold;
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            animate();
        });
    } else {
        init();
        animate();
    }

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resize();
        }, 150);
    });

    window.ParticlesAPI = { setTheme };
})();
