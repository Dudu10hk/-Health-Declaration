// Global state management
let formState = {
    answers: {},
    selectedMembers: {},
    memberDetails: {},
    selectedDisorders: {},
    followupAnswers: {} // Added for follow-up questions
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
            if (this.checked) {
                setAllAnswersToNo();
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
    console.log(`Question ${questionId} answered: ${answer}`);
    
    // Update form state
    formState.answers[questionId] = answer;
    
    // Update UI
    updateQuestionButtons(questionId, answer);
    
    // Show/hide member selection based on answer
    const membersSection = document.getElementById(`members-${questionId}`);
    if (membersSection) {
        if (answer === 'yes') {
            membersSection.style.display = 'block';
        } else {
            membersSection.style.display = 'none';
            // Clear member selections for this question
            clearMemberSelectionsForQuestion(questionId);
        }
    }
    
    // Update progress
    updateProgress();
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

function selectMember(questionId, memberId, checkbox) {
    console.log(`Member ${memberId} for question ${questionId}: ${checkbox.checked}`);
    
    // Update form state
    if (!formState.selectedMembers[questionId]) {
        formState.selectedMembers[questionId] = {};
    }
    formState.selectedMembers[questionId][memberId] = checkbox.checked;
    
    // Update checkbox visual
    updateCheckboxVisual(checkbox);
    
    // Show/hide appropriate section based on question type
    let sectionId;
    if (questionId === 1) {
        sectionId = `member-${memberId}-disorders`;
    } else if (questionId === 2) {
        sectionId = `member-${memberId}-family-history`;
    } else {
        sectionId = `member-${memberId}-q${questionId}`;
    }
    
    let disordersSection = document.getElementById(sectionId);
    
    if (checkbox.checked) {
        if (!disordersSection && questionId === 1) {
            // Create the disorders section dynamically for question 1
            createMemberDisordersSection(memberId);
            disordersSection = document.getElementById(sectionId);
        } else if (!disordersSection && questionId === 2) {
            // Create family history section dynamically for question 2
            createMemberFamilyHistorySection(memberId);
            disordersSection = document.getElementById(sectionId);
        } else if (!disordersSection) {
            // Create generic section for other questions
            createMemberGenericSection(memberId, questionId);
            disordersSection = document.getElementById(sectionId);
        }
        
        if (disordersSection) {
            disordersSection.style.display = 'block';
        }
        console.log(`Showing section for ${memberId} question ${questionId}`);
    } else {
        if (disordersSection) {
            disordersSection.style.display = 'none';
        }
        console.log(`Hiding section for ${memberId} question ${questionId}`);
        
        // Clear member's selections
        if (formState.selectedDisorders[memberId]) {
            if (questionId === 2) {
                delete formState.selectedDisorders[memberId].familyHistory;
            } else {
                formState.selectedDisorders[memberId] = {};
            }
        }
    }
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

function setAllAnswersToNo() {
    console.log('Setting all answers to "no"');
    
    // Answer all questions with "no"
    for (let i = 1; i <= 4; i++) {
        answerQuestion(i, 'no');
    }
    
    // Clear all follow-up answers
    formState.followupAnswers = {};
    
    // Hide all member selection sections
    document.querySelectorAll('.members-selection').forEach(section => {
        section.style.display = 'none';
    });
    
    // Clear and hide all follow-up questions
    const followupSections = document.querySelectorAll('[id^="followup-questions-"]');
    followupSections.forEach(section => {
        section.style.display = 'none';
        const inputs = section.querySelectorAll('.followup-input');
        inputs.forEach(input => input.value = '');
    });
    
    // Enable the next button
    const nextBtn = document.querySelector('.next-btn');
    if (nextBtn) {
        nextBtn.classList.remove('disabled');
        nextBtn.style.cursor = 'pointer';
    }
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

function updateProgress() {
    // Count answered questions
    const totalQuestions = 4;
    const answeredQuestions = Object.keys(formState.answers).length;
    
    // Calculate progress based on current step + answered questions
    // We are currently on step 6 (הצהרת בריאות), so 5 steps are completed + partial progress
    const completedSteps = 5; // Steps 1-5 are fully completed
    const currentStepProgress = answeredQuestions / totalQuestions; // Progress within current step
    const totalSteps = 9;
    const overallProgress = (completedSteps + currentStepProgress) / totalSteps;
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        const maxWidth = 914; // Based on the original design
        const newWidth = (maxWidth * overallProgress);
        progressFill.style.width = `${newWidth}px`;
    }
    
    // Enable/disable next button
    const nextBtn = document.querySelector('.next-btn');
    if (nextBtn) {
        if (answeredQuestions === totalQuestions) {
            nextBtn.classList.remove('disabled');
            nextBtn.style.cursor = 'pointer';
        } else {
            nextBtn.classList.add('disabled');
            nextBtn.style.cursor = 'not-allowed';
        }
    }
    
    console.log(`Progress: ${answeredQuestions}/${totalQuestions} questions answered, overall: ${(overallProgress * 100).toFixed(1)}%`);
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
    // This function is no longer needed as follow-up questions are now included
    // in the createMemberFamilyHistorySection function
    return;
}