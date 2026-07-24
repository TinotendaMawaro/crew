/* =====================================================================
   components/sectionOptions.js
   Builds <option> lists for a sector <select> from sectionsData.
   Reused by both the registration form and the HOD reassign modal.
   ===================================================================== */

function buildSectionOptions(selectEl, areaVal, placeholder) {
    selectEl.innerHTML = '';

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    placeholderOption.textContent = placeholder || 'Select Section';
    selectEl.appendChild(placeholderOption);

    if (areaVal && sectionsData[areaVal]) {
        sectionsData[areaVal].forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            selectEl.appendChild(option);
        });
    }
}
