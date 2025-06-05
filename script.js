// Global state management
let formState = {
    // Original structure for normal mode compatibility
    answers: {},
    selectedMembers: {},
    memberDetails: {},
    selectedDisorders: {},
    followupAnswers: {},
    
    // New structure for enhanced functionality
    questions: {
        1: { answered: false, answer: null, selectedMembers: [] },
        2: { answered: false, answer: null, selectedMembers: [] },
        3: { answered: false, answer: null, selectedMembers: [] },
        4: { answered: false, answer: null, selectedMembers: [] }
    },
    members: {
        'israel': { selected: false, details: {} },
        'sara': { selected: false, details: {} },
        'david': { selected: false, details: {} },
        'michal': { selected: false, details: {} }
    },
    disorders: {},
    familyHistory: {},
    neurological: {},
    autoAnswerEnabled: false,
    currentViewMode: 'normal',
    tableAnswers: {},
    tableFollowupAnswers: {}
};

// Family members data - updated to new family
const familyMembers = {
    israel: { name: 'ישראל ישראלי', type: 'מבוטח ראשי' },
    sara: { name: 'שרה ישראלי', type: 'בת זוג' },
    david: { name: 'דוד ישראלי', type: 'ילד' },
    michal: { name: 'מיכל ישראלי', type: 'ילדה' }
};

// Disorders data - simplified for the new structure
const disorders = {
    'depression': { name: 'דיכאון', questions: ['timing', 'hospitalization', 'disability'] },
    'mood-disorder': { name: 'הפרעת מצב רוח', questions: ['timing', 'hospitalization', 'disability'] },
    'anxiety': { name: 'חרדה', questions: ['timing', 'hospitalization', 'disability'] },
    'major-depression': { name: 'דיכאון מג\'ורי', questions: ['timing', 'hospitalization', 'disability'] },
    'ocd': { name: 'OCD', questions: ['timing', 'hospitalization', 'disability'] },
    'postpartum-depression': { name: 'דיכאון לאחר לידה', questions: ['timing', 'hospitalization', 'disability'] },
    'eating-disorders': { name: 'הפרעות אכילה', questions: ['timing', 'hospitalization', 'disability'] }
};

// Questions configuration - updated for new structure
const questions = {
    1: {
        title: 'הפרעות נפש',
        text: 'האם מישהו מבני המשפחה סובל מהפרעת נפש לרבות דיכאון?',
        hasMembers: true,
        hasDisorders: true
    },
    2: {
        title: 'היסטוריה משפחתית',
        text: 'האם יש היסטוריה משפחתית של מחלות בקרובי משפחה (הורים ואחים)?',
        hasMembers: true,
        hasDisorders: false
    },
    3: {
        title: 'מערכת עצבים ומוח',
        text: 'האם יש מומים/מחלות ו/או הפרעות במערכת העצבים והמוח?',
        hasMembers: true,
        hasDisorders: false
    },
    4: {
        title: 'אשפוזים ובדיקות',
        text: 'האם היו אשפוזים, ניתוחים או בדיקות מיוחדות?',
        hasMembers: true,
        hasDisorders: false
    }
};

// Initialize the form
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
});

function initializeForm() {
    // Initialize form state
    formState.answers = {};
    formState.selectedMembers = {};
    formState.memberDetails = {};
    formState.selectedDisorders = {};
    formState.followupAnswers = {};
    
    // Remove any pre-selected states from buttons
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    console.log('Form initialized with new 4-question structure');
}

function setupEventListeners() {
    // Auto answer toggle
    const autoAnswerToggle = document.getElementById('autoAnswer');
    if (autoAnswerToggle) {
        autoAnswerToggle.addEventListener('change', function() {
            console.log('Toggle changed:', this.checked);
            if (this.checked) {
                console.log('🔴 Toggle ON - Setting all to NO (but keeping buttons enabled)');
                setAllAnswersToNo();
                // Note: We don't disable buttons anymore - user can still change answers
            } else {
                console.log('🟢 Toggle OFF - Clearing everything');
                clearAllAnswers();
                // Force a visual refresh
                setTimeout(() => {
                    console.log('🔄 Forcing visual refresh');
                    // Make sure all buttons are visually cleared
                    document.querySelectorAll('.answer-btn.selected').forEach(btn => {
                        btn.classList.remove('selected');
                        console.log('Removed selected from button:', btn.textContent);
                    });
                }, 100);
            }
        });
    }

    // Clear buttons
    const clearButtons = document.querySelectorAll('.clear-btn');
    clearButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            clearMemberSelections();
        });
    });
}

function answerQuestion(questionId, answer) {
    console.log(`Answering question ${questionId} with: ${answer}`);
    
    // Save answer to form state
    formState.answers[questionId] = answer;
    
    // Update button visual states
    updateQuestionButtons(questionId, answer);
    
    // Show/hide member selection based on answer
    const membersSection = document.getElementById(`members-${questionId}`);
    if (answer === 'yes') {
        membersSection.style.display = 'block';
        
        // Initialize member tracking for this question if not exists
        if (!formState.selectedMembers[questionId]) {
            formState.selectedMembers[questionId] = [];
        }
    } else {
        membersSection.style.display = 'none';
        
        // Clear any selected members for this question
        if (formState.selectedMembers[questionId]) {
            formState.selectedMembers[questionId] = [];
        }
        
        // Hide all member detail sections for this question
        const memberDetailsSelectors = [
            `#member-israel-disorders`,
            `#member-sara-disorders`, 
            `#member-david-disorders`,
            `#member-michal-disorders`,
            `#member-israel-family-history`,
            `#member-israel-neurological`
        ];
        
        memberDetailsSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = 'none';
            }
        });
        
        // Clear member checkboxes
        const memberCheckboxes = document.querySelectorAll(`#members-${questionId} .member-checkbox`);
        memberCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
            updateCheckboxVisual(checkbox);
        });
    }
    
    // Update overall progress
    updateProgress();
    
    console.log('Current formState:', formState);
}

function updateQuestionButtons(questionId, answer) {
    const questionElement = document.getElementById(`question-${questionId}`);
    if (!questionElement) return;
    
    const yesBtn = questionElement.querySelector('.yes-btn');
    const noBtn = questionElement.querySelector('.no-btn');
    
    // Remove selected class from both buttons
    yesBtn.classList.remove('selected');
    noBtn.classList.remove('selected');
    
    // Add selected class to the chosen button
    if (answer === 'yes') {
        yesBtn.classList.add('selected');
    } else {
        noBtn.classList.add('selected');
    }
}

// Handle member selection
function selectMember(questionId, memberId, checkbox) {
    console.log(`Selecting member ${memberId} for question ${questionId}:`, checkbox.checked);
    
    // Initialize arrays if they don't exist
    if (!formState.selectedMembers[questionId]) {
        formState.selectedMembers[questionId] = [];
    }
    
    // Update member selection state
    if (checkbox.checked) {
        // Add member to selected list if not already there
        if (!formState.selectedMembers[questionId].includes(memberId)) {
            formState.selectedMembers[questionId].push(memberId);
        }
        
        // Show member details section based on question type
        let detailsSelector = '';
        switch(questionId) {
            case 1:
                detailsSelector = `#member-${memberId}-disorders`;
                // Create disorders section if it doesn't exist
                if (!document.querySelector(detailsSelector)) {
                    createMemberDisordersSection(memberId);
                }
                break;
            case 2:
                detailsSelector = `#member-${memberId}-family-history`;
                // Create family history section if it doesn't exist
                if (!document.querySelector(detailsSelector)) {
                    createMemberFamilyHistorySection(memberId);
                }
                break;
            case 3:
                detailsSelector = `#member-${memberId}-neurological`;
                break;
            case 4:
                detailsSelector = `#member-${memberId}-hospitalizations`;
                // Create generic section for hospitalizations if needed
                if (!document.querySelector(detailsSelector)) {
                    createMemberGenericSection(memberId, questionId);
                }
                break;
        }
        
        const detailsSection = document.querySelector(detailsSelector);
        if (detailsSection) {
            detailsSection.style.display = 'block';
            console.log(`Showing details section: ${detailsSelector}`);
        } else {
            console.log(`Details section not found: ${detailsSelector}`);
        }
    } else {
        // Remove member from selected list
        const index = formState.selectedMembers[questionId].indexOf(memberId);
        if (index > -1) {
            formState.selectedMembers[questionId].splice(index, 1);
        }
        
        // Hide member details section
        let detailsSelector = '';
        switch(questionId) {
            case 1:
                detailsSelector = `#member-${memberId}-disorders`;
                break;
            case 2:
                detailsSelector = `#member-${memberId}-family-history`;
                break;
            case 3:
                detailsSelector = `#member-${memberId}-neurological`;
                break;
            case 4:
                detailsSelector = `#member-${memberId}-hospitalizations`;
                break;
        }
        
        const detailsSection = document.querySelector(detailsSelector);
        if (detailsSection) {
            detailsSection.style.display = 'none';
            console.log(`Hiding details section: ${detailsSelector}`);
        }
        
        // Clear any saved details for this member and question
        if (formState.memberDetails[questionId] && formState.memberDetails[questionId][memberId]) {
            delete formState.memberDetails[questionId][memberId];
        }
    }
    
    // Update checkbox visual
    updateCheckboxVisual(checkbox);
    
    // Update progress
    updateProgress();
    
    console.log('Updated selectedMembers:', formState.selectedMembers);
}

function updateCheckboxVisual(checkbox) {
    // Handle both member checkboxes and disorder checkboxes
    if (checkbox.classList.contains('member-checkbox') || 
        checkbox.classList.contains('disorder-checkbox') || 
        checkbox.classList.contains('disorder-option-checkbox')) {
        
        // The visual state is handled by CSS :checked pseudo-class
        // and ::after content for the checkmark
        
        // Optional: trigger any additional visual updates here
        console.log('Checkbox visual updated:', checkbox.checked);
    }
}

function generateMemberDetails(questionId, memberId) {
    const question = questions[questionId];
    if (!question || !question.subQuestions) return;
    
    const memberDetails = document.getElementById(`member-details-${memberId}`);
    if (!memberDetails) return;
    
    const memberName = familyMembers[memberId]?.name || memberId;
    
    let html = `
        <div class="details-content">
            <h4>${question.title} - פרטים עבור ${memberName}</h4>
            <div class="details-questions">
    `;
    
    let questionNumber = 1;
    Object.entries(question.subQuestions).forEach(([key, subQuestion]) => {
        html += generateSubQuestionHTML(questionId, memberId, key, subQuestion, questionNumber);
        questionNumber++;
    });
    
    html += `
            </div>
            <div class="question-indicator"></div>
        </div>
    `;
    
    memberDetails.innerHTML = html;
    
    // Add event listeners for the generated inputs
    addSubQuestionEventListeners(questionId, memberId);
}

function generateSubQuestionHTML(questionId, memberId, key, subQuestion, number) {
    const inputId = `${questionId}-${memberId}-${key}`;
    
    let html = `
        <div class="detail-question">
            <span class="detail-number">${number}.</span>
            <label>${subQuestion.label}</label>
    `;
    
    switch (subQuestion.type) {
        case 'radio':
            html += '<div class="detail-options">';
            subQuestion.options.forEach((option, index) => {
                const optionId = `${inputId}-${index}`;
                const isChecked = (questionId === 2 && key === 'timing' && option === 'לפני 3 שנים ומעלה') ||
                                 (questionId === 2 && key === 'hospitalization' && option === 'כן') ||
                                 (questionId === 2 && key === 'disability' && option === 'כן');
                html += `
                    <label>
                        <input type="radio" name="${inputId}" value="${option}" ${isChecked ? 'checked' : ''}>
                        <span class="radio-checkmark ${isChecked ? 'checked' : ''}"></span>
                        <span>${option}</span>
                    </label>
                `;
            });
            html += '</div>';
            break;
            
        case 'multiselect':
            html += '<div class="detail-options">';
            subQuestion.options.forEach((option, index) => {
                const optionId = `${inputId}-${index}`;
                const isChecked = (questionId === 2 && key === 'disorders' && (option === 'דיכאון' || option === 'חרדה'));
                html += `
                    <label>
                        <input type="checkbox" id="${optionId}" value="${option}" ${isChecked ? 'checked' : ''}>
                        <span class="radio-checkmark ${isChecked ? 'checked' : ''}"></span>
                        <span>${option}</span>
                    </label>
                `;
            });
            html += '</div>';
            break;
            
        case 'text':
            const defaultValue = (questionId === 2 && key === 'duration') ? '1 חודשים' : '';
            html += `<input type="text" class="text-input" value="${defaultValue}">`;
            break;
            
        case 'number':
            const defaultNumber = (questionId === 2 && key === 'percentage') ? '25' : '';
            if (key === 'percentage') {
                html += `
                    <div class="percentage-input">
                        <input type="number" class="text-input" value="${defaultNumber}">
                        <span>%</span>
                    </div>
                `;
            } else {
                html += `<input type="number" class="text-input" value="${defaultNumber}">`;
            }
            break;
            
        case 'textarea':
            html += `<textarea class="text-area"></textarea>`;
            break;
    }
    
    html += '</div>';
    return html;
}

function addSubQuestionEventListeners(questionId, memberId) {
    const memberDetails = document.getElementById(`member-details-${memberId}`);
    if (!memberDetails) return;
    
    // Add listeners for radio buttons
    const radioInputs = memberDetails.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(input => {
        input.addEventListener('change', function() {
            updateRadioVisual(this);
            saveMemberDetailAnswer(questionId, memberId, this.name, this.value);
        });
    });
    
    // Add listeners for checkboxes
    const checkboxInputs = memberDetails.querySelectorAll('input[type="checkbox"]');
    checkboxInputs.forEach(input => {
        input.addEventListener('change', function() {
            updateRadioVisual(this);
            saveMemberDetailAnswer(questionId, memberId, this.id, this.checked);
        });
    });
    
    // Add listeners for text inputs
    const textInputs = memberDetails.querySelectorAll('input[type="text"], input[type="number"], textarea');
    textInputs.forEach(input => {
        input.addEventListener('change', function() {
            saveMemberDetailAnswer(questionId, memberId, this.className, this.value);
        });
    });
}

function updateRadioVisual(input) {
    if (input.type === 'radio') {
        // Clear all radio buttons in the same group
        const groupInputs = document.querySelectorAll(`input[name="${input.name}"]`);
        groupInputs.forEach(groupInput => {
            const checkmark = groupInput.nextElementSibling;
            if (checkmark && checkmark.classList.contains('radio-checkmark')) {
                checkmark.classList.remove('checked');
                checkmark.innerHTML = '';
            }
        });
        
        // Mark the selected one
        if (input.checked) {
            const checkmark = input.nextElementSibling;
            if (checkmark && checkmark.classList.contains('radio-checkmark')) {
                checkmark.classList.add('checked');
                checkmark.innerHTML = '✓';
            }
        }
    } else if (input.type === 'checkbox') {
        const checkmark = input.nextElementSibling;
        if (checkmark && checkmark.classList.contains('radio-checkmark')) {
            if (input.checked) {
                checkmark.classList.add('checked');
                checkmark.innerHTML = '✓';
            } else {
                checkmark.classList.remove('checked');
                checkmark.innerHTML = '';
            }
        }
    }
}

function saveMemberDetailAnswer(questionId, memberId, field, value) {
    if (!formState.memberDetails[questionId]) {
        formState.memberDetails[questionId] = {};
    }
    if (!formState.memberDetails[questionId][memberId]) {
        formState.memberDetails[questionId][memberId] = {};
    }
    
    formState.memberDetails[questionId][memberId][field] = value;
    console.log('Member detail saved:', questionId, memberId, field, value);
}

// Auto-answer functionality
function setAllAnswersToNo() {
    console.log('Setting all answers to "No"');
    
    if (formState.currentViewMode === 'table') {
        // Table mode: set all radio buttons to "no"
        const questions = [1, 2, 3, 4];
        const members = ['israel', 'sara', 'david', 'michal'];
        
        questions.forEach(q => {
            members.forEach(member => {
                const radioNo = document.getElementById(`q${q}-${member}-no`);
                if (radioNo) {
                    radioNo.checked = true;
                    handleTableAnswer(q, member, 'no');
                }
            });
        });
    } else {
        // Normal mode: set all question buttons to "no"
        for (let questionId = 1; questionId <= 4; questionId++) {
            // Find and click the "no" button for each question
            const questionDiv = document.getElementById(`question-${questionId}`);
            if (questionDiv) {
                const noButton = questionDiv.querySelector('.no-btn');
                if (noButton) {
                    // Simulate clicking the "no" button
                    answerQuestion(questionId, 'no');
                    
                    // Update button visual state
                    const yesButton = questionDiv.querySelector('.yes-btn');
                    if (yesButton) {
                        yesButton.classList.remove('selected');
                    }
                    noButton.classList.add('selected');
                }
            }
        }
    }
    
    updateProgress();
}

// Clear all answers functionality
function clearAllAnswers() {
    console.log('Clearing all answers');
    
    if (formState.currentViewMode === 'table') {
        // Table mode clearing
        clearAllTableAnswers();
    } else {
        // Normal mode: clear all answers and selections
        formState.answers = {};
        formState.selectedMembers = {};
        formState.memberDetails = {};
        formState.selectedDisorders = {};
        formState.followupAnswers = {};
        
        // Clear all question button selections
        for (let questionId = 1; questionId <= 4; questionId++) {
            const questionDiv = document.getElementById(`question-${questionId}`);
            if (questionDiv) {
                const buttons = questionDiv.querySelectorAll('.answer-btn');
                buttons.forEach(button => button.classList.remove('selected'));
            }
            
            // Hide member selection sections
            const membersSection = document.getElementById(`members-${questionId}`);
            if (membersSection) {
                membersSection.style.display = 'none';
            }
        }
        
        // Clear all member checkboxes
        const memberCheckboxes = document.querySelectorAll('.member-checkbox');
        memberCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
            updateCheckboxVisual(checkbox);
        });
        
        // Hide all member detail sections
        const memberDetailSections = document.querySelectorAll('[id^="member-"][id$="-disorders"], [id^="member-"][id$="-family-history"], [id^="member-"][id$="-neurological"]');
        memberDetailSections.forEach(section => {
            section.style.display = 'none';
        });
    }
    
    updateProgress();
}

function clearMemberSelections() {
    console.log('Clearing member selections');
    
    // Uncheck all member checkboxes
    document.querySelectorAll('.member-checkbox').forEach(checkbox => {
        checkbox.checked = false;
        updateCheckboxVisual(checkbox);
    });
    
    // Hide all member details
    document.querySelectorAll('.member-details').forEach(details => {
        details.style.display = 'none';
    });
    
    // Clear and hide all follow-up questions
    const followupSections = document.querySelectorAll('[id^="followup-questions-"]');
    followupSections.forEach(section => {
        section.style.display = 'none';
        const inputs = section.querySelectorAll('.followup-input');
        inputs.forEach(input => input.value = '');
    });
    
    // Clear form state
    formState.selectedMembers = {};
    formState.memberDetails = {};
    formState.followupAnswers = {};
}

function clearMemberSelectionsForQuestion(questionId) {
    console.log(`Clearing member selections for question ${questionId}`);
    
    // Clear from form state
    delete formState.selectedMembers[questionId];
    delete formState.memberDetails[questionId];
    
    // Clear follow-up answers for all members if this is question 2
    if (questionId === 2) {
        formState.followupAnswers = {};
    }
    
    // Update UI
    const membersSection = document.getElementById(`members-${questionId}`);
    if (membersSection) {
        const checkboxes = membersSection.querySelectorAll('.member-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            updateCheckboxVisual(checkbox);
        });
        
        const details = membersSection.querySelectorAll('.member-details');
        details.forEach(detail => {
            detail.style.display = 'none';
        });
        
        // Clear and hide follow-up questions for question 2
        if (questionId === 2) {
            const followupSections = document.querySelectorAll('[id^="followup-questions-"]');
            followupSections.forEach(section => {
                section.style.display = 'none';
                const inputs = section.querySelectorAll('.followup-input');
                inputs.forEach(input => input.value = '');
            });
        }
    }
}

// Update progress and next button state
function updateProgress() {
    let isComplete = false;
    
    if (formState.currentViewMode === 'table') {
        // Table mode progress calculation
        const totalAnswers = 16; // 4 questions × 4 members
        let answeredCount = 0;
        
        for (let q = 1; q <= 4; q++) {
            if (formState.tableAnswers[q]) {
                ['israel', 'sara', 'david', 'michal'].forEach(member => {
                    if (formState.tableAnswers[q][member]) {
                        answeredCount++;
                    }
                });
            }
        }
        
        isComplete = (answeredCount === totalAnswers);
        console.log(`Table mode progress: ${answeredCount}/${totalAnswers} answered`);
    } else {
        // Normal mode progress calculation
        const totalQuestions = 4;
        let answeredQuestions = 0;
        
        for (let i = 1; i <= totalQuestions; i++) {
            if (formState.answers[i]) {
                answeredQuestions++;
                
                // If answered "yes", check if at least one member is selected
                if (formState.answers[i] === 'yes') {
                    if (!formState.selectedMembers[i] || formState.selectedMembers[i].length === 0) {
                        // Question answered "yes" but no members selected - not complete
                        isComplete = false;
                        break;
                    }
                }
            }
        }
        
        isComplete = (answeredQuestions === totalQuestions);
        console.log(`Normal mode progress: ${answeredQuestions}/${totalQuestions} questions answered`);
    }
    
    // Update next button state
    const nextBtn = document.querySelector('.next-btn');
    if (isComplete) {
        nextBtn.classList.remove('disabled');
        nextBtn.disabled = false;
        nextBtn.style.cursor = 'pointer';
    } else {
        nextBtn.classList.add('disabled');
        nextBtn.disabled = true;
        nextBtn.style.cursor = 'not-allowed';
    }
}

// Form submission
function submitForm() {
    console.log('Submitting form with state:', formState);
    
    // Validate form
    if (Object.keys(formState.answers).length < 4) {
        alert('אנא ענה על כל השאלות לפני המשך');
        return;
    }
    
    // Here you would typically send the data to a server
    alert('הצהרת הבריאות נשלחה בהצלחה!');
}

// Initialize tooltips and other interactive elements
function initializeInteractiveElements() {
    // Add hover effects
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 10px rgba(40, 54, 102, 0.2)';
            }
        });
        
        btn.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = '';
                this.style.boxShadow = '';
            }
        });
    });
}

// Call initialization functions
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    initializeInteractiveElements();
});

// Handle disorder selection
function selectDisorder(memberId, disorderId, checkbox) {
    console.log(`Disorder ${disorderId} for member ${memberId}: ${checkbox.checked}`);
    
    // Initialize member disorders if not exists
    if (!formState.selectedDisorders[memberId]) {
        formState.selectedDisorders[memberId] = {};
    }
    
    // Update disorder state
    formState.selectedDisorders[memberId][disorderId] = checkbox.checked;
    
    // Show/hide disorder details
    const detailsSection = document.getElementById(`${memberId}-${disorderId}-details`);
    if (detailsSection) {
        detailsSection.style.display = checkbox.checked ? 'block' : 'none';
    } else if (checkbox.checked) {
        // Create the disorder details section dynamically
        createDisorderDetailsSection(memberId, disorderId);
    }
    
    // Update checkbox visual
    updateCheckboxVisual(checkbox);
}

// Create disorder details section dynamically
function createDisorderDetailsSection(memberId, disorderId) {
    const disorderData = disorders[disorderId];
    if (!disorderData) return;
    
    const memberCheckboxItem = document.querySelector(`input[onchange*="selectMember(1, '${memberId}', this)"]`).closest('.member-checkbox-item');
    const memberName = memberCheckboxItem.querySelector('span').textContent;
    
    const detailsHTML = `
        <div class="disorder-details" id="${memberId}-${disorderId}-details" style="display: block;">
            <div class="disorder-details-content">
                <div class="disorder-title-wrapper">
                    <h4 class="disorder-title">${disorderData.name} - ${memberName}</h4>
                    <div class="question-indicator"></div>
                </div>
                
                <div class="disorder-questions">
                    <div class="disorder-question">
                        <div class="disorder-question-header">
                            <span class="disorder-question-number">1.</span>
                            <span class="disorder-question-text">מועד האבחון</span>
                        </div>
                        <div class="disorder-options">
                            <div class="disorder-option">
                                <span>אובחן בשנה האחרונה</span>
                                <input type="checkbox" class="disorder-option-checkbox" onchange="selectDisorderOption('${memberId}', '${disorderId}', 'timing', 'אובחן בשנה האחרונה', this)">
                            </div>
                            <div class="disorder-option">
                                <span>בשנתיים האחרונות</span>
                                <input type="checkbox" class="disorder-option-checkbox" onchange="selectDisorderOption('${memberId}', '${disorderId}', 'timing', 'בשנתיים האחרונות', this)">
                            </div>
                            <div class="disorder-option">
                                <span>לפני 3 שנים אובחן לפני שנתיים</span>
                                <input type="checkbox" class="disorder-option-checkbox" onchange="selectDisorderOption('${memberId}', '${disorderId}', 'timing', 'לפני 3 שנים אובחן לפני שנתיים', this)">
                            </div>
                        </div>
                    </div>

                    <div class="disorder-question" data-question="${memberId}-${disorderId}-hospitalization">
                        <div class="disorder-question-header">
                            <span class="disorder-question-number">2.</span>
                            <span class="disorder-question-text">אשפוז</span>
                        </div>
                        <div class="disorder-options">
                            <div class="disorder-option">
                                <span>כן</span>
                                <input type="checkbox" class="disorder-option-checkbox" onchange="selectDisorderOption('${memberId}', '${disorderId}', 'hospitalization', 'כן', this)">
                            </div>
                            <div class="disorder-option">
                                <span>לא</span>
                                <input type="checkbox" class="disorder-option-checkbox" onchange="selectDisorderOption('${memberId}', '${disorderId}', 'hospitalization', 'לא', this)">
                            </div>
                        </div>
                    </div>

                    <div class="disorder-question" data-question="${memberId}-${disorderId}-disability">
                        <div class="disorder-question-header">
                            <span class="disorder-question-number">3.</span>
                            <span class="disorder-question-text">נכות</span>
                        </div>
                        <div class="disorder-options">
                            <div class="disorder-option">
                                <span>כן</span>
                                <input type="checkbox" class="disorder-option-checkbox" onchange="selectDisorderOption('${memberId}', '${disorderId}', 'disability', 'כן', this)">
                            </div>
                            <div class="disorder-option">
                                <span>לא</span>
                                <input type="checkbox" class="disorder-option-checkbox" onchange="selectDisorderOption('${memberId}', '${disorderId}', 'disability', 'לא', this)">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Find the disorders section for this member and append the details
    const memberDisordersSection = document.getElementById(`member-${memberId}-disorders`);
    if (memberDisordersSection) {
        memberDisordersSection.insertAdjacentHTML('beforeend', detailsHTML);
    }
}

// Handle disorder option selection (for individual questions within disorders)
function selectDisorderOption(memberId, disorderId, questionId, option, checkbox) {
    console.log(`Option selected: ${memberId} - ${disorderId} - ${questionId} - ${option}`);
    
    // For single-select questions, uncheck other options in the same question
    const questionContainer = checkbox.closest('.disorder-options');
    if (questionContainer) {
        const otherCheckboxes = questionContainer.querySelectorAll('.disorder-option-checkbox');
        otherCheckboxes.forEach(cb => {
            if (cb !== checkbox) {
                cb.checked = false;
                updateCheckboxVisual(cb);
                
                // Hide any text inputs for the unchecked option
                hideRelatedTextInputs(cb, memberId, disorderId, questionId);
            }
        });
    }
    
    // Update visual
    updateCheckboxVisual(checkbox);
    
    // Show/hide text input based on the selection
    if (checkbox.checked && option === 'כן') {
        showTextInputForQuestion(memberId, disorderId, questionId);
    } else {
        hideTextInputForQuestion(memberId, disorderId, questionId);
    }
    
    // Save the answer
    if (!formState.memberDetails[memberId]) {
        formState.memberDetails[memberId] = {};
    }
    if (!formState.memberDetails[memberId][disorderId]) {
        formState.memberDetails[memberId][disorderId] = {};
    }
    
    formState.memberDetails[memberId][disorderId][questionId] = checkbox.checked ? option : null;
}

// Show text input for specific questions when "yes" is selected
function showTextInputForQuestion(memberId, disorderId, questionId) {
    const inputId = `${memberId}-${disorderId}-${questionId}-input`;
    const existingInput = document.getElementById(inputId);
    
    if (existingInput) {
        existingInput.style.display = 'flex';
        return;
    }
    
    // Create the text input based on question type
    let inputHTML = '';
    let placeholder = '';
    
    if (questionId === 'hospitalization') {
        placeholder = 'מה משך האשפוז?';
        inputHTML = `
            <div class="disorder-input" id="${inputId}" style="margin-top: 15px; display: flex; justify-content: flex-start; direction: rtl; width: 100%; text-align: right;">
                <input type="text" 
                       class="disorder-text-input" 
                       placeholder="${placeholder}"
                       style="text-align: right; direction: rtl; margin-right: 0; margin-left: auto;"
                       onchange="saveDisorderText('${memberId}', '${disorderId}', '${questionId}', this.value)">
            </div>
        `;
    } else if (questionId === 'disability') {
        placeholder = 'כמה אחוזי נכות נקבעו לך?';
        inputHTML = `
            <div class="disorder-percentage" id="${inputId}" style="margin-top: 15px; display: flex; justify-content: flex-start; direction: rtl; width: 100%; text-align: right; align-items: center; gap: 10px;">
                <span style="order: 2;">%</span>
                <input type="number" 
                       class="disorder-text-input" 
                       placeholder="${placeholder}"
                       min="0" 
                       max="100"
                       style="text-align: right; direction: rtl; order: 1;"
                       onchange="saveDisorderText('${memberId}', '${disorderId}', '${questionId}', this.value)">
            </div>
        `;
    }
    
    if (inputHTML) {
        // Find the question container and add the input inside it at the end
        const questionElement = document.querySelector(`[data-question="${memberId}-${disorderId}-${questionId}"]`);
        if (questionElement) {
            questionElement.insertAdjacentHTML('beforeend', inputHTML);
        }
    }
}

// Hide text input for specific questions
function hideTextInputForQuestion(memberId, disorderId, questionId) {
    const inputId = `${memberId}-${disorderId}-${questionId}-input`;
    const inputElement = document.getElementById(inputId);
    
    if (inputElement) {
        inputElement.style.display = 'none';
        
        // Clear the saved value
        if (formState.memberDetails[memberId] && 
            formState.memberDetails[memberId][disorderId]) {
            delete formState.memberDetails[memberId][disorderId][`${questionId}_text`];
        }
    }
}

// Hide text inputs when checkbox is unchecked
function hideRelatedTextInputs(checkbox, memberId, disorderId, questionId) {
    const option = checkbox.closest('.disorder-option').querySelector('span').textContent;
    if (option === 'כן') {
        hideTextInputForQuestion(memberId, disorderId, questionId);
    }
}

// Handle text input for disorder details
function saveDisorderText(memberId, disorderId, questionId, value) {
    console.log(`Text saved: ${memberId} - ${disorderId} - ${questionId} - ${value}`);
    
    // Save the text answer
    if (!formState.memberDetails[memberId]) {
        formState.memberDetails[memberId] = {};
    }
    if (!formState.memberDetails[memberId][disorderId]) {
        formState.memberDetails[memberId][disorderId] = {};
    }
    
    // Save with a specific key for text inputs
    formState.memberDetails[memberId][disorderId][`${questionId}_text`] = value;
}

// Create member disorders section dynamically
function createMemberDisordersSection(memberId) {
    const memberCheckboxItem = document.querySelector(`input[onchange*="selectMember(1, '${memberId}', this)"]`).closest('.member-checkbox-item');
    const memberName = memberCheckboxItem.querySelector('span').textContent;
    
    const disordersHTML = `
        <div class="member-disorders-section" id="member-${memberId}-disorders" style="display: none;">
            <!-- Disorders Selection -->
            <div class="disorders-selection">
                <div class="disorders-header">
                    <span>בחר את ההפרעות הרלוונטיות עבור </span>
                    <span class="member-name">${memberName}</span>
                </div>
                <div class="disorders-divider"></div>
                
                <div class="disorders-list">
                    <div class="disorder-checkbox-item">
                        <span>דיכאון</span>
                        <input type="checkbox" class="disorder-checkbox" onchange="selectDisorder('${memberId}', 'depression', this)">
                    </div>
                    <div class="disorder-checkbox-item">
                        <span>הפרעת מצב רוח</span>
                        <input type="checkbox" class="disorder-checkbox" onchange="selectDisorder('${memberId}', 'mood-disorder', this)">
                    </div>
                    <div class="disorder-checkbox-item">
                        <span>חרדה</span>
                        <input type="checkbox" class="disorder-checkbox" onchange="selectDisorder('${memberId}', 'anxiety', this)">
                    </div>
                    <div class="disorder-checkbox-item">
                        <span>דיכאון מג'ורי</span>
                        <input type="checkbox" class="disorder-checkbox" onchange="selectDisorder('${memberId}', 'major-depression', this)">
                    </div>
                    <div class="disorder-checkbox-item">
                        <span>OCD</span>
                        <input type="checkbox" class="disorder-checkbox" onchange="selectDisorder('${memberId}', 'ocd', this)">
                    </div>
                    <div class="disorder-checkbox-item">
                        <span>דיכאון לאחר לידה</span>
                        <input type="checkbox" class="disorder-checkbox" onchange="selectDisorder('${memberId}', 'postpartum-depression', this)">
                    </div>
                    <div class="disorder-checkbox-item">
                        <span>הפרעות אכילה</span>
                        <input type="checkbox" class="disorder-checkbox" onchange="selectDisorder('${memberId}', 'eating-disorders', this)">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (memberCheckboxItem) {
        memberCheckboxItem.insertAdjacentHTML('afterend', disordersHTML);
    }
}

// Handle family disease selection for question 2
function selectFamilyDisease(memberId, diseaseId, checkbox) {
    console.log(`Family disease ${diseaseId} for member ${memberId}: ${checkbox.checked}`);
    
    // Initialize family diseases if not exists
    if (!formState.selectedDisorders[memberId]) {
        formState.selectedDisorders[memberId] = {};
    }
    if (!formState.selectedDisorders[memberId].familyHistory) {
        formState.selectedDisorders[memberId].familyHistory = {};
    }
    
    // Update disease state
    formState.selectedDisorders[memberId].familyHistory[diseaseId] = checkbox.checked;
    
    // Check if any of the specific diseases are selected to show follow-up questions
    const specificDiseases = [
        'colon-cancer', 'breast-cancer', 'ovarian-cancer', 'prostate-cancer',
        'multiple-sclerosis', 'als', 'parkinson', 'alzheimer'
    ];
    
    // Check if any specific disease is selected for this member
    let shouldShowFollowup = false;
    if (formState.selectedDisorders[memberId] && formState.selectedDisorders[memberId].familyHistory) {
        specificDiseases.forEach(disease => {
            if (formState.selectedDisorders[memberId].familyHistory[disease]) {
                shouldShowFollowup = true;
            }
        });
    }
    
    // Show or hide follow-up questions for this member
    const followupSection = document.getElementById(`followup-questions-${memberId}`);
    if (followupSection) {
        followupSection.style.display = shouldShowFollowup ? 'block' : 'none';
        
        // Clear follow-up answers if hiding the section
        if (!shouldShowFollowup && formState.followupAnswers[memberId]) {
            delete formState.followupAnswers[memberId];
            // Clear the input values
            const inputs = followupSection.querySelectorAll('.followup-input');
            inputs.forEach(input => input.value = '');
        }
    } else if (shouldShowFollowup) {
        // Create follow-up section dynamically if it doesn't exist
        createFollowupSection(memberId);
    }
    
    // Update checkbox visual
    updateCheckboxVisual(checkbox);
}

// Handle family disorder option selection (for sub-questions)
function selectFamilyDisorderOption(memberId, categoryId, questionId, option, checkbox) {
    console.log(`Family disorder option: ${memberId} - ${categoryId} - ${questionId} - ${option}`);
    
    // For single-select questions, uncheck other options in the same question
    const questionContainer = checkbox.closest('.disorder-options');
    if (questionContainer) {
        const otherCheckboxes = questionContainer.querySelectorAll('.disorder-option-checkbox');
        otherCheckboxes.forEach(cb => {
            if (cb !== checkbox) {
                cb.checked = false;
                updateCheckboxVisual(cb);
            }
        });
    }
    
    // Update visual
    updateCheckboxVisual(checkbox);
    
    // Handle special cases that show sub-questions
    if (categoryId === 'familial-polyposis' && questionId === 'polyposis' && option === 'כן') {
        showPolypoisSubQuestions(memberId, checkbox.checked);
    } else if (categoryId === 'polycystic-kidneys' && questionId === 'polycystic' && option === 'כן') {
        showPolycysticKidneysSubQuestions(memberId, checkbox.checked);
    }
    
    // Save the answer
    if (!formState.memberDetails[memberId]) {
        formState.memberDetails[memberId] = {};
    }
    if (!formState.memberDetails[memberId].familyHistory) {
        formState.memberDetails[memberId].familyHistory = {};
    }
    if (!formState.memberDetails[memberId].familyHistory[categoryId]) {
        formState.memberDetails[memberId].familyHistory[categoryId] = {};
    }
    
    formState.memberDetails[memberId].familyHistory[categoryId][questionId] = checkbox.checked ? option : null;
}

// Show polyposis sub-questions
function showPolypoisSubQuestions(memberId, show) {
    const subQuestionsDiv = document.getElementById(`${memberId}-polyposis-subquestions`);
    if (subQuestionsDiv) {
        subQuestionsDiv.style.display = show ? 'block' : 'none';
    }
}

// Show polycystic kidneys sub-questions
function showPolycysticKidneysSubQuestions(memberId, show) {
    const subQuestionsDiv = document.getElementById(`${memberId}-polycystic-subquestions`);
    if (subQuestionsDiv) {
        subQuestionsDiv.style.display = show ? 'block' : 'none';
    }
}

// Create member family history section dynamically
function createMemberFamilyHistorySection(memberId) {
    const memberCheckboxItem = document.querySelector(`input[onchange*="selectMember(2, '${memberId}', this)"]`).closest('.member-checkbox-item');
    
    const memberName = familyMembers[memberId]?.name || memberId;
    
    const familyHistoryHTML = `
        <div class="member-disorders-section" id="member-${memberId}-family-history" style="display: none;">
            <!-- Family Diseases Selection -->
            <div class="disorders-selection">
                <div class="disorders-header">
                    <span>מחלות עיקריות אצל הורים ואחים של ${memberName}:</span>
                </div>
                <div class="disorders-divider"></div>
                
                <div class="disorders-list">
                    <div class="disorder-checkbox-item">
                        <span>סרטן המעי הגס</span>
                        <input type="checkbox" class="disorder-checkbox" onchange="selectFamilyDisease('${memberId}', 'colon-cancer', this)">
                    </div>
                    <div class="disorder-checkbox-item">
                        <span>סרטן השד</span>
                        <input type="checkbox" class="disorder-checkbox" onchange="selectFamilyDisease('${memberId}', 'breast-cancer', this)">
                    </div>
                    <div class="disorder-checkbox-item">
                        <span>סרטן השחלות</span>
                        <input type="checkbox" class="disorder-checkbox" onchange="selectFamilyDisease('${memberId}', 'ovarian-cancer', this)">
                    </div>
                    <div class="disorder-checkbox-item">
                        <span>סרטן הערמונית</span>
                        <input type="checkbox" class="disorder-checkbox" onchange="selectFamilyDisease('${memberId}', 'prostate-cancer', this)">
                    </div>
                    <div class="disorder-checkbox-item">
                        <span>טרשת נפוצה</span>
                        <input type="checkbox" class="disorder-checkbox" onchange="selectFamilyDisease('${memberId}', 'multiple-sclerosis', this)">
                    </div>
                    <div class="disorder-checkbox-item">
                        <span>ALS</span>
                        <input type="checkbox" class="disorder-checkbox" onchange="selectFamilyDisease('${memberId}', 'als', this)">
                    </div>
                    <div class="disorder-checkbox-item">
                        <span>פרקינסון</span>
                        <input type="checkbox" class="disorder-checkbox" onchange="selectFamilyDisease('${memberId}', 'parkinson', this)">
                    </div>
                    <div class="disorder-checkbox-item">
                        <span>אלצהיימר</span>
                        <input type="checkbox" class="disorder-checkbox" onchange="selectFamilyDisease('${memberId}', 'alzheimer', this)">
                    </div>
                </div>
            </div>

            <!-- Follow-up Questions - Hidden initially -->
            <div class="followup-questions" id="followup-questions-${memberId}" style="display: none;">
                <div class="followup-question">
                    <span class="followup-question-text">כמות בני משפחה חלו בשם המחלה:</span>
                    <div class="followup-input-container">
                        <input type="number" class="followup-input" min="1" max="10" placeholder="הכנס מספר" onchange="saveFollowupAnswer('${memberId}', 'quantity', this.value)">
                    </div>
                </div>
                
                <div class="followup-question">
                    <span class="followup-question-text">מה גיל הצעיר מביניהם:</span>
                    <div class="followup-input-container">
                        <input type="number" class="followup-input" min="0" max="120" placeholder="הכנס גיל" onchange="saveFollowupAnswer('${memberId}', 'youngest_age', this.value)">
                    </div>
                </div>
            </div>

            <!-- Additional Questions Section -->
            <div class="disorder-details" style="display: block;">
                <div class="disorder-details-content">
                    <div class="disorder-questions">
                        <!-- Question 2: Familial Polyposis -->
                        <div class="disorder-question">
                            <div class="disorder-question-header">
                                <span class="disorder-question-number">2.</span>
                                <span class="disorder-question-text">פוליפוזיס משפחתית אצל ההורים, אחים של ${memberName}:</span>
                            </div>
                            <div class="disorder-options">
                                <div class="disorder-option">
                                    <span>פוליפוזיס משפחתית</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'familial-polyposis', 'polyposis', 'כן', this)">
                                </div>
                            </div>
                            
                            <!-- Sub-questions for polyposis -->
                            <div id="${memberId}-polyposis-subquestions" style="display: none; margin-top: 20px; padding-right: 20px;">
                                <div class="disorder-question" data-question="${memberId}-polyposis-diagnosed">
                                    <div class="disorder-question-header">
                                        <span class="disorder-question-number">2.1</span>
                                        <span class="disorder-question-text">האם אובחנו אצלך פוליפים בדרכי העיכול?</span>
                                    </div>
                                    <div class="disorder-options">
                                        <div class="disorder-option">
                                            <span>כן</span>
                                            <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'familial-polyposis', 'diagnosed', 'כן', this)">
                                        </div>
                                        <div class="disorder-option">
                                            <span>לא</span>
                                            <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'familial-polyposis', 'diagnosed', 'לא', this)">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="disorder-question" data-question="${memberId}-polyposis-monitoring">
                                    <div class="disorder-question-header">
                                        <span class="disorder-question-number">2.2</span>
                                        <span class="disorder-question-text">האם אתה נמצא במעקב קבוע אצל רופא גסטרואנטרולוג?</span>
                                    </div>
                                    <div class="disorder-options">
                                        <div class="disorder-option">
                                            <span>כן</span>
                                            <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'familial-polyposis', 'monitoring', 'כן', this)">
                                        </div>
                                        <div class="disorder-option">
                                            <span>לא</span>
                                            <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'familial-polyposis', 'monitoring', 'לא', this)">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Additional diseases -->
                        <div style="margin-top: 20px;">
                            <h5 style="color: #2D3968; font-size: 18px; font-weight: 600; margin-bottom: 20px;">מחלות נוספות עבור ${memberName}:</h5>
                            
                            <!-- Heart Disease -->
                            <div class="disorder-question" data-question="${memberId}-heart-disease">
                                <div class="disorder-question-header">
                                    <span class="disorder-question-number">3.</span>
                                    <span class="disorder-question-text">מחלת לב אצל שניים או יותר קרובי משפחה (הורים, אחים):</span>
                                </div>
                                <div class="disorder-options">
                                    <div class="disorder-option">
                                        <span>כן</span>
                                        <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'general', 'heart-disease', 'כן', this)">
                                    </div>
                                    <div class="disorder-option">
                                        <span>לא</span>
                                        <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'general', 'heart-disease', 'לא', this)">
                                    </div>
                                </div>
                            </div>

                            <!-- Diabetes -->
                            <div class="disorder-question" data-question="${memberId}-diabetes">
                                <div class="disorder-question-header">
                                    <span class="disorder-question-number">4.</span>
                                    <span class="disorder-question-text">סכרת אצל שניים או יותר קרובי משפחה (הורים, אחים):</span>
                                </div>
                                <div class="disorder-options">
                                    <div class="disorder-option">
                                        <span>כן</span>
                                        <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'general', 'diabetes', 'כן', this)">
                                    </div>
                                    <div class="disorder-option">
                                        <span>לא</span>
                                        <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'general', 'diabetes', 'לא', this)">
                                    </div>
                                </div>
                            </div>

                            <!-- Polycystic Kidneys -->
                            <div class="disorder-question">
                                <div class="disorder-question-header">
                                    <span class="disorder-question-number">5.</span>
                                    <span class="disorder-question-text">כליות פוליציסטיות אצל ההורים, אחים:</span>
                                </div>
                                <div class="disorder-options">
                                    <div class="disorder-option">
                                        <span>כן</span>
                                        <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'polycystic-kidneys', 'polycystic', 'כן', this)">
                                    </div>
                                    <div class="disorder-option">
                                        <span>לא</span>
                                        <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'polycystic-kidneys', 'polycystic', 'לא', this)">
                                    </div>
                                </div>
                                
                                <!-- Sub-questions for polycystic kidneys -->
                                <div id="${memberId}-polycystic-subquestions" style="display: none; margin-top: 20px; padding-right: 20px;">
                                    <div class="disorder-question" data-question="${memberId}-polycystic-ultrasound">
                                        <div class="disorder-question-header">
                                            <span class="disorder-question-number">5.1</span>
                                            <span class="disorder-question-text">האם עברת בדיקת אולטרה סאונד של הכליות בשנתיים האחרונות?</span>
                                        </div>
                                        <div class="disorder-options">
                                            <div class="disorder-option">
                                                <span>כן</span>
                                                <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'polycystic-kidneys', 'ultrasound', 'כן', this)">
                                            </div>
                                            <div class="disorder-option">
                                                <span>לא</span>
                                                <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'polycystic-kidneys', 'ultrasound', 'לא', this)">
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="disorder-question" data-question="${memberId}-polycystic-cysts">
                                        <div class="disorder-question-header">
                                            <span class="disorder-question-number">5.2</span>
                                            <span class="disorder-question-text">האם אובחנו אצלך ציסטות בכליות?</span>
                                        </div>
                                        <div class="disorder-options">
                                            <div class="disorder-option">
                                                <span>כן</span>
                                                <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'polycystic-kidneys', 'cysts', 'כן', this)">
                                            </div>
                                            <div class="disorder-option">
                                                <span>לא</span>
                                                <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'polycystic-kidneys', 'cysts', 'לא', this)">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Huntington -->
                            <div class="disorder-question" data-question="${memberId}-huntington">
                                <div class="disorder-question-header">
                                    <span class="disorder-question-number">6.</span>
                                    <span class="disorder-question-text">הנטינגטון אצל הורים, אחים:</span>
                                </div>
                                <div class="disorder-options">
                                    <div class="disorder-option">
                                        <span>כן</span>
                                        <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'general', 'huntington', 'כן', this)">
                                    </div>
                                    <div class="disorder-option">
                                        <span>לא</span>
                                        <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'general', 'huntington', 'לא', this)">
                                    </div>
                                </div>
                            </div>

                            <!-- Myotonic Dystrophy -->
                            <div class="disorder-question" data-question="${memberId}-myotonic">
                                <div class="disorder-question-header">
                                    <span class="disorder-question-number">7.</span>
                                    <span class="disorder-question-text">מיוטוניק דיסטרופי אצל הורים, אחים:</span>
                                </div>
                                <div class="disorder-options">
                                    <div class="disorder-option">
                                        <span>כן</span>
                                        <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'general', 'myotonic', 'כן', this)">
                                    </div>
                                    <div class="disorder-option">
                                        <span>לא</span>
                                        <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'general', 'myotonic', 'לא', this)">
                                    </div>
                                </div>
                            </div>

                            <!-- Celiac -->
                            <div class="disorder-question" data-question="${memberId}-celiac">
                                <div class="disorder-question-header">
                                    <span class="disorder-question-number">8.</span>
                                    <span class="disorder-question-text">צליאק אצל אחד או יותר מקרובי המשפחה (הורים, אחים):</span>
                                </div>
                                <div class="disorder-options">
                                    <div class="disorder-option">
                                        <span>כן</span>
                                        <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'general', 'celiac', 'כן', this)">
                                    </div>
                                    <div class="disorder-option">
                                        <span>לא</span>
                                        <input type="checkbox" class="disorder-option-checkbox" onchange="selectFamilyDisorderOption('${memberId}', 'general', 'celiac', 'לא', this)">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (memberCheckboxItem) {
        memberCheckboxItem.insertAdjacentHTML('afterend', familyHistoryHTML);
    }
}

// Create member generic section dynamically
function createMemberGenericSection(memberId, questionId) {
    const memberCheckboxItem = document.querySelector(`input[onchange*="selectMember(1, '${memberId}', this)"]`).closest('.member-checkbox-item');
    
    const genericHTML = `
        <div class="member-generic-section" id="member-${memberId}-q${questionId}" style="display: none;">
            <!-- Generic Section -->
            <div class="generic-section">
                <div class="generic-header">
                    <span>בחר את התשובה המתאימה</span>
                </div>
                <div class="generic-divider"></div>
                
                <div class="generic-options">
                    <div class="generic-option">
                        <span>כן</span>
                        <input type="radio" name="generic-${questionId}" value="yes">
                    </div>
                    <div class="generic-option">
                        <span>לא</span>
                        <input type="radio" name="generic-${questionId}" value="no">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (memberCheckboxItem) {
        memberCheckboxItem.insertAdjacentHTML('afterend', genericHTML);
    }
}

// Handle follow-up questions
function saveFollowupAnswer(memberId, answerType, value) {
    console.log(`Follow-up answer saved: Member ${memberId}, ${answerType}: ${value}`);
    
    // Initialize follow-up answers for this member if not exists
    if (!formState.followupAnswers[memberId]) {
        formState.followupAnswers[memberId] = {};
    }
    
    // Save the answer
    formState.followupAnswers[memberId][answerType] = value;
    
    // Update progress if needed
    updateProgress();
}

// Create follow-up section dynamically for family members
function createFollowupSection(memberId) {
    return `
        <div class="followup-questions" id="followup-questions-${memberId}" style="display: none;">
            <div class="followup-question">
                <div class="followup-question-header">
                    <span class="followup-question-text">כמות בני משפחה חלו בשם המחלה:</span>
                </div>
                <div class="followup-input-container">
                    <input type="number" class="followup-input" min="1" max="10" placeholder="הכנס מספר" onchange="saveFollowupAnswer('${memberId}', 'quantity', this.value)">
                </div>
            </div>
            
            <div class="followup-question">
                <div class="followup-question-header">
                    <span class="followup-question-text">מה גיל הצעיר מביניהם:</span>
                </div>
                <div class="followup-input-container">
                    <input type="number" class="followup-input" min="0" max="120" placeholder="הכנס גיל" onchange="saveFollowupAnswer('${memberId}', 'youngest_age', this.value)">
                </div>
            </div>
        </div>
    `;
}

// Neurological disorders functions for Question 3
function selectNeurological(member, disorder, checkbox) {
    // Store the answer (you can expand this as needed)
    console.log(`Member: ${member}, Disorder: ${disorder}, Selected: ${checkbox.checked}`);
    
    // Update checkbox visual
    updateCheckboxVisual(checkbox);
    
    // If disorder has detail questions, show/hide them
    const detailsId = `${member}-${disorder}-details`;
    const detailsElement = document.getElementById(detailsId);
    
    if (detailsElement) {
        detailsElement.style.display = checkbox.checked ? 'block' : 'none';
    } else if (checkbox.checked) {
        // Create detailed questions section for specific disorders
        createNeurologicalDetailsSection(member, disorder, checkbox);
    }
    
    // Add/remove elegant indicator for disorders with follow-up questions
    const indicatorId = `${member}-${disorder}-indicator`;
    let indicator = document.getElementById(indicatorId);
    
    if (checkbox.checked && (disorder === 'epilepsy' || disorder === 'migraine' || disorder === 'facial-paralysis' || disorder === 'meningitis')) {
        if (!indicator) {
            // Create elegant indicator that appears on the LEFT side of the specific item
            const checkboxItem = checkbox.closest('.disorder-checkbox-item');
            const indicatorHTML = `
                <div id="${indicatorId}" class="disorder-indicator-container" style="
                    display: inline-flex;
                    align-items: center;
                    margin-left: 15px;
                    cursor: pointer;
                    padding: 6px 12px;
                    background: linear-gradient(135deg, #59D189 0%, #45B871 100%);
                    border-radius: 20px;
                    box-shadow: 0 2px 8px rgba(89, 209, 137, 0.3);
                    transition: all 0.3s ease;
                    animation: slideInFromLeft 0.5s ease-out;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    position: absolute;
                    left: -200px;
                    z-index: 10;
                " onclick="scrollToNeurologicalDetails('${member}', '${disorder}')" 
                   onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(89, 209, 137, 0.4)'" 
                   onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 8px rgba(89, 209, 137, 0.3)'">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="margin-left: 6px;">
                        <path d="M7 14L12 9L17 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(180 12 12)"/>
                    </svg>
                    <span style="
                        color: white;
                        font-size: 12px;
                        font-weight: 600;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
                        white-space: nowrap;
                    ">שאלות נוספות למטה</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="margin-right: 6px;">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="white" opacity="0.9"/>
                    </svg>
                </div>
            `;
            
            // Make the parent item relative for absolute positioning
            checkboxItem.style.position = 'relative';
            checkboxItem.insertAdjacentHTML('beforeend', indicatorHTML);
        }
        
        // Add pulse animation to draw attention
        setTimeout(() => {
            const indicatorElement = document.getElementById(indicatorId);
            if (indicatorElement) {
                indicatorElement.style.animation = 'gentlePulse 2s ease-in-out';
            }
        }, 600);
        
    } else if (indicator) {
        // Remove indicator with fade-out animation to the left
        indicator.style.animation = 'fadeOutToLeft 0.3s ease-in';
        setTimeout(() => {
            if (indicator && indicator.parentNode) {
                indicator.remove();
                // Reset parent position if no more indicators
                const parent = indicator.parentNode;
                if (parent && !parent.querySelector('.disorder-indicator-container')) {
                    parent.style.position = '';
                }
            }
        }, 300);
    }
}

// Add smooth scroll function to navigate to neurological details
function scrollToNeurologicalDetails(member, disorder) {
    const detailsElement = document.getElementById(`${member}-${disorder}-details`);
    
    if (detailsElement) {
        // Add a gentle highlight effect before scrolling
        detailsElement.style.transition = 'all 0.3s ease';
        detailsElement.style.transform = 'scale(1.02)';
        detailsElement.style.boxShadow = '0 8px 25px rgba(89, 209, 137, 0.15)';
        detailsElement.style.border = '2px solid rgba(89, 209, 137, 0.3)';
        detailsElement.style.borderRadius = '8px';
        
        // Smooth scroll with offset for better positioning
        const elementTop = detailsElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementTop - 80; // 80px offset from top
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        // Remove highlight effect after scroll
        setTimeout(() => {
            detailsElement.style.transform = 'scale(1)';
            detailsElement.style.boxShadow = '';
            detailsElement.style.border = '';
            detailsElement.style.borderRadius = '';
        }, 1500);
        
        // Add a subtle "found it" feedback
        const indicator = document.getElementById(`${member}-${disorder}-indicator`);
        if (indicator) {
            const originalBg = indicator.style.background;
            indicator.style.background = 'linear-gradient(135deg, #45B871 0%, #3A9B5C 100%)';
            indicator.innerHTML = indicator.innerHTML.replace('שאלות נוספות למטה', 'נמצא! 👆');
            
            setTimeout(() => {
                indicator.style.background = originalBg;
                indicator.innerHTML = indicator.innerHTML.replace('נמצא! 👆', 'שאלות נוספות למטה');
            }, 2000);
        }
    }
}

// Create detailed questions section for neurological disorders
function createNeurologicalDetailsSection(member, disorder, checkbox) {
    let detailsHTML = '';
    
    if (disorder === 'epilepsy') {
        detailsHTML = `
            <div class="disorder-details" id="${member}-${disorder}-details" style="display: block;">
                <div class="disorder-details-content">
                    <div class="disorder-title-wrapper">
                        <h4 class="disorder-title">אפילפסיה</h4>
                        <div class="question-indicator"></div>
                    </div>
                    
                    <div class="disorder-questions">
                        <div class="disorder-question">
                            <div class="disorder-question-header">
                                <span class="disorder-question-number">1.1</span>
                                <span class="disorder-question-text">אובחנה במהלך חצי השנה האחרונה:</span>
                            </div>
                            <div class="disorder-options">
                                <div class="disorder-option">
                                    <span>כן</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'recent-diagnosis', 'כן', this)">
                                </div>
                                <div class="disorder-option">
                                    <span>לא</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'recent-diagnosis', 'לא', this)">
                                </div>
                            </div>
                        </div>

                        <div class="disorder-question">
                            <div class="disorder-question-header">
                                <span class="disorder-question-number">1.2</span>
                                <span class="disorder-question-text">מאופיינת באירועי:</span>
                            </div>
                            <div class="disorder-options">
                                <div class="disorder-option">
                                    <span>התנתקות (פטיט מל)</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'seizure-type', 'התנתקות', this)">
                                </div>
                                <div class="disorder-option">
                                    <span>בפרכוסים (גרנד מל)</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'seizure-type', 'בפרכוסים', this)">
                                </div>
                            </div>
                        </div>

                        <div class="disorder-question">
                            <div class="disorder-question-header">
                                <span class="disorder-question-number">1.3</span>
                                <span class="disorder-question-text">נוטל טיפול תרופתי:</span>
                            </div>
                            <div class="disorder-options">
                                <div class="disorder-option">
                                    <span>כן</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'medication', 'כן', this)">
                                </div>
                                <div class="disorder-option">
                                    <span>לא</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'medication', 'לא', this)">
                                </div>
                            </div>
                        </div>

                        <div class="disorder-question">
                            <div class="disorder-question-header">
                                <span class="disorder-question-number">1.4</span>
                                <span class="disorder-question-text">ישנם התקפים:</span>
                            </div>
                            <div class="disorder-options">
                                <div class="disorder-option">
                                    <span>כן</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'has-seizures', 'כן', this)">
                                </div>
                                <div class="disorder-option">
                                    <span>לא</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'has-seizures', 'לא', this)">
                                </div>
                            </div>
                            
                            <div class="disorder-question" style="margin-top: 15px;">
                                <div class="disorder-question-header">
                                    <span class="disorder-question-number">1.4.1</span>
                                    <span class="disorder-question-text">מספר התקפים בשנה:</span>
                                </div>
                                <div class="disorder-input">
                                    <input type="number" class="disorder-text-input" placeholder="מספר התקפים" min="0" onchange="saveNeurologicalInput('${member}', '${disorder}', 'seizures-per-year', this.value)">
                                </div>
                            </div>
                        </div>

                        <div class="disorder-question">
                            <div class="disorder-question-header">
                                <span class="disorder-question-number">1.5</span>
                                <span class="disorder-question-text">מתי ההתקף האחרון:</span>
                            </div>
                            
                            <div class="disorder-question" style="margin-top: 10px;">
                                <div class="disorder-question-header">
                                    <span class="disorder-question-text">אם בשנה האחרונה - לפני כמה חודשים:</span>
                                </div>
                                <div class="disorder-input">
                                    <input type="number" class="disorder-text-input" placeholder="חודשים" min="0" max="12" onchange="saveNeurologicalInput('${member}', '${disorder}', 'last-seizure-months', this.value)">
                                </div>
                            </div>
                            
                            <div class="disorder-question" style="margin-top: 10px;">
                                <div class="disorder-question-header">
                                    <span class="disorder-question-text">אם לפני מעל שנה - לפני כמה שנים:</span>
                                </div>
                                <div class="disorder-input">
                                    <input type="number" class="disorder-text-input" placeholder="שנים" min="1" onchange="saveNeurologicalInput('${member}', '${disorder}', 'last-seizure-years', this.value)">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (disorder === 'migraine') {
        detailsHTML = `
            <div class="disorder-details" id="${member}-${disorder}-details" style="display: block;">
                <div class="disorder-details-content">
                    <div class="disorder-title-wrapper">
                        <h4 class="disorder-title">מיגרנה</h4>
                        <div class="question-indicator"></div>
                    </div>
                    
                    <div class="disorder-questions">
                        <div class="disorder-question">
                            <div class="disorder-question-header">
                                <span class="disorder-question-number">3.1</span>
                                <span class="disorder-question-text">היעדרות מהעבודה של יותר מ-5 ימים בחודש במהלך החצי שנה האחרונה עקב התקפי המיגרנה?</span>
                            </div>
                            <div class="disorder-options">
                                <div class="disorder-option">
                                    <span>כן</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'work-absence', 'כן', this)">
                                </div>
                                <div class="disorder-option">
                                    <span>לא</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'work-absence', 'לא', this)">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (disorder === 'facial-paralysis') {
        detailsHTML = `
            <div class="disorder-details" id="${member}-${disorder}-details" style="display: block;">
                <div class="disorder-details-content">
                    <div class="disorder-title-wrapper">
                        <h4 class="disorder-title">פציאליס</h4>
                        <div class="question-indicator"></div>
                    </div>
                    
                    <div class="disorder-questions">
                        <div class="disorder-question">
                            <div class="disorder-question-header">
                                <span class="disorder-question-number">15.1</span>
                                <span class="disorder-question-text">היה בשנה האחרונה:</span>
                            </div>
                            <div class="disorder-options">
                                <div class="disorder-option">
                                    <span>כן</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'recent-year', 'כן', this)">
                                </div>
                                <div class="disorder-option">
                                    <span>לא</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'recent-year', 'לא', this)">
                                </div>
                            </div>
                        </div>

                        <div class="disorder-question">
                            <div class="disorder-question-header">
                                <span class="disorder-question-number">15.2</span>
                                <span class="disorder-question-text">מתי היה:</span>
                            </div>
                            
                            <div class="disorder-question" style="margin-top: 10px;">
                                <div class="disorder-question-header">
                                    <span class="disorder-question-text">אם בשנה האחרונה - לפני כמה חודשים:</span>
                                </div>
                                <div class="disorder-input">
                                    <input type="number" class="disorder-text-input" placeholder="חודשים" min="0" max="12" onchange="saveNeurologicalInput('${member}', '${disorder}', 'when-months', this.value)">
                                </div>
                            </div>
                            
                            <div class="disorder-question" style="margin-top: 10px;">
                                <div class="disorder-question-header">
                                    <span class="disorder-question-text">אם מעל שנה - לפני כמה שנים:</span>
                                </div>
                                <div class="disorder-input">
                                    <input type="number" class="disorder-text-input" placeholder="שנים" min="1" onchange="saveNeurologicalInput('${member}', '${disorder}', 'when-years', this.value)">
                                </div>
                            </div>
                        </div>

                        <div class="disorder-question">
                            <div class="disorder-question-header">
                                <span class="disorder-question-number">15.3</span>
                                <span class="disorder-question-text">נותר נזק שארי:</span>
                            </div>
                            <div class="disorder-options">
                                <div class="disorder-option">
                                    <span>כן</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'residual-damage', 'כן', this)">
                                </div>
                                <div class="disorder-option">
                                    <span>לא</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'residual-damage', 'לא', this)">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (disorder === 'meningitis') {
        detailsHTML = `
            <div class="disorder-details" id="${member}-${disorder}-details" style="display: block;">
                <div class="disorder-details-content">
                    <div class="disorder-title-wrapper">
                        <h4 class="disorder-title">דלקת קרום המוח (מנינגיטיס)</h4>
                        <div class="question-indicator"></div>
                    </div>
                    
                    <div class="disorder-questions">
                        <div class="disorder-question">
                            <div class="disorder-question-header">
                                <span class="disorder-question-number">5.1</span>
                                <span class="disorder-question-text">היתה במהלך 6 החודשים האחרונים:</span>
                            </div>
                            <div class="disorder-options">
                                <div class="disorder-option">
                                    <span>כן</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'recent', 'כן', this)">
                                </div>
                                <div class="disorder-option">
                                    <span>לא</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'recent', 'לא', this)">
                                </div>
                            </div>
                        </div>

                        <div class="disorder-question">
                            <div class="disorder-question-header">
                                <span class="disorder-question-number">5.2</span>
                                <span class="disorder-question-text">האם נותר נזק שארי ו/או אחר:</span>
                            </div>
                            <div class="disorder-options">
                                <div class="disorder-option">
                                    <span>כן</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'residual-damage', 'כן', this)">
                                </div>
                                <div class="disorder-option">
                                    <span>לא</span>
                                    <input type="checkbox" class="disorder-option-checkbox" onchange="selectNeurologicalOption('${member}', '${disorder}', 'residual-damage', 'לא', this)">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Add the details section to the neurological disorders section (back to original behavior)
    if (detailsHTML) {
        const neurologicalSection = document.getElementById(`member-${member}-neurological`);
        if (neurologicalSection) {
            neurologicalSection.insertAdjacentHTML('beforeend', detailsHTML);
            
            // Scroll to the details section smoothly
            setTimeout(() => {
                const detailsElement = document.getElementById(`${member}-${disorder}-details`);
                if (detailsElement) {
                    detailsElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start',
                        inline: 'nearest'
                    });
                }
            }, 100);
        }
    }
}

// Handle neurological option selection
function selectNeurologicalOption(memberId, disorderId, questionId, option, checkbox) {
    console.log(`Neurological option: ${memberId} - ${disorderId} - ${questionId} - ${option}: ${checkbox.checked}`);
    
    // Initialize nested structures
    if (!formState.memberDetails[memberId]) {
        formState.memberDetails[memberId] = {};
    }
    if (!formState.memberDetails[memberId].neurological) {
        formState.memberDetails[memberId].neurological = {};
    }
    if (!formState.memberDetails[memberId].neurological[disorderId]) {
        formState.memberDetails[memberId].neurological[disorderId] = {};
    }
    
    // Uncheck other checkboxes in the same question group (radio-like behavior)
    const questionElement = checkbox.closest('.disorder-question');
    if (questionElement) {
        const allCheckboxes = questionElement.querySelectorAll('.disorder-option-checkbox');
        allCheckboxes.forEach(cb => {
            if (cb !== checkbox) {
                cb.checked = false;
            }
        });
    }
    
    // Update state
    if (checkbox.checked) {
        formState.memberDetails[memberId].neurological[disorderId][questionId] = option;
    } else {
        delete formState.memberDetails[memberId].neurological[disorderId][questionId];
    }
    
    console.log('Updated neurological details:', formState.memberDetails[memberId].neurological);
}

// Handle neurological input
function saveNeurologicalInput(memberId, disorderId, questionId, value) {
    console.log(`Neurological input: ${memberId} - ${disorderId} - ${questionId} - ${value}`);
    
    // Initialize nested structures
    if (!formState.memberDetails[memberId]) {
        formState.memberDetails[memberId] = {};
    }
    if (!formState.memberDetails[memberId].neurological) {
        formState.memberDetails[memberId].neurological = {};
    }
    if (!formState.memberDetails[memberId].neurological[disorderId]) {
        formState.memberDetails[memberId].neurological[disorderId] = {};
    }
    
    // Save the input value
    formState.memberDetails[memberId].neurological[disorderId][questionId] = value;
    
    console.log('Updated neurological input details:', formState.memberDetails[memberId].neurological);
}

// New functions for table mode
function toggleViewMode() {
    const normalMode = document.getElementById('normal-mode');
    const tableMode = document.getElementById('table-mode');
    const switchText = document.getElementById('switch-text');
    
    formState.currentViewMode = formState.currentViewMode === 'normal' ? 'table' : 'normal';
    
    if (formState.currentViewMode === 'table') {
        normalMode.classList.add('hidden');
        tableMode.classList.add('active');
        switchText.textContent = 'מצב רגיל';
        
        // Sync data from normal to table mode
        syncNormalToTable();
        
        // Setup table mode event listeners
        setupTableModeListeners();
    } else {
        normalMode.classList.remove('hidden');
        tableMode.classList.remove('active');
        switchText.textContent = 'מצב טבלה';
        
        // Sync data from table to normal mode
        syncTableToNormal();
    }
    
    updateProgress();
}

// Handle table radio button answers
function handleTableAnswer(questionId, memberId, answer) {
    console.log(`Table answer: Q${questionId}, Member: ${memberId}, Answer: ${answer}`);
    
    // Initialize if needed
    if (!formState.tableAnswers[questionId]) {
        formState.tableAnswers[questionId] = {};
    }
    
    // Save the answer
    formState.tableAnswers[questionId][memberId] = answer;
    
    // Show/hide follow-up sections based on "yes" answers
    updateTableFollowupSections(questionId);
    
    // Update progress
    updateTableProgress();
    
    console.log('Current table answers:', formState.tableAnswers);
}

// Update table progress and enable/disable next button
function updateTableProgress() {
    const totalAnswers = 16; // 4 questions × 4 members
    let answeredCount = 0;
    
    // Count answered questions
    for (let q = 1; q <= 4; q++) {
        if (formState.tableAnswers[q]) {
            ['israel', 'sara', 'david', 'michal'].forEach(member => {
                if (formState.tableAnswers[q][member]) {
                    answeredCount++;
                }
            });
        }
    }
    
    const nextBtn = document.querySelector('.next-btn');
    if (answeredCount === totalAnswers) {
        nextBtn.classList.remove('disabled');
        nextBtn.disabled = false;
    } else {
        nextBtn.classList.add('disabled');
        nextBtn.disabled = true;
    }
    
    console.log(`Table progress: ${answeredCount}/${totalAnswers} answered`);
}

// Update follow-up sections visibility
function updateTableFollowupSections(questionId) {
    const followupSection = document.getElementById(`table-followup-q${questionId}`);
    const followupContent = document.getElementById(`table-followup-content-q${questionId}`);
    
    if (!followupSection || !followupContent) return;
    
    // Check if any member answered "yes" for this question
    const hasYesAnswers = formState.tableAnswers[questionId] && 
        Object.values(formState.tableAnswers[questionId]).some(answer => answer === 'yes');
    
    if (hasYesAnswers) {
        followupSection.classList.add('show');
        generateTableFollowupContent(questionId, followupContent);
    } else {
        followupSection.classList.remove('show');
        followupContent.innerHTML = '';
    }
}

// Generate follow-up content for table mode
function generateTableFollowupContent(questionId, container) {
    const membersWithYes = [];
    
    // Find members who answered "yes"
    if (formState.tableAnswers[questionId]) {
        Object.entries(formState.tableAnswers[questionId]).forEach(([memberId, answer]) => {
            if (answer === 'yes') {
                membersWithYes.push(memberId);
            }
        });
    }
    
    if (membersWithYes.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    // Generate content based on question type
    let content = '';
    
    membersWithYes.forEach(memberId => {
        const memberName = getMemberDisplayName(memberId);
        content += `<div class="table-member-section">`;
        content += `<div class="table-member-title">${memberName}</div>`;
        
        switch (questionId) {
            case 1: // Mental health disorders
                content += generateMentalHealthTableContent(memberId);
                break;
            case 2: // Family history
                content += generateFamilyHistoryTableContent(memberId);
                break;
            case 3: // Neurological
                content += generateNeurologicalTableContent(memberId);
                break;
            case 4: // Hospitalizations
                content += generateHospitalizationsTableContent(memberId);
                break;
        }
        
        content += `</div>`;
    });
    
    container.innerHTML = content;
    
    // Add event listeners to the new content
    addTableFollowupEventListeners(questionId, membersWithYes);
}

// Generate mental health content for table mode
function generateMentalHealthTableContent(memberId) {
    const disorders = [
        { id: 'depression', name: 'דיכאון' },
        { id: 'mood-disorder', name: 'הפרעת מצב רוח' },
        { id: 'anxiety', name: 'חרדה' },
        { id: 'major-depression', name: 'דיכאון מג\'ורי' },
        { id: 'ocd', name: 'OCD' },
        { id: 'postpartum-depression', name: 'דיכאון לאחר לידה' },
        { id: 'eating-disorders', name: 'הפרעות אכילה' }
    ];
    
    let content = '<div class="table-disorders-grid">';
    
    disorders.forEach(disorder => {
        content += `
            <div class="table-disorder-item">
                <div class="table-disorder-checkbox">
                    <input type="checkbox" id="table-${memberId}-${disorder.id}" 
                           onchange="handleTableDisorderSelection('${memberId}', '${disorder.id}', this)">
                    <span>${disorder.name}</span>
                </div>
                <div class="table-disorder-details" id="table-${memberId}-${disorder.id}-details">
                    <div class="table-disorder-question">
                        <div class="table-disorder-question-text">מועד האבחון:</div>
                        <div class="table-disorder-options">
                            <div class="table-disorder-option">
                                <input type="radio" id="table-${memberId}-${disorder.id}-timing-recent" 
                                       name="table-${memberId}-${disorder.id}-timing" value="recent">
                                <label for="table-${memberId}-${disorder.id}-timing-recent">אובחן בשנה האחרונה</label>
                            </div>
                            <div class="table-disorder-option">
                                <input type="radio" id="table-${memberId}-${disorder.id}-timing-two-years" 
                                       name="table-${memberId}-${disorder.id}-timing" value="two-years">
                                <label for="table-${memberId}-${disorder.id}-timing-two-years">בשנתיים האחרונות</label>
                            </div>
                            <div class="table-disorder-option">
                                <input type="radio" id="table-${memberId}-${disorder.id}-timing-older" 
                                       name="table-${memberId}-${disorder.id}-timing" value="older">
                                <label for="table-${memberId}-${disorder.id}-timing-older">לפני 3 שנים</label>
                            </div>
                        </div>
                    </div>
                    <div class="table-disorder-question">
                        <div class="table-disorder-question-text">אשפוז:</div>
                        <div class="table-disorder-options">
                            <div class="table-disorder-option">
                                <input type="radio" id="table-${memberId}-${disorder.id}-hospitalization-yes" 
                                       name="table-${memberId}-${disorder.id}-hospitalization" value="yes">
                                <label for="table-${memberId}-${disorder.id}-hospitalization-yes">כן</label>
                            </div>
                            <div class="table-disorder-option">
                                <input type="radio" id="table-${memberId}-${disorder.id}-hospitalization-no" 
                                       name="table-${memberId}-${disorder.id}-hospitalization" value="no">
                                <label for="table-${memberId}-${disorder.id}-hospitalization-no">לא</label>
                            </div>
                        </div>
                    </div>
                    <div class="table-disorder-question">
                        <div class="table-disorder-question-text">נכות:</div>
                        <div class="table-disorder-options">
                            <div class="table-disorder-option">
                                <input type="radio" id="table-${memberId}-${disorder.id}-disability-yes" 
                                       name="table-${memberId}-${disorder.id}-disability" value="yes">
                                <label for="table-${memberId}-${disorder.id}-disability-yes">כן</label>
                            </div>
                            <div class="table-disorder-option">
                                <input type="radio" id="table-${memberId}-${disorder.id}-disability-no" 
                                       name="table-${memberId}-${disorder.id}-disability" value="no">
                                <label for="table-${memberId}-${disorder.id}-disability-no">לא</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    content += '</div>';
    return content;
}

// Generate family history content for table mode
function generateFamilyHistoryTableContent(memberId) {
    const diseases = [
        { id: 'colon-cancer', name: 'סרטן המעי הגס' },
        { id: 'breast-cancer', name: 'סרטן השד' },
        { id: 'ovarian-cancer', name: 'סרטן השחלות' },
        { id: 'prostate-cancer', name: 'סרטן הערמונית' },
        { id: 'multiple-sclerosis', name: 'טרשת נפוצה' },
        { id: 'als', name: 'ALS' },
        { id: 'parkinson', name: 'פרקינסון' },
        { id: 'alzheimer', name: 'אלצהיימר' }
    ];
    
    let content = '<div class="table-disorders-grid">';
    
    diseases.forEach(disease => {
        content += `
            <div class="table-disorder-item">
                <div class="table-disorder-checkbox">
                    <input type="checkbox" id="table-family-${memberId}-${disease.id}" 
                           onchange="handleTableFamilyDiseaseSelection('${memberId}', '${disease.id}', this)">
                    <span>${disease.name}</span>
                </div>
            </div>
        `;
    });
    
    content += '</div>';
    return content;
}

// Generate neurological content for table mode
function generateNeurologicalTableContent(memberId) {
    const disorders = [
        { id: 'epilepsy', name: 'אפילפסיה' },
        { id: 'headaches', name: 'כאבי ראש שהחלו בחצי השנה האחרונה' },
        { id: 'migraine', name: 'מיגרנה' },
        { id: 'encephalitis', name: 'דלקת המוח (אנצפליטיס)' },
        { id: 'meningitis', name: 'דלקת קרום המוח (מנינגיטיס)' },
        { id: 'head-trauma', name: 'חבלת ראש עם נזק מוחי או גולגלתי' },
        { id: 'brain-tumor', name: 'גידול במוח ומערכת העצבים' },
        { id: 'ms', name: 'טרשת נפוצה' },
        { id: 'parkinson', name: 'פרקינסון' },
        { id: 'stroke', name: 'שבץ מוחי (CVA)' },
        { id: 'autism', name: 'אוטיזם ו/או PDD' },
        { id: 'adhd', name: 'הפרעות קשב וריכוז' }
    ];
    
    let content = '<div class="table-disorders-grid">';
    
    disorders.forEach(disorder => {
        content += `
            <div class="table-disorder-item">
                <div class="table-disorder-checkbox">
                    <input type="checkbox" id="table-neuro-${memberId}-${disorder.id}" 
                           onchange="handleTableNeurologicalSelection('${memberId}', '${disorder.id}', this)">
                    <span>${disorder.name}</span>
                </div>
            </div>
        `;
    });
    
    content += '</div>';
    return content;
}

// Generate hospitalizations content for table mode
function generateHospitalizationsTableContent(memberId) {
    return `
        <div class="table-disorder-item">
            <div class="table-disorder-question">
                <div class="table-disorder-question-text">פרטי אשפוז/ניתוח/בדיקה מיוחדת:</div>
                <textarea rows="4" cols="50" placeholder="אנא פרט..." 
                          style="width: 100%; padding: 10px; border: 1px solid #E2E3EA; border-radius: 6px; resize: vertical; direction: rtl; text-align: right;"></textarea>
            </div>
        </div>
    `;
}

// Handle disorder selection in table mode
function handleTableDisorderSelection(memberId, disorderId, checkbox) {
    const detailsSection = document.getElementById(`table-${memberId}-${disorderId}-details`);
    
    if (checkbox.checked) {
        detailsSection.classList.add('show');
    } else {
        detailsSection.classList.remove('show');
        // Clear all related radio buttons
        const radioButtons = detailsSection.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => radio.checked = false);
    }
}

// Handle family disease selection in table mode
function handleTableFamilyDiseaseSelection(memberId, diseaseId, checkbox) {
    // Save selection to form state
    if (!formState.tableFollowupAnswers) {
        formState.tableFollowupAnswers = {};
    }
    if (!formState.tableFollowupAnswers[2]) {
        formState.tableFollowupAnswers[2] = {};
    }
    if (!formState.tableFollowupAnswers[2][memberId]) {
        formState.tableFollowupAnswers[2][memberId] = {};
    }
    
    formState.tableFollowupAnswers[2][memberId][diseaseId] = checkbox.checked;
}

// Handle neurological selection in table mode
function handleTableNeurologicalSelection(memberId, disorderId, checkbox) {
    // Save selection to form state
    if (!formState.tableFollowupAnswers) {
        formState.tableFollowupAnswers = {};
    }
    if (!formState.tableFollowupAnswers[3]) {
        formState.tableFollowupAnswers[3] = {};
    }
    if (!formState.tableFollowupAnswers[3][memberId]) {
        formState.tableFollowupAnswers[3][memberId] = {};
    }
    
    formState.tableFollowupAnswers[3][memberId][disorderId] = checkbox.checked;
}

// Add event listeners for table followup content
function addTableFollowupEventListeners(questionId, memberIds) {
    // Add any additional event listeners needed for the dynamic content
    console.log(`Added table followup event listeners for Q${questionId}, members:`, memberIds);
}

// Get member display name
function getMemberDisplayName(memberId) {
    const memberNames = {
        'israel': 'ישראל ישראלי',
        'sara': 'שרה ישראלי',
        'david': 'דוד ישראלי',
        'michal': 'מיכל ישראלי'
    };
    return memberNames[memberId] || memberId;
}

// Setup table mode event listeners
function setupTableModeListeners() {
    // Auto answer toggle for table mode
    const tableAutoAnswer = document.getElementById('tableAutoAnswer');
    if (tableAutoAnswer) {
        tableAutoAnswer.addEventListener('change', function() {
            if (this.checked) {
                setAllTableAnswersToNo();
            } else {
                clearAllTableAnswers();
            }
        });
    }
}

// Set all table answers to "no"
function setAllTableAnswersToNo() {
    const questions = [1, 2, 3, 4];
    const members = ['israel', 'sara', 'david', 'michal'];
    
    questions.forEach(q => {
        members.forEach(member => {
            const radioNo = document.getElementById(`q${q}-${member}-no`);
            if (radioNo) {
                radioNo.checked = true;
                handleTableAnswer(q, member, 'no');
            }
        });
    });
}

// Clear all table answers
function clearAllTableAnswers() {
    const questions = [1, 2, 3, 4];
    const members = ['israel', 'sara', 'david', 'michal'];
    
    questions.forEach(q => {
        members.forEach(member => {
            const radioYes = document.getElementById(`q${q}-${member}-yes`);
            const radioNo = document.getElementById(`q${q}-${member}-no`);
            if (radioYes) radioYes.checked = false;
            if (radioNo) radioNo.checked = false;
            
            if (formState.tableAnswers[q]) {
                delete formState.tableAnswers[q][member];
            }
        });
        
        // Hide followup sections
        const followupSection = document.getElementById(`table-followup-q${q}`);
        if (followupSection) {
            followupSection.classList.remove('show');
        }
    });
    
    updateTableProgress();
}

function syncTableToNormal() {
    // Convert table answers to normal mode format
    // This function can be called when switching modes to maintain data consistency
    Object.keys(formState.tableAnswers).forEach(questionId => {
        let hasYesAnswers = false;
        
        Object.keys(formState.tableAnswers[questionId]).forEach(memberId => {
            const answer = formState.tableAnswers[questionId][memberId];
            
            // Update normal mode state based on table answers
            if (answer === 'yes') {
                hasYesAnswers = true;
                if (!formState.selectedMembers[questionId]) {
                    formState.selectedMembers[questionId] = {};
                }
                formState.selectedMembers[questionId][memberId] = true;
            }
        });
        
        // Set the main question answer
        formState.answers[questionId] = hasYesAnswers ? 'yes' : 'no';
        
        // Update UI buttons
        updateQuestionButtons(questionId, formState.answers[questionId]);
    });
}

function syncNormalToTable() {
    // Convert normal mode answers to table format
    // Clear existing table answers first
    formState.tableAnswers = {};
    
    // Initialize all members with 'no' answers first
    const members = ['israel', 'sara', 'david', 'michal'];
    for (let q = 1; q <= 4; q++) {
        formState.tableAnswers[q] = {};
        members.forEach(member => {
            formState.tableAnswers[q][member] = 'no';
        });
    }
    
    // Override with 'yes' answers from normal mode
    Object.keys(formState.selectedMembers).forEach(questionId => {
        Object.keys(formState.selectedMembers[questionId]).forEach(memberId => {
            const isSelected = formState.selectedMembers[questionId][memberId];
            
            if (!formState.tableAnswers[questionId]) {
                formState.tableAnswers[questionId] = {};
            }
            
            if (isSelected) {
                formState.tableAnswers[questionId][memberId] = 'yes';
            }
        });
    });
    
    // Update all table radio buttons
    for (let q = 1; q <= 4; q++) {
        members.forEach(member => {
            const answer = formState.tableAnswers[q][member];
            const radioButton = document.getElementById(`q${q}-${member}-${answer}`);
            if (radioButton) {
                radioButton.checked = true;
            }
        });
    }
    
    // Update table progress
    updateTableProgress();
}