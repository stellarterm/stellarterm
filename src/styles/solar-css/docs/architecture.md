---
id: architecture
title: Architecture
category: Documents
---

The solar css framework is a modular framework allowing (developer) consumers to use modules that build upon and extend the core solar functionality.

## Overview
### File architecture
There are multiple layers in the `solar` ecosystem. In order from general/global to specific:
- Core
- Modules (including themes)
- States
- Widgets

### Solar core module
The core library defines the sass functions and variables that other modules use and extend. This library is also extensively used by the framework.

The styles contain the basic framework functionality. It lays out the basic styling and classes.

### Modules and themes
At first, solar core is the only item in the solar framework. Additional modules can be brought in to add and/or change functionality. Themes are a type of module that only changes the look and feel of solar.

Each module should contain an `_index.scss` file as its entry point in each of it's folder `lib` and `styles`.

### Module feature types
Each module may have a combination of any of the following:
- **library**: a set of sass files that creates sass functions/mixins/variables without generating output css code
- **styles**: a set of sass files that consumes sass functions/mixins/variables and generates output css code

### Entry point
- Each library should contain an `_index.scss` file as its entry point.

## Build process overview
The solar framework build process produces two important files:
- **solar library bundle** (_solar-library-bundle.scss)
- **solar css bundle** (solar-css-bundle.css)

### Solar library bundle (_solar-library-bundle.scss)
A solar library bundle is a scss file containing all the libraries from solar modules combined into one scss file. This scss file provides sass functions/mixins/variables but does not directly produce css code.

Each scss can use a one-liner to import the solar sass library:
```css
@import "solar-library-bundle";
```

### Solar css bundle (solar-css-bundle.css)
A solar css bundle is a css file compiled from the solar framework. This css file can then be further postprocessed and then served to the end user's browser.

### Example
Here is an example of a common use case to help illustrate the build process.

Solar modules:
- **solar core** (lib and styles): the core required part of solar
- **solar-theme-base** (lib and styles): a module that lays out the basics of the ui
- **solar-theme-allBlue** (only lib): a (fictional) module that configures solar-theme-base to make everything blue
- **solar-utilities** (only styles): a set of utility css classes

In order, this is what happens:
```
1. Creating `_solar-library-bundle.scss`
  a. add `solar/lib/_index.scss` to `_solar-library-bundle.scss`
  b. add `solar-theme-base/lib/_index.scss` to `_solar-library-bundle.scss`
  c. add `solar-theme-allBlue/lib/_index.scss` lib to `_solar-library-bundle.scss`
2. Creating `solar-css-bundle.css`
  a. add `solar/styles/_index.scss`
  b. add `solar-theme-base/styles/_index.scss`
  c. add `solar-utilities/styles/_index.scss`
  d. sass compilation into one file
```
