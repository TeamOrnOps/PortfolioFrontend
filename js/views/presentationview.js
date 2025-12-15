import { fetchProjectById, fetchAllProjectsPublic } from '../api.js';

// =============================
// Helpers til detalje-view
// =============================

// Find featured image (eller fallback til første billede)
function getFeaturedImage(project) {
    if (!project.images || project.images.length === 0) return null;
    const featured = project.images.find(img => img.isFeatured);
    return featured || project.images[0];
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('da-DK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// Hero med titel, beskrivelse, featured billede
function renderHeroSection(project) {
    const featuredImage = getFeaturedImage(project);

    return `
        <section class="presentation-hero">
            <div class="hero-media">
                ${
        featuredImage
            ? `<img src="${featuredImage.url}"
                                 alt="Projektbillede: ${project.title}"
                                 class="hero-image"
                                 loading="eager" />`
            : '<div class="hero-image hero-image--placeholder"></div>'
    }
            </div>
            <div class="hero-content">
                <p class="hero-tags">
                    <span class="hero-tag">${project.workType}</span>
                    <span class="hero-dot">•</span>
                    <span class="hero-tag">${project.customerType}</span>
                </p>
                <h1 class="hero-title">${project.title}</h1>
                <p class="hero-description">${project.description}</p>
                ${
        project.executionDate
            ? `<p class="hero-meta">
                               Udført: <span>${formatDate(project.executionDate)}</span>
                           </p>`
            : ''
    }
            </div>
        </section>
    `;
}

// Metadata-boks
function renderProjectMetadata(project) {
    const rows = [
        { label: 'Servicekategori', value: project.workType },
        { label: 'Kundetype', value: project.customerType },
        project.executionDate && {
            label: 'Udførelsesdato',
            value: formatDate(project.executionDate),
        },
    ].filter(Boolean);

    if (!rows.length) return '';

    return `
        <section class="project-metadata">
            <h2 class="section-title">Projektinfo</h2>
            <dl class="metadata-list">
                ${rows
        .map(
            r => `
                    <div class="metadata-item">
                        <dt>${r.label}</dt>
                        <dd>${r.value}</dd>
                    </div>
                `
        )
        .join('')}
            </dl>
        </section>
    `;
}

// Galleri: før/efter (uden featured)
function renderImageGallery(images, projectTitle) {
    if (!images || images.length === 0) {
        return '<p class="empty-state">Der er ingen billeder tilknyttet dette projekt.</p>';
    }

    const gridImages = images.filter(img => !img.isFeatured);

    if (gridImages.length === 0) {
        return ''; // kun hero-billedet findes
    }

    const beforeImages = gridImages.filter(img => img.imageType === 'BEFORE');
    const afterImages = gridImages.filter(img => img.imageType === 'AFTER');

    const renderImageGroup = (imageList, title, badgeClass) => {
        if (imageList.length === 0) return '';

        const imagesHtml = imageList
            .map(
                img => `
            <figure class="gallery-item">
                <div class="gallery-image-wrapper">
                    <img src="${img.url}"
                         alt="${title} – ${projectTitle}"
                         class="gallery-image"
                         loading="lazy" />
                    <span class="image-badge ${badgeClass}">${title}</span>
                </div>
            </figure>
        `
            )
            .join('');

        return `
            <section class="image-group">
                <h3 class="section-subtitle">${title}</h3>
                <div class="image-grid">
                    ${imagesHtml}
                </div>
            </section>
        `;
    };

    return `
        <section class="project-images">
            <h2 class="section-title">Billeder</h2>
            ${renderImageGroup(beforeImages, 'Før-billeder', 'badge-before')}
            ${renderImageGroup(afterImages, 'Efter-billeder', 'badge-after')}
        </section>
    `;
}

// =============================
// Helpers til liste-view
// =============================

function renderProjectCard(project) {
    const featured = getFeaturedImage(project);

    return `
        <article class="project-card">
            <a href="#/project/${project.id}" class="project-card-link">
                <div class="project-card-image-wrapper">
                    ${
        featured
            ? `<img src="${featured.url}"
                                     alt="Projekt: ${project.title}"
                                     class="project-card-image"
                                     loading="lazy" />`
            : '<div class="project-card-image placeholder"></div>'
    }
                </div>
                <div class="project-card-content">
                    <p class="project-card-tags">
                        <span>${project.workType}</span>
                        <span>•</span>
                        <span>${project.customerType}</span>
                    </p>
                    <h3 class="project-card-title">${project.title}</h3>
                    <p class="project-card-description">
                        ${project.description}
                    </p>
                </div>
            </a>
        </article>
    `;
}

function renderOverview(projects) {
    if (!projects || projects.length === 0) {
        return `
            <div class="presentation-view">
                <section class="presentation-hero presentation-hero--simple">
                    <div class="hero-content">
                        <h1 class="hero-title">Projekter</h1>
                        <p class="hero-description">
                            Der er endnu ingen projekter at vise.
                        </p>
                    </div>
                </section>
            </div>
        `;
    }

    return `
        <div class="presentation-view">
            <section class="presentation-hero presentation-hero--simple">
                <div class="hero-content">
                    <h1 class="hero-title">Projekter</h1>
                    <p class="hero-description">
                        Se et udvalg af gennemførte opgaver. Klik på et projekt for at se flere detaljer og billeder.
                    </p>
                </div>
            </section>

            <section class="project-grid-section">
                <div class="project-grid">
                    ${projects.map(renderProjectCard).join('')}
                </div>
            </section>
        </div>
    `;
}

// =============================
// Hovedfunktion: vælg liste/detalje
// =============================

export async function renderPresentationView(params) {
    const projectId = params?.id;

    // Ingen id → vis liste over alle projekter (offentlig oversigt)
    if (!projectId) {
        try {
            const projects = await fetchAllProjectsPublic({});
            return renderOverview(projects);
        } catch (error) {
            console.error('Error fetching projects:', error);
            return `
                <div class="error-state">
                    <p>Kunne ikke indlæse projekter. Prøv igen senere.</p>
                </div>
            `;
        }
    }

    // Med id → vis ét projekt (offentlig detalje)
    try {
        const project = await fetchProjectById(projectId);

        return `
            <div class="presentation-view">
                <nav class="breadcrumb">
                    <a href="#/project">&larr; Tilbage til projekter</a>
                </nav>

                ${renderHeroSection(project)}

                <div class="presentation-layout">
                    ${renderProjectMetadata(project)}
                    ${renderImageGallery(project.images, project.title)}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching project:', error);
        return `
            <div class="error-state">
                <p>Kunne ikke indlæse projektet. Prøv igen senere.</p>
                <button class="btn" onclick="window.location.hash = '#/project'">
                    Tilbage til projekter
                </button>
            </div>
        `;
    }
}
