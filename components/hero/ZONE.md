# Zoning System Convention

The application uses an HTML `data-attribute` based cascading zoning system to seamlessly map foundational colors (background, text, accent) dynamically per page, without needing to override dozens of component props.

## How it works

At the root level of `index.css`, we define dynamic CSS variables bound to `data-zone` attributes on the HTML container.
- When no wrapper is present, the `<body class="bg-[#F2F2F0]">` acts as the default "Moss" zone (warm alabaster with green action).
- When a page root is wrapped and assigned a `data-zone` attribute, it fundamentally shifts the color palette for all descending components that listen to `.zone-*` utilities.

## Zones Defined

1. **Default (`brand-moss`):**
   Implicitly applied everywhere. Background: `brand-bg` (#F2F2F0), Text: `brand-dark` (#111111), primary CTA: `brand-moss` (#1A4D2E).

2. **Editorial (`data-zone="editorial"`):**
   Dark mode reading environment. Background: `brand-ink` (#0a0908), Text: `brand-paper` (#f4f1ea). Accents shift from green to `brand-brass`.

3. **Editorial Paper (`data-zone="editorial-paper"`):**
   Light mode reading environment. Background: `brand-paper` (#f4f1ea), Text: `brand-ink` (#0a0908). Accents are led by `brand-rust` with `brand-brass` as secondary.

## Applying Zones

To zone a page or sub-page, simply add the `data-zone` attribute to the top-level container of that page:
```tsx
const AboutPage = () => {
  return (
    <div data-zone="editorial" className="min-h-screen relative font-sans zone-bg zone-text">
       {/* All zone-aware components within will adopt the dark/brass aesthetics automatically */}
    </div>
  )
}
```

## Important Limitations

- Never replace `brand-moss` completely. Our firm's primary buttons (`Primary CTA`, `Submit Forms`) must remain `brand-moss` to ensure a consistent corporate anchor, even inside an editorial zone.
- Use explicit `zone-*` Tailwind utility classes (e.g. `zone-bg`, `zone-surface`, `zone-text`) for your newly created components so they listen to the override. Existing generic classes (`bg-brand-bg`) will not respond to the `zone` shift.
