const API_BASE_URL = 'http://localhost:8080/api';

// Generic fetch handler with error handling
async function apiFetch(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        // Parse (JSON) response body
        const data = await response.json();

        // Handle HTTP errors
        if (!response.ok) {
            // Backend sends { message: 'error details', trackingId: 'unique-id' }
            const errorMsg = data.message || 'An error occurred';
            const trackingId = data.trackingId;

            // Log full error for debug
            console.error(`API Error [${trackingId}]:`, data);

            // Show user-friendly msg
            alert(errorMsg);

            throw new Error(errorMsg);
        }

        return data;
    } catch (error) {
        if (!error.message.includes('fejl')) {
            console.error('Network Error:', error);
            alert('An unexpected error occurred. Please try again later.');
        }
        throw error;
    }
}

// Fetch all projects with optional filters
export async function fetchAllProjects(filters = {}) {
    const params = new URLSearchParams();

    if (filters.workType) params.append('workType', filters.workType);
    if (filters.customerType) params.append('customerType', filters.customerType);
    if (filters.sort) params.append('sort', filters.sort);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/projects${queryString ? `?${queryString}` : ''}`;

    return apiFetch(url);
}

// Fetch single project by ID
export async function fetchProjectById(id) {
    return apiFetch(`${API_BASE_URL}/projects/${id}`);
}

// Create new project with images
export async function createProject(formData) {
    return apiFetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
            // Browser sets Content-Type for multipart/form-data automatically
        },
        body: formData,
    });
}

// Update existing project
export async function updateProject(id, updateData) {
    return apiFetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
    });
}

// Delete project by ID
export async function deleteProject(id) {
    return apiFetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
    });
}

// Upload images to existing project
export async function uploadProjectImages(projectId, formData) {
    return apiFetch(`${API_BASE_URL}/projects/${projectId}/images`, {
        method: 'PATCH',
        body: formData,
    });
}

// Update image metadata
export async function updateImageMetadata(projectId, imageId, updateData) {
    return apiFetch(`${API_BASE_URL}/projects/${projectId}/images/${imageId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
    });
}

// Delete image from project
export async function deleteImage(projectId, imageId) {
    return apiFetch(`${API_BASE_URL}/projects/${projectId}/images/${imageId}`, {
        method: 'DELETE',
    });
}