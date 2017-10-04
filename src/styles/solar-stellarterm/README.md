solar-stellarterm
--------------

Solar-stellarterm is a fork of solar-stellarorg which is a theme layer for the solar css framework.

It themes solar to Stellar Development Foundation's branding by adding a [theme layer](https://github.com/stellar/solar/blob/master/docs/architecture.md#modules-and-themes) on solar.

The lib/_index.scss and styles/_index.scss files are loaded after each of their respective core modules. The solar-stellarorg/lib/_index.scss file is loaded before solar-css/styles/_index.scss so that this theme library can affect core styles with variables.

This theme is not limited to use in interstellar. It is also used on other Stellarorg projects. While anyone can use solar-stellarorg, development of solar-stellarorg is targeted for use by Stellarorg itself. Feel free to fork and develop into your own theme.

## What lives in the stellarorg theme?
- **variables**: theming variables that other css code uses (colors, padding, border-radius)
- **typography**: overrides for scale, typography, and custom fonts
- **organization global sprites/icons**: small sprites used globally throughout the Stellarorg brand, such as the Stellar rocket or [stroopy and friends](https://www.stellar.org/stories/adventures-in-galactic-consensus-chapter-1/)
- **custom**: any other styles to be used across multiple Stellarorg projects
