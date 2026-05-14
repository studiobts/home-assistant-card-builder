# Weather Background SVG Specification

This document describes the SVG contract required by the Card Builder `weather_background` block.

The block injects the SVG inline, reads known `data-cb-weather-background-*` attributes, and updates element visibility, sky color, and sun position at runtime.

## Required Structure

The SVG must be a valid inline SVG document with a `viewBox`.

Required runtime markers:

- `data-cb-weather-background-role="sky"` on the element that represents the sky background.
- `data-cb-weather-background-role="sun-arc"` on a `<path>` used as the sun trajectory.
- `data-cb-weather-background-role="sun"` on one or more elements/groups that should move along the sun trajectory.

Recommended runtime markers:

- `data-cb-weather-background-role="stars"` for stars shown during clear nights.
- Elements with `data-cb-weather-background-phase="dawn dusk twilight"` for sunrise/sunset glow.

## Attribute Names

Use only this prefix for block-specific metadata:

```code
data-cb-weather-background-*
```

Supported attributes:

```code
data-cb-weather-background-role="sky"
data-cb-weather-background-weather="cloudy partlycloudy rainy"
data-cb-weather-background-phase="day night dawn dusk twilight"
data-cb-weather-background-current-weather="rainy"
data-cb-weather-background-current-weather-tokens="rainy"
data-cb-weather-background-current-phase="day"
data-cb-weather-background-current-phase-tokens="day sun-up"
data-cb-weather-background-sun-visible="true"
data-cb-weather-background-runtime-active="true"
data-cb-weather-background-version="1"
```

Attribute values that contain multiple tokens must be separated by spaces.

## Weather Tokens

The block supports Home Assistant weather states:

```text
clear-night
cloudy
exceptional
fog
hail
lightning
lightning-rainy
partlycloudy
pouring
rainy
snowy
snowy-rainy
sunny
windy
windy-variant
```

Example:

```svg
<g data-cb-weather-background-weather="cloudy partlycloudy rainy">
  <!-- reusable cloud artwork -->
</g>
```

The block validates custom SVGs and warns when no element is found for a weather token.

The block does not force weather-based visibility with inline `display` styles. The SVG owns weather visibility, so authors have full control over what appears for each condition. At runtime the block sets these attributes on the root `<svg>`:

```code
data-cb-weather-background-current-weather="rainy"
data-cb-weather-background-current-weather-tokens="rainy"
```

Use those root attributes in SVG CSS to show or hide weather groups:

```css
[data-cb-weather-background-weather] {
  display: none;
}

svg[data-cb-weather-background-current-weather-tokens~="sunny"]
[data-cb-weather-background-weather~="sunny"],
svg[data-cb-weather-background-current-weather-tokens~="rainy"]
[data-cb-weather-background-weather~="rainy"],
svg[data-cb-weather-background-current-weather-tokens~="partlycloudy"]
[data-cb-weather-background-weather~="partlycloudy"] {
  display: inline;
}
```

For reusable artwork, add multiple tokens to the same element:

```svg
<g data-cb-weather-background-weather="cloudy partlycloudy rainy">
  <!-- shared cloud artwork -->
</g>
```

The block still hides elements marked with `data-cb-weather-background-role="sun"` when the calculated sun position is outside the sunrise/sunset range. When the sun is above the horizon, the block restores the sun element display and only moves it along `sun-arc`.

## Phase Tokens

The block computes the current phase from `sun.sun`:

```text
day
night
dawn
dusk
twilight
```

`twilight` is active during both `dawn` and `dusk`.

At runtime the block sets these attributes on the root `<svg>`:

```code
data-cb-weather-background-current-phase="dawn"
data-cb-weather-background-current-phase-tokens="dawn twilight day sun-up"
```

The SVG can use them exactly like weather tokens:

```css
[data-cb-weather-background-phase] {
  display: none;
}

svg[data-cb-weather-background-current-phase-tokens~="night"]
[data-cb-weather-background-phase~="night"],
svg[data-cb-weather-background-current-phase-tokens~="twilight"]
[data-cb-weather-background-phase~="twilight"] {
  display: inline;
}
```

Example:

```svg
<ellipse
  data-cb-weather-background-role="dawn-dusk"
  data-cb-weather-background-phase="dawn dusk twilight"
  cx="200"
  cy="210"
  rx="220"
  ry="90"
/>
```

## Sun Arc

The sun arc must be a `<path>`:

```svg
<path
  data-cb-weather-background-role="sun-arc"
  d="M 54 164 C 112 46 288 46 346 164"
  fill="none"
  stroke="none"
/>
```

The sun group should be drawn around local coordinate `(0, 0)` because the block applies a runtime `translate(x y)` transform.

```svg
<g data-cb-weather-background-role="sun">
  <circle cx="0" cy="0" r="16" />
</g>
```

The sun is visible only when its normalized position is between `0` and `1`.

- `0` means sunrise.
- `1` means sunset.
- Values outside this range hide the sun.

## Runtime CSS Variables

The block sets runtime CSS variables on the SVG:

```css
--cb-weather-background-sky-top
--cb-weather-background-sky-middle
--cb-weather-background-sky-bottom
--cb-weather-background-state
--cb-weather-background-current-weather
--cb-weather-background-current-weather-tokens
--cb-weather-background-current-phase
--cb-weather-background-current-phase-tokens
--cb-weather-background-sun-visible
--cb-weather-background-sun-progress
--cb-weather-background-sun-state
--cb-weather-background-cloud-opacity
--cb-weather-background-cloud-speed
--cb-weather-background-cloud-bob-speed
--cb-weather-background-rain-speed
--cb-weather-background-rain-opacity
--cb-weather-background-pouring-speed
--cb-weather-background-pouring-opacity
--cb-weather-background-snow-speed
--cb-weather-background-snow-opacity
--cb-weather-background-hail-speed
--cb-weather-background-hail-opacity
--cb-weather-background-lightning-speed
--cb-weather-background-lightning-intensity
--cb-weather-background-wind-speed
--cb-weather-background-wind-opacity
--cb-weather-background-fog-speed
--cb-weather-background-exceptional-speed
--cb-weather-background-exceptional-opacity
--cb-weather-background-star-speed
--cb-weather-background-star-opacity
--cb-weather-background-sun-pulse-speed
--cb-weather-background-animation-play-state
```

Runtime state variables describe the current values received or calculated by the block:

| Variable | Value |
|----------|-------|
| `--cb-weather-background-state` | JSON string with weather, weather tokens, solar phase, phase tokens, sun visibility, sun progress, and raw `sun.sun` state. |
| `--cb-weather-background-current-weather` | Current Home Assistant weather state, for example `rainy` or `fog`. |
| `--cb-weather-background-current-weather-tokens` | Space-separated weather tokens used by the block. |
| `--cb-weather-background-current-phase` | Current calculated solar phase: `day`, `night`, `dawn`, or `dusk`. |
| `--cb-weather-background-current-phase-tokens` | Space-separated phase tokens, for example `dawn twilight day sun-up`. |
| `--cb-weather-background-sun-visible` | `1` when the sun is on the visible arc, `0` otherwise. |
| `--cb-weather-background-sun-progress` | Normalized sun position on the arc. `0` is sunrise, `1` is sunset, `none` means no valid visible position. |
| `--cb-weather-background-sun-state` | Raw `sun.sun` state, usually `above_horizon` or `below_horizon`. |

The block also forces the element marked with `data-cb-weather-background-role="sky"` to use a generated runtime gradient, so the sky can react even if the SVG does not define these variables.

Animation variables are optional. If the SVG does not use them, the block still works. If the SVG does use them, always include fallbacks:

```css
.rain {
  animation: rain-fall var(--cb-weather-background-rain-speed, 0.9s) linear infinite;
  animation-play-state: var(--cb-weather-background-animation-play-state, running);
  opacity: var(--cb-weather-background-rain-opacity, 0.76);
}
```

The block also has an `Enable Animations` property. It is enabled by default. When disabled, the block:

- Applies `--cb-weather-background-animation-play-state: paused`.
- Adds a wrapper rule that disables CSS animations and transitions for the injected SVG.
- Calls the SVG animation pause API when available, so SVG/SMIL animations are paused as well.

For best results, keep the sky as a simple full-size shape:

```svg
<rect
  data-cb-weather-background-role="sky"
  x="0"
  y="0"
  width="400"
  height="240"
/>
```

## SVG Animations

Animations should be implemented directly inside the SVG with CSS keyframes or SVG animation elements. Do not include JavaScript in custom SVGs. The block sanitizer removes scripts, event handler attributes, `foreignObject`, and other unsafe elements.

Recommended animation patterns:

- Clouds: animate `translateX` slowly on cloud groups.
- Cloud depth: animate a small vertical bob on inner cloud groups.
- Rain: duplicate rain streak groups and animate `translateY` with offset delays.
- Pouring rain: use faster rain speed, higher opacity, and more streaks.
- Snow: animate slow downward movement with slight horizontal drift.
- Hail: animate faster downward movement with harder easing.
- Lightning: animate `stroke-dashoffset` for propagation and a full-scene flash opacity.
- Fog: animate horizontal drift on long, semi-transparent strokes.
- Wind: use dashed strokes and animate `stroke-dashoffset`.
- Stars: animate opacity for subtle twinkle during clear nights.
- Exceptional weather: use fast warning waves, lightning, or wind-style strokes.

Example:

```svg
<defs>
  <style>
    .clouds {
      animation: cloud-drift var(--cb-weather-background-cloud-speed, 52s) ease-in-out infinite alternate;
      animation-play-state: var(--cb-weather-background-animation-play-state, running);
    }

    .rain {
      animation: rain-fall var(--cb-weather-background-rain-speed, 0.9s) linear infinite;
      animation-play-state: var(--cb-weather-background-animation-play-state, running);
      opacity: var(--cb-weather-background-rain-opacity, 0.76);
    }

    .wind {
      stroke-dasharray: 44 34;
      animation: wind-flow var(--cb-weather-background-wind-speed, 2.8s) linear infinite;
      animation-play-state: var(--cb-weather-background-animation-play-state, running);
      opacity: var(--cb-weather-background-wind-opacity, 0.82);
    }

    @keyframes cloud-drift {
      from { transform: translateX(-12px); }
      to { transform: translateX(18px); }
    }

    @keyframes rain-fall {
      from { transform: translate(0, -42px); }
      to { transform: translate(-18px, 42px); }
    }

    @keyframes wind-flow {
      from { stroke-dashoffset: 80; }
      to { stroke-dashoffset: -80; }
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 1ms !important;
        animation-iteration-count: 1 !important;
      }
    }
  </style>
</defs>
```

Use duplicated animated groups for seamless loops:

```svg
<g data-cb-weather-background-weather="rainy pouring lightning-rainy">
  <g class="rain">
    <line x1="90" y1="154" x2="76" y2="184" />
  </g>
  <g class="rain" style="animation-delay: -0.45s">
    <line x1="112" y1="112" x2="98" y2="142" />
  </g>
</g>
```

Animated elements can still use `data-cb-weather-background-weather` and `data-cb-weather-background-phase`. The SVG controls both visibility and motion by using the runtime root attributes described above.

## Authoring Preview

When an SVG is opened directly on a computer, the Card Builder block is not present, so all weather groups would normally be visible at once. To make editing easier, SVG authors can hide every non-sunny weather state by default and let the block opt into runtime rendering.

Add this rule inside the SVG `<style>`:

```css
svg:not([data-cb-weather-background-runtime-active="true"])
[data-cb-weather-background-weather]:not([data-cb-weather-background-weather~="sunny"]) {
  display: none;
}
```

The block sets `data-cb-weather-background-runtime-active="true"` on the injected `<svg>` before applying weather visibility. This means:

- Opening the SVG directly shows only artwork tagged with `sunny`, which should usually be the clean authoring state.
- Rendering inside Card Builder ignores the authoring-only hide rule and uses the live weather state.
- SVG authors should prefer this rule over setting `display="none"` or `style="display:none"` on weather groups, because inline display values can interfere with runtime visibility restoration.

## Minimal SVG Example

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240">
  <rect data-cb-weather-background-role="sky" x="0" y="0" width="400" height="240" />

  <defs>
    <style>
      .clouds {
        animation: cloud-drift var(--cb-weather-background-cloud-speed, 52s) ease-in-out infinite alternate;
        animation-play-state: var(--cb-weather-background-animation-play-state, running);
      }

      .rain {
        animation: rain-fall var(--cb-weather-background-rain-speed, 0.9s) linear infinite;
        animation-play-state: var(--cb-weather-background-animation-play-state, running);
        opacity: var(--cb-weather-background-rain-opacity, 0.76);
      }

      svg:not([data-cb-weather-background-runtime-active="true"])
      [data-cb-weather-background-weather]:not([data-cb-weather-background-weather~="sunny"]) {
        display: none;
      }

      [data-cb-weather-background-weather] {
        display: none;
      }

      svg[data-cb-weather-background-current-weather-tokens~="sunny"]
      [data-cb-weather-background-weather~="sunny"],
      svg[data-cb-weather-background-current-weather-tokens~="rainy"]
      [data-cb-weather-background-weather~="rainy"],
      svg[data-cb-weather-background-current-weather-tokens~="partlycloudy"]
      [data-cb-weather-background-weather~="partlycloudy"],
      svg[data-cb-weather-background-current-weather-tokens~="cloudy"]
      [data-cb-weather-background-weather~="cloudy"],
      svg[data-cb-weather-background-current-weather-tokens~="pouring"]
      [data-cb-weather-background-weather~="pouring"],
      svg[data-cb-weather-background-current-weather-tokens~="clear-night"]
      [data-cb-weather-background-weather~="clear-night"] {
        display: inline;
      }

      @keyframes cloud-drift {
        from { transform: translateX(-12px); }
        to { transform: translateX(18px); }
      }

      @keyframes rain-fall {
        from { transform: translate(0, -42px); }
        to { transform: translate(-18px, 42px); }
      }
    </style>
  </defs>

  <path
    data-cb-weather-background-role="sun-arc"
    d="M 50 160 C 120 40 280 40 350 160"
    fill="none"
    stroke="none"
  />

  <g data-cb-weather-background-role="sun" data-cb-weather-background-weather="sunny partlycloudy">
    <circle cx="0" cy="0" r="18" fill="#ffd45f" />
  </g>

  <g class="clouds" data-cb-weather-background-weather="cloudy partlycloudy rainy pouring snowy snowy-rainy">
    <path d="M80 130c-18 0-32-11-32-25 0-12 10-22 24-24 6-16 23-27 42-27 24 0 44 17 47 38 18 2 32 13 32 28 0 17-16 30-37 30H80z" fill="#fff" />
  </g>

  <g data-cb-weather-background-weather="rainy pouring lightning-rainy" stroke="#3f83b7" stroke-width="4">
    <g class="rain">
      <line x1="90" y1="154" x2="76" y2="184" />
      <line x1="132" y1="154" x2="118" y2="184" />
    </g>
  </g>

  <g data-cb-weather-background-weather="clear-night" data-cb-weather-background-phase="night" fill="#fff">
    <circle cx="42" cy="34" r="1.4" />
    <circle cx="86" cy="62" r="1.1" />
  </g>
</svg>
```
