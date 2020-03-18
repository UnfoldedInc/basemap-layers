# deckgl-mapbox-style

[![Build Status](https://travis-ci.org/kylebarron/deckgl-mapbox-style.svg?branch=master)](https://travis-ci.org/kylebarron/deckgl-mapbox-style)

Implementation of a subset of the Mapbox Style Specification using Deck.gl
layers.

_A work in progress_.

## Motivation

Currently, Mapbox GL JS does not have 3D terrain support, and despite [an
enticing tweet][mapbox_3d_tweet], no support is imminent. As of version 8.1,
Deck.gl will have support for a [terrain layer][deckgl_terrain_layer], which
generates a terrain mesh on the fly using [MARTINI][martini] and overlays an
image texture on the mesh (i.e. satellite imagery). While this is great, by
default it hides any vector layers rendered by the underlying Mapbox GL JS,
because those layers have elevation 0. This means that it's hard to interpret
the terrain and easy to lose track of where you are.

[mapbox_3d_tweet]: https://twitter.com/Mapbox/status/1222605626053783552
[deckgl_terrain_layer]: https://github.com/uber/deck.gl/blob/master/docs/layers/terrain-layer.md
[martini]: https://github.com/mapbox/martini

However deck.gl correctly renders vector features that have 3D coordinates.
Thus, this spec is part of my attempt to create a workaround, so that I can
render vector features on top of 3D terrain.

1. Snap vector features to the terrain mesh on the fly using [kylebarron/snap-features-to-tin][kylebarron/snap-features-to-tin]. This adds Z values to every coordinate of the vector feature.
2. Style each feature using a deck.gl layer.

[kylebarron/snap-features-to-tin]: https://github.com/kylebarron/snap-features-to-tin

## Usage


## Layer mapping

| Mapbox Layer     | Deck.gl Layer                         | Implemented? |
| ---------------- | ------------------------------------- | ------------ |
| `background`     | -                                     | No           |
| `fill`           | `SolidPolygonLayer` or `PolygonLayer` | No           |
| `line`           | `PathLayer`                           | No           |
| `symbol`         | `IconLayer` or `TextLayer`            | No           |
| `raster`         | `BitmapLayer`                         | No           |
| `circle`         | `ScatterplotLayer`                    | No           |
| `fill-extrusion` | -                                     | No           |
| `heatmap`        | -                                     | No           |
| `hillshade`      | -                                     | No           |

### Supported property keys

#### `fill`

| Property Key            | Supported? |
| ----------------------- | ---------- |
| `fill-antialias`        | No         |
| `fill-color`            | No         |
| `fill-opacity`          | No         |
| `fill-outline-color`    | No         |
| `fill-pattern`          | No         |
| `fill-sort-key`         | No         |
| `fill-translate`        | No         |
| `fill-translate-anchor` | No         |
| `visibility`            | No         |

#### `line`

| Property Key            | Supported? |
| ----------------------- | ---------- |
| `line-blur`             | No         |
| `line-cap`              | No         |
| `line-color`            | No         |
| `line-dasharray`        | No         |
| `line-gap-width`        | No         |
| `line-gradient`         | No         |
| `line-join`             | No         |
| `line-miter-limit`      | No         |
| `line-offset`           | No         |
| `line-opacity`          | No         |
| `line-pattern`          | No         |
| `line-round-limit`      | No         |
| `line-sort-key`         | No         |
| `line-translate`        | No         |
| `line-translate-anchor` | No         |
| `line-width`            | No         |
| `visibility`            | No         |

#### `symbol`

| Property Key              | Supported? |
| ------------------------- | ---------- |
| `icon-allow-overlap`      | No         |
| `icon-anchor`             | No         |
| `icon-color`              | No         |
| `icon-halo-blur`          | No         |
| `icon-halo-color`         | No         |
| `icon-halo-width`         | No         |
| `icon-ignore-placement`   | No         |
| `icon-image`              | No         |
| `icon-keep-upright`       | No         |
| `icon-offset`             | No         |
| `icon-opacity`            | No         |
| `icon-optional`           | No         |
| `icon-padding`            | No         |
| `icon-pitch-alignment`    | No         |
| `icon-rotate`             | No         |
| `icon-rotation-alignment` | No         |
| `icon-size`               | No         |
| `icon-text-fit`           | No         |
| `icon-text-fit-padding`   | No         |
| `icon-translate`          | No         |
| `icon-translate-anchor`   | No         |
| `symbol-avoid-edges`      | No         |
| `symbol-placement`        | No         |
| `symbol-sort-key`         | No         |
| `symbol-spacing`          | No         |
| `symbol-z-order`          | No         |
| `text-allow-overlap`      | No         |
| `text-anchor`             | No         |
| `text-color`              | No         |
| `text-field`              | No         |
| `text-font`               | No         |
| `text-halo-blur`          | No         |
| `text-halo-color`         | No         |
| `text-halo-width`         | No         |
| `text-ignore-placement`   | No         |
| `text-justify`            | No         |
| `text-keep-upright`       | No         |
| `text-letter-spacing`     | No         |
| `text-line-height`        | No         |
| `text-max-angle`          | No         |
| `text-max-width`          | No         |
| `text-offset`             | No         |
| `text-opacity`            | No         |
| `text-optional`           | No         |
| `text-padding`            | No         |
| `text-pitch-alignment`    | No         |
| `text-radial-offset`      | No         |
| `text-rotate`             | No         |
| `text-rotation-alignment` | No         |
| `text-size`               | No         |
| `text-transform`          | No         |
| `text-translate`          | No         |
| `text-translate-anchor`   | No         |
| `text-variable-anchor`    | No         |
| `text-writing-mode`       | No         |
| `visibility`              | No         |

#### `raster`

| Property Key            | Supported? |
| ----------------------- | ---------- |
| `raster-brightness-max` | No         |
| `raster-brightness-min` | No         |
| `raster-contrast`       | No         |
| `raster-fade-duration`  | No         |
| `raster-hue-rotate`     | No         |
| `raster-opacity`        | No         |
| `raster-resampling`     | No         |
| `raster-saturation`     | No         |
| `visibility`            | No         |

#### `circle`

| Property Key              | Supported? |
| ------------------------- | ---------- |
| `circle-blur`             | No         |
| `circle-color`            | No         |
| `circle-opacity`          | No         |
| `circle-pitch-alignment`  | No         |
| `circle-pitch-scale`      | No         |
| `circle-radius`           | No         |
| `circle-sort-key`         | No         |
| `circle-stroke-color`     | No         |
| `circle-stroke-opacity`   | No         |
| `circle-stroke-width`     | No         |
| `circle-translate`        | No         |
| `circle-translate-anchor` | No         |
| `visibility`              | No         |

## Comparison with deck.gl/json

deck.gl already supports a [type of JSON layer description][deck.gl/json]. They
have a [live preview][deckgl/json_preview] of deck.gl/json as well.

[deck.gl/json]: https://deck.gl/#/documentation/submodule-api-reference/deckgl-json/overview
[deckgl/json_preview]: https://deck.gl/playground/

There are a couple of issues with their approach that don't fit my needs:

- Each layer is tied to a single data source.

  I want to take a _single source_, i.e. a vector tile layer, and render
  _many_ layers from that source. I don't see a way to do that with the
  existing deckgl/json capabilities.

deck.gl/JSON is designed to be used to define an _entire_ visualization. In
contrast, this spec is desinged to be used to generate layers _within_ a
`TileLayer`.
