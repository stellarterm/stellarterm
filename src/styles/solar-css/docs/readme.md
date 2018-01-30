---
id: readme
title: Overview
category: Getting Started
---

This document contains information on two main sections:
- How the css components are organized
- How the build process and architecture concepts

## Solar framework css overview
Solar framework includes four concepts of code:
- Base
- Basics
- Components
- Utilities (still under design)

### Solar Base
The solar base is a set of styles baked in to the solar-core to make the overall css development experience better. It includes css normalize and other extremely basic things such as configuring border-box. It does not come with any mixins or classes that developers can use.

### Solar Basics (non-themable)
Solar provides "basics" which are **non-themable** reusable building blocks. They come in the form of sass mixins along with classes for convenience and are namespaced with `S-`. Think of them as the screws and motors in a robot--these are standard parts that aren't painted/themed.

### Solar Components (themable)
Solar provides components which are **themable** reusable building blocks of a website. They are only available as classes. Components should be as generic as possible so that they can be reused in many different places.

When using a solar module, do it alongside your own defined class. For example, do the following which uses the module class alongside your own class:
```
<ul class="s-webApp-tabBar state-one-tabBar">
```

Do not use the @extend feature.

### Solar utilities
Still to be designed. The current thought is that utilities will live inside a solar extension (with namespace `U-`). Consumers can then create their own utilities as needed. This is still under design and may be later moved out as an extension.

### Sass
Sass is a css preprocessor that solar uses. It provides functionality such as mixins and includes.

To use a mixin, do:
```
@include mixinName(arguments);
```

In the solar framework, only use the following features:
- mixins
- variables
- solar functions (shade/tint)

Don't use these features:
- @extend
- nesting

