/* =====================================================================
   registration.js - Crew registration stepper + submission
   Steps 1-4: identity, logistics/gadgets, regalia/EcoCash, QR ticket.
   ===================================================================== */

/* Populate section dropdown for the registration form */
function updateServingSections() {
    const areaVal = document.getElementById('serving-area').value;
    const sectionSelect = document.getElementById('serving-section');
    buildSectionOptions(sectionSelect, areaVal, 'Select Section');
}

/* Show a single step and refresh progress / controls */
function showStep(n) {
    document.querySelectorAll('.step-transition').forEach(el => el.classList.add('hidden'));
    document.getElementById(`form-step-${n}`).classList.remove('hidden');
    uiState.currentStep = n;
    updateStepIndicators();
}

/* Step navigation with forward validation */
function navigateStep(direction) {
    if (direction === 1 && !validateStep(uiState.currentStep)) return;
    showStep(uiState.currentStep + direction);
}

function validateStep(step) {
    if (step === 1) {
        const name = document.getElementById('fullname').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const hist = document.getElementById('serving-history').value;
        if (!name || !phone || !hist) {
            renderToast("Please provide name, phone number, and history.", "warning");
            return false;
        }
    } else if (step === 2) {
        const area = document.getElementById('serving-area').value;
        const sect = document.getElementById('serving-section').value;
        const type = document.getElementById('gadget-type').value.trim();
        const model = document.getElementById('gadget-model').value.trim();
        const serial = document.getElementById('gadget-serial').value.trim();
        const transport = document.querySelector('input[name="transport"]:checked');

        if (!area || !sect || !type || !model || !serial || !transport) {
            renderToast("Please declare serving sectors, device attributes, and transport.", "warning");
            return false;
        }
    } else if (step === 3) {
        if (!uiState.selectedRegaliaChoice) {
            const size = document.getElementById('regalia-size').value;
            const pRef = document.getElementById('payment-reference').value.trim();
            if (!size || !pRef) {
                renderToast("Please declare your size and exact EcoCash transaction code.", "warning");
                return false;
            }
        }
    }
    return true;
}

function updateStepIndicators() {
    const percent = (uiState.currentStep / 4) * 100;
    document.getElementById('registration-progress').style.width = `${percent}%`;

    const badge = document.getElementById('step-badge');
    const prev = document.getElementById('prev-btn');
    const next = document.getElementById('next-btn');
    const submit = document.getElementById('submit-btn');

    if (uiState.currentStep === 1) {
        badge.textContent = "Step 1 of 4: Personal";
        prev.disabled = true;
        next.classList.remove('hidden');
        submit.classList.add('hidden');
    } else if (uiState.currentStep === 2) {
        badge.textContent = "Step 2 of 4: Logistics";
        prev.disabled = false;
        next.classList.remove('hidden');
        submit.classList.add('hidden');
    } else if (uiState.currentStep === 3) {
        badge.textContent = "Step 3 of 4: Regalia";
        prev.disabled = false;
        next.classList.add('hidden');
        submit.classList.remove('hidden');
    } else if (uiState.currentStep === 4) {
        badge.textContent = "Step 4 of 4: Generated Ticket";
        document.getElementById('navigation-controls').classList.add('hidden');
    }
}

/* Regalia choice + EcoCash panel toggle */
function selectRegalia(hasIt) {
    uiState.selectedRegaliaChoice = hasIt;
    const yes = document.getElementById('regalia-yes');
    const no = document.getElementById('regalia-no');
    const panel = document.getElementById('ecocash-panel');

    if (hasIt) {
        yes.className = "py-3 px-4 rounded-xl border-2 border-brand-cyan bg-brand-cyan/25 text-sm font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition duration-300 flex items-center justify-center gap-2";
        no.className = "py-3 px-4 rounded-xl border border-white/10 bg-brand-darkSpace/60 text-sm font-bold hover:border-brand-cyan transition duration-300 flex items-center justify-center gap-2";
        panel.classList.add('hidden');
    } else {
        yes.className = "py-3 px-4 rounded-xl border border-white/10 bg-brand-darkSpace/60 text-sm font-bold hover:border-brand-cyan transition duration-300 flex items-center justify-center gap-2";
        no.className = "py-3 px-4 rounded-xl border-2 border-brand-cyan bg-brand-cyan/25 text-sm font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition duration-300 flex items-center justify-center gap-2";
        panel.classList.remove('hidden');
    }
}

function simulatePopUpload(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('pop-upload-text').textContent = `Upload complete: ${file.name}`;
        renderToast("Proof of Transfer uploaded securely.", "success");
    }
}

/* Submission + QR ticket generation */
async function handleFormSubmission(e) {
    e.preventDefault();

    const rawCode = Math.floor(1000 + Math.random() * 9000);
    const generatedNo = `HIM-CTF26-${rawCode}`;

    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const history = document.getElementById('serving-history').value;
    const area = document.getElementById('serving-area').value;
    const section = document.getElementById('serving-section').value;
    const gadget = document.getElementById('gadget-type').value.trim();
    const model = document.getElementById('gadget-model').value.trim();
    const serial = document.getElementById('gadget-serial').value.trim();
    const transport = document.querySelector('input[name="transport"]:checked').value;
    const regaliaSize = uiState.selectedRegaliaChoice ? "N/A" : document.getElementById('regalia-size').value;
    const paymentRef = uiState.selectedRegaliaChoice ? "N/A" : document.getElementById('payment-reference').value.trim();

    const record = {
        serving_no: generatedNo,
        fullname,
        phone,
        history,
        area,
        section,
        gadget: `${gadget} (${model})`,
        serial,
        transport,
        has_regalia: uiState.selectedRegaliaChoice,
        regalia_size: regaliaSize,
        payment_ref: paymentRef,
        status: "Pending",
        registration_date: new Date().toISOString().split('T')[0]
    };

    // Persist to Supabase, then sync local cache with the returned row (has id)
    await insertCrew(record).then(saved => {
        registeredCrew.unshift(saved);
    }).catch(() => {
        // insertCrew already toasted on failure; still show ticket from local record
        const localId = `local-${Date.now()}`;
        registeredCrew.unshift({ id: localId, ...record });
    });

    // Build QR ticket pass
    document.getElementById('ticket-serving-number').textContent = generatedNo;
    document.getElementById('ticket-fullname').textContent = fullname;
    document.getElementById('ticket-serving-section').textContent = `${area} • ${section}`;
    document.getElementById('ticket-gadget-details').textContent = `${gadget} (${model}) - S/N ${serial}`;
    document.getElementById('ticket-regalia').textContent = uiState.selectedRegaliaChoice ? "Owns Uniform" : `Ordered Size ${regaliaSize}`;
    document.getElementById('ticket-transport').textContent = transport === 'need' ? "Bus Requested" : "Provides Ride";

    logSystemEmail(fullname, area, "System Validation Sent");

    // Reveal ticket step + confetti celebration
    setTimeout(() => {
        confetti({
            particleCount: 160,
            spread: 80,
            origin: { y: 0.65 },
            colors: ['#6366f1', '#3b82f6', '#06b6d4']
        });
        showStep(4);
    }, 600);
}

/* Reset back to a clean step 1 */
function resetForm() {
    document.getElementById('crew-registration-form').reset();
    document.getElementById('navigation-controls').classList.remove('hidden');
    uiState.currentStep = 1;
    uiState.selectedRegaliaChoice = true;
    document.getElementById('form-step-4').classList.add('hidden');
    document.getElementById('form-step-1').classList.remove('hidden');
    selectRegalia(true);
    updateStepIndicators();
}
