const { jsPDF } = window.jspdf;
const STORAGE_KEY = 'titleSearchFormData';
const COUNTER_KEY = 'titleSearchCounters';

// Global Counters (Initialized in loadCounters())
let taxCount = 1;
let mortgageCount = 1; 
let nocCount = 1;
let uccCount = 1;
let uccContinuationCount = 0; 
let divorceCount = 1;
let judgmentCount = 1;
let additionalDocCount = 0; 

// --- HTML GENERATOR FUNCTIONS ---

function generateTaxHTML(num) { 
    return `
        <div class="mb-4" id="taxes-${num}-wrapper">
            <div class="section-header" data-bs-toggle="collapse" data-bs-target="#taxes${num}Collapse" aria-expanded="false" aria-controls="taxes${num}Collapse">
                <legend><i class="bi bi-cash-stack me-2"></i> Taxes / Assessments Information - ${num} <i class="bi bi-x-circle-fill dynamic-remove float-end" onclick="removeDynamicSection(event, 'taxes', ${num})"></i></legend>
            </div>
            <div class="collapse section-body p-4" id="taxes${num}Collapse">
                <fieldset class="tax-section" data-doc-type="Taxes-${num}">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label for="tax${num}-fiscal-year" class="form-label">Fiscal Year:</label>
                            <select id="tax${num}-fiscal-year" name="tax${num}-fiscal-year" class="form-select tax-year-select" data-excel-field="Tax ${num} - Fiscal Year" onchange="toggleUnpaidTaxFields(${num}); saveFormData()"></select>
                        </div>
                        <div class="col-md-4">
                            <label for="tax${num}-status" class="form-label">Tax Status:</label>
                            <select id="tax${num}-status" name="tax${num}-status" class="form-select" onchange="toggleUnpaidTaxFields(${num}); saveFormData()" data-excel-field="Tax ${num} - Status">
                                <option value="">--Select Status--</option>
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Exempt">Exempt</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="tax${num}-amount" class="form-label">Tax Amount:</label>
                            <div class="input-group">
                                <span class="input-group-text">$</span>
                                <input type="number" step="0.01" id="tax${num}-amount" name="tax${num}-amount" class="form-control" data-excel-field="Tax ${num} - Amount" oninput="saveFormData()">
                            </div>
                        </div>
                    </div>
                    <div class="mt-3" id="tax${num}-unpaid-year-group" style="display: none;">
                        <label for="tax${num}-unpaid-year" class="form-label">If Unpaid, which year(s) are unpaid?</label>
                        <input type="text" id="tax${num}-unpaid-year" name="tax${num}-unpaid-year" class="form-control" data-excel-field="Tax ${num} - Unpaid Year(s)" oninput="saveFormData()">
                    </div>
                    <div class="mt-3" id="tax${num}-comments-group" style="display: none;">
                        <label for="tax${num}-comments" class="form-label">Comments:</label>
                        <textarea id="tax${num}-comments" name="tax${num}-comments" class="form-control" data-excel-field="Tax ${num} - Comments" oninput="saveFormData()"></textarea>
                    </div>
                </fieldset>
            </div>
        </div>
    `;
}

function generateAdditionalDocHTML(num, initialData = {}) {
    const docType = initialData.type || '';
    const grantor = initialData.grantor || '';
    const grantee = initialData.grantee || '';
    const instNo = initialData.instNo || '';
    // NEW: Capture dates from initialData
    const datedDate = initialData.datedDate || '';
    const recordingDate = initialData.recordingDate || '';
    
    return `
        <div class="mb-4" id="additionalDoc-${num}-wrapper">
            <div class="section-header" data-bs-toggle="collapse" data-bs-target="#additionalDoc${num}Collapse" aria-expanded="true" aria-controls="additionalDoc${num}Collapse">
                <legend><i class="bi bi-file-earmark-plus me-2"></i> Document Type: ${docType || 'Additional Property Doc'} - ${num} <i class="bi bi-x-circle-fill dynamic-remove float-end" onclick="removeDynamicSection(event, 'additionalDoc', ${num})"></i></legend>
            </div>
            <div class="collapse show section-body p-4" id="additionalDoc${num}Collapse">
                <fieldset class="transaction-section" data-doc-type="Additional Property Doc-${num}">
                    <div class="mb-3">
                        <label for="doc${num}-type" class="form-label fw-bold">Document Type:</label>
                        <input type="text" id="doc${num}-type" name="doc${num}-type" class="form-control" value="${docType}" data-excel-field="Add. Doc ${num} - Type" oninput="saveFormData()">
                    </div>
                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label for="doc${num}-grantor" class="form-label">Grantor / First Party:</label>
                            <input type="text" id="doc${num}-grantor" name="doc${num}-grantor" class="form-control" value="${grantor}" data-excel-field="Add. Doc ${num} - Grantor" oninput="saveFormData()">
                        </div>
                        <div class="col-md-6">
                            <label for="doc${num}-grantee" class="form-label">Grantee / Second Party:</label>
                            <input type="text" id="doc${num}-grantee" name="doc${num}-grantee" class="form-control" value="${grantee}" data-excel-field="Add. Doc ${num} - Grantee" oninput="saveFormData()">
                        </div>
                    </div>
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label for="doc${num}-dated-date" class="form-label">Dated Date:</label>
                            <input type="date" id="doc${num}-dated-date" name="doc${num}-dated-date" class="form-control" value="${datedDate}" data-excel-field="Add. Doc ${num} - Dated Date" oninput="saveFormData()">
                        </div>
                        <div class="col-md-4">
                            <label for="doc${num}-recording-date" class="form-label">Recording Date:</label>
                            <input type="date" id="doc${num}-recording-date" name="doc${num}-recording-date" class="form-control" value="${recordingDate}" data-excel-field="Add. Doc ${num} - Recording Date" oninput="saveFormData()">
                        </div>
                        <div class="col-md-4">
                            <label for="doc${num}-inst-no" class="form-label">Inst. No. / Book/Page:</label>
                            <input type="text" id="doc${num}-inst-no" name="doc${num}-inst-no" class="form-control" value="${instNo}" data-excel-field="Add. Doc ${num} - Inst No/Bk Pg" oninput="saveFormData()">
                        </div>
                    </div>
                </fieldset>
            </div>
        </div>
    `;
}

function generateMortgageHTML(num) {
    return `
        <div class="mb-4" id="mortgage-${num}-wrapper">
            <div class="section-header" data-bs-toggle="collapse" data-bs-target="#mortgage${num}Collapse" aria-expanded="false" aria-controls="mortgage${num}Collapse">
                <legend><i class="bi bi-bank me-2"></i> Document Type: Mortgage / Deed of Trust - ${num} <i class="bi bi-x-circle-fill dynamic-remove float-end" onclick="removeDynamicSection(event, 'mortgage', ${num})"></i></legend>
            </div>
            <div class="collapse section-body p-4" id="mortgage${num}Collapse">
                <fieldset class="transaction-section" data-doc-type="Mortgage-${num}">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label for="m${num}-mortgagor" class="form-label">Mortgagor (Borrower):</label>
                            <input type="text" id="m${num}-mortgagor" name="m${num}-mortgagor" class="form-control" data-excel-field="Mtg ${num} - Mortgagor" oninput="saveFormData()">
                        </div>
                        <div class="col-md-4">
                            <label for="m${num}-mortgagee" class="form-label">Mortgagee (Lender):</label>
                            <input type="text" id="m${num}-mortgagee" name="m${num}-mortgagee" class="form-control" data-excel-field="Mtg ${num} - Mortgagee" oninput="saveFormData()">
                        </div>
                        <div class="col-md-4">
                            <label for="m${num}-trustee" class="form-label">Trustee (If any):</label>
                            <input type="text" id="m${num}-trustee" name="m${num}-trustee" class="form-control" data-excel-field="Mtg ${num} - Trustee" oninput="saveFormData()">
                        </div>
                    </div>
                    <div class="row g-3 my-3">
                        <div class="col-lg-3 col-md-6">
                            <label for="m${num}-dated-date" class="form-label">Dated Date:</label>
                            <input type="date" id="m${num}-dated-date" name="m${num}-dated-date" class="form-control" data-excel-field="Mtg ${num} - Dated Date" oninput="saveFormData()">
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <label for="m${num}-recording-date" class="form-label">Recording Date:</label>
                            <input type="date" id="m${num}-recording-date" name="m${num}-recording-date" class="form-control" data-excel-field="Mtg ${num} - Recording Date" oninput="saveFormData()">
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <label for="m${num}-inst-no" class="form-label">Instrument No.:</label>
                            <input type="text" id="m${num}-inst-no" name="m${num}-inst-no" class="form-control" data-excel-field="Mtg ${num} - Inst. No." oninput="saveFormData()">
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <label for="m${num}-book-page" class="form-label">Book/Page:</label>
                            <input type="text" id="m${num}-book-page" name="m${num}-book-page" class="form-control" data-excel-field="Mtg ${num} - Book/Page" oninput="saveFormData()">
                        </div>
                    </div>
                    <div class="row g-3">
                        <div class="col-md-3">
                            <label for="m${num}-loan-amount" class="form-label">Loan Amount:</label>
                            <div class="input-group">
                                <span class="input-group-text">$</span>
                                <input type="number" step="0.01" id="m${num}-loan-amount" name="m${num}-loan-amount" class="form-control" data-excel-field="Mtg ${num} - Loan Amount" oninput="saveFormData()">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <label for="m${num}-min-no" class="form-label">MIN No.:</label>
                            <input type="text" id="m${num}-min-no" name="m${num}-min-no" class="form-control" data-excel-field="Mtg ${num} - MIN No." oninput="saveFormData()">
                        </div>
                        <div class="col-md-6">
                            <label for="m${num}-mers-nominee" class="form-label">MERS as Nominee for:</label>
                            <input type="text" id="m${num}-mers-nominee" name="m${num}-mers-nominee" class="form-control" data-excel-field="Mtg ${num} - MERS Nominee" oninput="saveFormData()">
                        </div>
                    </div>
                </fieldset>
            </div>
        </div>
    `;
}

function generateNOCHTML(num) {
    return `
        <div class="mb-4" id="noc-${num}-wrapper">
            <div class="section-header" data-bs-toggle="collapse" data-bs-target="#noc${num}Collapse" aria-expanded="false" aria-controls="noc${num}Collapse">
                <legend><i class="bi bi-hammer me-2"></i> Document Type: Notice of Commencement - ${num} <i class="bi bi-x-circle-fill dynamic-remove float-end" onclick="removeDynamicSection(event, 'noc', ${num})"></i></legend>
            </div>
            <div class="collapse section-body p-4" id="noc${num}Collapse">
                <fieldset class="noc-section" data-doc-type="Notice of Commencement-${num}">
                    <div class="mb-3">
                        <label for="noc${num}-name" class="form-label">Name of the Contractor/Document:</label>
                        <input type="text" id="noc${num}-name" name="noc${num}-name" class="form-control" data-excel-field="NOC ${num} - Name of the Document" oninput="saveFormData()">
                    </div>
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label for="noc${num}-recording-date" class="form-label">Recording Date:</label>
                            <input type="date" id="noc${num}-recording-date" name="noc${num}-recording-date" class="form-control" data-excel-field="NOC ${num} - Recording Date" oninput="saveFormData()">
                        </div>
                        <div class="col-md-4">
                            <label for="noc${num}-inst-no" class="form-label">Instrument No.:</label>
                            <input type="text" id="noc${num}-inst-no" name="noc${num}-inst-no" class="form-control" data-excel-field="NOC ${num} - Instrument No." oninput="saveFormData()">
                        </div>
                        <div class="col-md-4">
                            <label for="noc${num}-book-page" class="form-label">Book/Page:</label>
                            <input type="text" id="noc${num}-book-page" name="noc${num}-book-page" class="form-control" data-excel-field="NOC ${num} - Book/Page" oninput="saveFormData()">
                        </div>
                    </div>
                </fieldset>
            </div>
        </div>
    `;
}

function generateUCCHtml(num) {
    return `
        <div class="mb-4" id="ucc-${num}-wrapper">
            <div class="section-header" data-bs-toggle="collapse" data-bs-target="#ucc${num}Collapse" aria-expanded="false" aria-controls="ucc${num}Collapse">
                <legend><i class="bi bi-file-earmark-lock-fill me-2"></i> Document Type: UCC-1 Financing Statement - ${num} <i class="bi bi-x-circle-fill dynamic-remove float-end" onclick="removeDynamicSection(event, 'ucc', ${num})"></i></legend>
            </div>
            <div class="collapse section-body p-4" id="ucc${num}Collapse">
                <fieldset class="ucc-section" data-doc-type="UCC Filing-${num}">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="ucc${num}-first-party" class="form-label">First Party (Debtor):</label>
                            <input type="text" id="ucc${num}-first-party" name="ucc${num}-first-party" class="form-control" data-excel-field="UCC ${num} - First Party (Debtor)" oninput="saveFormData()">
                        </div>
                        <div class="col-md-6">
                            <label for="ucc${num}-secured-party" class="form-label">Secured Party (Creditor):</label>
                            <input type="text" id="ucc${num}-secured-party" name="ucc${num}-secured-party" class="form-control" data-excel-field="UCC ${num} - Secured Party" oninput="saveFormData()">
                        </div>
                    </div>
                    <div class="row g-3 my-3">
                        <div class="col-md-4">
                            <label for="ucc${num}-recording-date" class="form-label">Recording Date:</label>
                            <input type="date" id="ucc${num}-recording-date" name="ucc${num}-recording-date" class="form-control" data-excel-field="UCC ${num} - Recording Date" oninput="saveFormData()">
                        </div>
                        <div class="col-md-4">
                            <label for="ucc${num}-inst-no" class="form-label">Instrument No.:</label>
                            <input type="text" id="ucc${num}-inst-no" name="ucc${num}-inst-no" class="form-control" data-excel-field="UCC ${num} - Instrument No." oninput="saveFormData()">
                        </div>
                        <div class="col-md-4">
                            <label for="ucc${num}-book-page" class="form-label">Book/Page:</label>
                            <input type="text" id="ucc${num}-book-page" name="ucc${num}-book-page" class="form-control" data-excel-field="UCC ${num} - Book/Page" oninput="saveFormData()">
                        </div>
                    </div>
                </fieldset>
            </div>
        </div>
    `;
}

function generateUCCContinuationHtml(num) {
    return `
        <div class="mb-4" id="uccContinuation-${num}-wrapper">
            <div class="section-header" data-bs-toggle="collapse" data-bs-target="#uccContinuation${num}Collapse" aria-expanded="false" aria-controls="uccContinuation${num}Collapse">
                <legend><i class="bi bi-fast-forward-fill me-2"></i> Document Type: UCC-3 Continuation/Related - ${num} <i class="bi bi-x-circle-fill dynamic-remove float-end" onclick="removeDynamicSection(event, 'uccContinuation', ${num})"></i></legend>
            </div>
            <div class="collapse section-body p-4" id="uccContinuation${num}Collapse">
                <fieldset class="ucc-continuation-section" data-doc-type="UCC Continuation-${num}">
                    <p class="text-muted">Use this section for any UCC continuation, amendment, or assignment (UCC-3).</p>
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label for="ucc-cont${num}-recording-date" class="form-label">Recording Date:</label>
                            <input type="date" id="ucc-cont${num}-recording-date" name="ucc-cont${num}-recording-date" class="form-control" data-excel-field="UCC Cont. ${num} - Recording Date" oninput="saveFormData()">
                        </div>
                        <div class="col-md-4">
                            <label for="ucc-cont${num}-inst-no" class="form-label">Instrument No.:</label>
                            <input type="text" id="ucc-cont${num}-inst-no" name="ucc-cont${num}-inst-no" class="form-control" data-excel-field="UCC Cont. ${num} - Instrument No." oninput="saveFormData()">
                        </div>
                        <div class="col-md-4">
                            <label for="ucc-cont${num}-book-page" class="form-label">Book/Page:</label>
                            <input type="text" id="ucc-cont${num}-book-page" name="ucc-cont${num}-book-page" class="form-control" data-excel-field="UCC Cont. ${num} - Book/Page" oninput="saveFormData()">
                        </div>
                    </div>
                </fieldset>
            </div>
        </div>
    `;
}

function generateDivorceHTML(num) {
    return `
        <div class="mb-4" id="divorce-${num}-wrapper">
            <div class="section-header" data-bs-toggle="collapse" data-bs-target="#divorce${num}Collapse" aria-expanded="false" aria-controls="divorce${num}Collapse">
                <legend><i class="bi bi-people-fill me-2"></i> Document Type: Divorce/Lis Pendens - ${num} <i class="bi bi-x-circle-fill dynamic-remove float-end" onclick="removeDynamicSection(event, 'divorce', ${num})"></i></legend>
            </div>
            <div class="collapse section-body p-4" id="divorce${num}Collapse">
                <fieldset class="divorce-section" data-doc-type="Divorce-${num}">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="divorce${num}-plaintiff" class="form-label">Plaintiff:</label>
                            <input type="text" id="divorce${num}-plaintiff" name="divorce${num}-plaintiff" class="form-control" data-excel-field="Divorce ${num} - Plaintiff" oninput="saveFormData()">
                        </div>
                        <div class="col-md-6">
                            <label for="divorce${num}-defendant" class="form-label">Defendant:</label>
                            <input type="text" id="divorce${num}-defendant" name="divorce${num}-defendant" class="form-control" data-excel-field="Divorce ${num} - Defendant" oninput="saveFormData()">
                        </div>
                    </div>
                    <div class="row g-3 my-3">
                        <div class="col-md-4">
                            <label for="divorce${num}-case-no" class="form-label">Case No.:</label>
                            <input type="text" id="divorce${num}-case-no" name="divorce${num}-case-no" class="form-control" data-excel-field="Divorce ${num} - Case No." oninput="saveFormData()">
                        </div>
                        <div class="col-md-4">
                            <label for="divorce${num}-recording-date" class="form-label">Recording Date:</label>
                            <input type="date" id="divorce${num}-recording-date" name="divorce${num}-recording-date" class="form-control" data-excel-field="Divorce ${num} - Recording Date" oninput="saveFormData()">
                        </div>
                        <div class="col-md-4">
                            <label for="divorce${num}-inst-no" class="form-label">Instrument No.:</label>
                            <input type="text" id="divorce${num}-inst-no" name="divorce${num}-inst-no" class="form-control" data-excel-field="Divorce ${num} - Instrument No." oninput="saveFormData()">
                        </div>
                    </div>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="divorce${num}-book-page" class="form-label">Book/Page:</label>
                            <input type="text" id="divorce${num}-book-page" name="divorce${num}-book-page" class="form-control" data-excel-field="Divorce ${num} - Book/Page" oninput="saveFormData()">
                        </div>
                        <div class="col-md-6">
                            <label for="divorce${num}-amount" class="form-label">Total Amount (Alimony/Lien):</label>
                            <div class="input-group">
                                <span class="input-group-text">$</span>
                                <input type="number" step="0.01" id="divorce${num}-amount" name="divorce${num}-amount" class="form-control" data-excel-field="Divorce ${num} - Total Amount" oninput="saveFormData()">
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>
        </div>
    `;
}

function generateJudgmentHTML(num) {
    return `
        <div class="mb-4" id="judgment-${num}-wrapper">
            <div class="section-header" data-bs-toggle="collapse" data-bs-target="#judgment${num}Collapse" aria-expanded="false" aria-controls="judgment${num}Collapse">
                <legend><i class="bi bi-exclamation-triangle-fill me-2"></i> Document Type: Judgement/Lien - ${num} <i class="bi bi-x-circle-fill dynamic-remove float-end" onclick="removeDynamicSection(event, 'judgment', ${num})"></i></legend>
            </div>
            <div class="collapse section-body p-4" id="judgment${num}Collapse">
                <fieldset class="judgment-section" data-doc-type="Judgement-${num}">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="j${num}-debtor" class="form-label">Debtor (Defendant):</label>
                            <input type="text" id="j${num}-debtor" name="j${num}-debtor" class="form-control" data-excel-field="Judgement ${num} - Debtor" oninput="saveFormData()">
                        </div>
                        <div class="col-md-6">
                            <label for="j${num}-creditor" class="form-label">Creditor (Plaintiff):</label>
                            <input type="text" id="j${num}-creditor" name="j${num}-creditor" class="form-control" data-excel-field="Judgement ${num} - Creditor" oninput="saveFormData()">
                        </div>
                    </div>
                    <div class="row g-3 my-3">
                        <div class="col-md-4">
                            <label for="j${num}-case-number" class="form-label">Case Number:</label>
                            <input type="text" id="j${num}-case-number" name="j${num}-case-number" class="form-control" data-excel-field="Judgement ${num} - Case Number" oninput="saveFormData()">
                        </div>
                        <div class="col-md-4">
                            <label for="j${num}-court" class="form-label">Court:</label>
                            <input type="text" id="j${num}-court" name="j${num}-court" class="form-control" data-excel-field="Judgement ${num} - Court" oninput="saveFormData()">
                        </div>
                        <div class="col-md-4">
                            <label for="j${num}-date" class="form-label">Judgement Date:</label>
                            <input type="date" id="j${num}-date" name="j${num}-date" class="form-control" data-excel-field="Judgement ${num} - Date" oninput="saveFormData()">
                        </div>
                    </div>
                    <div class="mt-3">
                        <label for="j${num}-amount" class="form-label">Amount Awarded:</label>
                        <div class="input-group">
                            <span class="input-group-text">$</span>
                            <input type="number" step="0.01" id="j${num}-amount" name="j${num}-amount" class="form-control" data-excel-field="Judgement ${num} - Amount" oninput="saveFormData()">
                        </div>
                    </div>
                </fieldset>
            </div>
        </div>
    `;
}

// --- DYNAMIC SECTION ADDITION FUNCTIONS ---

function initializeCollapse(num, typePrefix) {
    const collapseId = `#${typePrefix}${num}Collapse`;
    const collapseEl = document.querySelector(collapseId);
    if (collapseEl) {
        // Ensure Bootstrap is available and element exists
        if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
            bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: true });
        }
        const header = collapseEl.closest('.mb-4')?.querySelector('.section-header');
        if (header) header.classList.add('active');
    }
}

// Function triggered by the modal "Add Document Section" button
function addAdditionalPropertyDocSectionFromModal() {
    const modalElement = document.getElementById('addDocModal');
    
    // Check for essential inputs before adding
    const modalType = document.getElementById('modal-doc-type').value.trim();
    if (!modalType) {
        alert("Please enter a Document Type.");
        document.getElementById('modal-doc-type').focus();
        return;
    }

    const modalGrantor = document.getElementById('modal-doc-grantor').value;
    const modalGrantee = document.getElementById('modal-doc-grantee').value;
    const modalInstNo = document.getElementById('modal-doc-inst').value;
    // NEW: Capture dated date and recording date from modal
    const modalDatedDate = document.getElementById('modal-doc-dated-date').value;
    const modalRecordingDate = document.getElementById('modal-doc-recording-date').value;


    const initialData = {
        type: modalType,
        grantor: modalGrantor,
        grantee: modalGrantee,
        instNo: modalInstNo,
        // NEW: Pass the date values
        datedDate: modalDatedDate,
        recordingDate: modalRecordingDate
    };

    additionalDocCount++;
    document.getElementById('additionalPropertyDocs').insertAdjacentHTML('beforeend', generateAdditionalDocHTML(additionalDocCount, initialData));
    
    // Auto-save the initial data from the modal and counters
    saveFormData(); 
    saveCounters();

    // Hide and reset the modal
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();
    
    // Reset modal inputs
    document.getElementById('modal-doc-type').value = '';
    document.getElementById('modal-doc-grantor').value = '';
    document.getElementById('modal-doc-grantee').value = '';
    document.getElementById('modal-doc-inst').value = '';
    // NEW: Reset date inputs
    document.getElementById('modal-doc-dated-date').value = '';
    document.getElementById('modal-doc-recording-date').value = '';

    // Scroll to the new section 
    const newSection = document.getElementById(`additionalDoc-${additionalDocCount}-wrapper`);
    if (newSection) {
        newSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}


function addTaxSection() {
    taxCount++;
    document.getElementById('additionalTaxes').insertAdjacentHTML('beforeend', generateTaxHTML(taxCount));
    populateTaxYears();
    initializeCollapse(taxCount, 'taxes');
    saveCounters();
}

function addMortgageSection() { 
    mortgageCount++;
    document.getElementById('additionalMortgages').insertAdjacentHTML('beforeend', generateMortgageHTML(mortgageCount));
    initializeCollapse(mortgageCount, 'mortgage');
    saveCounters(); 
}

function addNOCSection() {
    nocCount++;
    document.getElementById('additionalNOCs').insertAdjacentHTML('beforeend', generateNOCHTML(nocCount));
    initializeCollapse(nocCount, 'noc');
    saveCounters(); 
}

function addUCCSection() { 
    uccCount++;
    document.getElementById('additionalUCCs').insertAdjacentHTML('beforeend', generateUCCHtml(uccCount));
    initializeCollapse(uccCount, 'ucc');
    saveCounters(); 
}

function addUCCContinuationSection() { 
    uccContinuationCount++;
    document.getElementById('additionalUCCContinuations').insertAdjacentHTML('beforeend', generateUCCContinuationHtml(uccContinuationCount));
    initializeCollapse(uccContinuationCount, 'uccContinuation');
    saveCounters(); 
}

function addDivorceSection() {
    divorceCount++;
    document.getElementById('additionalDivorces').insertAdjacentHTML('beforeend', generateDivorceHTML(divorceCount));
    initializeCollapse(divorceCount, 'divorce');
    saveCounters(); 
}

function addJudgmentSection() { 
    judgmentCount++;
    document.getElementById('additionalJudgments').insertAdjacentHTML('beforeend', generateJudgmentHTML(judgmentCount));
    initializeCollapse(judgmentCount, 'judgment');
    saveCounters(); 
}

function removeDynamicSection(event, type, num) {
    event.stopPropagation(); 
    event.preventDefault(); 
    
    if (!confirm(`Are you sure you want to remove ${type.charAt(0).toUpperCase() + type.slice(1)}-${num} section?`)) {
        return;
    }

    const wrapperId = `${type}-${num}-wrapper`;
    const element = document.getElementById(wrapperId);
    if (element) {
        element.remove();
        
        // Logic to clear local storage data
        const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const prefixMap = {
            taxes: 'tax', mortgage: 'm', noc: 'noc', ucc: 'ucc', 
            uccContinuation: 'ucc-cont', divorce: 'divorce', judgment: 'j',
            additionalDoc: 'doc'
        };
        const prefix = prefixMap[type];
        
        Object.keys(storedData).forEach(key => {
            if (key.startsWith(prefix + num + '-')) { 
                delete storedData[key];
            }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));

        // Note: We only reset the counter if the highest number section was removed.
        const counterMap = {
            taxes: { count: taxCount, name: 'taxCount' },
            mortgage: { count: mortgageCount, name: 'mortgageCount' },
            noc: { count: nocCount, name: 'nocCount' },
            ucc: { count: uccCount, name: 'uccCount' },
            divorce: { count: divorceCount, name: 'divorceCount' },
            judgment: { count: judgmentCount, name: 'judgmentCount' },
            additionalDoc: { count: additionalDocCount, name: 'additionalDocCount' },
            uccContinuation: { count: uccContinuationCount, name: 'uccContinuationCount' }
        };

        if (counterMap[type] && num === counterMap[type].count) {
            // Set count to be the largest existing number in the group or min 1/0
            window[counterMap[type].name] = num - 1;
            if (window[counterMap[type].name] < 1 && type !== 'additionalDoc' && type !== 'uccContinuation') {
                window[counterMap[type].name] = 1;
            } else if (window[counterMap[type].name] < 0) {
                window[counterMap[type].name] = 0;
            }
        }
        
        saveCounters();
    }
}


// --- TAX FIELD UTILITIES ---

function populateTaxYears() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear + 1; // Start from next fiscal year
    const endYear = currentYear - 5;
    
    const selects = document.querySelectorAll('.tax-year-select');
    
    selects.forEach(select => {
        // Clear existing options, but keep first (if any)
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Add fiscal years
        for (let year = startYear; year >= endYear; year--) {
            const fiscalYear = `${year-1}/${String(year).slice(-2)}`;
            const option = new Option(fiscalYear, fiscalYear);
            select.add(option);
        }
    });
}

function toggleUnpaidTaxFields(num) {
    const status = document.getElementById(`tax${num}-status`)?.value;
    const unpaidGroup = document.getElementById(`tax${num}-unpaid-year-group`);
    const commentsGroup = document.getElementById(`tax${num}-comments-group`);

    if (unpaidGroup && commentsGroup) {
        if (status === 'Unpaid') {
            unpaidGroup.style.display = 'block';
            commentsGroup.style.display = 'block';
        } else {
            unpaidGroup.style.display = 'none';
            commentsGroup.style.display = 'none';
        }
    }
}

// --- LOCAL STORAGE AND REBUILD FUNCTIONS ---

function saveCounters() {
    const counters = {
        tax: taxCount,
        mortgage: mortgageCount,
        noc: nocCount,
        ucc: uccCount,
        uccContinuation: uccContinuationCount,
        divorce: divorceCount,
        judgment: judgmentCount,
        additionalDoc: additionalDocCount
    };
    localStorage.setItem(COUNTER_KEY, JSON.stringify(counters));
}

function loadCounters() {
    const savedCounters = localStorage.getItem(COUNTER_KEY);
    if (savedCounters) {
        const counters = JSON.parse(savedCounters);
        
        // Ensure minimum 1 for sections that start with a static box
        taxCount = Math.max(1, counters.tax || 0); 
        mortgageCount = Math.max(1, counters.mortgage || 0); 
        nocCount = Math.max(1, counters.noc || 0); 
        uccCount = Math.max(1, counters.ucc || 0);
        divorceCount = Math.max(1, counters.divorce || 0); 
        judgmentCount = Math.max(1, counters.judgment || 0);
        
        // Sections that start at 0
        uccContinuationCount = counters.uccContinuation || 0; 
        additionalDocCount = counters.additionalDoc || 0;
    } else {
        // Initial defaults
        taxCount = 1; mortgageCount = 1; nocCount = 1; uccCount = 1;
        divorceCount = 1; judgmentCount = 1;
        uccContinuationCount = 0;
        additionalDocCount = 0;
    }
}

function loadFormData() {
    loadCounters();
    populateTaxYears();

    // Rebuild dynamic sections (Start from 2 for initial sections, 1 for 0-based sections)
    for (let i = 2; i <= taxCount; i++) { document.getElementById('additionalTaxes').insertAdjacentHTML('beforeend', generateTaxHTML(i)); }
    for (let i = 2; i <= mortgageCount; i++) { document.getElementById('additionalMortgages').insertAdjacentHTML('beforeend', generateMortgageHTML(i)); }
    for (let i = 2; i <= nocCount; i++) { document.getElementById('additionalNOCs').insertAdjacentHTML('beforeend', generateNOCHTML(i)); }
    for (let i = 2; i <= uccCount; i++) { document.getElementById('additionalUCCs').insertAdjacentHTML('beforeend', generateUCCHtml(i)); }
    for (let i = 2; i <= divorceCount; i++) { document.getElementById('additionalDivorces').insertAdjacentHTML('beforeend', generateDivorceHTML(i)); }
    for (let i = 2; i <= judgmentCount; i++) { document.getElementById('additionalJudgments').insertAdjacentHTML('beforeend', generateJudgmentHTML(i)); }
    
    // Sections that start counting from 1 (initial section is dynamic, not static)
    for (let i = 1; i <= uccContinuationCount; i++) { document.getElementById('additionalUCCContinuations').insertAdjacentHTML('beforeend', generateUCCContinuationHtml(i)); }
    for (let i = 1; i <= additionalDocCount; i++) { document.getElementById('additionalPropertyDocs').insertAdjacentHTML('beforeend', generateAdditionalDocHTML(i)); }

    // Repopulate form fields
    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    Object.keys(savedData).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = savedData[id];
            // Handle conditional fields after setting value
            if (element.id.startsWith('tax') && element.id.includes('status')) {
                toggleUnpaidTaxFields(parseInt(element.id.match(/\d+/)[0]));
            }
        }
    });

    // Ensure initial static sections reflect their saved collapse state
    document.querySelectorAll('.collapse').forEach(collapseEl => {
        const header = collapseEl.closest('.mb-4')?.querySelector('.section-header');
        if (header) {
            // Check if collapse should be shown based on saved state or default
            if (collapseEl.classList.contains('show')) {
                header.classList.add('active');
            } else {
                header.classList.remove('active');
            }
        }
    });
}

function saveFormData() {
    const form = document.getElementById('dataEntryForm');
    const formData = {};
    const elements = form.querySelectorAll('input, select, textarea');

    elements.forEach(element => {
        // Exclude modal fields from main form data storage
        if (element.id && element.value && !element.id.startsWith('modal-')) {
            formData[element.id] = element.value;
        }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
}

function clearLocalData() {
    if (confirm("Are you sure you want to clear ALL saved form data and restart the form?")) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(COUNTER_KEY);
        window.location.reload();
    }
}


// --- THEME SWITCHER LOGIC ---
function toggleTheme() {
    const htmlEl = document.documentElement;
    const isDark = htmlEl.getAttribute('data-bs-theme') === 'dark';
    const themeIcon = document.getElementById('theme-icon');

    if (isDark) {
        htmlEl.setAttribute('data-bs-theme', 'light');
        themeIcon.classList.remove('bi-sun-fill');
        themeIcon.classList.add('bi-moon-fill');
        localStorage.setItem('theme', 'light');
    } else {
        htmlEl.setAttribute('data-bs-theme', 'dark');
        themeIcon.classList.remove('bi-moon-fill');
        themeIcon.classList.add('bi-sun-fill');
        localStorage.setItem('theme', 'dark');
    }
}

function applyInitialTheme() {
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const htmlEl = document.documentElement;
    const themeSwitch = document.getElementById('darkModeSwitch');
    const themeIcon = document.getElementById('theme-icon');

    htmlEl.setAttribute('data-bs-theme', savedTheme);
    themeSwitch.checked = savedTheme === 'dark';
    
    if (savedTheme === 'dark') {
        themeIcon.classList.remove('bi-moon-fill');
        themeIcon.classList.add('bi-sun-fill');
    } else {
        themeIcon.classList.remove('bi-sun-fill');
        themeIcon.classList.add('bi-moon-fill');
    }
}


// --- EXPORT LOGIC ---

function getAllStructuredData() {
    const data = {};
    const elements = document.querySelectorAll('[data-excel-field]');
    elements.forEach(element => {
        const fieldName = element.getAttribute('data-excel-field');
        if (element.value) {
            data[fieldName] = element.value;
        }
    });
    return data;
}

function exportToPDF() {
    const rawData = getAllStructuredData();
    const doc = new jsPDF('p', 'mm', 'a4');
    let yPos = 10;
    const margin = 15;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. HEADER (Title Commitment Report Style)
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Preliminary Title Data Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += lineHeight;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Order No.: ${rawData['Order No.'] || 'N/A'}`, margin, yPos);
    yPos += lineHeight * 0.7;
    doc.text(`Property Address: ${rawData['Prop. Address'] || 'N/A'}`, margin, yPos);
    yPos += lineHeight;
    doc.line(margin, yPos, pageWidth - margin, yPos); // Divider line
    yPos += lineHeight;

    // 2. GENERAL PROPERTY INFORMATION
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('I. General Property Information', margin, yPos);
    yPos += lineHeight;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const basicFields = [
        'Owner Name', 'Prop. Address', 'Short Legal Lot', 'Short Legal Block', 
        'County', 'State', 'APN/Parcel ID', 'Effective Date'
    ];
    
    basicFields.forEach(field => {
        if (rawData[field]) {
            if (yPos > 280) { doc.addPage(); yPos = 15; } 
            
            doc.setFont(undefined, 'bold');
            doc.text(`${field}:`, margin, yPos);
            doc.setFont(undefined, 'normal');
            doc.text(rawData[field], margin + 50, yPos);
            yPos += lineHeight;
        }
    });
    
    yPos += lineHeight * 0.5;

    // 3. DOCUMENT SECTIONS (Dynamic Content)
    // Order of sections for PDF output
    const sectionOrder = [
        'Deed', 'Prior Deed', 'Tax', 'Mtg', 'UCC', 'UCC Cont.', 'Add. Doc', 'NOC', 'Divorce', 'Judgement'
    ];

    const docGroups = {};
    Object.keys(rawData).forEach(key => {
        const match = key.match(/^([A-Za-z.\s]+)\s*(\d+)?\s*-\s*(.*)/);
        if (match) {
            const docType = match[1].trim();
            const num = match[2] || '';
            const fieldName = match[3].trim();
            const groupKey = `${docType} ${num}`.trim();
            
            if (!docGroups[groupKey]) docGroups[groupKey] = { title: groupKey, fields: {} };
            docGroups[groupKey].fields[fieldName] = rawData[key];
        }
    });

    sectionOrder.forEach(baseSection => {
        const relevantGroups = Object.keys(docGroups)
            .filter(groupKey => groupKey.startsWith(baseSection))
            .sort((a, b) => {
                const numA = parseInt(a.match(/\s(\d+)$/)?.[1] || 0);
                const numB = parseInt(b.match(/\s(\d+)$/)?.[1] || 0);
                return numA - numB;
            });

        relevantGroups.forEach(groupKey => {
            const group = docGroups[groupKey];
            const title = groupKey; 

            if (yPos > 280) { doc.addPage(); yPos = 15; }
            yPos += lineHeight * 0.5;
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`II. Document: ${title}`, margin, yPos);
            yPos += lineHeight;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');

            Object.keys(group.fields).forEach(fieldName => {
                const fieldValue = group.fields[fieldName];
                if (fieldValue) {
                    if (yPos > 280) { doc.addPage(); yPos = 15; }
                    
                    doc.setFont(undefined, 'bold');
                    doc.text(`${fieldName}:`, margin + 5, yPos);
                    doc.setFont(undefined, 'normal');
                    doc.text(fieldValue, margin + 55, yPos);
                    yPos += lineHeight;
                }
            });
            yPos += lineHeight * 0.5;
        });
    });

    doc.save(`TitleReport_${rawData['Order No.'] || 'Data'}.pdf`);
}

function exportToExcel() {
    const rawData = getAllStructuredData();
    const worksheet = XLSX.utils.json_to_sheet([rawData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TitleData");
    XLSX.writeFile(workbook, "TitleDataExport.xlsx");
}

// --- CURRENCY FORMATTING UTILITY (Keep existing utility functions here) ---
// ...

function setCopyrightYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    // Apply theme first
    applyInitialTheme();
    document.getElementById('darkModeSwitch').addEventListener('change', toggleTheme);

    // 1. Load data and rebuild dynamic sections
    loadFormData();
    
    // NEW: Call the function to set the copyright year
    setCopyrightYear(); 
    
    // 2. Set up auto-save on input for all form fields
    // ... (rest of your existing code)
});

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    // Apply theme first
    applyInitialTheme();
    document.getElementById('darkModeSwitch').addEventListener('change', toggleTheme);

    // 1. Load data and rebuild dynamic sections
    loadFormData();

    // 2. Set up auto-save on input for all form fields
    document.getElementById('dataEntryForm').addEventListener('input', saveFormData);
    
    // 3. Collapse Styling Listeners (Ensures headers change color when collapsed/expanded)
    document.addEventListener('shown.bs.collapse', function (e) {
        const header = e.target.closest('.mb-4')?.querySelector('.section-header');
        if (header) header.classList.add('active');
    });

    document.addEventListener('hidden.bs.collapse', function (e) {
        const header = e.target.closest('.mb-4')?.querySelector('.section-header');
        if (header) header.classList.remove('active');
    });
    
    // 4. Initial check for static Tax 1 fields
    toggleUnpaidTaxFields(1);
});
