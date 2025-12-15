// ============================================
// FOOTER COMPONENT
// Generic footer with placeholder content
// ============================================

/**
 * Render footer HTML
 * @returns {string} HTML string
 */
export function renderFooter() {
    const currentYear = new Date().getFullYear();

    return `
        <footer class="main-footer">
            <div class="footer-container">
                <div class="footer-placeholder">
                    <h2>Footer sektion kommer...</h2>
                    <p>Kontaktinformation, links og andet vil blive tilføjet her</p>
                </div>

                <div class="footer-bottom">
                    <p class="footer-copyright">
                        © ${currentYear} AlgeNord ApS. Alle rettigheder forbeholdes.
                    </p>
                    <a href="#/login" class="footer-legal-link">Admin Login</a>
                </div>
            </div>
        </footer>
    `;
}

// TODO: Unused function - consider removing
/**
 * Render full footer with content (for future use)
 * @param {Object} footerData - Footer content data
 * @returns {string} HTML string
 */
export function renderFullFooter(footerData = {}) {
    const currentYear = new Date().getFullYear();

    return `
        <footer class="main-footer">
            <div class="footer-container">
                <div class="footer-content">
                    <!-- Logo Column -->
                    <div class="footer-column footer-logo">
                        <img
                            src="/assets/logo-algenord.svg"
                            alt="AlgeNord Logo"
                            class="footer-logo-image"
                        />
                        <p class="footer-tagline">
                            ${footerData.tagline || 'Professionel rengøring og vedligeholdelse'}
                        </p>
                    </div>

                    <!-- Links Column -->
                    <div class="footer-column">
                        <h3>Links</h3>
                        <div class="footer-links">
                            <a href="#/projects" class="footer-link">Projekter</a>
                            <a href="#/about" class="footer-link">Om os</a>
                            <a href="#/services" class="footer-link">Tjenester</a>
                            <a href="#/contact" class="footer-link">Kontakt</a>
                        </div>
                    </div>

                    <!-- Contact Column -->
                    <div class="footer-column">
                        <h3>Kontakt</h3>
                        <div class="footer-links">
                            ${
                                footerData.email
                                    ? `<a href="mailto:${footerData.email}" class="footer-link">${footerData.email}</a>`
                                    : '<p>Email kommer...</p>'
                            }
                            ${
                                footerData.phone
                                    ? `<a href="tel:${footerData.phone}" class="footer-link">${footerData.phone}</a>`
                                    : '<p>Telefon kommer...</p>'
                            }
                            ${
                                footerData.address
                                    ? `<p class="footer-link">${footerData.address}</p>`
                                    : '<p>Adresse kommer...</p>'
                            }
                        </div>
                    </div>
                </div>

                <div class="footer-bottom">
                    <p class="footer-copyright">
                        © ${currentYear} AlgeNord ApS. Alle rettigheder forbeholdes.
                    </p>
                    <ul class="footer-legal-links">
                        <li>
                            <a href="#/privacy" class="footer-legal-link">Privatlivspolitik</a>
                        </li>
                        <li>
                            <a href="#/terms" class="footer-legal-link">Betingelser</a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    `;
}