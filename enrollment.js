class EnrollmentSystem {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {};
        this.init();
    }

    init() {
        // Check if user is logged in
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            // Redirect to login with return URL
            window.location.href = `login.html?redirect=enrollment.html`;
            return;
        }

        this.setupEventListeners();
        this.updateProgressBar();
        this.loadUserData();
        this.showCurrentStep();

        // Debug log
        console.log('Enrollment system initialized');
    }

    setupEventListeners() {
        // Get buttons
        const nextBtn = document.querySelector('.next-step');
        const prevBtn = document.querySelector('.prev-step');
        const addMemberBtn = document.querySelector('.add-member');
        
        // Debug logs
        console.log('Next button:', nextBtn);
        console.log('Previous button:', prevBtn);
        console.log('Add member button:', addMemberBtn);

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Next button clicked');
                this.nextStep();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Previous button clicked');
                this.previousStep();
            });
        }

        if (addMemberBtn) {
            addMemberBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Add member button clicked');
                this.addFamilyMember();
            });
        }

        // Handle form submissions
        document.querySelectorAll('.enrollment-step form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const stepData = Object.fromEntries(formData.entries());
                const stepNumber = e.target.closest('.enrollment-step').id.replace('step', '');
                this.formData[`step${stepNumber}`] = stepData;
                
                // If this is the plan selection step, update the summary
                if (stepNumber === '2' && stepData.selectedPlan) {
                    this.updatePlanSummary(stepData.selectedPlan);
                    // Store selected plan in localStorage
                    localStorage.setItem('selectedPlan', stepData.selectedPlan);
                }
            });
        });

        // Handle medical history form visibility
        document.getElementById('conditions-yes')?.addEventListener('change', () => {
            document.querySelector('.conditions-details').style.display = 'block';
        });
        document.getElementById('conditions-no')?.addEventListener('change', () => {
            document.querySelector('.conditions-details').style.display = 'none';
        });

        document.getElementById('medications-yes')?.addEventListener('change', () => {
            document.querySelector('.medications-details').style.display = 'block';
        });
        document.getElementById('medications-no')?.addEventListener('change', () => {
            document.querySelector('.medications-details').style.display = 'none';
        });

        // Handle plan selection
        const planOptions = document.querySelectorAll('input[name="selectedPlan"]');
        planOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                this.updatePlanSummary(e.target.value);
                // Store selected plan in localStorage
                localStorage.setItem('selectedPlan', e.target.value);
                console.log('Plan selected and stored:', e.target.value);
            });
        });
    }

    async loadUserData() {
        // Get user data from auth system
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        
        // Pre-fill form fields
        const nameInput = document.getElementById('fullName');
        const emailInput = document.getElementById('email');
        if (nameInput) nameInput.value = userData.name || '';
        if (emailInput) emailInput.value = userData.email || '';
    }

    updateProgressBar() {
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach((step, index) => {
            const stepNum = index + 1;
            if (stepNum < this.currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNum === this.currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('completed', 'active');
            }
        });
    }

    showCurrentStep() {
        document.querySelectorAll('.enrollment-step').forEach(step => {
            step.classList.add('hidden');
        });
        const currentStep = document.getElementById(`step${this.currentStep}`);
        if (currentStep) {
            currentStep.classList.remove('hidden');
        }

        // Update navigation buttons
        const prevBtn = document.querySelector('.prev-step');
        const nextBtn = document.querySelector('.next-step');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
        }
        if (nextBtn) {
            nextBtn.textContent = this.currentStep === this.totalSteps ? 'Submit' : 'Next';
        }
    }

    validateCurrentStep() {
        const currentForm = document.querySelector(`#step${this.currentStep} form`);
        if (!currentForm) return true;

        const isValid = currentForm.checkValidity();
        if (!isValid) {
            currentForm.reportValidity();
        }
        return isValid;
    }

    saveStepData(form) {
        const formData = new FormData(form);
        this.formData[`step${this.currentStep}`] = Object.fromEntries(formData.entries());
    }

    nextStep() {
        if (!this.validateCurrentStep()) return;

        if (this.currentStep === this.totalSteps) {
            this.submitEnrollment();
        } else {
            this.currentStep++;
            this.updateProgressBar();
            this.showCurrentStep();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateProgressBar();
            this.showCurrentStep();
        }
    }

    addFamilyMember() {
        const familyMembers = document.querySelector('.family-members-list');
        const memberCount = familyMembers.querySelectorAll('.family-member').length + 1;
        
        const memberHTML = `
            <div class="family-member">
                <h4>Family Member ${memberCount}</h4>
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" name="familyMember${memberCount}Name" required>
                </div>
                <div class="form-group">
                    <label>Relationship</label>
                    <select name="familyMember${memberCount}Relationship" required>
                        <option value="">Select relationship</option>
                        <option value="spouse">Spouse</option>
                        <option value="child">Child</option>
                        <option value="parent">Parent</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Date of Birth</label>
                    <input type="date" name="familyMember${memberCount}DOB" required>
                </div>
                <button type="button" class="btn secondary remove-member" onclick="removeFamilyMember(this)">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        `;

        familyMembers.insertAdjacentHTML('beforeend', memberHTML);
    }

    removeFamilyMember(button) {
        button.closest('.family-member').remove();
    }

    async submitEnrollment() {
        const notifications = new NotificationSystem();
        
        try {
            // Simulate API call
            await this.submitEnrollmentData(this.formData);
            
            notifications.push('Enrollment submitted successfully!', 'success');
            
            // Redirect to claims status page after 2 seconds
            setTimeout(() => {
                window.location.href = 'claims-status.html';
            }, 1000);
        } catch (error) {
            notifications.push('Failed to submit enrollment. Please try again.', 'error');
        }
    }

    async submitEnrollmentData(data) {
        // Get the selected plan from step 2 data or localStorage
        const selectedPlan = data.step2?.selectedPlan || localStorage.getItem('selectedPlan') || 'basic';
        
        // Store the selected plan in localStorage for use in claims
        localStorage.setItem('selectedPlan', selectedPlan);
        
        // Format enrollment data into a claim
        const claim = {
            id: 'CLM' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            type: 'enrollment',
            planType: selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) + ' Plan',
            amount: this.getPlanAmount(selectedPlan),
            provider: 'HealthCare Plus',
            description: 'New enrollment application',
            status: 'pending',
            submittedAt: new Date().toISOString(),
            documents: []
        };

        // Save claim to localStorage
        const existingClaims = JSON.parse(localStorage.getItem('claims') || '[]');
        existingClaims.unshift(claim);
        localStorage.setItem('claims', JSON.stringify(existingClaims));

        // Simulate API call delay
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Enrollment data:', data);
                console.log('Created claim:', claim);
                resolve({ success: true });
            }, 1500);
        });
    }

    getPlanAmount(planType) {
        const planPrices = {
            'basic': 199,
            'standard': 299,
            'premium': 499
        };
        return planPrices[planType?.toLowerCase()] || 199;
    }

    updatePlanSummary(planType) {
        const summaryDetails = document.querySelector('.plan-summary');
        if (!summaryDetails) return;

        const plans = {
            basic: { name: 'Basic Plan', price: '$199/month' },
            standard: { name: 'Standard Plan', price: '$299/month' },
            premium: { name: 'Premium Plan', price: '$499/month' }
        };

        const plan = plans[planType];
        const personalInfo = this.formData.step1 || {};

        // Save the selected plan type to formData
        this.formData.selectedPlan = planType;

        summaryDetails.innerHTML = `
            <div class="summary-item">
                <h4>Selected Plan</h4>
                <p>${plan.name} - ${plan.price}</p>
            </div>
            <div class="summary-item">
                <h4>Primary Member</h4>
                <p>${personalInfo.fullName || ''}</p>
                <p>${personalInfo.email || ''}</p>
            </div>
            <div class="summary-item">
                <h4>Coverage Details</h4>
                <ul>
                    ${this.getPlanFeatures(planType)}
                </ul>
            </div>
        `;
    }

    getPlanFeatures(planType) {
        const features = {
            basic: [
                'Primary Care Visits',
                'Emergency Care',
                'Basic Prescriptions',
                'Preventive Care'
            ],
            standard: [
                'Primary Care Visits',
                'Emergency Care',
                'Extended Prescriptions',
                'Preventive Care',
                'Specialist Visits',
                'Basic Dental Coverage'
            ],
            premium: [
                'Unlimited Primary Care',
                'Priority Emergency Care',
                'Full Prescription Coverage',
                'Comprehensive Preventive Care',
                'Unlimited Specialist Visits',
                'Full Dental & Vision Coverage'
            ]
        };

        return features[planType]?.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('') || '';
    }
}

// Initialize Enrollment System
document.addEventListener('DOMContentLoaded', () => {
    // Create a global instance of the enrollment system
    window.enrollmentSystem = new EnrollmentSystem();
    
    // Make the addFamilyMember and removeFamilyMember methods globally accessible
    window.addFamilyMember = function() {
        window.enrollmentSystem.addFamilyMember();
    };
    
    window.removeFamilyMember = function(button) {
        window.enrollmentSystem.removeFamilyMember(button);
    };
}); 

