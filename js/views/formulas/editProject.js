import { updateProject, fetchProjectById } from '../../api.js';

//FETCH PROJECT BY ID
async function fetchProject(id) {
    return await fetchProjectById(id);
}

// RENDER ENUM FOR CUSTOMER TYPE
function renderCustomerTypeOptions(selected) {
    const types = [
        "PRIVATE_CUSTOMER",
        "BUSINESS_CUSTOMER"
    ];
    return types.map(type => `
        <option value="${type}" ${type === selected ? "selected" : ""}>
            ${type.replace(/_/g, " ")}
        </option>
    `).join("");
}
// RENDER ENUM FOR WORK TYPE
function renderWorkTypeOptions(selected) {
    const types = [
        "PAVING_CLEANING",
        "WOODEN_DECK_CLEANING",
        "ROOF_CLEANING",
        "FACADE_CLEANING"
    ];

    return types.map(type => `
        <option value="${type}" ${type === selected ? "selected" : ""}>
            ${type.replace(/_/g, " ")}
        </option>
    `).join("");
}

// RENDER EDIT PROJECT FORM
function renderEditProjectForm(project) {
    return `
        <div class="edit-project-container">
            <h2>Rediger projekt</h2>

            <form id="edit-project-form" class="edit-grid">

                <div>
                    <label>Titel</label>
                    <input type="text" name="title" value="${project.title}" required />
                </div>

                <div>
                    <label>Beskrivelse</label>
                    <textarea name="description" required>${project.description}</textarea>
                </div>

                <div>
                    <label>Arbejdstype</label>
                    <select name="workType">${renderWorkTypeOptions(project.workType)}</select>
                </div>

                <div>
                    <label>Kundetype</label>
                    <select name="customerType">${renderCustomerTypeOptions(project.customerType)}</select>
                </div>

                <div>
                    <label>Udførelsesdato</label>
                    <input type="date" name="executionDate" value="${project.executionDate}" required />
                </div>

                <button class="btn btn-primary" type="submit">Gem ændringer</button>
                <button class="btn btn-secondary" type="button" onclick="window.location.hash='#/'">Annuller</button>

                <p id="edit-project-message"></p>
            </form>
        </div>
    `;
}

// INITIALIZE EDIT PROJECT FORM
export function initEditProjectForm(projectId) {
    const form = document.getElementById("edit-project-form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const msg = document.getElementById("edit-project-message");

        const payload = {
            title: form.title.value.trim(),
            description: form.description.value.trim(),
            workType: form.workType.value,
            customerType: form.customerType.value,
            executionDate: form.executionDate.value
        };

        try {
            await updateProject(projectId, payload);
            msg.textContent = "Projekt opdateret!";
            msg.style.color = "green";

            setTimeout(() => window.location.hash = "#/", 800);
        }
        catch (err) {
            msg.textContent = "Fejl: " + err.message;
            msg.style.color = "red";
        }
    });
}
// MAIN VIEW USED BY ROUTER IN MAIN.JS
export async function renderEditProjectView({ id }) {
    const project = await fetchProject(id);

    if (!project) {
        return `<p>Projekt ikke fundet.</p>`;
    }

    return renderEditProjectForm(project);
}