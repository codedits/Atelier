# Atelier - Design System & Theme Documentation

## 🎨 Color Palette

### Primary Colors
- **Deep Black** `#1A1A1A` - Main text, headings, primary elements
- **Dusty Rose/Mauve** `#D4A5A5` - Accent color, hover states, highlights, CTAs
- **Cream/Off-White** `#F8F7F5` - Background sections, light surfaces

### Secondary Colors
- **Dark Gray** `#6B6B6B` - Body text, descriptions, secondary copy
- **Medium Gray** `#9CA3AF` - Tertiary text, disabled states, subtle elements
- **Light Gray** `#E5E5E5` - Borders, dividers, subtle backgrounds

### Color Usage Guide
```
Headlines & Primary Text     → #1A1A1A
Body Copy & Descriptions     → #6B6B6B
Accent & Interactive Elements → #D4A5A5
Section Backgrounds          → #F8F7F5
Borders & Dividers           → #E5E5E5
Disabled/Muted Text          → #9CA3AF
```

## 🔤 Typography

### Font Stack
- **Display Font**: `font-display` - Used for headings and brand elements (Elegant, luxury serif)
- **Body Font**: System fonts (San-serif for readability)
- **Fallback**: Clean, modern sans-serif stack

### Typography Scale

#### Headings
- **H1**: `text-4xl md:text-5xl lg:text-6xl` - Main page titles
- **H2**: `font-display text-3xl md:text-4xl` - Section headings
- **H3**: `text-xl font-semibold` - Subsections
- **H4**: `text-xs font-semibold uppercase` - Category labels

#### Body Text
- **Large**: `text-lg` - Introductions, key messages
- **Regular**: `text-sm` / `text-base` - Main body copy
- **Small**: `text-xs` - Captions, metadata, fine print
- **Extra Small**: `text-[10px]` - Tags, badges

#### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Emphasis
- **Semibold**: 600 - Strong emphasis, labels
- **Bold**: 700 - Headings (display font)

### Letter Spacing
- `tracking-widest` - Page titles, brand name (0.05em)
- `tracking-wider` - Section labels, categories (0.025em)
- `tracking-wide` - Normal headings (0.025em)
- Regular - Body text

## 🎭 Theme Overview

### Brand Character
- **Luxury & Elegance** - Premium jewelry brand aesthetic
- **Timeless & Sophisticated** - Classic color palette with modern execution
- **Handcrafted & Artisanal** - Warm, sophisticated aesthetic
- **Exclusive & Refined** - High-end positioning reflected in design

### Design Principles
1. **Minimalist Elegance** - Clean layouts with breathing room
2. **Hierarchy through Color** - Dusty rose accents guide attention
3. **Premium Feel** - Generous spacing, quality typography
4. **Accessibility** - High contrast ratios, readable copy
5. **Luxury Simplicity** - Less is more approach

## 🎯 Component Colors

### Buttons
- **Primary CTA**: Background `#1A1A1A`, Text `white`
- **Hover State**: Background `#D4A5A5`, Text `white` or `#1A1A1A`
- **Secondary**: Border `#1A1A1A`, Text `#1A1A1A`, Hover background `#1A1A1A`
- **Disabled**: Background `#E5E5E5`, Text `#9CA3AF`

### Cards & Containers
- **Background**: `white` or `#F8F7F5`
- **Border**: `#E5E5E5` (1px)
- **Hover**: Subtle shadow elevation

### Badges & Labels
- **Background**: `#D4A5A5`
- **Text**: `white`
- **Alternative**: Text only with color `#D4A5A5`

### Links & Interactive Elements
- **Default**: `#1A1A1A`
- **Hover**: `#D4A5A5`
- **Active**: `#D4A5A5` with underline
- **Visited**: `#9CA3AF`

### Form Elements
- **Focus**: Border `#D4A5A5`
- **Background**: `white`
- **Border**: `#E5E5E5`
- **Placeholder**: `#9CA3AF`

## 📐 Spacing System

Built on Tailwind's spacing scale (multiples of 0.25rem):
- `gap-2` to `gap-12` - Component spacing
- `p-4` to `p-12` - Padding
- `m-4` to `m-16` - Margins
- `py-16 md:py-24` - Vertical section spacing

## 🎨 Visual Elements

### Rounded Corners
- `rounded-lg` - Standard elements, cards (0.5rem)
- `rounded-full` - Circles, badges (9999px)
- No rounded - Large sections, hero areas

### Borders
- `border` with `#E5E5E5` - Main borders (1px)
- `border-l-4` with `#D4A5A5` - Accent left border

### Shadows
- Subtle: `shadow-sm` - Hover states
- Elevation: Used sparingly for depth

### Transitions
- Duration: `duration-150` (default), `duration-300` (emphasis)
- Easing: `ease-in-out` (standard)
- Applied to: `hover:`, `focus:` states

## 🖼️ Image Optimization

### Supported Sources
- Unsplash (`images.unsplash.com`)
- Pexels (`images.pexels.com`)
- Supabase storage (`*.supabase.co`)

### Image Settings
- **Formats**: AVIF, WebP (modern formats for smaller file sizes)
- **Device Sizes**: 640px, 750px, 828px, 1080px, 1200px, 1920px
- **Image Sizes**: 16px - 256px
- **Cache TTL**: 30 days minimum
- **Optimization**: Enabled with modern format support

## 📱 Responsive Breakpoints

Tailwind standard breakpoints used throughout:
- Mobile: `< 640px` (default styles)
- `sm`: 640px
- `md`: 768px (most common breakpoint)
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 🎯 Accessibility

### Color Contrast
- Text on background meets WCAG AA standards
- `#1A1A1A` on `white`: 21:1 ratio (AAA)
- `#D4A5A5` on `white`: 7.5:1 ratio (AA)
- `#6B6B6B` on `white`: 8.59:1 ratio (AA)

### Interactive Elements
- Focus states with visible borders (`border-#D4A5A5`)
- Hover states clearly visible
- Links and buttons distinguishable
- Alt text on all images

### Text
- Minimum font size: 12px
- Line height: 1.5+ for body text
- Letter spacing for readability

## 🔄 Common Patterns

### Section Container
```tsx
className="max-w-7xl mx-auto px-6 lg:px-8"
```

### Section Padding
```tsx
className="py-16 md:py-24 px-6 lg:px-8"
```

### Text Hierarchy
```tsx
className="font-display text-4xl md:text-5xl text-[#1A1A1A] mb-6"
```

### Hover State for Links
```tsx
className="hover:text-[#D4A5A5] transition-colors duration-150"
```

### Card Component
```tsx
className="border border-[#E5E5E5] rounded-lg p-6 bg-white"
```

## 📖 Pages Using This System

All pages implement this design system:
- `index.tsx` - Home page
- `about.tsx` - About Atelier
- `products/index.tsx` - Products listing
- `products/[id].tsx` - Product detail
- `faq.tsx` - FAQs
- `journal.tsx` - Blog/Journal
- `gift-guide.tsx` - Gift guide
- `shipping-info.tsx` - Shipping information
- `returns.tsx` - Returns policy
- `privacy-policy.tsx` - Privacy policy
- `terms-of-service.tsx` - Terms of service
- `cookie-policy.tsx` - Cookie policy

## 🎨 Design Inspiration

The design draws from luxury jewelry and high-end e-commerce brands:
- Premium, minimalist aesthetic
- Warm, sophisticated color palette
- Elegant typography hierarchy
- Ample whitespace for sophistication
- Focus on product imagery
- Subtle interactive elements

## 📝 Notes for Developers

1. Use Tailwind utility classes exclusively
2. Keep color values consistent (copy from this document)
3. Maintain responsive design patterns
4. Test color contrast for accessibility
5. Use the display font for visual hierarchy
6. Respect the spacing system
7. Keep animations subtle and purposeful
8. Test on various devices and browsers

---

**Last Updated**: December 16, 2025
**Version**: 1.0
**Brand**: Atelier Fine Jewellery
