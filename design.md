---
name: Ryan Johnson AIA
colors:
  primary: "#313131"
  secondary: "gray"
  tertiary: "#ffab9f"
  tertiary-light: "#ffd1a4"
  neutral: "#FFFFFF"
typography:
  h1:
    fontFamily: "Abril Fatface"
    fontSize: 80px
    fontWeight: 200
  h2:
    fontFamily: "Lora"
    fontSize: 30px
    fontWeight: 100
  h3:
    fontFamily: "Roboto Slab"
    fontSize: 30px
    fontWeight: 300
  h4:
    fontFamily: "Teko"
    fontSize: 150px
    fontWeight: 300
  h5:
    fontFamily: "Teko"
    fontSize: 65px
    fontWeight: 300
  h6:
    fontFamily: "Roboto Slab"
    fontSize: 25px
    fontWeight: 100
  body:
    fontFamily: "Lora"
    fontSize: 15px
rounded:
  none: 0px
spacing:
  sm: 5px
  md: 10px
  lg: 50px
  xl: 100px
components:
  info-card:
    backgroundColor: "{colors.neutral}"
    padding: 10px
  info-card-hover:
    backgroundColor: "{colors.tertiary-light}"
  nav-overlay:
    backgroundColor: "{colors.tertiary}"
---
## Overview

A portfolio and personal site for Ryan Johnson - AIA. The UI evokes a clean, modern, architectural feel with a mix of serif, sans-serif, and cursive fonts, combined with a mostly monochromatic palette accented by salmon/red colors.

## Colors

The palette is rooted in high-contrast neutrals and a single accent color.
- **Primary (#313131):** Dark gray used for all text and headings.
- **Secondary (gray):** Used for links, secondary text, borders, and UI accents.
- **Tertiary (#ffab9f):** Brand base color used for link hovers and interactive overlays.
- **Tertiary Light (#ffd1a4):** Peach sunset used for card hovers.
- **Neutral (#FFFFFF):** White background.

## Typography

The typographic system uses a blend of Google Fonts to create a distinct architectural aesthetic.
- **Abril Fatface:** Used for the largest, most prominent headings (h1).
- **Roboto Slab:** Used for standard headings (h3, h6).
- **Teko:** Used for tight, tall typography (h4, h5).
- **Lora:** The foundational serif for all body copy.

## Layout

The layout uses a block-based structure with a maximum width container (`max-width: 1500px`). It employs fractional column classes (like `col-third`, `col-2third`, `col-half`) to create a structured grid. Vertical spacing is strictly controlled by explicit `whiteline` spacers of varying sizes to maintain a rigid rhythm.

## Elevation & Depth

Depth is primarily flat, relying on crisp edges and contrast. However, subtle elevation is used on floating text blocks (`#over` cards), which feature a delicate box-shadow (`6px 6px rgba(255, 171, 159, 0.2)`) and overlap underlying imagery to create a layered architectural composition.

## Shapes

The shape language is strictly orthogonal. No border radii are used, adhering to a stark, engineered aesthetic with sharp 90-degree corners (`0px`).

## Components

The system features image-overlay navigation blocks and floating info cards.
- **Info Cards:** Placed over images with a stark white background and a subtle colored shadow. Hovering changes the background to a soft tertiary light color.
- **Nav Overlays:** Complex, multi-stage overlays that use sequenced opacities to reveal a strong tertiary salmon color when hovered.

## Do's and Don'ts

- Do use the rigid grid classes to maintain structural alignment.
- Don't use rounded corners or soft shapes; keep all edges sharp and geometric.
- Do rely on the stark typography sizes to create contrast and hierarchy.
- Don't mix font families outside of their assigned roles (e.g., don't use Teko for body text).
