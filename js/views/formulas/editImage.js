import { fetchProjectById, updateImageMetadata, updateImageUrl, uploadImage } from "../../api.js";



export async function renderEditImageView({ projectId, imageId }) {
    try {
        const project = await fetchProjectById(projectId);
        if (!project) {
            return `<p>Projekt ikke fundet.</p>`;
        }

        const image = project.images.find(img => img.id == imageId);
        if (!image) {
            return `<p>Billede ikke fundet.</p>`;
        }

        const fullUrl = `http://localhost:8080${image.url}`;

        return `
            <div class="edit-image-container">
                <h2>Rediger billede</h2>

                <div class="image-preview-wrapper">
                    <img src="${fullUrl}" class="preview-image" />
                </div>

                <form id="edit-image-form">
                    <input type="file" id="imageFile" accept="image/*"/>

                    <button type="submit" class="btn btn-primary">
                        Gem nyt billede
                    </button>

                    <button type="button"
                            class="btn"
                            onclick="window.location.hash = '#/'">
                        Annuller
                    </button>
                </form>

                <div id="edit-image-error"></div>
            </div>
        `;
    } catch (err) {
        console.error(err);
        return `<p>Fejl: kunne ikke hente billedet.</p>`;
    }
}

/*
export async function renderEditImageView({ projectId, imageId }) {
    try {
        const project = await fetchProjectById(projectId);
        if (!project) {
            return `<p>Projekt ikke fundet.</p>`;
        }

        const image = project.images.find(img => img.id == imageId);
        if (!image) {
            return `<p>Billede ikke fundet.</p>`;
        }

        const fullUrl = `http://localhost:8080${image.url}`;

        return `
            <div class="edit-image-container">
                <h2>Rediger billede</h2>

                <div class="image-preview-wrapper">
                    <img src="${fullUrl}" class="preview-image" />
                    <p>Type: <strong>${image.imageType}</strong></p>
                </div>

                <form id="edit-image-form">

                    <div class="form-group">
                        <label for="isFeatured">Featured?</label>
                        <input type="checkbox" id="isFeatured" name="isFeatured"
                            ${image.isFeatured ? "checked" : ""} />
                    </div>

                    <button type="submit" class="btn btn-primary">Gem ændringer</button>
                    <button type="button" class="btn btn-secondary"
                            onclick="window.location.hash = '#/'">
                        Tilbage
                    </button>

                    <p id="edit-image-message"></p>
                </form>
            </div>
        `;
    } catch (err) {
        console.error(err);
        return `<p>Fejl: kunne ikke hente billedet.</p>`;
    }*/


    /* export function initEditImageForm(projectId, imageId) {
        const form = document.getElementById("edit-image-form");
        if (!form) return;

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const msg = document.getElementById("edit-image-message");

            const payload = {
                id: Number(imageId),
                url: null,          // vi ændrer ikke selve filen
                imageType: null,    // vi ændrer IKKE BEFORE/AFTER
                isFeatured: form.isFeatured.checked
            };

            try {
                await updateImageMetadata(projectId, imageId, payload);
                msg.textContent = "Billedet blev opdateret!";
                msg.style.color = "green";

                setTimeout(() => {
                    window.location.hash = "#/";
                }, 800);

            } catch (error) {
                msg.textContent = "Fejl: " + error.message;
                msg.style.color = "red";
            }
        });
    }*/


export function initEditImageForm(projectId, imageId) {
    const form = document.getElementById('edit-image-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const file = document.getElementById('imageFile').files[0];
        if (!file) {
            alert('Vælg en fil');
            return;
        }

        try {
            // 1️⃣ Upload fil
            const uploadResponse = await uploadImage(file);
            const newUrl = uploadResponse.url;

            // 2️⃣ Opdatér image URL
            await updateImageUrl(projectId, imageId, newUrl);

            // 3️⃣ Redirect
            window.location.hash = '#/';


        } catch (err) {
            console.error(err);
            document.getElementById('edit-image-error').innerText =
                'Kunne ikke opdatere billede';
        }
    });
}
