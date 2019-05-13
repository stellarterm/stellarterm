---
id: others
title: Misc solar things
category: Documents
---

## Responsiveness
### Breakpoints
Solar is built in a mobile first way and breakpoints only use `min-width`. Styles in smaller breakpoints cascade to larger breakpoints until overwritten by those larger breakpoints. These breakpoints are shared by both media queries and element queries. The smallest screen we reasonably design for is 240px.

- **x-small** `xs`: `min-width: 360px`
- **small** `s`: `min-width: 480px`
- **medium** `m`: `min-width: 640px`
- **large** `l`: `min-width: 840px`
- **x-large** `xl`: `min-width: 1080px`

Why? There are no such thing as a perfect set of breakpoints but these are fine grained and flexible. Each breakpoint is quadratically (60px) bigger than the previous one (360 + 120 = 480; 480 + 160 = 640; 640 + 200 = 840; 640 + 200 = 1080).

These breakpoints are represented as `em`'s in the code but should still refer to these set pixel sizes.

### Media queries
Media queries respond to the screen width. Usage:
```css
.widget-demo__child {
  // Styles here will show up regardless of screen width
  background: pink;
  @include r-media(m) {
    // These styles will show up when widget demo's width is 540px or greater
    border: 2px solid black;
  }
}
```

### Element queries (concept only; not yet implemented)
Element queries respond to the closest element that has element queries enabled. The breakpoint chosen will be based on the parent's width (not including padding or border). Element query parents can not nest.

Warning: Only use element queries on elements that won't change in size due to the element query styles. If this is not followed, an infinite loop of ping-ponging styles can happen.

#### Example
```html
<div element-query class="widget-demo">
  <div class="widget-demo__child">
</div>
```

```css
.widget-demo__child {
  // Styles here will show up regardless of element query width
  background: pink;
  @include r-element(m) {
    // These styles will show up when widget demo parent elementQuery width is 540px or greater
    border: 2px solid black;
  }
}
```
