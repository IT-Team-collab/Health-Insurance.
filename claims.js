document.addEventListener('DOMContentLoaded', () => {
    // Tab switching functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Form submission handling
    const claimForm = document.getElementById('claimsForm');
    if (claimForm) {
        claimForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Add your form submission logic here
            alert('Claim submitted successfully!');
            claimForm.reset();
        });
    }
});

class ClaimsSystem {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.setupEventListeners();
        this.claims = this.loadClaims();
        this.setupTabSwitching();
        this.initializeMultiStepForm();
        this.loadClaimsData();
    }

    setupEventListeners() {
        const claimForm = document.getElementById('claimsForm');
        if (claimForm) {
            claimForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleClaimSubmission(e.target);
            });
        }

        // Next button
        const nextBtn = document.querySelector('.next-step');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        // Previous button
        const prevBtn = document.querySelector('.prev-step');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousStep());
        }

        // Form input change handlers for review section
        const formInputs = document.querySelectorAll('#claimsForm input, #claimsForm select, #claimsForm textarea');
        formInputs.forEach(input => {
            input.addEventListener('change', () => this.updateReviewSection());
        });
    }

    initializeMultiStepForm() {
        this.updateProgressBar();
        this.showCurrentStep();
    }

    updateProgressBar() {
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach((step, index) => {
            const stepNum = index + 1;
            if (stepNum < this.currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNum === this.currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

    showCurrentStep() {
        const formSteps = document.querySelectorAll('.form-step');
        formSteps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Show/hide navigation buttons
        const prevBtn = document.querySelector('.prev-step');
        const nextBtn = document.querySelector('.next-step');
        const submitBtn = document.querySelector('.submit-claim');

        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
        }

        if (nextBtn) {
            nextBtn.style.display = this.currentStep < this.totalSteps ? 'block' : 'none';
        }

        if (submitBtn) {
            submitBtn.style.display = this.currentStep === this.totalSteps ? 'block' : 'none';
        }

        // Update review section if on last step
        if (this.currentStep === this.totalSteps) {
            this.updateReviewSection();
        }
    }

    nextStep() {
        if (this.validateCurrentStep() && this.currentStep < this.totalSteps) {
            this.captureStepData();
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

    validateCurrentStep() {
        const currentFormStep = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const requiredFields = currentFormStep.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value) {
                isValid = false;
                field.classList.add('error');
                field.addEventListener('input', () => {
                    if (field.value) {
                        field.classList.remove('error');
                    }
                }, { once: true });
            }
        });

        if (!isValid) {
            const notifications = new NotificationSystem();
            notifications.push('Please fill all required fields', 'error');
        }

        return isValid;
    }

    captureStepData() {
        const currentFormStep = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const inputs = currentFormStep.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name) {
                this.formData[input.name] = input.value;
            }
        });
    }

    updateReviewSection() {
        // Capture current form data
        const form = document.getElementById('claimsForm');
        const formData = new FormData(form);
        
        // Update review fields
        document.getElementById('reviewClaimType').textContent = this.getClaimTypeName(formData.get('claimType') || '');
        document.getElementById('reviewServiceDate').textContent = formData.get('serviceDate') || '';
        document.getElementById('reviewProvider').textContent = formData.get('provider') || '';
        document.getElementById('reviewAmount').textContent = formData.get('amount') ? `$${parseFloat(formData.get('amount')).toFixed(2)}` : '$0.00';
        document.getElementById('reviewDescription').textContent = formData.get('description') || 'No description provided';
        
        // Update documents list
        const fileList = document.querySelector('.file-list');
        let documentsText = 'No documents uploaded';
        
        if (fileList && fileList.querySelectorAll('.file-preview').length > 0) {
            documentsText = Array.from(fileList.querySelectorAll('.file-preview'))
                .map(el => el.querySelector('.file-name').textContent)
                .join(', ');
        }
        
        document.getElementById('reviewDocuments').textContent = documentsText;
    }

    getClaimTypeName(value) {
        const claimTypes = {
            'medical': 'Medical Visit',
            'prescription': 'Prescription',
            'dental': 'Dental',
            'vision': 'Vision',
            'other': 'Other'
        };
        
        return claimTypes[value] || 'Not specified';
    }

    setupTabSwitching() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons and contents
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Add active class to clicked button and corresponding content
                btn.classList.add('active');
                document.getElementById(btn.dataset.tab).classList.add('active');
            });
        });
    }

    loadClaims() {
        return JSON.parse(localStorage.getItem('claims') || '[]');
    }

    saveClaims() {
        localStorage.setItem('claims', JSON.stringify(this.claims));
    }

    async handleClaimSubmission(form) {
        const notifications = new NotificationSystem();
        
        try {
            const formData = new FormData(form);
            
            // Validate service date
            let serviceDate = formData.get('serviceDate');
            try {
                const dateParts = serviceDate.split('-');
                if (dateParts.length === 3) {
                    const validDate = new Date(serviceDate);
                    if (!isNaN(validDate.getTime())) {
                        serviceDate = validDate.toISOString();
                    }
                }
            } catch (e) {
                console.error('Date parsing error:', e);
                // If there's an error, we'll keep the original value
            }
            
            // Validate amount
            let amount = formData.get('amount');
            if (amount) {
                // Remove any non-numeric characters except decimal point
                amount = amount.replace(/[^0-9.]/g, '');
                // Parse as float
                amount = parseFloat(amount);
                if (isNaN(amount)) {
                    amount = 0;
                }
            } else {
                amount = 0;
            }
            
            // Create claim data object
            const claimData = {
                id: 'CLM' + Date.now(),
                date: serviceDate,
                type: formData.get('claimType') || 'medical',
                provider: formData.get('provider') || 'Not specified',
                amount: amount,
                description: formData.get('description') || '',
                status: 'pending',
                submittedAt: new Date().toISOString(),
                documents: [], // Store file names
                // Get the user's selected plan type from localStorage or default to Basic Plan
                planType: localStorage.getItem('selectedPlan') || 'Basic Plan'
            };

            // Get uploaded files
            const fileList = document.querySelector('.file-list');
            if (fileList) {
                const fileElements = fileList.querySelectorAll('.file-preview.uploaded');
                fileElements.forEach(el => {
                    const fileName = el.querySelector('.file-name').textContent;
                    claimData.documents.push(fileName);
                });
            }

            // For testing/debugging
            console.log('Submitting claim data:', claimData);

            // Add to claims array
            this.claims.unshift(claimData);
            this.saveClaims();
            
            notifications.push('Claim submitted successfully!', 'success');
            
            // Reset form and file list
            form.reset();
            if (fileList) {
                fileList.innerHTML = '';
            }
            
            // Reset form steps
            this.currentStep = 1;
            this.updateProgressBar();
            this.showCurrentStep();
            
            // Redirect to claims status page after 2 seconds
            setTimeout(() => {
                window.location.href = 'claims-status.html';
            }, 2000);
        } catch (error) {
            console.error('Error submitting claim:', error);
            notifications.push('Failed to submit claim. Please try again.', 'error');
        }
    }

    loadClaimsData() {
        // Load claims for tracking tab
        const claimsList = document.querySelector('.claims-list');
        if (claimsList) {
            this.displayClaims(claimsList);
        }

        // Load claims for history tab
        const historyTable = document.getElementById('historyTableBody');
        if (historyTable) {
            this.displayClaimsHistory(historyTable);
        }

        // Setup history filters
        const historyPeriod = document.getElementById('historyPeriod');
        const historyType = document.getElementById('historyType');
        if (historyPeriod && historyType) {
            historyPeriod.addEventListener('change', () => this.filterHistory());
            historyType.addEventListener('change', () => this.filterHistory());
        }

        // Setup tracking filters
        const statusFilter = document.getElementById('statusFilter');
        const dateFilter = document.getElementById('dateFilter');
        const searchInput = document.querySelector('.search-input input');
        if (statusFilter && dateFilter && searchInput) {
            statusFilter.addEventListener('change', () => this.filterClaims());
            dateFilter.addEventListener('change', () => this.filterClaims());
            searchInput.addEventListener('input', () => this.filterClaims());
        }
    }

    displayClaims(container) {
        if (this.claims.length === 0) {
            container.innerHTML = `
                <div class="no-claims">
                    <i class="fas fa-file-medical-alt"></i>
                    <h3>No Claims Found</h3>
                    <p>You haven't submitted any claims yet.</p>
                </div>
            `;
            return;
        }

        let html = '';
        this.claims.forEach(claim => {
            html += `
                <div class="claim-card" data-id="${claim.id}">
                    <div class="claim-header">
                        <h3>${this.getClaimTypeName(claim.type)}</h3>
                        <span class="status-badge status-${claim.status}">${this.capitalizeFirst(claim.status)}</span>
                    </div>
                    <div class="claim-details">
                        <p><strong>Date:</strong> ${this.formatDate(claim.date)}</p>
                        <p><strong>Provider:</strong> ${claim.provider}</p>
                        <p><strong>Amount:</strong> $${claim.amount.toFixed(2)}</p>
                        <p><strong>Claim ID:</strong> ${claim.id}</p>
                    </div>
                    <div class="claim-actions">
                        <button class="btn primary view-details" data-id="${claim.id}">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add event listeners for view details buttons
        const viewButtons = container.querySelectorAll('.view-details');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const claimId = button.dataset.id;
                // Handle view details - for now, just log
                console.log('View details for claim:', claimId);
            });
        });
    }

    displayClaimsHistory(table) {
        if (this.claims.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="6" class="no-data">No claims history found</td>
                </tr>
            `;
            this.updateHistoryStats(0, 0, 0);
            return;
        }

        let html = '';
        this.claims.forEach(claim => {
            html += `
                <tr>
                    <td>${claim.id}</td>
                    <td>${this.formatDate(claim.date)}</td>
                    <td>${this.getClaimTypeName(claim.type)}</td>
                    <td>$${claim.amount.toFixed(2)}</td>
                    <td><span class="status-badge status-${claim.status}">${this.capitalizeFirst(claim.status)}</span></td>
                    <td>
                        <button class="btn-icon view-details" data-id="${claim.id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        table.innerHTML = html;
        this.updateHistoryStats();
    }

    updateHistoryStats(totalClaims = null, approved = null, totalAmount = null) {
        const statCounts = document.querySelectorAll('.stat-card .count');
        if (statCounts.length >= 3) {
            if (totalClaims === null) {
                // Calculate stats from filtered claims
                const filteredClaims = this.getFilteredClaims();
                totalClaims = filteredClaims.length;
                approved = filteredClaims.filter(claim => claim.status === 'approved').length;
                totalAmount = filteredClaims.reduce((sum, claim) => sum + claim.amount, 0);
            }

            statCounts[0].textContent = totalClaims;
            statCounts[1].textContent = approved;
            statCounts[2].textContent = '$' + totalAmount.toFixed(2);
        }
    }

    filterHistory() {
        const historyPeriod = document.getElementById('historyPeriod');
        const historyType = document.getElementById('historyType');
        
        if (!historyPeriod || !historyType) return;
        
        const periodValue = historyPeriod.value;
        const typeValue = historyType.value;
        
        const filteredClaims = this.claims.filter(claim => {
            // Filter by period
            let includePeriod = true;
            if (periodValue !== 'all') {
                const months = parseInt(periodValue);
                const cutoffDate = new Date();
                cutoffDate.setMonth(cutoffDate.getMonth() - months);
                const claimDate = new Date(claim.date);
                includePeriod = claimDate >= cutoffDate;
            }
            
            // Filter by type
            let includeType = true;
            if (typeValue !== 'all') {
                includeType = claim.type === typeValue;
            }
            
            return includePeriod && includeType;
        });
        
        const historyTable = document.getElementById('historyTableBody');
        if (historyTable) {
            if (filteredClaims.length === 0) {
                historyTable.innerHTML = `
                    <tr>
                        <td colspan="6" class="no-data">No claims match your filters</td>
                    </tr>
                `;
            } else {
                let html = '';
                filteredClaims.forEach(claim => {
                    html += `
                        <tr>
                            <td>${claim.id}</td>
                            <td>${this.formatDate(claim.date)}</td>
                            <td>${this.getClaimTypeName(claim.type)}</td>
                            <td>$${claim.amount.toFixed(2)}</td>
                            <td><span class="status-badge status-${claim.status}">${this.capitalizeFirst(claim.status)}</span></td>
                            <td>
                                <button class="btn-icon view-details" data-id="${claim.id}" title="View Details">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
                historyTable.innerHTML = html;
            }
        }
        
        // Update stats
        const totalClaims = filteredClaims.length;
        const approved = filteredClaims.filter(claim => claim.status === 'approved').length;
        const totalAmount = filteredClaims.reduce((sum, claim) => sum + claim.amount, 0);
        this.updateHistoryStats(totalClaims, approved, totalAmount);
    }

    filterClaims() {
        const statusFilter = document.getElementById('statusFilter');
        const dateFilter = document.getElementById('dateFilter');
        const searchInput = document.querySelector('.search-input input');
        
        if (!statusFilter || !dateFilter || !searchInput) return;
        
        const statusValue = statusFilter.value;
        const dateValue = dateFilter.value;
        const searchValue = searchInput.value.toLowerCase();
        
        const filteredClaims = this.claims.filter(claim => {
            // Filter by status
            let includeStatus = true;
            if (statusValue) {
                includeStatus = claim.status === statusValue;
            }
            
            // Filter by date
            let includeDate = true;
            if (dateValue) {
                const days = parseInt(dateValue);
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - days);
                const claimDate = new Date(claim.date);
                includeDate = claimDate >= cutoffDate;
            }
            
            // Filter by search
            let includeSearch = true;
            if (searchValue) {
                includeSearch = claim.id.toLowerCase().includes(searchValue) || 
                               claim.provider.toLowerCase().includes(searchValue) ||
                               this.getClaimTypeName(claim.type).toLowerCase().includes(searchValue);
            }
            
            return includeStatus && includeDate && includeSearch;
        });
        
        const claimsList = document.querySelector('.claims-list');
        if (claimsList) {
            if (filteredClaims.length === 0) {
                claimsList.innerHTML = `
                    <div class="no-claims">
                        <i class="fas fa-search"></i>
                        <h3>No Claims Found</h3>
                        <p>No claims match your search criteria.</p>
                    </div>
                `;
            } else {
                let html = '';
                filteredClaims.forEach(claim => {
                    html += `
                        <div class="claim-card" data-id="${claim.id}">
                            <div class="claim-header">
                                <h3>${this.getClaimTypeName(claim.type)}</h3>
                                <span class="status-badge status-${claim.status}">${this.capitalizeFirst(claim.status)}</span>
                            </div>
                            <div class="claim-details">
                                <p><strong>Date:</strong> ${this.formatDate(claim.date)}</p>
                                <p><strong>Provider:</strong> ${claim.provider}</p>
                                <p><strong>Amount:</strong> $${claim.amount.toFixed(2)}</p>
                                <p><strong>Claim ID:</strong> ${claim.id}</p>
                            </div>
                            <div class="claim-actions">
                                <button class="btn primary view-details" data-id="${claim.id}">
                                    <i class="fas fa-eye"></i> View Details
                                </button>
                            </div>
                        </div>
                    `;
                });
                claimsList.innerHTML = html;
            }
        }
    }

    getFilteredClaims() {
        const historyPeriod = document.getElementById('historyPeriod');
        const historyType = document.getElementById('historyType');
        
        if (!historyPeriod || !historyType) return this.claims;
        
        const periodValue = historyPeriod.value;
        const typeValue = historyType.value;
        
        return this.claims.filter(claim => {
            // Filter by period
            let includePeriod = true;
            if (periodValue !== 'all') {
                const months = parseInt(periodValue);
                const cutoffDate = new Date();
                cutoffDate.setMonth(cutoffDate.getMonth() - months);
                const claimDate = new Date(claim.date);
                includePeriod = claimDate >= cutoffDate;
            }
            
            // Filter by type
            let includeType = true;
            if (typeValue !== 'all') {
                includeType = claim.type === typeValue;
            }
            
            return includePeriod && includeType;
        });
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            return date.toLocaleDateString();
        } catch (e) {
            console.error('Error formatting date:', e);
            return 'Invalid Date';
        }
    }

    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

// Initialize Claims System
document.addEventListener('DOMContentLoaded', () => {
    new ClaimsSystem();
}); 