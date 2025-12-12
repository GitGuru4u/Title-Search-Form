// script.js

// --- 1. GLOBAL COUNTERS & INITIALIZATION ---
let taxCount = 1; // Tax 1 is already in HTML
let mortgageCount = 1; // Mortgage 1 is already in HTML
let nocCount = 0;
let uccCount = 0;
let uccContinuationCount = 0;
let divorceCount = 0;
let judgmentCount = 0;
let additionalDocCount = 0;
const START_YEAR = 2000;


// --- 2. CORE UTILITY FUNCTIONS (Run on Load) ---

document.addEventListener('DOMContentLoaded', () => {
    // Initialize tax year selection for the pre-existing tax section
    populateTaxYears('tax1-fiscal-year');
    
    // Load data saved in local storage
    loadFormData();
    
    // Set up Dark Mode switch based on saved preference
    initializeDarkMode();
});

/**
 * Populates a <select> element with fiscal years from START_YEAR to Current Year + 1.
 * @param {string} selectId The ID of the select element (e.g., 'tax1-fiscal-year').
 */
function populateTaxYears(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const currentYear = new Date().getFullYear();
    const futureYear = currentYear + 1;

    // Clear existing options
    select.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "--Select Year--";
    select.appendChild(defaultOption);

    // Add options from current year + 1 down to START_YEAR
    for (let year = futureYear; year >= START_YEAR; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
    }
}

/**
 * Toggles the visibility of unpaid tax fields based on the selected status.
 * @param {number} index The index of the tax section (e.g., 1, 2, 3).
 */
function toggleUnpaidTaxFields(index) {
    const statusSelect = document.getElementById(`tax${index}-status`);
    const unpaidGroup = document.getElementById(`tax${index}-unpaid-group`);
    const commentsGroup = document.getElementById(`tax${index}-comments-group`);

    if (statusSelect.value === 'Unpaid') {
        if (unpaidGroup) unpaidGroup.style.display = 'block';
        if (commentsGroup) commentsGroup.style.display = 'block';
    } else if (statusSelect.value === 'Exempt') {
        if (unpaidGroup) unpaidGroup.style.display = 'none';
        if (commentsGroup) commentsGroup.style.display = 'block';
    } else {
        if (unpaidGroup) unpaidGroup.style.display = 'none';
        if (commentsGroup) commentsGroup.style.display = 'none';
    }
}


// --- 3. LOCAL STORAGE FUNCTIONS ---

/** Saves all form data to local storage. */
function saveFormData() {
    const data = {};
    const form = document.getElementById('dataEntryForm');
    if (!form) return;
    
    // Use FormData for simple key/value pairs
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
        // Simple inputs
        if (Array.isArray(data[key])) {
            data[key].push(value);
        } else if (data[key]) {
            data[key] = [data[key], value];
        } else {
            data[key] = value;
        }
    }

    localStorage.setItem('titleSearchFormData', JSON.stringify(data));
}

/** Loads and populates form data from local storage. */
function loadFormData() {
    const savedData = localStorage.getItem('titleSearchFormData');
    if (!savedData) return;

    const data = JSON.parse(savedData);
    const form = document.getElementById('dataEntryForm');
    if (!form) return;
    
    // Rebuild dynamic sections first (based on data arrays, not yet implemented)
    // For now, focus on populating static fields:
    for (const key in data) {
        const element = document.getElementById(key);
        if (element) {
            element.value = data[key];
        }
    }
    
    // Re-run tax toggle logic after loading data
    toggleUnpaidTaxFields(1);
}

/** Clears saved local data and reloads the form. */
function clearLocalData() {
    if (confirm('Are you sure you want to clear ALL saved form data?')) {
        localStorage.removeItem('titleSearchFormData');
        window.location.reload();
    }
}


// --- 4. DYNAMIC SECTION CREATION FUNCTIONS ---

/**
 * Generic function to remove any dynamic section element by its ID.
 * @param {string} id - The ID of the section div to remove.
 */
function removeSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
        saveFormData(); // Save changes immediately after removal
    }
}

// === TAX SECTION ===
function createTaxHtml(index) {
    const sectionId = `taxesSection${index}`;
    return `
        <div class="dynamic-section border-primary" id="${sectionId}">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0 text-primary">Taxes / Assessments - ${index}</h5>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeSection('${sectionId}')">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
            
            <fieldset class="tax-section" data-doc-type="Taxes-${index}">
                <div class="row g-3">
                    <div class="col-md-4">
                        <label for="tax${index}-fiscal-year" class="form-label">Fiscal Year:</label>
                        <select id="tax${index}-fiscal-year" name="tax${index}-fiscal-year" class="form-select tax-year-select" data-excel-field="Tax ${index} - Fiscal Year" onchange="toggleUnpaidTaxFields(${index}); saveFormData()"></select>
                    </div>
                    <div class="col-md-4">
                        <label for="tax${index}-status" class="form-label">Tax Status:</label>
                        <select id="tax${index}-status" name="tax${index}-status" class="form-select tax-status-select" onchange="toggleUnpaidTaxFields(${index}); saveFormData()" data-excel-field="Tax ${index} - Status">
                            <option value="">--Select Status--</option>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Exempt">Exempt</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label for="tax${index}-amount" class="form-label">Tax Amount:</label>
                        <div class="input-group">
                            <span class="input-group-text">$</span>
                            <input type="number" step="0.01" id="tax${index}-amount" name="tax${index}-amount" class="form-control" data-excel-field="Tax ${index} - Amount" oninput="saveFormData()">
                        </div>
                    </div>
                </div>
                <div class="mt-3" id="tax${index}-unpaid-group" style="display: none;">
                    <label for="tax${index}-unpaid-year" class="form-label">If Unpaid, which year(s) are unpaid?</label>
                    <input type="text" id="tax${index}-unpaid-year" name="tax${index}-unpaid-year" class="form-control" data-excel-field="Tax ${index} - Unpaid Year(s)" oninput="saveFormData()">
                </div>
                <div class="mt-3" id="tax${index}-comments-group" style="display: none;">
                    <label for="tax${index}-comments" class="form-label">Comments:</label>
                    <textarea id="tax${index}-comments" name="tax${index}-comments" class="form-control" data-excel-field="Tax ${index} - Comments" oninput="saveFormData()"></textarea>
                </div>
            </fieldset>
        </div>
    `;
}

function addTaxSection() {
    taxCount++;
    const container = document.getElementById('additionalTaxes');
    if (container) {
        container.insertAdjacentHTML('beforeend', createTaxHtml(taxCount));
        populateTaxYears(`tax${taxCount}-fiscal-year`); // Populate new year select
    }
    saveFormData();
}

// === MORTGAGE SECTION ===
function createMortgageHtml(index) {
    const sectionId = `mortgageSection${index}`;
    return `
        <div class="dynamic-section border-warning" id="${sectionId}">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0 text-warning">Mortgage / DOT - ${index}</h5>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeSection('${sectionId}')">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
            
            <fieldset class="transaction-section" data-doc-type="Mortgage-${index}">
                <div class="row g-3">
                    <div class="col-md-4"><label for="m${index}-mortgagor" class="form-label">Mortgagor (Borrower):</label><input type="text" id="m${index}-mortgagor" name="m${index}-mortgagor" class="form-control" data-excel-field="Mtg ${index} - Mortgagor" oninput="saveFormData()"></div>
                    <div class="col-md-4"><label for="m${index}-mortgagee" class="form-label">Mortgagee (Lender):</label><input type="text" id="m${index}-mortgagee" name="m${index}-mortgagee" class="form-control" data-excel-field="Mtg ${index} - Mortgagee" oninput="saveFormData()"></div>
                    <div class="col-md-4"><label for="m${index}-trustee" class="form-label">Trustee (If any):</label><input type="text" id="m${index}-trustee" name="m${index}-trustee" class="form-control" data-excel-field="Mtg ${index} - Trustee" oninput="saveFormData()"></div>
                </div>
                <div class="row g-3 my-3">
                    <div class="col-lg-3 col-md-6"><label for="m${index}-dated-date" class="form-label">Dated Date:</label><input type="date" id="m${index}-dated-date" name="m${index}-dated-date" class="form-control" data-excel-field="Mtg ${index} - Dated Date" oninput="saveFormData()"></div>
                    <div class="col-lg-3 col-md-6"><label for="m${index}-recording-date" class="form-label">Recording Date:</label><input type="date" id="m${index}-recording-date" name="m${index}-recording-date" class="form-control" data-excel-field="Mtg ${index} - Recording Date" oninput="saveFormData()"></div>
                    <div class="col-lg-3 col-md-6"><label for="m${index}-inst-no" class="form-label">Instrument No.:</label><input type="text" id="m${index}-inst-no" name="m${index}-inst-no" class="form-control" data-excel-field="Mtg ${index} - Inst. No." oninput="saveFormData()"></div>
                    <div class="col-lg-3 col-md-6"><label for="m${index}-book-page" class="form-label">Book/Page:</label><input type="text" id="m${index}-book-page" name="m${index}-book-page" class="form-control" data-excel-field="Mtg ${index} - Book/Page" oninput="saveFormData()"></div>
                </div>
                <div class="row g-3">
                    <div class="col-md-3">
                        <label for="m${index}-loan-amount" class="form-label">Loan Amount:</label>
                        <div class="input-group"><span class="input-group-text">$</span><input type="number" step="0.01" id="m${index}-loan-amount" name="m${index}-loan-amount" class="form-control" data-excel-field="Mtg ${index} - Loan Amount" oninput="saveFormData()"></div>
                    </div>
                    <div class="col-md-3"><label for="m${index}-min-no" class="form-label">MIN No.:</label><input type="text" id="m${index}-min-no" name="m${index}-min-no" class="form-control" data-excel-field="Mtg ${index} - MIN No." oninput="saveFormData()"></div>
                    <div class="col-md-6"><label for="m${index}-mers-nominee" class="form-label">MERS as Nominee for:</label><input type="text" id="m${index}-mers-nominee" name="m${index}-mers-nominee" class="form-control" data-excel-field="Mtg ${index} - MERS Nominee" oninput="saveFormData()"></div>
                </div>
            </fieldset>
        </div>
    `;
}

function addMortgageSection() {
    mortgageCount++;
    const container = document.getElementById('additionalMortgages');
    if (container) {
        container.insertAdjacentHTML('beforeend', createMortgageHtml(mortgageCount));
    }
    saveFormData();
}

// === JUDGMENT/LIEN SECTION ===
function createJudgmentHtml() {
    judgmentCount++;
    const index = judgmentCount;
    const sectionId = `judgmentSection${index}`;
    
    return `
        <div class="dynamic-section border-danger" id="${sectionId}">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0 text-danger">Judgment/Lien - ${index}</h5>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeSection('${sectionId}')">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
            
            <div class="row g-3">
                <div class="col-md-6">
                    <label for="judgmentCreditor${index}" class="form-label">Creditor Name:</label>
                    <input type="text" class="form-control" id="judgmentCreditor${index}" name="judgmentCreditor${index}" data-excel-field="Judg ${index} - Creditor" oninput="saveFormData()">
                </div>
                <div class="col-md-4">
                    <label for="judgmentCaseNum${index}" class="form-label">Case/Lien Number:</label>
                    <input type="text" class="form-control" id="judgmentCaseNum${index}" name="judgmentCaseNum${index}" data-excel-field="Judg ${index} - Case No." oninput="saveFormData()">
                </div>
                <div class="col-md-2">
                    <label for="judgmentType${index}" class="form-label">Type:</label>
                    <select class="form-select" id="judgmentType${index}" name="judgmentType${index}" data-excel-field="Judg ${index} - Type" oninput="saveFormData()">
                        <option value="">Select Type</option>
                        <option value="Tax">Tax Lien</option>
                        <option value="Mechanics">Mechanics Lien</option>
                        <option value="Court">Court Judgment</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            <div class="row g-3 mt-1">
                <div class="col-12">
                    <label for="judgmentInstNo${index}" class="form-label">Instrument No. / Book & Page / Comments:</label>
                    <input type="text" class="form-control" id="judgmentInstNo${index}" name="judgmentInstNo${index}" data-excel-field="Judg ${index} - Inst. No./Comments" oninput="saveFormData()">
                </div>
            </div>
        </div>
    `;
}

function addJudgmentSection() {
    const container = document.getElementById('additionalJudgments');
    if (container) {
        container.insertAdjacentHTML('beforeend', createJudgmentHtml());
    }
    saveFormData();
}

// === NOTICE OF COMMENCEMENT (NOC) SECTION ===
function createNOCHtml() {
    nocCount++;
    const index = nocCount;
    const sectionId = `nocSection${index}`;
    
    return `
        <div class="dynamic-section border-success" id="${sectionId}">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0 text-success">Notice of Commencement (NOC) - ${index}</h5>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeSection('${sectionId}')">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
            
            <div class="row g-3">
                <div class="col-md-6">
                    <label for="nocContractor${index}" class="form-label">Contractor Name:</label>
                    <input type="text" class="form-control" id="nocContractor${index}" name="nocContractor${index}" data-excel-field="NOC ${index} - Contractor" oninput="saveFormData()">
                </div>
                <div class="col-md-4">
                    <label for="nocDate${index}" class="form-label">Commencement Date:</label>
                    <input type="date" class="form-control" id="nocDate${index}" name="nocDate${index}" data-excel-field="NOC ${index} - Date" oninput="saveFormData()">
                </div>
                <div class="col-md-2">
                    <label for="nocRecordingDate${index}" class="form-label">Rec. Date:</label>
                    <input type="date" class="form-control" id="nocRecordingDate${index}" name="nocRecordingDate${index}" data-excel-field="NOC ${index} - Rec. Date" oninput="saveFormData()">
                </div>
            </div>
            <div class="row g-3 mt-1">
                <div class="col-12">
                    <label for="nocRecordingInfo${index}" class="form-label">Recording Info (Inst. No./Book/Page):</label>
                    <input type="text" class="form-control" id="nocRecordingInfo${index}" name="nocRecordingInfo${index}" data-excel-field="NOC ${index} - Rec. Info" oninput="saveFormData()">
                </div>
            </div>
        </div>
    `;
}

function addNOCSection() {
    const container = document.getElementById('additionalNOCs');
    if (container) {
        container.insertAdjacentHTML('beforeend', createNOCHtml());
    }
    saveFormData();
}

// === UCC-1 STATEMENT SECTION ===
function createUCCHtml() {
    uccCount++;
    const index = uccCount;
    const sectionId = `uccSection${index}`;
    
    return `
        <div class="dynamic-section border-info" id="${sectionId}">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0 text-info">UCC-1 Financing Statement - ${index}</h5>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeSection('${sectionId}')">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
            
            <div class="row g-3">
                <div class="col-md-6">
                    <label for="uccDebtor${index}" class="form-label">Debtor Name:</label>
                    <input type="text" class="form-control" id="uccDebtor${index}" name="uccDebtor${index}" data-excel-field="UCC1 ${index} - Debtor" oninput="saveFormData()">
                </div>
                <div class="col-md-6">
                    <label for="uccSecuredParty${index}" class="form-label">Secured Party Name:</label>
                    <input type="text" class="form-control" id="uccSecuredParty${index}" name="uccSecuredParty${index}" data-excel-field="UCC1 ${index} - Secured Party" oninput="saveFormData()">
                </div>
            </div>
            <div class="row g-3 mt-1">
                <div class="col-md-6">
                    <label for="uccFilingNumber${index}" class="form-label">Filing Number:</label>
                    <input type="text" class="form-control" id="uccFilingNumber${index}" name="uccFilingNumber${index}" data-excel-field="UCC1 ${index} - Filing No." oninput="saveFormData()">
                </div>
                <div class="col-md-6">
                    <label for="uccFilingDate${index}" class="form-label">Filing Date:</label>
                    <input type="date" class="form-control" id="uccFilingDate${index}" name="uccFilingDate${index}" data-excel-field="UCC1 ${index} - Filing Date" oninput="saveFormData()">
                </div>
            </div>
        </div>
    `;
}

function addUCCSection() {
    const container = document.getElementById('additionalUCCs');
    if (container) {
        container.insertAdjacentHTML('beforeend', createUCCHtml());
    }
    saveFormData();
}

// === UCC-3 CONTINUATION SECTION ===
function createUCCContinuationHtml() {
    uccContinuationCount++;
    const index = uccContinuationCount;
    const sectionId = `uccContinuationSection${index}`;
    
    return `
        <div class="dynamic-section border-secondary" id="${sectionId}">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0 text-secondary">UCC-3 Continuation/Related - ${index}</h5>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeSection('${sectionId}')">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
            
            <div class="row g-3">
                <div class="col-md-4">
                    <label for="uccContinuationType${index}" class="form-label">UCC-3 Type:</label>
                    <select class="form-select" id="uccContinuationType${index}" name="uccContinuationType${index}" data-excel-field="UCC3 ${index} - Type" oninput="saveFormData()">
                        <option value="">Select Action</option>
                        <option value="Continuation">Continuation</option>
                        <option value="Amendment">Amendment</option>
                        <option value="Termination">Termination</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label for="uccContinuationOriginalFile${index}" class="form-label">Original UCC-1 File No.:</label>
                    <input type="text" class="form-control" id="uccContinuationOriginalFile${index}" name="uccContinuationOriginalFile${index}" data-excel-field="UCC3 ${index} - Original File No." oninput="saveFormData()">
                </div>
                <div class="col-md-4">
                    <label for="uccContinuationFilingDate${index}" class="form-label">Filing Date:</label>
                    <input type="date" class="form-control" id="uccContinuationFilingDate${index}" name="uccContinuationFilingDate${index}" data-excel-field="UCC3 ${index} - Filing Date" oninput="saveFormData()">
                </div>
            </div>
        </div>
    `;
}

function addUCCContinuationSection() {
    const container = document.getElementById('additionalUCCContinuations');
    if (container) {
        container.insertAdjacentHTML('beforeend', createUCCContinuationHtml());
    }
    saveFormData();
}

// === DIVORCE / LIS PENDENS SECTION ===
function createDivorceHtml() {
    divorceCount++;
    const index = divorceCount;
    const sectionId = `divorceSection${index}`;
    
    return `
        <div class="dynamic-section border-secondary" id="${sectionId}">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0 text-secondary">Divorce / Lis Pendens - ${index}</h5>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeSection('${sectionId}')">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
            
            <div class="row g-3">
                <div class="col-md-6">
                    <label for="divorceParties${index}" class="form-label">Parties (e.g., Plaintiff vs. Defendant):</label>
                    <input type="text" class="form-control" id="divorceParties${index}" name="divorceParties${index}" data-excel-field="Divorce ${index} - Parties" oninput="saveFormData()">
                </div>
                <div class="col-md-6">
                    <label for="divorceCaseNo${index}" class="form-label">Case Number:</label>
                    <input type="text" class="form-control" id="divorceCaseNo${index}" name="divorceCaseNo${index}" data-excel-field="Divorce ${index} - Case No." oninput="saveFormData()">
                </div>
            </div>
            <div class="row g-3 mt-1">
                <div class="col-md-6">
                    <label for="divorceFilingDate${index}" class="form-label">Filing / Recording Date:</label>
                    <input type="date" class="form-control" id="divorceFilingDate${index}" name="divorceFilingDate${index}" data-excel-field="Divorce ${index} - Filing Date" oninput="saveFormData()">
                </div>
                <div class="col-md-6">
                    <label for="divorceComments${index}" class="form-label">Comments / Property Impact:</label>
                    <input type="text" class="form-control" id="divorceComments${index}" name="divorceComments${index}" data-excel-field="Divorce ${index} - Comments" oninput="saveFormData()">
                </div>
            </div>
        </div>
    `;
}

function addDivorceSection() {
    const container = document.getElementById('additionalDivorces');
    if (container) {
        container.insertAdjacentHTML('beforeend', createDivorceHtml());
    }
    saveFormData();
}

// === ADDITIONAL DOCUMENT (Modal) SECTION ===

function createAdditionalDocHtml(data) {
    additionalDocCount++;
    const index = additionalDocCount;
    const docType = data.type || 'Miscellaneous Document';
    const sectionId = `additionalDocSection${index}`;
    
    return `
        <div class="dynamic-section border-info" id="${sectionId}">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0 text-info">Additional Document: ${docType} - ${index}</h5>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeSection('${sectionId}')">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
            
            <div class="row g-3">
                <input type="hidden" name="addDocType${index}" value="${docType}" data-excel-field="AddDoc ${index} - Type">
                <div class="col-md-6">
                    <label for="addDocGrantor${index}" class="form-label
