# AlgeNord UI/UX Redesign Documentation

<!-- Made by Claude Code -->

## 📋 Overview

This document describes the new UI/UX implementation for the AlgeNord Portfolio website. All new code is tagged with `// made by claude code` comments for easy identification.

---

## 🎨 Design System

### Color Palette

The new color palette replaces the previous blue theme with a natural, professional green and orange scheme:

**Primary Colors:**
- **Green** (#009251): Main brand color for CTAs, links, active states
- **Orange** (#FF6716): Accent color for highlights and featured elements

**Neutral Colors:**
- **Black/Dark Grays** (#000000, #0A0A0A, #333333): Text and headings
- **Medium Grays** (#777777, #888888): Secondary text and metadata
- **Light Grays** (#DDDDDD, #F0F2F6, #F6F6F6): Borders and backgrounds
- **White** (#FFFFFF): Primary background

### Typography

**Font Family:**
- System UI stack (Segoe UI, Roboto, Helvetica, Arial)

**Font Sizes (Modular Scale 1.250):**
- `--text-xs`: 12px
- `--text-sm`: 14px
- `--text-base`: 16px
- `--text-lg`: 18px
- `--text-xl`: 20px
- `--text-2xl`: 25px
- `--text-3xl`: 31px
- `--text-4xl`: 39px
- `--text-5xl`: 49px

### Spacing System (8px Grid)

All spacing uses multiples of 4px/8px:
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-12`: 48px
- `--space-16`: 64px

---

## 🧩 Components

### 1. Hero Carousel

**Location:**
- CSS: `/css/components/hero-carousel.css`
- JS: `/js/components/heroCarousel.js`

**Features:**
- Displays all images with `isFeatured: true`
- Auto-rotates every 5 seconds
- Pauses on hover
- Swiper.js integration for smooth transitions
- Responsive (60vh desktop → 40vh mobile)

**Usage:**
```javascript
import { renderHeroCarousel, initHeroCarousel, getFeaturedImages } from './components/heroCarousel.js';

// Get featured images from projects
const featuredImages = getFeaturedImages(projects, workTypeFilter);

// Render HTML
const html = renderHeroCarousel(featuredImages);

// Initialize Swiper after DOM render
initHeroCarousel();
```

**Filtering:**
When a category is selected, only featured images from that category are shown.

---

### 2. Sticky Navigation

**Location:**
- CSS: `/css/components/navigation.css`
- JS: `/js/components/navigation.js`

**Features:**
- Fixed position at top of page
- Transparent background on scroll (rgba with blur)
- Logo integration (left side)
- Category filter links (desktop)
- Burger menu (mobile)
- Smooth scroll-to-top on logo click

**Scroll Behavior:**
- **Top (0-100px)**: Solid white background
- **Scrolled (>100px)**: 95% transparent white + backdrop blur

**Mobile Menu:**
- Hamburger icon → X animation
- Slides in from right (80% width)
- Overlay background (rgba black)
- Closes on: overlay click, link click, ESC key

**Usage:**
```javascript
import { renderNavigation, initNavigation, getNavigationCategories } from './components/navigation.js';

// Get categories
const categories = getNavigationCategories();

// Render HTML
const html = renderNavigation(categories, activeCategory);

// Initialize functionality
initNavigation();
```

---

### 3. Filter Bar

**Location:**
- CSS: `/css/components/filter-bar.css`

**Features:**
- Pill-style buttons
- Active state: Green background + white text
- Hover state: Light gray background + green border
- Mobile: Horizontal scroll with hidden scrollbar

**Styling:**
- Border radius: Full (9999px)
- Active color: `var(--color-primary)`
- Hover effect: Subtle lift (translateY -2px)

---

### 4. Project Grid

**Location:**
- CSS: `/css/components/project-grid.css`

**Features:**
- **Desktop (≥768px)**: 2 columns
- **Mobile (<768px)**: 1 column
- **Large Desktop (≥1536px)**: 3 columns (optional)
- Gap: 32px desktop, 24px mobile
- Card hover: Lift effect + shadow

**Card Structure:**
- Image (4:3 aspect ratio)
- Tags (workType, customerType)
- Title (H3)
- Description (3-line clamp)
- Metadata (execution date)

---

### 5. Footer

**Location:**
- CSS: `/css/components/footer.css`
- JS: `/js/components/footer.js`

**Current State:**
- Placeholder with "Footer sektion kommer..."
- Dark background (#0A0A0A)
- Ready for 3-column layout (logo, links, contact)

**Future Layout:**
```
[Logo + Tagline]  [Links]      [Contact]
                  Om os        Email
                  Tjenester    Telefon
                  Projekter    Adresse
```

---

## 📂 File Structure

```
frontend/
├── css/
│   ├── design-system.css          # NEW: Design tokens and base styles
│   ├── components/
│   │   ├── navigation.css         # NEW: Sticky nav
│   │   ├── hero-carousel.css      # NEW: Featured images carousel
│   │   ├── filter-bar.css         # NEW: Category filters
│   │   ├── project-grid.css       # NEW: Responsive grid
│   │   ├── footer.css             # NEW: Footer component
│   │   ├── animations.css         # NEW: Subtle animations
│   │   └── image-slider.css       # EXISTING: Before/after slider
│   ├── views/
│   │   ├── create-project.css     # EXISTING
│   │   └── admin.css              # EXISTING
│   └── style.css                  # LEGACY: To be phased out
├── js/
│   ├── components/
│   │   ├── heroCarousel.js        # NEW
│   │   ├── navigation.js          # NEW
│   │   └── footer.js              # NEW
│   ├── views/
│   │   ├── presentationview-new.js # NEW: Updated public view
│   │   └── presentationview.js     # LEGACY: Old implementation
│   └── main.js                     # Router (needs update)
├── assets/
│   ├── logo-algenord.svg          # ✅ ADDED: Your logo (SVG format)
│   └── README.md                  # Logo instructions
└── index.html                      # UPDATED: New CSS/JS imports
```

---

## 🔄 Migration Guide

### Step 1: Add Logo ✅ COMPLETED

Your logo has been added as `/assets/logo-algenord.svg`

- ✅ Format: SVG (vector) - Perfect choice!
- ✅ Benefits: Scales infinitely, smaller file size, CSS-styleable
- ✅ Browser support: All modern browsers

### Step 2: Update Router

In `/js/main.js`, change the route for `/projects`:

**Before:**
```javascript
'/projects': renderPresentationView,
'/project/:id': renderPresentationView,
```

**After:**
```javascript
import { renderPresentationView } from './views/presentationview-new.js';

'/projects': renderPresentationView,
'/project/:id': renderPresentationView,
```

### Step 3: Test

1. Navigate to `#/projects` in the browser
2. Verify:
   - ✅ Hero carousel shows featured images
   - ✅ Navigation is sticky and transparent on scroll
   - ✅ Filters work and update carousel
   - ✅ Project grid is 2 columns on desktop, 1 on mobile
   - ✅ Mobile burger menu works
   - ✅ Footer shows placeholder

### Step 4: Clean Up (Optional)

Once confirmed working:
1. Delete `/js/views/presentationview.js` (old version)
2. Rename `presentationview-new.js` → `presentationview.js`
3. Remove `/css/style.css` import from `index.html` (after migrating needed styles)

---

## 🎯 Features Implemented

### ✅ Completed

- [x] New color palette (green/orange)
- [x] Design system with CSS variables
- [x] Hero carousel with Swiper.js
- [x] Sticky navigation with scroll transparency
- [x] Logo integration
- [x] Mobile burger menu
- [x] Category filter bar (pill style)
- [x] Responsive project grid (2→1 column)
- [x] Project cards with hover effects
- [x] Generic footer placeholder
- [x] Subtle animations
- [x] Loading states and skeletons
- [x] Accessibility (ARIA, focus states)

### 🔜 To Be Completed by Team

- [ ] Add final logo to `/assets/`
- [ ] Fill footer content (contact info, links)
- [ ] Add hero text overlay (if needed)
- [ ] Adjust category list (add/remove as needed)
- [ ] Test across all browsers
- [ ] Performance optimization
- [ ] SEO metadata

---

## 🎨 Design Decisions

### Why Green and Orange?

- **Green**: Symbolizes cleanliness, nature, and sustainability (perfect for a cleaning company)
- **Orange**: Provides energy, action, and warmth (ideal for CTAs)
- **Gray scale**: Professional, clean, and easy to read

### Why Swiper.js?

- Industry-standard carousel library
- Lightweight (~45KB)
- Touch/swipe support built-in
- Accessibility features
- Highly customizable

### Why Sticky Navigation?

- Always accessible for users
- Modern UX pattern
- Transparency on scroll reduces visual weight
- Improves conversion (always visible CTAs)

### Why 2-Column Grid?

- Wireframe specification
- Optimal for showcasing before/after images
- Not overwhelming (unlike 3-4 columns)
- Mobile-friendly (collapses to 1 column)

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 767px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1536px) { }
```

**Key Changes by Breakpoint:**

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Project Grid | 2 columns | 2 columns | 1 column |
| Hero Height | 60vh | 50vh | 40vh |
| Navigation | Full menu | Condensed | Burger |
| Filter Bar | Wrap | Wrap | Scroll |
| Font Sizes | Full scale | -10% | -20% |

---

## 🧪 Testing Checklist

### Desktop (≥1024px)

- [ ] Hero carousel auto-plays and pauses on hover
- [ ] Navigation becomes transparent on scroll
- [ ] Filter buttons show all categories
- [ ] Project grid shows 2 columns
- [ ] Cards have hover lift effect
- [ ] Navigation arrows appear on carousel hover

### Tablet (768-1023px)

- [ ] Navigation condensed but visible
- [ ] Hero carousel still works
- [ ] Project grid still 2 columns
- [ ] Filters wrap properly

### Mobile (<768px)

- [ ] Burger menu icon visible
- [ ] Menu slides in from right
- [ ] Overlay closes menu
- [ ] Project grid is 1 column
- [ ] Hero carousel is 40vh height
- [ ] Filter bar scrolls horizontally
- [ ] All touch interactions work

---

## 🚀 Performance

### Optimizations Implemented

- **Lazy loading**: All non-hero images use `loading="lazy"`
- **Eager loading**: Hero carousel images use `loading="eager"`
- **CDN**: Swiper.js loaded from jsdelivr CDN
- **CSS**: Modular component-based architecture
- **Animations**: GPU-accelerated (transform, opacity)
- **Debouncing**: Scroll events use requestAnimationFrame

### Recommendations

1. **Image optimization**: Compress all images (use WebP format)
2. **Caching**: Add service worker for offline support
3. **Bundle**: Consider bundling CSS/JS for production
4. **Font loading**: Use font-display: swap

---

## 🔧 Customization

### Changing Colors

Edit `/css/design-system.css`:

```css
:root {
    --color-primary: #YOUR_COLOR;
    --color-accent: #YOUR_COLOR;
}
```

### Changing Fonts

Edit `/css/design-system.css`:

```css
:root {
    --font-primary: 'YourFont', system-ui, sans-serif;
}
```

Add font import in `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=YourFont" rel="stylesheet">
```

### Changing Grid Columns

Edit `/css/components/project-grid.css`:

```css
.project-grid {
    grid-template-columns: repeat(3, 1fr); /* Change 2 to 3 */
}
```

### Changing Carousel Speed

Edit `/js/components/heroCarousel.js`:

```javascript
autoplay: {
    delay: 3000, // Change from 5000 to 3000 (3 seconds)
}
```

---

## 💡 Tips & Best Practices

1. **Always use design tokens**: Use `var(--color-primary)` instead of `#009251`
2. **Maintain spacing system**: Use `var(--space-4)` instead of `16px`
3. **Keep accessibility in mind**: Use semantic HTML, ARIA labels
4. **Test on real devices**: Not just browser dev tools
5. **Keep animations subtle**: Respect `prefers-reduced-motion`
6. **Document changes**: Add `// made by claude code` comments

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify logo is in `/assets/logo-algenord.svg`
3. Ensure all CSS/JS files are loaded (check Network tab)
4. Test in different browsers (Chrome, Firefox, Safari)
5. Clear cache and hard reload (Cmd+Shift+R / Ctrl+Shift+R)

---

## 🎉 Summary

You now have a modern, responsive UI with:

✅ Professional color scheme (green/orange)
✅ Featured image carousel
✅ Sticky navigation with mobile menu
✅ Category filtering
✅ Responsive 2-column grid
✅ Subtle animations
✅ Full accessibility support
✅ Clean, maintainable code

**Next Steps:**
1. Add your logo to `/assets/`
2. Update router in `main.js`
3. Test thoroughly
4. Add footer content
5. Go live! 🚀

---

_Made with ❤️ by Claude Code_