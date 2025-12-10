import { createProject } from '../../api.js';

/**
 * Render create project form view
 * @returns {string} HTML string
 */
export async function renderCreateProjectView() {
    return `
        <div class="create-project-view">
            <nav class="breadcrumb">
                <a href="#/">← Back to overview</a>
            </nav>
            
            <header>
                <h1>Create New Project</h1>
            </header>
            
            <form id="create-project-form" class="project-form">
                <div class="form-group">
                    <label for="title">Project Title *</label>
                    <input type="text" id="title" name="title" required placeholder="Enter project title">
                </div>
                
                <div class="form-group">
                    <label for="description">Description *</label>
                    <textarea id="description" name="description" required rows="4" placeholder="Enter project description"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="workType">Work Type *</label>
                        <select id="workType" name="workType" required>
                            <option value="">Select work type</option>
                            <option value="PAVING_CLEANING">Fliserens</option>
                            <option value="WOODEN_DECK_CLEANING">Rens af træterrasse</option>
                            <option value="ROOF_CLEANING">Tagrens</option>
                            <option value="FACADE_CLEANING">Facaderens</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="customerType">Customer Type *</label>
                        <select id="customerType" name="customerType" required>
                            <option value="">Select customer type</option>
                            <option value="PRIVATE_CUSTOMER">Private</option>
                            <option value="BUSINESS_CUSTOMER">Business</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="executionDate">Execution Date *</label>
                    <input type="date" id="executionDate" name="executionDate" required>
                </div>
                
                <div class="form-group">
                    <label>Images *</label>
                    <p class="form-help">Upload at least one BEFORE and one AFTER image</p>
                    <div id="image-upload-container">
                        <div class="image-upload-item">
                            <input type="file" name="images" accept="image/*" required>
                            <select name="imageType" required>
                                <option value="BEFORE">Before</option>
                                <option value="AFTER">After</option>
                            </select>
                            <label><input type="checkbox" name="isFeatured"> Featured</label>
                        </div>
                    </div>
                    <button type="button" id="add-image-btn" class="btn-secondary">+ Add another image</button>
                </div>
                
                <div class="form-actions">
                    <button type="button" onclick="window.location.hash = '#/'" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary">Create Project</button>
                </div>
                
                <div id="form-error" class="form-error" style="display: none;"></div>
                <div id="form-success" class="form-success" style="display: none;"></div>
            </form>
        </div>
    `;
}

/**
 * Initialize form event listeners
 * Call this after the view is rendered
 */
export function initCreateProjectForm() {
    const form = document.getElementById('create-project-form');
    const addImageBtn = document.getElementById('add-image-btn');

    if (form) {
        form.addEventListener('submit', handleCreateProjectSubmit);
    }

    if (addImageBtn) {
        addImageBtn.addEventListener('click', addImageUploadField);
    }
}

/**
 * Add another image upload field
 */
function addImageUploadField() {
    const container = document.getElementById('image-upload-container');
    const newItem = document.createElement('div');
    newItem.className = 'image-upload-item';
    newItem.innerHTML = `
        <input type="file" name="images" accept="image/*" required>
        <select name="imageType" required>
            <option value="BEFORE">Before</option>
            <option value="AFTER">After</option>
        </select>
        <label><input type="checkbox" name="isFeatured"> Featured</label>
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(newItem);
}

/**
 * Handle form submission
 */
async function handleCreateProjectSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const errorDiv = document.getElementById('form-error');
    const successDiv = document.getElementById('form-success');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Clear previous messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    // Validate before/after images
    const imageTypes = form.querySelectorAll('select[name="imageType"]');
    const types = Array.from(imageTypes).map(select => select.value);

    if (!types.includes('BEFORE') || !types.includes('AFTER')) {
        errorDiv.textContent = 'You must upload at least one BEFORE and one AFTER image.';
        errorDiv.style.display = 'block';
        return;
    }

    // Disable submit
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    try {
        // Build FormData
        const formData = new FormData();

        // Add project data as JSON
        const projectData = {
            title: form.title.value,
            description: form.description.value,
            workType: form.workType.value,
            customerType: form.customerType.value,
            executionDate: form.executionDate.value
        };
        formData.append('data', new Blob([JSON.stringify(projectData)], { type: 'application/json' }));

        // Add images and metadata
        const imageInputs = form.querySelectorAll('input[name="images"]');
        const imageTypeSelects = form.querySelectorAll('select[name="imageType"]');
        const featuredCheckboxes = form.querySelectorAll('input[name="isFeatured"]');

        const imageMetadata = [];

        imageInputs.forEach((input, index) => {
            if (input.files[0]) {
                formData.append('images', input.files[0]);
                imageMetadata.push({
                    imageType: imageTypeSelects[index].value,
                    isFeatured: featuredCheckboxes[index].checked
                });
            }
        });

        formData.append('imageMetadata', new Blob([JSON.stringify(imageMetadata)], { type: 'application/json' }));

        // Send request
        await createProject(formData);

        // Success
        successDiv.textContent = 'Project created successfully!';
        successDiv.style.display = 'block';

        // Redirect after short delay
        setTimeout(() => {
            window.location.hash = '#/';
        }, 1500);

    } catch (error) {
        errorDiv.textContent = error.message || 'Failed to create project. Please try again.';
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Project';
    }
}