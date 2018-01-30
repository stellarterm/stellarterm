---
id: basics
title: Solar Basics (non themeable)
category: Guides
---

**Note: This guide is outdated and was intended to be viewed in a tool that was never finished.**

## S-flex (S-flexItem)[layout]
[Flexbox](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Flexible_boxes) is a new powerful layout mode. S-flex is a set of predefined common flex use cases. It assumes the developer using it has at least a basic understand of the flexbox model.

**Warning: examples and usages in code elsewhere may be out of date. The most up to date reference is in the sections labeled `Reference source code (styles/_layout.flex.scss)`**

### What it provides:
- a set of common flex children sizes

### What it is not:
- an auto-prefixer
- a replacement for css flex properties

### flex-grow 12 basis
Flexbox with a default basis of 12. Here is an example of how it would look like with the basis set
```
| 1/2 basis: 12 | 1/2 basis: 12 | (total: 24)
| 1/3 basis: 12 | 1/3 basis: 12 | 1/3 basis: 12 | (total: 36)
| 2/3 basis: 12 | 1/3 basis: 6 | (total: 18)
| 3/4 basis: 12 | 1/4 basis: 4 | (total: 16)
| 60% basis: 12 | 20% basis: 4 | 20% basis: 4 | (total: 20)
| 50% basis: 12 | 16.6% basis: 4 | 16.6% basis: 4 | 16.6% basis: 4 | (total: 24)
```

When adjusting basis, stay at basis 12 or under.

For now, flex-shrink values assume a default of 1 while flex-grow assumes a default of 12.

### flex container reference
There are 4 different types of containers available:
- S-flex-row
- S-flex-rowWrap
- S-flex-col
- S-flex-colWrap

Reference source code (styles/_layout.flex.scss):
```
// flex containers (all of them have display: flex)
.S-flex-row     { @include S-flex-row; } // flex-direction: row;
.S-flex-rowWrap { @include S-flex-rowWrap; } // flex-flow: row wrap;
.S-flex-col     { @include S-flex-col; } // flex-direction: column;
.S-flex-colWrap { @include S-flex-colWrap; } // flex-flow: column wrap;
```

### flex item reference
These classes are not meant to be comprehensive and for complex cases, you may need to write your own.
<!-- csv to markdown table style="white-space: nowrap"
name,class/mixin name,grow,shrink,basis,description
 ,(no `flex` specified),0,1,auto,<small>when no flex explicitly specified it uses `width` info</small>
 ,(shorthand omission default),1,1,auto,t<small>hese are the values filled when items omitted in shorthand</small>
none,`S-flexItem-none`,0,0,auto,<small>no flexing: takes up space it needs or defined. Same as `flex: none`</small>
full,`S-flexItem-full`,12,0,100%,<small>always takes up the main-size (slightly different from theoretical 12of12)</small>
share[N],`S-flexItem-share`,12,0,0%,<small>all space completely distributed (could get crumpled to ~0px); basis of N: 1 2 3 4 6 8 10</small>
auto[N],`S-flexItem-N`,N,0,auto,<small>extra space distributed; basis of N: 1 2 3 4 6 8 10</small>
MofN,`S-flexItem-MofN`,0,0,100%*M/N,<small>non-resizing column sizes. available for M in range 1-11 with N at 12. always reduced</small>
-->

<table>
<tr><td>name</td><td>class/mixin name</td><td>grow</td><td>shrink</td><td>basis</td><td>description</td></tr>
<tr><td> </td><td style="white-space: nowrap">(no `flex` specified)</td><td>0</td><td>1</td><td>auto</td><td><small>when no flex explicitly specified it uses `width` info</small></td></tr>
<tr><td> </td><td style="white-space: nowrap">(shorthand omission default)</td><td>1</td><td>1</td><td>auto</td><td>t<small>hese are the values filled when items omitted in shorthand</small></td></tr>
<tr><td>none</td><td style="white-space: nowrap">`S-flexItem-none`</td><td>0</td><td>0</td><td>auto</td><td><small>no flexing: takes up space it needs or defined. Same as `flex: none`</small></td></tr>
<tr><td>full</td><td style="white-space: nowrap">`S-flexItem-full`</td><td>12</td><td>0</td><td>100%</td><td><small>always takes up the main-size (slightly different from theoretical 12of12)</small></td></tr>
<tr><td>share[N]</td style="white-space: nowrap"><td>`S-flexItem-share`</td><td>12</td><td>0</td><td>0%</td><td><small>all space completely distributed (could get crumpled to ~0px); basis of N: 1 2 3 4 6 8 10</small></td></tr>
<tr><td>auto[N]</td style="white-space: nowrap"><td>`S-flexItem-N`</td><td>N</td><td>0</td><td>auto</td><td><small>extra space distributed; basis of N: 1 2 3 4 6 8 10</small></td></tr>
<tr><td>MofN</td><td style="white-space: nowrap">`S-flexItem-MofN`</td><td>0</td><td>0</td><td>100%*M/N</td><td><small>non-resizing column sizes. available for M in range 1-11 with N at 12. always reduced</small></td></tr>
</table>

Note: CSSWG might (or might not) rename flex-basis of `auto` to `main-size` in future versions of flex

Reference source code (styles/_layout.flex.scss):
```scss
// no flexing
.S-flexItem-none { @include S-flexItem-none; } // flex: 0 0 auto;

// full row
.S-flexItem-full { @include S-flexItem-full; }   // flex: 12 0 100%;

// share sizes (all space distributed)
.S-flexItem-share1  { @include S-flexItem-share1; }  // flex: 1 0 0%;
.S-flexItem-share2  { @include S-flexItem-share2; }  // flex: 2 0 0%;
.S-flexItem-share3  { @include S-flexItem-share3; }  // flex: 3 0 0%;
.S-flexItem-share4  { @include S-flexItem-share4; }  // flex: 4 0 0%;
.S-flexItem-share6  { @include S-flexItem-share6; }  // flex: 6 0 0%;
.S-flexItem-share8  { @include S-flexItem-share8; }  // flex: 8 0 0%;
.S-flexItem-share10 { @include S-flexItem-share10; } // flex: 10 0 0%;
.S-flexItem-share   { @include S-flexItem-share; }   // flex: 12 0 0%;

// auto sizes (extra space distributed)
.S-flexItem-auto1  { @include S-flexItem-auto1; }  // flex: 1 0 auto;
.S-flexItem-auto2  { @include S-flexItem-auto2; }  // flex: 2 0 auto;
.S-flexItem-auto3  { @include S-flexItem-auto3; }  // flex: 3 0 auto;
.S-flexItem-auto4  { @include S-flexItem-auto4; }  // flex: 4 0 auto;
.S-flexItem-auto6  { @include S-flexItem-auto6; }  // flex: 6 0 auto;
.S-flexItem-auto8  { @include S-flexItem-auto8; }  // flex: 8 0 auto;
.S-flexItem-auto10 { @include S-flexItem-auto10; } // flex: 10 0 auto;
.S-flexItem-auto   { @include S-flexItem-auto; }   // flex: 12 0 auto;

// column sizes
.S-flexItem-5of6 { @include S-flexItem-11of12; } // flex: 0 0 91.66666%; // 11of12
.S-flexItem-5of6 { @include S-flexItem-5of6; }   // flex: 0 0 83.33333%; // 10of12
.S-flexItem-3of4 { @include S-flexItem-3of4; }   // flex: 0 0 75%;       // 9of12
.S-flexItem-2of3 { @include S-flexItem-2of3; }   // flex: 0 0 66.66666%; // 8of12
.S-flexItem-1of3 { @include S-flexItem-7of12; }  // flex: 0 0 58.33333%; // 5of12
.S-flexItem-1of2 { @include S-flexItem-1of2; }   // flex: 0 0 50%;       // 6of12
.S-flexItem-1of3 { @include S-flexItem-5of12; }  // flex: 0 0 41.66666%; // 5of12
.S-flexItem-1of3 { @include S-flexItem-1of3; }   // flex: 0 0 33.33333%; // 4of12
.S-flexItem-1of4 { @include S-flexItem-1of4; }   // flex: 0 0 25%;       // 3of12
.S-flexItem-1of6 { @include S-flexItem-1of6; }   // flex: 0 0 16.66666%; // 2of12
.S-flexItem-1of12 { @include S-flexItem-1of12; } // flex: 0 0 8.33333%;  // 1of12
```

### Demos
<div class="S-flex-rowWrap solarDocs-flexDemo-container">
  <div class="S-flexItem-share">.S-flexItem-share</div>
  <div class="S-flexItem-share">.S-flexItem-share</div>
</div>
<div class="S-flex-rowWrap solarDocs-flexDemo-container">
  <div class="S-flexItem-addon">.S-flexItem-addon</div>
  <div class="S-flexItem-share">.S-flexItem-share</div>
</div>
<div class="S-flex-rowWrap solarDocs-flexDemo-container">
  <div class="S-flexItem-addon">.S-flexItem-addon</div>
  <div class="S-flexItem-share">.S-flexItem-share</div>
  <div class="S-flexItem-share">.S-flexItem-share</div>
</div>
<div class="S-flex-rowWrap solarDocs-flexDemo-container">
  <div class="S-flexItem-addon">.S-flexItem-addon</div>
  <div class="S-flexItem-full">.S-flexItem-full</div>
  <div class="S-flexItem-share">.S-flexItem-share</div>
</div>

Grid proportioned flex items are not a direct replacement for traditional grids since this does not take into account the gutters (and no, adding a bit of margin-right does not make it a true grid column). They do add a quick simple way to proportionally take up space and this is useful for inputGroups.

<div class="S-flex-rowWrap solarDocs-flexDemo-container">
  <div class="S-flexItem-1of4">.S-flexItem-1of4</div>
  <div class="S-flexItem-share">.S-flexItem-share</div>
</div>
<div class="S-flex-rowWrap solarDocs-flexDemo-container">
  <div class="S-flexItem-1of4">.S-flexItem-1of4</div>
  <div class="S-flexItem-1of2">.S-flexItem-1of2</div>
  <div class="S-flexItem-1of4">.S-flexItem-1of4</div>
</div>
<div class="S-flex-rowWrap solarDocs-flexDemo-container">
  <div class="S-flexItem-1of4">.S-flexItem-1of4</div>
  <div class="S-flexItem-1of2">.S-flexItem-1of2</div>
  <div class="S-flexItem-1of3">.S-flexItem-1of3</div>
</div>

<div class="S-flex-rowWrap solarDocs-flexDemo-container">
  <div class="S-flexItem-share">.S-flexItem-share</div>
  <div class="S-flexItem-addon">.S-flexItem-addon</div>
  <div class="S-flexItem-full">.S-flexItem-full</div>
  <div class="S-flexItem-1of2">.S-flexItem-1of2</div>
  <div class="S-flexItem-1of3">.S-flexItem-1of3</div>
  <div class="S-flexItem-1of4">.S-flexItem-1of4</div>
  <div class="S-flexItem-1of6">.S-flexItem-1of6</div>
  <div class="S-flexItem-1of12">.S-flexItem-1of12</div>
</div>
```html
<div class="S-flex-rowWrap solarDocs-flexDemo-container">
  <div class="S-flexItem-share">.S-flexItem-share</div>
  <div class="S-flexItem-addon">.S-flexItem-addon</div>
  <div class="S-flexItem-full">.S-flexItem-full</div>
  <div class="S-flexItem-1of2">.S-flexItem-1of2</div>
  <div class="S-flexItem-1of3">.S-flexItem-1of3</div>
  <div class="S-flexItem-1of4">.S-flexItem-1of4</div>
  <div class="S-flexItem-1of6">.S-flexItem-1of6</div>
  <div class="S-flexItem-1of12">.S-flexItem-1of12</div>
</div>
```


### Example 1: S-flexItem-share vs S-flexItem-auto
With a auto sized flex element and no specified `width`, the flex item will take up its natural size. For text, this means it the width will be one line. **For text, use share instead of auto**.

<label class="s-inputGroup solarDocs-inputGroup--bordered">
  <span class="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">.S-flexItem-1of4</span>
  <input class="s-inputGroup__item S-flexItem-share" placeholder="S-flexItem-share" type="text">
  <span class="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of3">.S-flexItem-1of3</span>
  <span class="s-inputGroup__item s-inputGroup__item--tag S-flexItem-share">S-flexItem-share doesn't assert any space and gets squeezed in here</span>
</label>
<label class="s-inputGroup solarDocs-inputGroup--bordered">
  <span class="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">.S-flexItem-1of4</span>
  <input class="s-inputGroup__item S-flexItem-share" placeholder="S-flexItem-share" type="text">
  <span class="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of3">.S-flexItem-1of3</span>
  <span class="s-inputGroup__item s-inputGroup__item--tag S-flexItem-auto">S-flexItem-auto (default inputGroup item) gets pushed down to new row</span>
</label>
