class FileUploadSystem {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        this.init();
    }

    init() {
        const dropZone = document.querySelector('.file-drop-zone');
        if (!dropZone) return;

        // Create file list container if it doesn't exist
        if (!dropZone.querySelector('.file-list')) {
            const fileList = document.createElement('div');
            fileList.className = 'file-list';
            dropZone.appendChild(fileList);
        }

        // Create hidden file input if it doesn't exist
        if (!dropZone.querySelector('.file-input')) {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.className = 'file-input';
            input.style.display = 'none';
            input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
            dropZone.appendChild(input);
        }

        this.setupDropZone(dropZone);
        this.setupFileInput(dropZone.querySelector('.file-input'));
    }

    setupDropZone(dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processFiles(files, dropZone);
            }
        });

        // Handle click to upload
        dropZone.addEventListener('click', () => {
            dropZone.querySelector('.file-input').click();
        });
    }

    setupFileInput(input) {
        input.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                this.processFiles(files, input.closest('.file-drop-zone'));
            }
        });
    }

    async processFiles(files, zone) {
        const notifications = new NotificationSystem();
        const fileList = zone.querySelector('.file-list');
        
        for (let file of files) {
            // Validate file
            if (!this.validateFile(file)) {
                continue;
            }

            // Create preview
            const preview = this.createFilePreview(file);
            fileList.appendChild(preview);

            try {
                // Simulate file upload with progress
                const progressBar = preview.querySelector('.progress-bar');
                const statusText = preview.querySelector('.status');

                await this.simulateUpload(progressBar, statusText);
                
                // Mark as uploaded
                preview.classList.add('uploaded');
                statusText.textContent = 'Uploaded';
                notifications.push(`${file.name} uploaded successfully`, 'success');
            } catch (error) {
                preview.classList.add('error');
                statusText.textContent = 'Failed';
                notifications.push(`Failed to upload ${file.name}`, 'error');
            }
        }
    }

    simulateUpload(progressBar, statusText) {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                progressBar.style.width = `${progress}%`;
                statusText.textContent = `Uploading... ${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                    resolve();
                }
            }, 200); // Faster simulation for better UX
        });
    }

    validateFile(file) {
        const notifications = new NotificationSystem();

        if (!this.allowedTypes.includes(file.type)) {
            notifications.push('Invalid file type. Please upload PDF, Word, or image files.', 'error');
            return false;
        }

        if (file.size > this.maxFileSize) {
            notifications.push('File too large. Maximum size is 10MB.', 'error');
            return false;
        }

        return true;
    }

    createFilePreview(file) {
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        
        const icon = this.getFileIcon(file.type);
        
        preview.innerHTML = `
            <div class="file-info">
                <i class="fas ${icon}"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
            </div>
            <div class="file-status">
                <div class="progress">
                    <div class="progress-bar" style="width: 0%"></div>
                </div>
                <span class="status">Preparing...</span>
                <button class="remove-file" title="Remove file">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        preview.querySelector('.remove-file').addEventListener('click', () => {
            preview.remove();
        });

        return preview;
    }

    getFileIcon(type) {
        if (type.includes('pdf')) return 'fa-file-pdf';
        if (type.includes('word')) return 'fa-file-word';
        if (type.includes('image')) return 'fa-file-image';
        return 'fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize File Upload System
document.addEventListener('DOMContentLoaded', () => {
    new FileUploadSystem();
}); 