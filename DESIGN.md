# DESIGN.md — AskDocsV2 Design System

> **Source:** Stitch Project `AskDocsV2` · ID `16488524766486503784`
> **Extracted:** 2026-03-27 · **Mode:** Light · **Device:** Desktop

---

## 1. Creative North Star — "The Digital Curator"

Rather than a standard boxed-in SaaS interface, AskDocsV2 is built as a **sophisticated editorial environment** where AI-driven insights feel like a natural extension of the user's workflow. The philosophy embraces **Tonal Depth** and **Asymmetric Breathing Room** — breaking the "template" look through organic layering instead of rigid, high-contrast grid lines.

---

## 2. Typography

| Token          | Value  | Usage                                              |
|----------------|--------|----------------------------------------------------|
| `font`         | Inter  | Global UI font                                     |
| `headlineFont` | Inter  | Section headings & document titles                 |
| `bodyFont`     | Inter  | AI responses, body copy                            |
| `labelFont`    | Inter  | Status indicators, metadata labels                 |

### Type Scale Guidelines

| Level       | Style         | Notes                                                                 |
|-------------|---------------|-----------------------------------------------------------------------|
| Display     | `display-sm`  | Empty states & onboarding headers — authoritative but welcoming       |
| Headline    | `headline-sm` | Document titles; pair with `on_surface_variant` for metadata          |
| Body        | `body-lg`     | 1rem · line-height 1.6 — long-form AI responses, fatigue-free reading |
| Label       | `label-md`    | ALL-CAPS · 0.05em tracking — status chips (Processing, Ready, Failed) |

---

## 3. Color Palette

### Brand / Override Colors

| Name               | Hex       | Purpose                                      |
|--------------------|-----------|----------------------------------------------|
| Custom Primary     | `#3B82F6` | Override / brand accent (Tailwind Blue 500)  |
| Neutral Override   | `#0F172A` | Deep neutral base (Slate 900)                |

### Primary

| Token                    | Hex       | Usage                                      |
|--------------------------|-----------|--------------------------------------------|
| `primary`                | `#005ac2` | Main CTA backgrounds, links, focus rings   |
| `primary_dim`            | `#004fab` | Hover state for primary CTA (gradient end) |
| `primary_container`      | `#d8e2ff` | Secondary button bg, soft highlight areas  |
| `primary_fixed`          | `#d8e2ff` | Fixed primary container                    |
| `primary_fixed_dim`      | `#c3d4ff` | Icon tint — premium metallic-blue feel     |
| `on_primary`             | `#f7f7ff` | Text/icons on primary buttons              |
| `on_primary_container`   | `#004eaa` | Text on `primary_container`                |
| `on_primary_fixed`       | `#003c86` | Text on `primary_fixed`                    |
| `on_primary_fixed_variant` | `#0057bd` | Secondary text on fixed primary surfaces |
| `inverse_primary`        | `#4d8eff` | Primary color for dark/inverse contexts    |

### Secondary

| Token                      | Hex       | Usage                             |
|----------------------------|-----------|-----------------------------------|
| `secondary`                | `#5e5f65` | Secondary interactive elements    |
| `secondary_dim`            | `#515359` | Hover on secondary elements       |
| `secondary_container`      | `#e2e2e9` | Secondary container surfaces      |
| `secondary_fixed`          | `#e2e2e9` | Fixed secondary container         |
| `secondary_fixed_dim`      | `#d4d4db` | Fixed secondary dim               |
| `on_secondary`             | `#f9f8ff` | Text on secondary backgrounds     |
| `on_secondary_container`   | `#505157` | Text on secondary containers      |
| `on_secondary_fixed`       | `#3e3f45` | Text on secondary fixed           |
| `on_secondary_fixed_variant` | `#5a5b61` | Variant text on secondary fixed |

### Tertiary

| Token                      | Hex       | Usage                                  |
|----------------------------|-----------|----------------------------------------|
| `tertiary`                 | `#5f5c78` | Accents, decorative highlights         |
| `tertiary_dim`             | `#53506b` | Hover on tertiary elements             |
| `tertiary_container`       | `#d3ceef` | "Processing" status badge background  |
| `tertiary_fixed`           | `#d3ceef` | Fixed tertiary container              |
| `tertiary_fixed_dim`       | `#c5c0e0` | Fixed tertiary dim                    |
| `on_tertiary`              | `#fcf7ff` | Text on tertiary backgrounds          |
| `on_tertiary_container`    | `#47445f` | Text on tertiary containers           |
| `on_tertiary_fixed`        | `#34314b` | Text on tertiary fixed                |
| `on_tertiary_fixed_variant` | `#504e69` | Variant text on tertiary fixed       |

### Surface Hierarchy (The Layering System)

| Level    | Token                       | Hex       | Usage                                          |
|----------|-----------------------------|-----------|------------------------------------------------|
| Level 0  | `surface`                   | `#faf8ff` | Base canvas — the vast open workspace          |
| Level 0  | `surface_bright`            | `#faf8ff` | Primary document reading area (max focus)      |
| Level 1  | `surface_container_lowest`  | `#ffffff`  | Pure white — floating glass surfaces          |
| Level 1  | `surface_container_low`     | `#f2f3ff` | Sidebars, secondary navigation                 |
| Level 2  | `surface_container`         | `#eaedff` | Main workspace, chat bubble containers         |
| Level 3  | `surface_container_high`    | `#e2e7ff` | Active areas, elevated section                 |
| Level 3  | `surface_container_highest` | `#d9e2ff` | Active document cards, popovers                |
| —        | `surface_dim`               | `#cdd9ff` | Dimmed/inactive surface states                 |
| —        | `surface_variant`           | `#d9e2ff` | AI citation callouts within chat              |
| —        | `surface_tint`              | `#005ac2` | Surface tint color (matches primary)           |

### On-Surface (Text & Icon Colors)

| Token               | Hex       | Usage                                              |
|---------------------|-----------|----------------------------------------------------|
| `on_surface`        | `#113069` | All "black" text — never use `#000000`             |
| `on_surface_variant`| `#445d99` | Metadata, subtitles, ghost/secondary labels        |
| `on_background`     | `#113069` | Text on the base background                        |
| `inverse_on_surface`| `#959cb5` | Text on inverse/dark surfaces                      |
| `inverse_surface`   | `#060e20` | Inverse/dark surface backgrounds                   |

### Background

| Token        | Hex       | Usage              |
|--------------|-----------|--------------------|
| `background` | `#faf8ff` | Page background    |

### Error

| Token                 | Hex       | Usage                             |
|-----------------------|-----------|-----------------------------------|
| `error`               | `#9f403d` | Error states, destructive actions |
| `error_container`     | `#fe8983` | "Failed" status badge background  |
| `error_dim`           | `#4e0309` | Dark error tint                   |
| `on_error`            | `#fff7f6` | Text on error backgrounds         |
| `on_error_container`  | `#752121` | Text on error containers          |

### Outline / Dividers

| Token             | Hex       | Usage                                                     |
|-------------------|-----------|-----------------------------------------------------------|
| `outline`         | `#6079b7` | Accessible borders, focus rings                           |
| `outline_variant` | `#98b1f2` | "Ghost borders" at 20% opacity — accessibility fallback   |

---

## 4. Shape & Spacing

| Token        | Value   | Usage                                         |
|--------------|---------|-----------------------------------------------|
| `roundness`  | `8px`   | Base corner radius for cards, containers      |
| `sm`         | `4px`   | Citation callouts, nested inner elements      |
| `md`         | `12px`  | Primary buttons, nested elements              |
| `lg`         | `16px`  | Chat inputs, text fields, larger containers   |
| `spacingScale` | `2`   | Spacing multiplier for layout rhythm          |

> **Rule:** Mix `lg` (1rem) for outer containers and `md` (0.75rem) for nested elements to create visual nesting depth.

---

## 5. Elevation & Depth

Depth is achieved through **Tonal Layering**, not box shadows.

### Layering Principle
Use surface container tiers to imply physical elevation:
- A "Ready" document card (`surface_container_lowest`) on a `surface_container_low` background = soft, natural lift.

### Ambient Modal Shadow
```css
box-shadow: 0px 4px 24px rgba(17, 48, 105, 0.06);
```

### Ghost Border Fallback (Accessibility)
```css
border: 1px solid rgba(152, 177, 242, 0.20); /* outline_variant at 20% */
```

> ⚠️ **Prohibition:** Never use 1px solid borders for sectioning. Separate regions with background color shifts and padding.

---

## 6. Component Specs

### Buttons

| Variant   | Background                                | Text Color             | Corner | Hover                  |
|-----------|-------------------------------------------|------------------------|--------|------------------------|
| Primary   | `primary` → `primary_dim` (135° gradient) | `on_primary`           | `md`   | `primary_dim`          |
| Secondary | `primary_container`                       | `on_primary_container` | `md`   | Deepen slightly        |
| Ghost     | transparent                               | `on_surface_variant`   | `md`   | `surface_container_low` bg |

### Inputs (The Intelligent Command)

```css
background:    #ffffff;                              /* surface_container_lowest */
border:        1px solid rgba(152, 177, 242, 0.20); /* outline_variant @ 20% */
border-radius: 1rem;                                 /* lg */
/* Focus state */
box-shadow:    0 0 0 2px rgba(0, 90, 194, 0.15);   /* primary @ 15% */
```

### Status Badges (Tonal Pattern)

| State      | Background          | Text Color             |
|------------|---------------------|------------------------|
| Processing | `tertiary_container` (#d3ceef) | `on_tertiary_container` (#47445f) |
| Ready      | `primary_container` (#d8e2ff)  | `on_primary_container` (#004eaa)  |
| Failed     | `error_container`   (#fe8983)  | `on_error_container`   (#752121)  |

> Label text: ALL-CAPS · `label-md` · 0.05em letter-spacing

### Cards & Lists

- **No divider lines** between items — use `gap: 0.375rem` (1.5 spacing) and background color shifts.
- **AI Citations:** `surface_variant` (#d9e2ff) background · `sm` (0.25rem) radius.

---

## 7. Glass & Gradient Effects

### Primary CTA Gradient
```css
background: linear-gradient(135deg, #005ac2, #004fab);
```

### Glassmorphism (Document Actions / Hover States)
```css
background:        rgba(255, 255, 255, 0.80); /* surface_container_lowest @ 80% */
backdrop-filter:   blur(12px);
-webkit-backdrop-filter: blur(12px);
```

---

## 8. Do's and Don'ts

### ✅ Do
- Use **asymmetrical spacing** (e.g., more padding at the bottom) to create a sense of gravity.
- Tint icons with `primary_fixed_dim` (#c3d4ff) for a premium, metallic-blue feel.
- Use `surface_bright` for the primary document reading area to maximize focus.
- Use `on_surface` (#113069) for all "black" text — never `#000000`.

### ❌ Don't
- **Don't** use pure black (`#000000`) anywhere in the UI.
- **Don't** use 1px solid borders to separate sections — use color shifts and whitespace.
- **Don't** use `0.5rem` rounding uniformly — mix `lg`/`md` for nesting depth.
- **Don't** use drop shadows on cards — use Tonal Layering (surface shifts) first. Shadows are a last resort for floating elements only.

---

## 9. Quick Reference — CSS Variables

```css
:root {
  /* Primary */
  --color-primary:                #005ac2;
  --color-primary-dim:            #004fab;
  --color-primary-container:      #d8e2ff;
  --color-primary-fixed:          #d8e2ff;
  --color-primary-fixed-dim:      #c3d4ff;
  --color-on-primary:             #f7f7ff;
  --color-on-primary-container:   #004eaa;
  --color-inverse-primary:        #4d8eff;

  /* Secondary */
  --color-secondary:              #5e5f65;
  --color-secondary-dim:          #515359;
  --color-secondary-container:    #e2e2e9;
  --color-on-secondary:           #f9f8ff;
  --color-on-secondary-container: #505157;

  /* Tertiary */
  --color-tertiary:               #5f5c78;
  --color-tertiary-container:     #d3ceef;
  --color-on-tertiary:            #fcf7ff;
  --color-on-tertiary-container:  #47445f;

  /* Surface */
  --color-surface:                    #faf8ff;
  --color-surface-bright:             #faf8ff;
  --color-surface-dim:                #cdd9ff;
  --color-surface-variant:            #d9e2ff;
  --color-surface-container-lowest:   #ffffff;
  --color-surface-container-low:      #f2f3ff;
  --color-surface-container:          #eaedff;
  --color-surface-container-high:     #e2e7ff;
  --color-surface-container-highest:  #d9e2ff;
  --color-surface-tint:               #005ac2;
  --color-inverse-surface:            #060e20;
  --color-inverse-on-surface:         #959cb5;

  /* On Surface */
  --color-on-surface:         #113069;
  --color-on-surface-variant: #445d99;
  --color-background:         #faf8ff;
  --color-on-background:      #113069;

  /* Error */
  --color-error:              #9f403d;
  --color-error-container:    #fe8983;
  --color-error-dim:          #4e0309;
  --color-on-error:           #fff7f6;
  --color-on-error-container: #752121;

  /* Outline */
  --color-outline:         #6079b7;
  --color-outline-variant: #98b1f2;

  /* Typography */
  --font-headline: 'Inter', sans-serif;
  --font-body:     'Inter', sans-serif;
  --font-label:    'Inter', sans-serif;

  /* Shape */
  --radius-sm: 4px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-base: 8px;
}
```
