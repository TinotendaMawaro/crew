/* =====================================================================
   hod.js - HOD command center: admin table, KPIs, approve/decline,
   sector reassignment, and reassign modal control.
   All mutations go through the Supabase data layer (js/supabase.js)
   and the local cache (registeredCrew) is refreshed afterwards.
   ===================================================================== */

async function loadAndRenderCrew() {
    const data = await fetchCrew();
    registeredCrew = data || [];
    renderAdminTable();
}

function renderAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '';

    registeredCrew.forEach((member, index) => {
        tbody.insertAdjacentHTML('beforeend', renderCrewRow(member, index));
    });

    // Refresh KPI counters
    document.getElementById('kpi-total').textContent = registeredCrew.length;
    document.getElementById('kpi-pending').textContent = registeredCrew.filter(c => c.status === 'Pending').length;
    document.getElementById('kpi-transport').textContent = registeredCrew.filter(c => c.transport === 'need').length;
    document.getElementById('kpi-regalia').textContent = registeredCrew.filter(c => !c.has_regalia).length;
}

async function approveCrew(index) {
    const member = registeredCrew[index];
    const confirmed = await askConfirm("Authorize Server Deployment", `Allow ${member.fullname} to serve inside the '${member.area}' sector? An automated email confirmation will be sent.`);
    if (!confirmed) return;
    try {
        await updateCrewField(member.id, 'status', 'Approved');
        // Refresh local cache from backend so the row reflects the new status
        registeredCrew = await fetchCrew();
        renderToast(`${member.fullname} approved successfully!`, "success");
        logSystemEmail(member.fullname, member.area, "Final Service Authorization Confirmed");
        renderAdminTable();
    } catch (_) { /* error already toasted in data layer */ }
}

async function declineCrew(index) {
    const member = registeredCrew[index];
    const confirmed = await askConfirm("Dismiss Registration Logs", `Confirm the complete dismissal of ${member.fullname}'s registration request?`);
    if (!confirmed) return;
    try {
        await deleteCrew(member.id);
        registeredCrew = await fetchCrew();
        logSystemEmail(member.fullname, "HIM Media Dept", "Service Dismissal Dispatch Sent");
        renderToast("Logs successfully dismissed.", "warning");
        renderAdminTable();
    } catch (_) { /* error already toasted in data layer */ }
}

/* ---- Receipt preview modal ---- */
function viewReceipt(url) {
    const modal = document.getElementById('receipt-modal');
    const img = document.getElementById('receipt-preview-img');
    const link = document.getElementById('receipt-download-link');
    if (!modal || !img || !link) return;
    img.src = url;
    link.href = url;
    link.classList.remove('hidden');
    modal.classList.remove('hidden');
}

function closeReceiptModal() {
    const modal = document.getElementById('receipt-modal');
    if (!modal) return;
    modal.classList.add('hidden');
}

/* ---- Reassign modal ---- */
function updateReassignSections() {
    const areaVal = document.getElementById('reassign-area').value;
    const sectionSelect = document.getElementById('reassign-section');
    buildSectionOptions(sectionSelect, areaVal, 'Select Section');
}

function openReassignModal(index) {
    uiState.currentEditingIndex = index;
    const member = registeredCrew[index];
    document.getElementById('reassign-member-name').textContent = member.fullname;
    document.getElementById('reassign-area').value = member.area;
    updateReassignSections();
    document.getElementById('reassign-section').value = member.section;
    document.getElementById('reassign-modal').classList.remove('hidden');
}

function closeReassignModal() {
    document.getElementById('reassign-modal').classList.add('hidden');
}

async function confirmReassign() {
    if (uiState.currentEditingIndex === -1) return;
    const member = registeredCrew[uiState.currentEditingIndex];
    const targetArea = document.getElementById('reassign-area').value;
    const targetSection = document.getElementById('reassign-section').value;

    try {
        await reassignCrew(member.id, targetArea, targetSection);
        registeredCrew = await fetchCrew();
        logSystemEmail(member.fullname, targetArea, `Deployment Reassigned to '${targetSection}'`);
        renderToast(`Reassigned successfully! Dispatching notification email to ${member.fullname}.`, "success");
        closeReassignModal();
        renderAdminTable();
    } catch (_) { /* error already toasted in data layer */ }
}
