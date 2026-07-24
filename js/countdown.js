/* =====================================================================
   countdown.js - Live countdown to conference start
   Target: August 24, 2026 08:00:00
   ===================================================================== */

function runCountdown() {
    const target = new Date("August 24, 2026 08:00:00").getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff < 0) {
        document.getElementById('cd-days').textContent = "0";
        document.getElementById('cd-hours').textContent = "0";
        document.getElementById('cd-mins').textContent = "0";
        document.getElementById('cd-secs').textContent = "0";
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cd-days').textContent = days;
    document.getElementById('cd-hours').textContent = hours;
    document.getElementById('cd-mins').textContent = mins;
    document.getElementById('cd-secs').textContent = secs;
}
