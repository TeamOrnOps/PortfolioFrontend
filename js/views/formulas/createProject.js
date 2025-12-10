import { createProject } from '../../api.js';

// Store uploaded images with metadata
let uploadedImages = [];

// Work type options (matches backend WorkType enum)
const WORK_TYPES = [
    { value: 'PAVING_CLEANING', label: 'Fliserens' },
    { value: 'WOODEN_DECK_CLEANING', label: 'Rens af trædæk' },
    { value: 'ROOF_CLEANING', label: 'Tagrens' },
    { value: 'FACADE_CLEANING', label: 'Facaderens' }
];

// Customer type options (matches backend CustomerType enum)
const CUSTOMER_TYPES = [
    { value: 'PRIVATE_CUSTOMER', label: 'Privat kunde' },
    { value: 'BUSINESS_CUSTOMER', label: 'Erhvervskunde' }
];

// Accepted image MIME types
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Generate unique ID for image tracking
function generateImageId() {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Format date for input[type="date"] (YYYY-MM-DD)
function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

// Get today's date formatted for max attribute
function getTodayFormatted() {
    return formatDateForInput(new Date());
}

// Render the create project form
export function renderCreateProjectForm() {
    // Reset uploaded images when rendering new form
    uploadedImages = [];

    const workTypeOptions = WORK_TYPES.map(type =>
        `<option value="${type.value}">${type.label}</option>`
    ).join('');

    const customerTypeOptions = CUSTOMER_TYPES.map(type =>
        `<option value="${type.value}">${type.label}</option>`
    ).join('');

    return `
        <div class="create-project-page">
            <nav class="breadcrumb">
                <a href="#/">← Tilbage til oversigt</a>
            </nav>

            <header class="page-header">
                <h1>Opret nyt projekt</h1>
                <p>Udfyld formularen for at tilføje et nyt projekt til porteføljen</p>
            </header>

            <form id="create-project-form" class="project-form" novalidate>
                <!-- Project Details Section -->
                <section class="form-section">
                    <h2>Projektdetaljer</h2>
                    
                    <div class="form-group">
                        <label for="project-title">Projektnavn *</label>
                        <input 
                            type="text" 
                            id="project-title" 
                            name="title" 
                            required 
                            minlength="3"
                            maxlength="100"
                            placeholder="Indtast projektnavn"
                        />
                        <span class="error-message" id="title-error"></span>
                    </div>

                    <div class="form-group">
                        <label for="project-description">Beskrivelse *</label>
                        <textarea 
                            id="project-description" 
                            name="description" 
                            required 
                            minlength="10"
                            maxlength="1000"
                            rows="4"
                            placeholder="Beskriv projektet..."
                        ></textarea>
                        <span class="error-message" id="description-error"></span>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="work-type">Servicekategori *</label>
                            <select id="work-type" name="workType" required>
                                <option value="">Vælg kategori</option>
                                ${workTypeOptions}
                            </select>
                            <span class="error-message" id="workType-error"></span>
                        </div>

                        <div class="form-group">
                            <label for="customer-type">Kundetype *</label>
                            <select id="customer-type" name="customerType" required>
                                <option value="">Vælg kundetype</option>
                                ${customerTypeOptions}
                            </select>
                            <span class="error-message" id="customerType-error"></span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="execution-date">Udførelsesdato *</label>
                        <input 
                            type="date" 
                            id="execution-date" 
                            name="executionDate" 
                            required
                            max="${getTodayFormatted()}"
                        />
                        <span class="error-message" id="executionDate-error"></span>
                    </div>
                </section>

                <!-- Image Upload Section -->
                <section class="form-section">
                    <h2>Billeder</h2>
                    <p class="section-description">
                        Upload mindst ét "før" og ét "efter" billede. Du kan markere ét billede som fremhævet.
                    </p>

                    <div class="form-group">
                        <label for="image-upload">Tilføj billeder *</label>
                        <input 
                            type="file" 
                            id="image-upload" 
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            multiple
                        />
                        <span class="file-hint">Accepterede formater: JPG, PNG, GIF, WebP</span>
                        <span class="error-message" id="images-error"></span>
                    </div>

                    <!-- Image Preview Container -->
                    <div id="image-preview-container" class="image-preview-container">
                        <!-- Uploaded images will be rendered here -->
                    </div>

                    <div id="image-validation-summary" class="validation-summary hidden">
                        <span class="before-count">Før-billeder: 0</span>
                        <span class="after-count">Efter-billeder: 0</span>
                    </div>
                </section>

                <!-- Form Actions -->
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.location.hash='#/'">
                        Annuller
                    </button>
                    <button type="submit" class="btn btn-primary" id="submit-btn">
                        <span class="btn-text">Opret projekt</span>
                        <span class="btn-loading hidden">Opretter...</span>
                    </button>
                </div>

                <!-- Form Messages -->
                <div id="form-message" class="form-message hidden"></div>
            </form>
        </div>
    `;
}

// Render single image preview card
function renderImagePreview(imageData) {
    return `
        <div class="image-preview-card" data-image-id="${imageData.id}">
            <div class="image-preview-thumbnail">
                <img src="${imageData.previewUrl}" alt="Preview" />
                <button type="button" class="remove-image-btn" data-image-id="${imageData.id}" title="Fjern billede">
                    ×
                </button>
            </div>
            <div class="image-preview-controls">
                <div class="control-group">
                    <label for="image-type-${imageData.id}">Type *</label>
                    <select id="image-type-${imageData.id}" data-image-id="${imageData.id}" class="image-type-select" required>
                        <option value="">Vælg type</option>
                        <option value="BEFORE" ${imageData.imageType === 'BEFORE' ? 'selected' : ''}>Før</option>
                        <option value="AFTER" ${imageData.imageType === 'AFTER' ? 'selected' : ''}>Efter</option>
                    </select>
                </div>
                <div class="control-group checkbox-group">
                    <label>
                        <input 
                            type="checkbox" 
                            class="featured-checkbox"
                            data-image-id="${imageData.id}"
                            ${imageData.isFeatured ? 'checked' : ''}
                        />
                        Fremhævet
                    </label>
                </div>
            </div>
            <p class="image-filename">${imageData.file.name}</p>
        </div>
    `;
}

// Update image previews in DOM
function updateImagePreviews() {
    const container = document.getElementById('image-preview-container');
    const validationSummary = document.getElementById('image-validation-summary');

    if (!container) return;

    if (uploadedImages.length === 0) {
        container.innerHTML = '<p class="no-images-text">Ingen billeder tilføjet endnu</p>';
        validationSummary.classList.add('hidden');
        return;
    }

    container.innerHTML = uploadedImages.map(img => renderImagePreview(img)).join('');

    // Update validation summary
    const beforeCount = uploadedImages.filter(img => img.imageType === 'BEFORE').length;
    const afterCount = uploadedImages.filter(img => img.imageType === 'AFTER').length;

    validationSummary.querySelector('.before-count').textContent = `Før-billeder: ${beforeCount}`;
    validationSummary.querySelector('.after-count').textContent = `Efter-billeder: ${afterCount}`;
    validationSummary.classList.remove('hidden');

    // Add event listeners to new elements
    attachImageControlListeners();
}

// Attach event listeners to image controls
function attachImageControlListeners() {
    // Remove buttons
    document.querySelectorAll('.remove-image-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const imageId = e.target.dataset.imageId;
            removeImage(imageId);
        });
    });

    // Image type selects
    document.querySelectorAll('.image-type-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const imageId = e.target.dataset.imageId;
            const imageType = e.target.value;
            updateImageMetadata(imageId, { imageType });
        });
    });

    // Featured checkboxes
    document.querySelectorAll('.featured-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const imageId = e.target.dataset.imageId;
            const isFeatured = e.target.checked;

            // If setting as featured, uncheck all others first
            if (isFeatured) {
                uploadedImages.forEach(img => {
                    if (img.id !== imageId) {
                        img.isFeatured = false;
                    }
                });
            }

            updateImageMetadata(imageId, { isFeatured });
            updateImagePreviews(); // Re-render to update checkboxes
        });
    });
}

// Add new images to upload list
function handleImageUpload(files) {
    const errorElement = document.getElementById('images-error');
    errorElement.textContent = '';

    for (const file of files) {
        // Validate file type
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            errorElement.textContent = `Ugyldig filtype: ${file.name}. Accepterede formater: JPG, PNG, GIF, WebP`;
            continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            errorElement.textContent = `Filen ${file.name} er for stor. Maksimal størrelse er 10MB`;
            continue;
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);

        // Add to uploaded images array
        uploadedImages.push({
            id: generateImageId(),
            file: file,
            previewUrl: previewUrl,
            imageType: '', // User must select
            isFeatured: false
        });
    }

    updateImagePreviews();
}

// Remove image from list
function removeImage(imageId) {
    const imageIndex = uploadedImages.findIndex(img => img.id === imageId);
    if (imageIndex !== -1) {
        // Revoke preview URL to free memory
        URL.revokeObjectURL(uploadedImages[imageIndex].previewUrl);
        uploadedImages.splice(imageIndex, 1);
        updateImagePreviews();
    }
}

// Update image metadata
function updateImageMetadata(imageId, updates) {
    const image = uploadedImages.find(img => img.id === imageId);
    if (image) {
        Object.assign(image, updates);
    }
}

// Validate form fields
function validateForm() {
    let isValid = true;
    const errors = {};

    // Clear all previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea')
        .forEach(el => el.classList.remove('input-error'));

    // Title validation
    const title = document.getElementById('project-title').value.trim();
    if (!title) {
        errors.title = 'Projektnavn er påkrævet';
        isValid = false;
    } else if (title.length < 3) {
        errors.title = 'Projektnavn skal være mindst 3 tegn';
        isValid = false;
    }

    // Description validation
    const description = document.getElementById('project-description').value.trim();
    if (!description) {
        errors.description = 'Beskrivelse er påkrævet';
        isValid = false;
    } else if (description.length < 10) {
        errors.description = 'Beskrivelse skal være mindst 10 tegn';
        isValid = false;
    }

    // Work type validation
    const workType = document.getElementById('work-type').value;
    if (!workType) {
        errors.workType = 'Vælg en servicekategori';
        isValid = false;
    }

    // Customer type validation
    const customerType = document.getElementById('customer-type').value;
    if (!customerType) {
        errors.customerType = 'Vælg en kundetype';
        isValid = false;
    }

    // Execution date validation
    const executionDate = document.getElementById('execution-date').value;
    if (!executionDate) {
        errors.executionDate = 'Udførelsesdato er påkrævet';
        isValid = false;
    } else {
        const selectedDate = new Date(executionDate);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (selectedDate > today) {
            errors.executionDate = 'Udførelsesdato kan ikke være i fremtiden';
            isValid = false;
        }
    }

    // Image validation
    if (uploadedImages.length === 0) {
        errors.images = 'Upload mindst ét billede';
        isValid = false;
    } else {
        // Check that all images have type selected
        const imagesWithoutType = uploadedImages.filter(img => !img.imageType);
        if (imagesWithoutType.length > 0) {
            errors.images = 'Alle billeder skal have en type valgt (Før/Efter)';
            isValid = false;
        }

        // Check for at least one BEFORE and one AFTER
        const beforeCount = uploadedImages.filter(img => img.imageType === 'BEFORE').length;
        const afterCount = uploadedImages.filter(img => img.imageType === 'AFTER').length;

        if (beforeCount === 0) {
            errors.images = 'Der kræves mindst ét "før" billede';
            isValid = false;
        } else if (afterCount === 0) {
            errors.images = 'Der kræves mindst ét "efter" billede';
            isValid = false;
        }
    }

    // Display errors
    Object.keys(errors).forEach(field => {
        const errorElement = document.getElementById(`${field}-error`);
        if (errorElement) {
            errorElement.textContent = errors[field];
        }
        const inputElement = document.getElementById(
            field === 'title' ? 'project-title' :
                field === 'description' ? 'project-description' :
                    field === 'workType' ? 'work-type' :
                        field === 'customerType' ? 'customer-type' :
                            field === 'executionDate' ? 'execution-date' : ''
        );
        if (inputElement) {
            inputElement.classList.add('input-error');
        }
    });

    return isValid;
}

// Show form message (success or error)
function showFormMessage(message, isError = false) {
    const messageElement = document.getElementById('form-message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `form-message ${isError ? 'error' : 'success'}`;
        messageElement.classList.remove('hidden');

        // Scroll to message
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Set loading state
function setLoadingState(isLoading) {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    if (isLoading) {
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
    } else {
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
    }
}

// Reset form after successful submission
function resetForm() {
    const form = document.getElementById('create-project-form');
    if (form) {
        form.reset();
    }

    // Clear uploaded images and revoke URLs
    uploadedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    uploadedImages = [];
    updateImagePreviews();

    // Clear any error messages
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

// Handle form submission
export async function handleCreateProjectSubmit(event) {
    event.preventDefault();

    // Validate form
    if (!validateForm()) {
        return;
    }

    // Set loading state
    setLoadingState(true);

    try {
        // Build project data object
        const projectData = {
            title: document.getElementById('project-title').value.trim(),
            description: document.getElementById('project-description').value.trim(),
            workType: document.getElementById('work-type').value,
            customerType: document.getElementById('customer-type').value,
            executionDate: document.getElementById('execution-date').value
        };

        // Build image metadata array
        const imageMetadata = uploadedImages.map(img => ({
            imageType: img.imageType,
            isFeatured: img.isFeatured
        }));

        // Create FormData for multipart request
        const formData = new FormData();

        // Add project data as JSON blob
        formData.append('data', new Blob([JSON.stringify(projectData)], { type: 'application/json' }));

        // Add each image file
        uploadedImages.forEach(img => {
            formData.append('images', img.file);
        });

        // Add image metadata as JSON blob
        formData.append('imageMetadata', new Blob([JSON.stringify(imageMetadata)], { type: 'application/json' }));

        // Send request
        const result = await createProject(formData);

        // Success!
        showFormMessage('Projekt oprettet succesfuldt!', false);
        resetForm();

        // Redirect to project view after short delay
        setTimeout(() => {
            window.location.hash = `#/project/${result.id}`;
        }, 1500);

    } catch (error) {
        console.error('Error creating project:', error);
        showFormMessage(error.message || 'Der opstod en fejl ved oprettelse af projektet. Prøv igen.', true);
    } finally {
        setLoadingState(false);
    }
}

// Initialize form event listeners
export function initCreateProjectForm() {
    const form = document.getElementById('create-project-form');
    const imageInput = document.getElementById('image-upload');

    if (form) {
        form.addEventListener('submit', handleCreateProjectSubmit);
    }

    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleImageUpload(e.target.files);
                // Reset input so same file can be selected again if removed
                e.target.value = '';
            }
        });
    }

    // Initial render of empty image previews
    updateImagePreviews();
}

// Main render function for create project view
export async function renderCreateProjectView() {
    return renderCreateProjectForm();
}