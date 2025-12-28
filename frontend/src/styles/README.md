# Mobile-First SCSS Architecture with BEM

This project implements a comprehensive mobile-first responsive design system using SCSS with BEM (Block Element Modifier) naming conventions.

## 📱 Mobile-First Breakpoints

```scss
$breakpoint-mobile: 320px; // Small mobile devices
$breakpoint-tablet: 641px; // Tablets and large mobile
$breakpoint-desktop: 1024px; // Desktop and laptops
$breakpoint-large: 1281px; // Large screens
```

## 🏗️ Architecture Overview

```
src/styles/
├── _variables.scss          # Design tokens, colors, spacing, typography
├── _mixins.scss            # Reusable mixins with mobile-first approach
├── _base.scss              # Global base styles and resets
├── _utilities.scss         # Utility classes for quick styling
├── main.scss              # Main entry point
├── components/            # BEM component styles
│   ├── _layout.scss       # Layout utilities and grid system
│   ├── _buttons.scss      # Button components
│   ├── _forms.scss        # Form components
│   ├── _cards.scss        # Card components
│   ├── _navigation.scss   # Navigation components
│   └── _assignment-workspace.scss # Complex workspace component
└── README.md              # This documentation
```

## 🎯 BEM Naming Convention

### Block

The standalone entity that is meaningful on its own.

```scss
.card {
}
.button {
}
.nav {
}
```

### Element

A part of a block that has no standalone meaning.

```scss
.card__header {
}
.card__body {
}
.card__footer {
}
.button__icon {
}
.nav__list {
}
.nav__item {
}
```

### Modifier

A flag on a block or element that changes appearance or behavior.

```scss
.card--highlighted {
}
.card--compact {
}
.button--primary {
}
.button--large {
}
.nav__link--active {
}
```

## 📱 Mobile-First Approach

### Responsive Mixins

```scss
// Mobile-first (min-width)
@include mobile-up {
} // 320px+
@include tablet-up {
} // 641px+
@include desktop-up {
} // 1024px+
@include large-up {
} // 1281px+

// Max-width for overrides
@include mobile-only {
} // up to 640px
@include tablet-only {
} // 641px to 1023px
```

### Touch-Friendly Design

- Minimum touch target: 44px (48px on small screens)
- Touch spacing: 12px minimum between interactive elements
- `touch-action: manipulation` to prevent double-tap zoom
- Larger font sizes on mobile for better readability

### Example Mobile-First Component

```scss
.btn {
  // Mobile-first: larger touch targets
  min-height: 48px;
  padding: $spacing-md $spacing-lg;
  font-size: $font-size-lg;

  // Tablet and up: refined sizing
  @include tablet-up {
    min-height: $touch-target-min;
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-sm;
  }

  // Touch feedback
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
}
```

## 🎨 Design System

### Colors

- Primary: `$primary-color` (#2563eb)
- Success: `$success-color` (#10b981)
- Warning: `$warning-color` (#f59e0b)
- Error: `$error-color` (#ef4444)

### Typography Scale (Mobile-First)

```scss
// Mobile sizes are larger for better readability
h1: $font-size-3xl → $font-size-4xl (tablet+)
h2: $font-size-2xl → $font-size-3xl (tablet+)
body: $font-size-lg → $font-size-base (tablet+)
```

### Spacing Scale

```scss
$spacing-xs: 0.25rem; // 4px
$spacing-sm: 0.5rem; // 8px
$spacing-md: 1rem; // 16px
$spacing-lg: 1.5rem; // 24px
$spacing-xl: 2rem; // 32px
$spacing-2xl: 3rem; // 48px
$spacing-3xl: 4rem; // 64px
```

## 🧩 Component Examples

### Button Usage

```html
<!-- Primary button -->
<button class="btn btn--primary">Submit</button>

<!-- Large secondary button -->
<button class="btn btn--secondary btn--large">Cancel</button>

<!-- Button with icon -->
<button class="btn btn--primary">
  <span class="btn__icon">📧</span>
  Send Email
</button>

<!-- Full width on mobile -->
<button class="btn btn--primary btn--full-width">Continue</button>
```

### Card Usage

```html
<div class="card card--interactive">
  <div class="card__header">
    <h3 class="card__title">Assignment Title</h3>
    <p class="card__subtitle">Difficulty: Medium</p>
  </div>
  <div class="card__body">
    <p>Assignment description...</p>
  </div>
  <div class="card__footer">
    <div class="card__actions">
      <button class="btn btn--primary">Start</button>
      <button class="btn btn--secondary">Preview</button>
    </div>
  </div>
</div>
```

### Form Usage

```html
<form class="form">
  <div class="form__group">
    <label class="form__label form__label--required">Email</label>
    <input type="email" class="form__input" placeholder="Enter your email" />
    <span class="form__error">Please enter a valid email</span>
  </div>

  <div class="form__actions">
    <button type="submit" class="btn btn--primary">Submit</button>
    <button type="button" class="btn btn--secondary">Cancel</button>
  </div>
</form>
```

### Navigation Usage

```html
<nav class="nav">
  <button class="nav__toggle">☰</button>
  <div class="nav__menu">
    <ul class="nav__list">
      <li class="nav__item">
        <a href="/" class="nav__link nav__link--active">Home</a>
      </li>
      <li class="nav__item">
        <a href="/assignments" class="nav__link">Assignments</a>
      </li>
    </ul>
  </div>
</nav>
```

## 🛠️ Utility Classes

### Layout

```html
<div class="flex flex--mobile-column flex--between">
  <div class="grid grid--2-col">
    <div class="container"></div>
  </div>
</div>
```

### Spacing

```html
<div class="spacing--mt-lg spacing--mb-xl">
  <div class="spacing--pt-md spacing--pb-lg"></div>
</div>
```

### Typography

```html
<p class="text--center text--lg text--bold"></p>
<p class="text--truncate text--muted"></p>
```

### Responsive Visibility

```html
<div class="show--mobile-only">Mobile only content</div>
<div class="hide--mobile-only">Hidden on mobile</div>
<div class="show--tablet-up">Tablet and desktop</div>
```

## 🎯 Best Practices

### 1. Mobile-First Development

- Start with mobile styles (320px)
- Use `min-width` media queries to enhance for larger screens
- Test on actual devices, not just browser dev tools

### 2. Touch-Friendly Design

- Minimum 44px touch targets (48px on small screens)
- 12px minimum spacing between interactive elements
- Use `touch-action: manipulation` to prevent zoom
- Provide visual feedback for touch interactions

### 3. BEM Naming

- Use single hyphens for compound words: `nav-item`
- Use double hyphens for modifiers: `button--primary`
- Use double underscores for elements: `card__header`
- Keep names descriptive but concise

### 4. Performance

- Use SCSS nesting sparingly (max 3 levels)
- Leverage mixins for repeated patterns
- Use utility classes for common styles
- Minimize CSS output with efficient selectors

### 5. Accessibility

- Maintain color contrast ratios
- Use semantic HTML with SCSS styling
- Provide focus indicators
- Test with screen readers

## 🔧 Development Workflow

1. **Design Mobile First**: Start with 320px viewport
2. **Use BEM**: Follow Block\_\_Element--Modifier pattern
3. **Leverage Mixins**: Use provided mixins for consistency
4. **Test Responsively**: Check all breakpoints
5. **Validate Touch**: Ensure 44px+ touch targets
6. **Optimize Performance**: Keep CSS lean and efficient

## 📚 Resources

- [BEM Methodology](http://getbem.com/)
- [Mobile-First Design](https://www.lukew.com/ff/entry.asp?933)
- [Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [SCSS Documentation](https://sass-lang.com/documentation)
