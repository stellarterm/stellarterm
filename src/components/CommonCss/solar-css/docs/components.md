---
id: components
title: Solar Components (themeable)
category: Guides
---

**Note: This guide is outdated and was intended to be viewed in a tool that was never finished.**

## Button `.s-button`
There are four types of buttons: disabled, light, medium (default; no modifier), and heavy. The differences in visual strengths are used to vary the emphasis of buttons.

- disabled: should only be used when button is actually disabled
- light: less important buttons
- medium: default should be used in most places
- heavy: emphasis for important actions such as form submission

Solar core does not enforce how they look like--this job belongs to themes. For example, a theme might choose their light to be flat and their heavy to have a box shadow. Another might want to have a border on light and primary background color on heavy.

<button class="s-button s-button--light">a.s-button.s-button--light</button>
<button class="s-button">a.s-button (default; no modifier)</button>
<button class="s-button s-button--heavy">a.s-button.s-button--heavy</button>
```html
<button class="s-button s-button--light">a.s-button.s-button--light</button>
<button class="s-button">a.s-button (default; no modifier)</button>
<button class="s-button s-button--heavy">a.s-button.s-button--heavy</button>
```


### `<a>` vs `<button>`
Using both the `<a>` tag and the `<button>` should look the same.

- `<a>`: Used with a meaningful href for state/page navigation
- `<button>`: Used inside a form or as a control

<a href="#somewhere" class="s-button">This is an a.button</a>
<button class="s-button">This is a button.button</button>
```html
<a href="#somewhere" class="s-button">This is an a.button</a>
<button class="s-button">This is a button.button</button>
```

### buttonGroup `.s-buttonGroup`
s-buttonGroup is a way to group multiple buttons together into one bar. These can only be single rows.
<div class="s-buttonGroup">
  <button class="s-button">Left</button>
  <button class="s-button">Middle</button>
  <button class="s-button">Right</button>
</div>

```html
<div class="s-buttonGroup">
  <button class="s-button">Left</button>
  <button class="s-button">Middle</button>
  <button class="s-button">Right</button>
</div>
```

## inputGroup `.s-inputGroup`
s-inputGroup is an wrapping flex row component for laying out form elements and addons. It is often used inside a form but can be used in other places dealing with buttons and addons too.

Here are some examples to illustrate how inputGroup works.

### Auto negative margin management to collapse borders (theme starter)
By default all items except for the last have a margin-right of `-1px` to prevent the double borders.
```css
.s-inputGroup {
  padding-right: 1px;
  padding-bottom: 1px;
}
.s-inputGroup__item {
  margin-bottom: -1px;
  margin-right: -1px;
}
```

margin-bottom is not applied to the last item so that in most cases the border won't cover the elements. This "magic" will be helpful for most cases while requiring some manual intervention for a small number of cases.

Disadvantages: if the inputGroup has a border, it will cover the border of the bottom row of elements. It is not common that an inputGroup would have an additional border but if it does, then a workaround would be to wrap it inside another element.

See example 2 for what this helps achieve

### Example 1: main + addon (aka "none")
```html
<div class="s-inputGroup">
  <input class="s-inputGroup__item" placeholder="main (auto)" type="text">
  <select class="s-inputGroup__item S-flexItem-none">
    <option value="addon">addon</option>
  </select>
</div>
```
<div class="s-inputGroup">
  <input class="s-inputGroup__item" placeholder="main (auto)" type="text">
  <select class="s-inputGroup__item S-flexItem-none">
    <option value="addon">addon</option>
  </select>
</div>

### Example 2: mixing different flex sizes
With `solar-theme-base` (a base theme that currently lives inside `solar`), the first item is expected to not have a right border because there is usually other elements on the same row. The full should have a border on the right because it is not expected to have something on the right.

Each line should fill up the whole row.
```html
<div class="s-inputGroup">
  <input class="s-inputGroup__item" value="default (S-flexItem-auto)" type="text">
  <input class="s-inputGroup__item S-flexItem-1of3" value="default (S-flexItem-1of3)" type="text">
  <input class="s-inputGroup__item S-flexItem-full" value="S-flexItem-full" type="text">
  <button class="s-button s-inputGroup__item" value="addon">addon</button>
</div>
```
<div class="s-inputGroup">
  <input class="s-inputGroup__item" value="default (S-flexItem-auto)" type="text">
  <input class="s-inputGroup__item S-flexItem-1of3" value="default (S-flexItem-1of3)" type="text">
  <input class="s-inputGroup__item S-flexItem-full" value="S-flexItem-full" type="text">
  <button class="s-button s-inputGroup__item" value="addon">addon</button>
</div>

### Example 3: `<label>`s and vertical alignment (flex align)
Labels aid usability by effectively expanding the click area for the input. By using the label as the parent `s-inputGroup`, we get simpler markup by not needing the `for` attribute.

By default, items in s-inputGroup are aligned to stretch via [flexbox align](https://developer.mozilla.org/en-US/docs/Web/CSS/align-items).

<label class="s-inputGroup solarDocs-inputGroup--bordered">
  <span class="s-inputGroup__item S-flexItem-1of3">.S-flexItem-1of3</span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item--huge" placeholder="by default, text is aligned to flex-start" type="text">
</label>
<label class="s-inputGroup solarDocs-inputGroup--bordered">
  <span class="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of3">`.s-inputGroup__item--tag`</span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item solarDocs-inputGroup__item--huge" placeholder="using a --tag will vertically align the text" type="text">
</label>
<label class="s-inputGroup solarDocs-inputGroup--bordered">
  <span class="s-inputGroup__item solarDocs-inputGroup__label solarDocs-inputGroup__label--end">align-self: flex-end</span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item solarDocs-inputGroup__item--huge" placeholder="Label aligned to flex-end" type="text">
</label>
<label class="s-inputGroup solarDocs-inputGroup--bordered">
  <span class="s-inputGroup__item solarDocs-inputGroup__label">The input can be aligned to the end if desired<br />---<br />(align-self: flex-start)</span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item solarDocs-inputGroup__item--flexStart" placeholder="align-self: flex-start" type="text">
</label>
<label class="s-inputGroup solarDocs-inputGroup--bordered">
  <span class="s-inputGroup__item solarDocs-inputGroup__label">Or it could be at the end too<br />---<br />(align-self: flex-end)</span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item solarDocs-inputGroup__item--flexEnd" placeholder="align-self: flex-end" type="text">
</label>

```html
<label class="s-inputGroup solarDocs-inputGroup--bordered">
  <span class="s-inputGroup__item S-flexItem-1of3">.S-flexItem-1of3</span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item--huge" placeholder="by default, text is aligned to flex-start" type="text">
</label>
<label class="s-inputGroup solarDocs-inputGroup--bordered">
  <span class="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of3">`.s-inputGroup__item--tag`</span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item solarDocs-inputGroup__item--huge" placeholder="using a --tag will vertically align the text" type="text">
</label>
<label class="s-inputGroup solarDocs-inputGroup--bordered">
  <span class="s-inputGroup__item solarDocs-inputGroup__label solarDocs-inputGroup__label--end">align-self: flex-end</span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item solarDocs-inputGroup__item--huge" placeholder="Label aligned to flex-end" type="text">
</label>
<label class="s-inputGroup solarDocs-inputGroup--bordered">
  <span class="s-inputGroup__item solarDocs-inputGroup__label">The input can be aligned to the end if desired<br />---<br />(align-self: flex-start)</span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item solarDocs-inputGroup__item--flexStart" placeholder="align-self: flex-start" type="text">
</label>
<label class="s-inputGroup solarDocs-inputGroup--bordered">
  <span class="s-inputGroup__item solarDocs-inputGroup__label">Or it could be at the end too<br />---<br />(align-self: flex-end)</span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item solarDocs-inputGroup__item--flexEnd" placeholder="align-self: flex-end" type="text">
</label>
```

```css
.solarDocs-inputGroup--bordered {
  outline: 1px solid pink;
}

// modifiers
.solarDocs-inputGroup__label--end {
  align-self: flex-end;
}
.solarDocs-inputGroup__item--huge {
  font-size: $s-scale-up2;
}
.solarDocs-inputGroup__item--flexStart {
  align-self: flex-start;
}
.solarDocs-inputGroup__item--flexEnd {
  align-self: flex-end;
}
```

### Example 4: s-inputGroup__item modifiers tag, tagFlat, tagMin
The tag modifiers to the inputGroup item.

**Tip**: If the inputGroup__item contains not only a text node, be sure to wrap it with something else like a span. This is because the tag modifiers turn the item into a flex item so that it can vertically center contents.

<label class="s-inputGroup">
  <span class="s-inputGroup__item s-inputGroup__item--tag S-flexItem-share">
    <span>`.s-inputGroup__item--tag` (the whole package)</span>
  </span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item--huge S-flexItem-1of3" placeholder="..." type="text">
</label>
<label class="s-inputGroup">
  <span class="s-inputGroup__item s-inputGroup__item--tagFlat S-flexItem-share">
    <span>`.s-inputGroup__item--tagFlat` (no background/visible border)</span>
  </span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item--huge S-flexItem-1of3" placeholder="..." type="text">
</label>
<label class="s-inputGroup">
  <span class="s-inputGroup__item s-inputGroup__item--tagMin S-flexItem-share">
    <span>`.s-inputGroup__item--tagMin` (no padding)</span>
  </span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item--huge S-flexItem-1of3" placeholder="..." type="text">
</label>
<label class="s-inputGroup">
  <span class="s-inputGroup__item s-inputGroup__item--tagMin S-flexItem-share">
    `.s-inputGroup__item--tagMin` This is what <a href="">happens</a> when you don't wrap inner contents with span.
  </span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item--huge S-flexItem-1of3" placeholder="..." type="text">
</label>

```html
<label class="s-inputGroup">
  <span class="s-inputGroup__item s-inputGroup__item--tag S-flexItem-share">
    <span>`.s-inputGroup__item--tag` (the whole package)</span>
  </span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item--huge S-flexItem-1of3" placeholder="..." type="text">
</label>
<label class="s-inputGroup">
  <span class="s-inputGroup__item s-inputGroup__item--tagFlat S-flexItem-share">
    <span>`.s-inputGroup__item--tagFlat` (no background/visible border)</span>
  </span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item--huge S-flexItem-1of3" placeholder="..." type="text">
</label>
<label class="s-inputGroup">
  <span class="s-inputGroup__item s-inputGroup__item--tagMin S-flexItem-share">
    <span>`.s-inputGroup__item--tagMin` (no padding)</span>
  </span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item--huge S-flexItem-1of3" placeholder="..." type="text">
</label>
<label class="s-inputGroup">
  <span class="s-inputGroup__item s-inputGroup__item--tagMin S-flexItem-share">
    `.s-inputGroup__item--tagMin` This is what <a href="">happens</a> when you don't wrap inner contents with span.
  </span>
  <input class="s-inputGroup__item solarDocs-inputGroup__item--huge S-flexItem-1of3" placeholder="..." type="text">
</label>
```

<div class="s-inputGroup">
  <button class="s-inputGroup__item s-button">Mix</button>
  <input class="s-inputGroup__item" id="solarDocs-inputGroup-and" type="text" placeholder="and">
  <label for="solarDocs-inputGroup-and" class="s-inputGroup__item s-inputGroup__item--tag">
    match! (remember to use label `for` carefully)
  </label>
</div>

```html
<div class="s-inputGroup">
  <button class="s-inputGroup__item s-button">Mix</button>
  <input class="s-inputGroup__item" id="solarDocs-inputGroup-and" type="text" placeholder="and">
  <label for="solarDocs-inputGroup-and" class="s-inputGroup__item s-inputGroup__item--tag">
    match! (remember to use label `for` carefully)
  </label>
</div>
```

<label class="s-inputGroup">
  <span class="s-inputGroup__item s-inputGroup__item--tag S-flexItem-none">
    <input type="checkbox">
  </span>
  <span class="s-inputGroup__item s-inputGroup__item--tag">
    <span>tags can be used with inputs inside them too</span>
  </span>
</label>

```html
<label class="s-inputGroup">
  <span class="s-inputGroup__item s-inputGroup__item--tag S-flexItem-none">
    <input type="checkbox">
  </span>
  <span class="s-inputGroup__item s-inputGroup__item--tag">
    <span>tags can be used with inputs inside them too</span>
  </span>
</label>
```




### Advanced notes:

s-inputGroup also handles edgecases such as maintaining consistent left/right padding with bigger font size. It pulls sizing from `$s-spacing`.

While one could configure s-inputGroup flex direction to be a column, this is not something that solar supports out of the box since it is a rare use case.
