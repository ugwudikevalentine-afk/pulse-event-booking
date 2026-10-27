# PULSE Design System & Brand Guidelines

This document outlines the visual identity and UI components used in the PULSE Event Booking platform. Use these specifications to extend the UI or create marketing materials.

## 🎨 Color Palette

### Primary (Dark Mode / Obsidian)
*   **Obsidian (Background):** `#0B0D0C`
*   **Graphite (Surface/Cards):** `#202522`
*   **Slate Moss (Accents):** `#6B7A6F`

### Brand Accents
*   **Electric Lime (Primary Action):** `#C6FF00`
*   **Dark Green (Secondary):** `#4D7C0F`

### Typography Colors
*   **Warm White (Text):** `#F5F5EF`
*   **Muted Text:** `#94A3B8`

### Status Colors
*   **Success:** `#22C55E`
*   **Error:** `#EF4444`
*   **Warning:** `#F59E0B`
*   **Info:** `#3B82F6`

---

## 🔡 Typography
*   **Primary Font:** Inter (Sans-serif) - *Imported via Next.js Google Fonts*
*   **Headings:** Bold/Semi-bold, Tracking-tight (-0.025em)
*   **Body:** Regular, Leading-relaxed

---

## 🍱 UI Components (Tailwind CSS v4)

### Buttons
*   **Primary Action:** Pill-shaped, `border-2 border-[#C6FF00]`, `text-[#C6FF00]`.
*   **Hover State:** Background fills with `#C6FF00`, text changes to `#0B0D0C`.

### Cards
*   **Standard Card:** Background `#202522`, Border `1px solid rgba(255,255,255,0.1)`, Rounded `1rem (xl)`.

### Inputs
*   **Form Fields:** Background `#0B0D0C`, Border `#202522`, Focus ring `#C6FF00`.

---

## 📐 Layout Principles
*   **Gutter/Spacing:** 4 (1rem), 8 (2rem), 12 (3rem) increments.
*   **Max Width:** `max-w-7xl` (1280px) for main containers.
*   **Visual Zones:** 
    *   **Dark Zone:** Default site-wide.
    *   **Light Zone:** Specific content sections using `.light-zone` class (Warm White background).