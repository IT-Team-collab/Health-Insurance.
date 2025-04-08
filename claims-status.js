document.addEventListener('DOMContentLoaded', function() {
    const claimsApp = {
        currentClaimId: null,

        init: function() {
            this.loadClaims();
        this.setupEventListeners();
            this.updateClaimsSummary();
        },

        setupEventListeners: function() {
        // Search functionality
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                    this.filterClaims(e.target.value.toLowerCase());
            });
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                    this.filterClaims(searchInput?.value?.toLowerCase() || '');
                });
            }

            // Date filter
            const dateFilter = document.getElementById('dateFilter');
            if (dateFilter) {
                dateFilter.addEventListener('change', () => {
                    this.filterClaims(searchInput?.value?.toLowerCase() || '');
                });
            }

            // Close modals
            document.querySelectorAll('.close-modal, .close-btn, .cancel-btn').forEach(button => {
                button.addEventListener('click', () => {
                    document.querySelectorAll('.modal').forEach(modal => {
                        modal.classList.remove('active');
                    });
                });
            });

            // Delete button in claim details modal
            const deleteBtn = document.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (this.currentClaimId) {
                        document.getElementById('claimDetailsModal').classList.remove('active');
                        document.getElementById('deleteConfirmModal').classList.add('active');
                    }
                });
            }

            // Confirm delete button
            const confirmDeleteBtn = document.querySelector('.confirm-delete-btn');
            if (confirmDeleteBtn) {
                confirmDeleteBtn.addEventListener('click', () => {
                    if (this.currentClaimId) {
                        this.deleteClaim(this.currentClaimId);
                        document.getElementById('deleteConfirmModal').classList.remove('active');
                    }
                });
            }
        },

        loadClaims: function() {
            // Get claims from localStorage
            let claims = JSON.parse(localStorage.getItem('claims') || '[]');
            
            // Process and normalize claim data
            claims = claims.map(claim => {
                // Ensure amount is a number
                if (claim.amount === undefined || claim.amount === null) {
                    claim.amount = 0;
                } else if (typeof claim.amount === 'string') {
                    // Remove any non-numeric characters except decimal point
                    const cleanedAmount = claim.amount.replace(/[^0-9.]/g, '');
                    claim.amount = parseFloat(cleanedAmount) || 0;
                }
                
                // Ensure dates are properly formatted
                if (!claim.date) {
                    claim.date = claim.submittedAt || new Date().toISOString();
                }
                
                // Ensure type has a value
                if (!claim.type) {
                    claim.type = 'Medical';
                }
                
                return claim;
            });
            
            // Sort claims by date (newest first)
            claims = claims.sort((a, b) => new Date(b.submittedAt || b.date) - new Date(a.submittedAt || a.date));
            
            this.displayClaims(claims);
        },

        displayClaims: function(claims) {
            const tableBody = document.getElementById('claimsTableBody');
            if (!tableBody) return;
            
            // Clear existing rows
            tableBody.innerHTML = '';
            
            if (claims.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="no-claims">
                            <i class="fas fa-info-circle"></i>
                            <p>No claims found</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Add claims to table
            claims.forEach(claim => {
                const row = document.createElement('tr');
                
                // Ensure numeric amount
                let numericAmount = 0;
                if (claim.amount !== undefined && claim.amount !== null) {
                    if (typeof claim.amount === 'string') {
                        numericAmount = parseFloat(claim.amount.replace(/[^0-9.]/g, '')) || 0;
                    } else {
                        numericAmount = parseFloat(claim.amount) || 0;
                    }
                }
                
                // Format date
                const formattedDate = this.formatDate(claim.serviceDate || claim.date);
                
                // Format amount with dollar sign and 2 decimal places
                const formattedAmount = this.formatAmount(numericAmount);
                
                // Claim type with proper capitalization
                const claimType = claim.type ? this.capitalizeFirstLetter(claim.type) : 'Medical';
                
                // Plan type with proper formatting
                const planType = claim.planType || 'Basic Plan';
                
                row.innerHTML = `
                <td>${claim.id}</td>
                    <td>${formattedDate}</td>
                    <td>${claimType}</td>
                    <td>${planType}</td>
                    <td>${formattedAmount}</td>
                    <td>
                        <span class="status-badge ${claim.status || 'pending'}">${this.capitalizeFirstLetter(claim.status || 'pending')}</span>
                </td>
                <td>
                        <button class="btn-icon view-claim" data-id="${claim.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon download-claim" data-id="${claim.id}">
                            <i class="fas fa-download"></i>
                    </button>
                </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Add event listeners to action buttons
            document.querySelectorAll('.view-claim').forEach(button => {
                button.addEventListener('click', (e) => {
                    const claimId = e.currentTarget.dataset.id;
                    this.viewClaimDetails(claimId);
                });
            });
            
            document.querySelectorAll('.download-claim').forEach(button => {
                button.addEventListener('click', (e) => {
                    const claimId = e.currentTarget.dataset.id;
                    this.downloadClaimSummary(claimId);
                });
            });
        },

        updateClaimsSummary: function() {
            const claims = JSON.parse(localStorage.getItem('claims') || '[]');
            
            const totalClaims = claims.length;
            const pendingClaims = claims.filter(claim => !claim.status || claim.status.toLowerCase() === 'pending').length;
            const approvedClaims = claims.filter(claim => claim.status && claim.status.toLowerCase() === 'approved').length;
            const rejectedClaims = claims.filter(claim => claim.status && claim.status.toLowerCase() === 'rejected').length;
            
            // Update summary counts
            document.querySelector('.summary-card:nth-child(1) .count').textContent = totalClaims;
            document.querySelector('.summary-card:nth-child(2) .count').textContent = pendingClaims;
            document.querySelector('.summary-card:nth-child(3) .count').textContent = approvedClaims;
            document.querySelector('.summary-card:nth-child(4) .count').textContent = rejectedClaims;
        },

        filterClaims: function(searchValue) {
            const statusValue = document.getElementById('statusFilter')?.value.toLowerCase() || '';
            const dateValue = document.getElementById('dateFilter')?.value || '';
            
            // Get all claims
            let claims = JSON.parse(localStorage.getItem('claims') || '[]');
            
            // Filter by search value
            if (searchValue) {
                claims = claims.filter(claim => {
                    return (
                        (claim.id && claim.id.toLowerCase().includes(searchValue)) ||
                        (claim.type && claim.type.toLowerCase().includes(searchValue)) ||
                        (claim.planType && claim.planType.toLowerCase().includes(searchValue)) ||
                        (claim.provider && claim.provider.toLowerCase().includes(searchValue)) ||
                        (claim.description && claim.description.toLowerCase().includes(searchValue))
                    );
                });
            }
            
            // Filter by status
            if (statusValue) {
                claims = claims.filter(claim => {
                    const claimStatus = claim.status?.toLowerCase() || 'pending';
                    return claimStatus === statusValue;
                });
            }
            
            // Filter by date
            if (dateValue) {
                const daysAgo = parseInt(dateValue);
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
                
                claims = claims.filter(claim => {
                    const claimDate = new Date(claim.submittedAt || claim.date);
                    return claimDate >= cutoffDate;
                });
            }
            
            // Display filtered claims
            this.displayClaims(claims);
        },

        viewClaimDetails: function(claimId) {
            // Set current claim ID
            this.currentClaimId = claimId;
            
            // Find the claim
            const claims = JSON.parse(localStorage.getItem('claims') || '[]');
            const claim = claims.find(c => c.id === claimId);
            
            if (!claim) {
                this.showNotification('Claim not found', 'error');
                return;
            }
            
            // Process and normalize claim data for display
            const processedClaim = { ...claim };
            
            // Ensure amount is properly formatted
            if (processedClaim.amount === undefined || processedClaim.amount === null) {
                processedClaim.amount = 0;
            } else if (typeof processedClaim.amount === 'string') {
                // Remove any non-numeric characters except decimal point
                const cleanedAmount = processedClaim.amount.replace(/[^0-9.]/g, '');
                processedClaim.amount = parseFloat(cleanedAmount) || 0;
            }
            
            // Get the modal
            const modal = document.getElementById('claimDetailsModal');
            const modalBody = modal.querySelector('.modal-body');
            
            // Format dates
            const submittedDate = this.formatDate(processedClaim.submittedAt || processedClaim.date);
            const serviceDate = this.formatDate(processedClaim.serviceDate || processedClaim.date);
            
            // Format amount
            const formattedAmount = this.formatAmount(processedClaim.amount);
            
            // Build document list
            let documentsHtml = '<p>No documents attached</p>';
            if (processedClaim.documents && processedClaim.documents.length > 0) {
                documentsHtml = `<ul class="document-list">`;
                processedClaim.documents.forEach(doc => {
                    if (typeof doc === 'string') {
                        documentsHtml += `<li><i class="fas fa-file"></i> ${doc}</li>`;
                    } else {
                        documentsHtml += `<li><i class="fas fa-file"></i> ${doc.name || 'Document'}</li>`;
                    }
                });
                documentsHtml += `</ul>`;
            }
            
            // Set modal content
        modalBody.innerHTML = `
            <div class="claim-detail-grid">
                <div class="detail-item">
                        <label>Claim ID:</label>
                        <span>${processedClaim.id}</span>
                    </div>
                    <div class="detail-item">
                        <label>Date Submitted:</label>
                        <span>${submittedDate}</span>
                    </div>
                    <div class="detail-item">
                        <label>Service Date:</label>
                        <span>${serviceDate}</span>
                </div>
                <div class="detail-item">
                        <label>Claim Type:</label>
                        <span>${this.capitalizeFirstLetter(processedClaim.type || 'Medical')}</span>
                </div>
                <div class="detail-item">
                        <label>Plan Type:</label>
                        <span>${processedClaim.planType || 'Basic Plan'}</span>
                </div>
                <div class="detail-item">
                        <label>Provider:</label>
                        <span>${processedClaim.provider || 'Not specified'}</span>
                </div>
                <div class="detail-item">
                        <label>Amount:</label>
                        <span>${formattedAmount}</span>
                </div>
                <div class="detail-item">
                        <label>Status:</label>
                        <span class="status-badge ${processedClaim.status || 'pending'}">${this.capitalizeFirstLetter(processedClaim.status || 'pending')}</span>
                </div>
                <div class="detail-item full-width">
                        <label>Description:</label>
                        <span>${processedClaim.description || 'No description provided'}</span>
                </div>
                    <div class="detail-item full-width">
                        <label>Documents:</label>
                        <div class="documents-list">
                            ${documentsHtml}
                        </div>
                    </div>
            </div>
        `;

            // Show modal
        modal.classList.add('active');
        },

        downloadClaimSummary: function(claimId) {
            // Find the claim
            const claims = JSON.parse(localStorage.getItem('claims') || '[]');
            const claim = claims.find(c => c.id === claimId);
            
            if (!claim) {
                this.showNotification('Claim not found', 'error');
                return;
            }
            
            // Format dates
            const submittedDate = this.formatDate(claim.submittedAt || claim.date);
            const serviceDate = this.formatDate(claim.serviceDate || claim.date);
            
            // Format amount
            const formattedAmount = this.formatAmount(claim.amount);
            
            // Create text content
            const content = `
HEALTHCARE PLUS INSURANCE CLAIM SUMMARY
--------------------------------------
Claim ID: ${claim.id}
Date Submitted: ${submittedDate}
Service Date: ${serviceDate}
Claim Type: ${this.capitalizeFirstLetter(claim.type || 'Medical')}
Plan Type: ${claim.planType || 'Basic Plan'}
Provider: ${claim.provider || 'Not specified'}
Amount: ${formattedAmount}
Status: ${this.capitalizeFirstLetter(claim.status || 'pending')}
Description: ${claim.description || 'No description provided'}

Documents:
${claim.documents && claim.documents.length > 0 
    ? claim.documents.map(doc => typeof doc === 'string' ? doc : doc.name).join('\n') 
    : 'No documents attached'
}
            `;
            
            // Create blob and download link
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Claim_${claim.id}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showNotification('Claim summary downloaded', 'success');
        },

        deleteClaim: function(claimId) {
            // Find and remove the claim
            let claims = JSON.parse(localStorage.getItem('claims') || '[]');
            claims = claims.filter(claim => claim.id !== claimId);
            
            // Save back to localStorage
            localStorage.setItem('claims', JSON.stringify(claims));
            
            // Reload claims
            this.loadClaims();
            
            // Update summary
            this.updateClaimsSummary();
            
            this.showNotification('Claim deleted successfully', 'success');
        },

        formatDate: function(dateString) {
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) {
                    return new Date().toLocaleDateString();
                }
                return date.toLocaleDateString();
            } catch (e) {
                return new Date().toLocaleDateString();
            }
        },

        formatAmount: function(amount) {
            try {
                // Handle various input types
                if (amount === undefined || amount === null) {
                    return '$0.00';
                }

                // Convert string amounts that might be formatted with $ or commas
                if (typeof amount === 'string') {
                    // Remove any non-numeric characters except decimal point
                    amount = amount.replace(/[^0-9.]/g, '');
                }

                const value = parseFloat(amount);
                if (isNaN(value)) {
                    return '$0.00';
                }
                return '$' + value.toFixed(2);
            } catch (e) {
                console.error('Error formatting amount:', e);
                return '$0.00';
            }
        },

        capitalizeFirstLetter: function(string) {
            if (!string) return '';
            return string.charAt(0).toUpperCase() + string.slice(1);
        },

        showNotification: function(message, type = 'info') {
            // Check if NotificationSystem is available
            if (typeof NotificationSystem !== 'undefined') {
                const notifications = new NotificationSystem();
                notifications.push(message, type);
            } else {
                // Fallback to alert
                alert(message);
            }
        }
    };

    // Initialize the app
    claimsApp.init();
}); 