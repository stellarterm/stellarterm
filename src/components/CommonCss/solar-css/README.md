# Solar css framework

Solar is a front-end css framework. It was originally developed for use with the [Stellar Interstellar Module System](https://github.com/stellar/interstellar/). It is currently mainly used on front-end projects by Stellar.org.

This framework was designed to work in layers so that specific layers of the solar framework could be replaced with ease.

## Design philosophies/goals
The `solar` css framework is:
- **Mobile first**: concepts designed with a mobile first philosophy
- **Unopinionated**: the core is unopinionated in design
- **Themable**: enabling anybody to theme the look and feel
- **Modular**: enables styles to be shared across multiple web applications, websites, teams or organizations

## Getting started
To see an example of solar in use, see the new client.

To learn about the different parts of the solar ecosystem and how extensions and themes come in, read the [Solar css framework architecture](https://github.com/stellar/solar/blob/master/docs/architecture.md).

To learn about how to write css consistent with the design laid out in solar, read the [solar css guide](https://github.com/stellar/solar/blob/master/docs/css-guide.md).

## Simple usage
At the top of your css file, import the necessary files in the right order. For example:
```
@import '../../node_modules/solar-css/lib/index';
@import '../../node_modules/solar-stellarorg/lib/index';

@import '../../node_modules/solar-css/styles/index';
@import '../../node_modules/solar-stellarorg/styles/index';
@import '../../node_modules/solar-stellarorg-pages/styles/index';
```

This allows for useful error/warning messages from sass since the direct files are being imported and not just bundled. The downside is that the developer will have to manage this. However, if the developer already understands how Solar works, then it should be easy.

## Conventions
Solar is more than just a set of sass/js files. It is also set of conventions. Solar extensions and consumers should follow the solar conventions. These conventions are designed to enable developers to write css in a unified, clean, and modular way.

These conventions should be keep the css organized while still being easy to understand. Developers new to this framework should be able to write code meaningfully without being bogged down by heavy conventions.
