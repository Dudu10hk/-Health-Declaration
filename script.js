// Global state management
let formState = {
    answers: {},
    selectedMembers: {},
    memberDetails: {},
    selectedDisorders: {}
};

// Family members data
const familyMembers = {
    yuval: { name: 'יובל ישראלי', type: 'מבוטח ראשי' },
    esti: { name: 'אסתי ישראלי', type: 'בת זוג' },
    yaakov: { name: 'יעקב ישראלי', type: 'ילד' },
    noam: { name: 'נועם ישראלי', type: 'ילדה' }
};

// Disorders data
const disorders = {
    'major-depression': { name: 'דיכאון מג\'ורי', questions: ['timing', 'hospitalization', 'duration', 'disability', 'percentage'] },
    'postpartum-depression': { name: 'דיכאון לאחר לידה', questions: ['timing', 'hospitalization', 'duration'] },
    'ocd': { name: 'OCD', questions: ['timing', 'treatment'] },
    'eating-disorders': { name: 'הפרעות אכילה', questions: ['timing', 'type', 'treatment'] },
    'anxiety': { name: 'חרדה', questions: ['timing'] },
    'mood-disorder': { name: 'הפרעת מצב רוח', questions: ['timing', 'treatment'] },
    'depression': { name: 'דיכאון', questions: ['timing', 'hospitalization', 'duration', 'disability', 'percentage'] }
};

// Questions configuration
const questions = {
    1: {
        title: 'מחלות תורשתיות',
        text: 'האם ככל הידוע לך, קיימת אצל אחד או יותר מקרובי משפחתך מדרגה ראשונה...',
        subQuestions: {
            diseases: {
                type: 'multiselect',
                label: 'בחר את המחלות הרלוונטיות',
                options: ['סרטן השד', 'סרטן השחלות', 'סרטן הערמונית', 'סרטן המעי הגס', 'כליות פוליציסטיות', 'צליאק', 'טרשת נפוצה', 'פרקינסון', 'אלצהיימר']
            },
            relatives: {
                type: 'number',
                label: 'כמה קרובי משפחה?'
            },
            ages: {
                type: 'text',
                label: 'גילאי האבחון'
            }
        }
    },
    2: {
        title: 'הפרעות נפש',
        text: 'האם ככל הידוע לך, קיימת אצל אחד או יותר מקרובי משפחתך מדרגה ראשונה, הפרעת נפש לרבות דיכאון?',
        subQuestions: {
            disorders: {
                type: 'multiselect',
                label: 'בחר את ההפרעות הרלוונטיות',
                options: ['דיכאון', 'חרדה', 'הפרעת מצב רוח', 'OCD', 'הפרעות אכילה', 'דיכאון לאחר לידה', 'דיכאון מג\'ורי']
            },
            timing: {
                type: 'radio',
                label: 'מתי אובחן?',
                options: ['בשנה האחרונה', 'בשנתיים האחרונות', 'לפני 3 שנים ומעלה']
            },
            hospitalization: {
                type: 'radio',
                label: 'האם היה אשפוז?',
                options: ['כן', 'לא']
            },
            duration: {
                type: 'text',
                label: 'משך האשפוז'
            },
            disability: {
                type: 'radio',
                label: 'האם נקבעה נכות?',
                options: ['כן', 'לא']
            },
            percentage: {
                type: 'number',
                label: 'אחוז הנכות'
            }
        }
    },
    3: {
        title: 'הפרעות שלד ושרירים',
        text: 'האם אתה סובל הפרעה במערכת שלד ושרירים?',
        subQuestions: {
            conditions: {
                type: 'multiselect',
                label: 'בחר את ההפרעות הרלוונטיות',
                options: ['פריצת דיסק', 'דלקת פרקים', 'שבר עצם', 'קרע ברצועות', 'דלקת גידים']
            },
            severity: {
                type: 'radio',
                label: 'רמת החומרה',
                options: ['קלה', 'בינונית', 'חמורה']
            },
            treatment: {
                type: 'radio',
                label: 'האם מקבל טיפול?',
                options: ['כן', 'לא']
            }
        }
    },
    4: {
        title: 'תרופות קבועות',
        text: 'האם אתה נוטל תרופות באופן קבוע?',
        subQuestions: {
            medications: {
                type: 'textarea',
                label: 'פרט את התרופות'
            },
            duration: {
                type: 'text',
                label: 'משך הטיפול'
            },
            reason: {
                type: 'text',
                label: 'סיבת הטיפול'
            }
        }
    },
    5: {
        title: 'אלרגיות',
        text: 'האם אתה סובל מאלרגיות?',
        subQuestions: {
            allergens: {
                type: 'multiselect',
                label: 'סוגי אלרגיות',
                options: ['מזון', 'תרופות', 'אבקה', 'בעלי חיים', 'צמחים', 'חומרי ניקוי']
            },
            severity: {
                type: 'radio',
                label: 'חומרת התגובה',
                options: ['קלה', 'בינונית', 'חמורה', 'מסכנת חיים']
            },
            treatment: {
                type: 'text',
                label: 'טיפול נדרש'
            }
        }
    },
    6: {
        title: 'היסטוריה משפחתית',
        text: 'האם ככל הידוע לך, קיימת אצל אחד או יותר מקרובי משפחתך מדרגה ראשונה, מקרים של המחלות הבאות: סרטן, מחלות כליות, סכרת, מחלות לב, שבץ מוחי, אלצהיימר, פרקינסון?',
        subQuestions: {
            diseases: {
                type: 'multiselect',
                label: 'בחר את המחלות הרלוונטיות',
                options: ['סרטן', 'מחלות כליות', 'סכרת', 'מחלות לב', 'שבץ מוחי', 'אלצהיימר', 'פרקינסון']
            },
            relatives: {
                type: 'number',
                label: 'כמה קרובי משפחה?'
            },
            ages: {
                type: 'text',
                label: 'גילאי האבחון'
            }
        }
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
    
    console.log('Form initialized with new disorder structure');
    
    // Don't pre-select any disorders - let the user make their selections
    // formState.selectedDisorders.yuval = {
    //     'depression': true,
    //     'anxiety': true
    // };
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
    
    // Show/hide member disorders section
    const disordersSection = document.getElementById(`member-${memberId}-disorders`);
    if (disordersSection) {
        disordersSection.style.display = checkbox.checked ? 'block' : 'none';
    }
    
    // Generate or remove member details based on selection
    if (checkbox.checked) {
        // Member was selected - ensure disorders section is visible
        console.log(`Showing disorders for ${memberId}`);
    } else {
        // Member was deselected - hide disorders section
        console.log(`Hiding disorders for ${memberId}`);
        
        // Clear member's disorder selections
        if (formState.selectedDisorders[memberId]) {
            formState.selectedDisorders[memberId] = {};
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
    for (let i = 1; i <= 6; i++) {
        answerQuestion(i, 'no');
    }
    
    // Hide all member selection sections
    document.querySelectorAll('.members-selection').forEach(section => {
        section.style.display = 'none';
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
    
    // Clear form state
    formState.selectedMembers = {};
    formState.memberDetails = {};
}

function clearMemberSelectionsForQuestion(questionId) {
    console.log(`Clearing member selections for question ${questionId}`);
    
    // Clear from form state
    delete formState.selectedMembers[questionId];
    delete formState.memberDetails[questionId];
    
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
    }
}

function updateProgress() {
    // Count answered questions
    const totalQuestions = 6;
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
    if (Object.keys(formState.answers).length < 6) {
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
    }
    
    // Update checkbox visual
    updateCheckboxVisual(checkbox);
}

// Handle disorder option selection (for individual questions within disorders)
function selectDisorderOption(memberId, disorderId, questionId, option, checkbox) {
    console.log(`Option selected: ${memberId} - ${disorderId} - ${questionId} - ${option}`);
    
    // For single-select questions, uncheck other options
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
    
    // Save the answer
    if (!formState.memberDetails[memberId]) {
        formState.memberDetails[memberId] = {};
    }
    if (!formState.memberDetails[memberId][disorderId]) {
        formState.memberDetails[memberId][disorderId] = {};
    }
    
    formState.memberDetails[memberId][disorderId][questionId] = checkbox.checked ? option : null;
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
    
    formState.memberDetails[memberId][disorderId][questionId] = value;
}