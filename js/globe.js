/* =====================================================================
   globe.js - Rotating wireframe world globe background
   Renders a 3D sphere with latitude/longitude grid on canvas.
   ===================================================================== */

(function () {
    'use strict';

    const canvas = document.getElementById('globe-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, centerX, centerY, radius;
    let rotationY = 0;
    let animationId;
    let isGoldTheme = false;

    const GLOBE_ROTATION_SPEED = 0.003;
    const LINE_COUNT = 18;
    const DOT_COUNT = 120;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        centerX = width * 0.82;
        centerY = height * 0.38;
        radius = Math.min(width, height) * 0.38;
        radius = Math.max(radius, 120);
    }

    function project(x, y, z) {
        const perspective = 800;
        const scale = perspective / (perspective + z);
        return {
            x: centerX + x * scale,
            y: centerY + y * scale,
            scale: scale
        };
    }

    function rotateY(x, y, z, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: x * cos - z * sin,
            y: y,
            z: x * sin + z * cos
        };
    }

    function getThemeColors() {
        return isGoldTheme
            ? { stroke: 'rgba(245, 158, 11, 0.35)', dot: 'rgba(245, 158, 11, 0.55)' }
            : { stroke: 'rgba(6, 182, 212, 0.35)', dot: 'rgba(6, 182, 212, 0.55)' };
    }

    function drawGlobe() {
        ctx.clearRect(0, 0, width, height);
        const colors = getThemeColors();

        const latSteps = LINE_COUNT;
        const lonSteps = LINE_COUNT;

        const latLines = [];
        for (let i = 0; i <= latSteps; i++) {
            const phi = (Math.PI * i) / latSteps;
            const points = [];
            for (let j = 0; j <= lonSteps * 2; j++) {
                const theta = (2 * Math.PI * j) / (lonSteps * 2);
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.cos(phi);
                const z = radius * Math.sin(phi) * Math.sin(theta);
                const rotated = rotateY(x, y, z, rotationY);
                points.push({ ...project(rotated.x, rotated.y, rotated.z), z: rotated.z });
            }
            latLines.push(points);
        }

        const lonLines = [];
        for (let j = 0; j < lonSteps * 2; j++) {
            const theta = (2 * Math.PI * j) / (lonSteps * 2);
            const points = [];
            for (let i = 0; i <= latSteps; i++) {
                const phi = (Math.PI * i) / latSteps;
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.cos(phi);
                const z = radius * Math.sin(phi) * Math.sin(theta);
                const rotated = rotateY(x, y, z, rotationY);
                points.push({ ...project(rotated.x, rotated.y, rotated.z), z: rotated.z });
            }
            lonLines.push(points);
        }

        ctx.lineWidth = 1;

        for (const line of latLines) {
            ctx.beginPath();
            let started = false;
            for (const p of line) {
                if (p.z > -radius * 0.3) {
                    if (!started) {
                        ctx.moveTo(p.x, p.y);
                        started = true;
                    } else {
                        ctx.lineTo(p.x, p.y);
                    }
                } else {
                    started = false;
                }
            }
            ctx.strokeStyle = colors.stroke;
            ctx.stroke();
        }

        for (const line of lonLines) {
            ctx.beginPath();
            let started = false;
            for (const p of line) {
                if (p.z > -radius * 0.3) {
                    if (!started) {
                        ctx.moveTo(p.x, p.y);
                        started = true;
                    } else {
                        ctx.lineTo(p.x, p.y);
                    }
                } else {
                    started = false;
                }
            }
            ctx.strokeStyle = colors.stroke;
            ctx.stroke();
        }

        for (let i = 0; i < DOT_COUNT; i++) {
            const phi = Math.acos(1 - 2 * (i + 0.5) / DOT_COUNT);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.cos(phi);
            const z = radius * Math.sin(phi) * Math.sin(theta);
            const rotated = rotateY(x, y, z, rotationY);
            if (rotated.z > -radius * 0.2) {
                const p = project(rotated.x, rotated.y, rotated.z);
                const alpha = Math.max(0, Math.min(1, (rotated.z + radius) / (2 * radius)));
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(1, 1.8 * p.scale), 0, Math.PI * 2);
                ctx.fillStyle = colors.dot.replace('0.55', (0.55 * alpha).toFixed(2));
                ctx.fill();
            }
        }

        const glow = ctx.createRadialGradient(centerX, centerY, radius * 0.85, centerX, centerY, radius * 1.15);
        glow.addColorStop(0, isGoldTheme ? 'rgba(245, 158, 11, 0)' : 'rgba(6, 182, 212, 0)');
        glow.addColorStop(0.5, isGoldTheme ? 'rgba(245, 158, 11, 0.06)' : 'rgba(6, 182, 212, 0.06)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.15, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
    }

    function animate() {
        rotationY += GLOBE_ROTATION_SPEED;
        if (rotationY > Math.PI * 2) rotationY -= Math.PI * 2;
        drawGlobe();
        animationId = requestAnimationFrame(animate);
    }

    function setTheme(gold) {
        isGoldTheme = !!gold;
    }

    window.addEventListener('resize', () => {
        resize();
        drawGlobe();
    });

    window.addEventListener('DOMContentLoaded', () => {
        resize();
        animate();
    });

    window.GlobeAPI = { setTheme };
})();
