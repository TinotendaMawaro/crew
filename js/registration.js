/* =====================================================================
   registration.js - Crew registration stepper + submission
   Steps 1-4: identity, logistics/gadgets, regalia/EcoCash, QR ticket.
   ===================================================================== */

/* Holds the selected Proof-of-Payment file until submission */
let selectedPopFile = null;

/* Populate section dropdown for the registration form */
function updateServingSections() {
    const areaSelect = document.getElementById('serving-area');
    const sectionSelect = document.getElementById('serving-section');
    if (!areaSelect || !sectionSelect) {
        console.warn('updateServingSections: required elements not found');
        return;
    }
    const areaVal = areaSelect.value;
    // Only rebuild from area mapping if an area is actually selected.
    // Otherwise preserve the static/default options already in the markup.
    if (!areaVal) return;
    console.log('updateServingSections:', areaVal, sectionsData);
    buildSectionOptions(sectionSelect, areaVal, 'Select Section');
}

/* Wire the Area -> Section dependency via JS event binding (more reliable than inline handlers). */
function initSectionDependency() {
    const areaSelect = document.getElementById('serving-area');
    if (!areaSelect) {
        console.warn('initSectionDependency: #serving-area not found');
        return;
    }
    // Prevent duplicate bindings on re-entry
    areaSelect.removeAttribute('onchange');

    const handler = () => {
        updateServingSections();
    };

    // 'change' handles blur-based selection changes and keyboard nav
    areaSelect.addEventListener('change', handler);
    // 'click' immediately populates sections as soon as the user opens the dropdown
    areaSelect.addEventListener('click', handler);
    // initial population (placeholder only; exercises the code path)
    handler();
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
        const email = document.getElementById('email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const hist = document.getElementById('serving-history').value;
        if (!name || !phone || !email || !emailRegex.test(email) || !hist) {
            renderToast("Please provide a valid name, phone number, email address, and history.", "warning");
            return false;
        }
    } else if (step === 2) {
        const area = document.getElementById('serving-area').value;
        const sect = document.getElementById('serving-section').value;
        const transport = document.querySelector('input[name="transport"]:checked');

        if (!area || !sect || !transport) {
            renderToast("Please declare serving sectors and transport.", "warning");
            return false;
        }
    } else if (step === 3) {
        if (!uiState.selectedRegaliaChoice) {
            const size = document.getElementById('regalia-size').value;
            if (!size) {
                renderToast("Please declare your needed item size.", "warning");
                return false;
            }
            if (uiState.selectedPaymentMethod === 'ecocash') {
                const pRef = document.getElementById('payment-reference').value.trim();
                if (!pRef) {
                    renderToast("Please provide your EcoCash transaction reference.", "warning");
                    return false;
                }
                if (!selectedPopFile) {
                    renderToast("Please upload your Proof of Payment receipt.", "warning");
                    return false;
                }
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
        selectPaymentMethod('ecocash');
    }
}

/* Payment method toggle within the regalia panel */
function selectPaymentMethod(method) {
    uiState.selectedPaymentMethod = method;
    const ecocashBtn = document.getElementById('pay-ecocash');
    const cashBtn = document.getElementById('pay-cash');
    const ecocashSection = document.getElementById('ecocash-section');
    const cashSection = document.getElementById('cash-section');

    if (method === 'ecocash') {
        ecocashBtn.className = "py-3 px-4 rounded-xl border-2 border-brand-cyan bg-brand-cyan/25 text-sm font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition duration-300 flex items-center justify-center gap-2";
        cashBtn.className = "py-3 px-4 rounded-xl border border-white/10 bg-brand-darkSpace/60 text-sm font-bold hover:border-brand-cyan transition duration-300 flex items-center justify-center gap-2";
        ecocashSection.classList.remove('hidden');
        cashSection.classList.add('hidden');
    } else {
        ecocashBtn.className = "py-3 px-4 rounded-xl border border-white/10 bg-brand-darkSpace/60 text-sm font-bold hover:border-brand-cyan transition duration-300 flex items-center justify-center gap-2";
        cashBtn.className = "py-3 px-4 rounded-xl border-2 border-green-500 bg-green-500/25 text-sm font-bold text-white shadow-[0_0_15px_rgba(34,197,94,0.3)] transition duration-300 flex items-center justify-center gap-2";
        ecocashSection.classList.add('hidden');
        cashSection.classList.remove('hidden');
    }
}

function simulatePopUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
        renderToast('Invalid file type. Please upload JPG, PNG or PDF.', 'warning');
        return;
    }
    if (file.size > 4 * 1024 * 1024) {
        renderToast('File too large. Max size is 4MB.', 'warning');
        return;
    }

    selectedPopFile = file;
    document.getElementById('pop-upload-text').textContent = `Selected: ${file.name}`;
    renderToast('Receipt selected. It will be uploaded on submission.', 'success');
}

/* Submission + QR ticket generation */
async function handleFormSubmission(e) {
    e.preventDefault();

    const rawCode = Math.floor(1000 + Math.random() * 9000);
    const generatedNo = `HIM-CTF26-${rawCode}`;

    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const history = document.getElementById('serving-history').value;
    const area = document.getElementById('serving-area').value;
    const section = document.getElementById('serving-section').value;
    const gadget = document.getElementById('gadget').value.trim();
    const serial = document.getElementById('gadget-serial').value.trim();
    const transport = document.querySelector('input[name="transport"]:checked').value;
    const regaliaSize = uiState.selectedRegaliaChoice ? "N/A" : document.getElementById('regalia-size').value;
    const paymentRef = uiState.selectedRegaliaChoice ? "N/A" : document.getElementById('payment-reference').value.trim();
    const paymentMethod = uiState.selectedRegaliaChoice ? "N/A" : (uiState.selectedPaymentMethod === 'ecocash' ? 'EcoCash' : 'Cash on Ground');

    // Server-side email uniqueness check
    const emailExists = await isEmailRegistered(email);
    if (emailExists) {
        renderToast('This email is already registered. Please use a different email or contact support.', 'warning');
        return;
    }

    // Upload receipt if provided
    let receiptUrl = null;
    if (selectedPopFile) {
        renderToast('Uploading receipt...', 'info');
        receiptUrl = await uploadRegaliaReceipt(selectedPopFile);
    }

    const record = {
        serving_no: generatedNo,
        fullname,
        email,
        phone,
        history,
        area,
        section,
        gadget,
        serial,
        transport,
        has_regalia: uiState.selectedRegaliaChoice,
        regalia_size: regaliaSize,
        payment_method: paymentMethod,
        payment_ref: paymentRef,
        regalia_receipt_url: receiptUrl,
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
    document.getElementById('ticket-gadget-details').textContent = `${gadget} - S/N ${serial}`;
    document.getElementById('ticket-regalia').textContent = uiState.selectedRegaliaChoice ? "Owns Uniform" : `Ordered Size ${regaliaSize}`;
    document.getElementById('ticket-transport').textContent = transport === 'need' ? "Bus Requested" : "Provides Ride";
    document.getElementById('ticket-payment').textContent = paymentMethod === 'N/A' ? "N/A" : paymentMethod;

    logSystemEmail(fullname, area, "System Validation Sent");

    // Trigger async email notification (non-blocking)
    sendConfirmationEmail({ email, fullname, servingNo: generatedNo, area, section }).catch(() => {
        // Email is best-effort; do not block ticket display
    });

    // Reveal ticket step + confetti celebration
    setTimeout(async () => {
        confetti({
            particleCount: 160,
            spread: 80,
            origin: { y: 0.65 },
            colors: ['#6366f1', '#3b82f6', '#06b6d4']
        });
        showStep(4);
        
        // Auto-download confirmation ticket as image
        try {
            await downloadConfirmationTicket(generatedNo, fullname, area, section);
            renderToast('Confirmation ticket downloaded.', 'success');
        } catch (err) {
            console.warn('Ticket download failed:', err);
        }
    }, 600);
}

/* Reset back to a clean step 1 */
function resetForm() {
    document.getElementById('crew-registration-form').reset();
    document.getElementById('navigation-controls').classList.remove('hidden');
    uiState.currentStep = 1;
    uiState.selectedRegaliaChoice = true;
    uiState.selectedPaymentMethod = 'ecocash';
    selectedPopFile = null;
    const popText = document.getElementById('pop-upload-text');
    if (popText) popText.textContent = 'Click to upload EcoCash receipt screenshot';
    document.getElementById('form-step-4').classList.add('hidden');
    document.getElementById('form-step-1').classList.remove('hidden');
    selectRegalia(true);
    updateStepIndicators();
}

/* Fire-and-forget email notification via Supabase Edge Function */
async function sendConfirmationEmail({ email, fullname, servingNo, area, section }) {
    const edgeUrl = `${SUPABASE_URL}/functions/v1/send-confirmation-email`;
    const res = await fetch(edgeUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({ email, fullname, servingNo, area, section })
    });

    if (!res.ok) throw new Error('Email dispatch failed');
    logSystemEmail(fullname, area, 'Confirmation email dispatched');
}

/* Generate and auto-download confirmation ticket as PNG */
async function downloadConfirmationTicket(servingNo, fullname, area, section) {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 640;
        const height = 520;
        canvas.width = width;
        canvas.height = height;

        // Background
        ctx.fillStyle = '#0e1726';
        ctx.fillRect(0, 0, width, height);

        // Top accent bar
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(0, 0, width, 8);

        // Header text
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CTF 2026 Media Pass', width / 2, 48);

        // Serving code
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 34px monospace';
        ctx.fillText(servingNo, width / 2, 110);

        // Divider line
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(48, 135);
        ctx.lineTo(width - 48, 135);
        ctx.stroke();

        // Crew name + assignment
        ctx.fillStyle = '#e5e7eb';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.fillText(fullname, width / 2, 175);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '15px Inter, sans-serif';
        ctx.fillText(`${area} \u2022 ${section}`, width / 2, 205);

        // Try to load logo and draw centered circular badge
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = 'assets/images/overflow logo (2).png';
            });

            const logoSize = 160;
            const logoX = (width - logoSize) / 2;
            const logoY = 250;

            ctx.save();
            ctx.beginPath();
            ctx.arc(width / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
            ctx.restore();

            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(width / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
            ctx.stroke();
        } catch (imgErr) {
            ctx.fillStyle = '#6366f1';
            ctx.beginPath();
            ctx.arc(width / 2, 315, 55, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 22px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('HIM', width / 2, 325);
            ctx.font = '11px Inter, sans-serif';
            ctx.fillText('Media', width / 2, 342);
        }

        // Footer
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Heartfelt International Ministries \u2022 Catch The Fire 2026', width / 2, height - 16);

        // Download
        const link = document.createElement('a');
        link.download = `HIM-CTF26-${servingNo}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        console.warn('downloadConfirmationTicket failed:', err);
        throw err;
    }
}
