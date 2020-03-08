# deckgl-style-spec

A specification for styling vector tiles/GeoJSON layers using only deck.gl
layers. Inspired by the Mapbox Style Specification.

## Motivation

Currently, Mapbox GL JS does not have 3D terrain support, and despite [an
enticing tweet][mapbox_3d_tweet], no support is imminent. As of version 8.1,
Deck.gl will have support for a [terrain layer][deckgl_terrain_layer], which
generates a terrain mesh on the fly using [MARTINI][martini] and overlays an
image texture on the mesh (i.e. satellite imagery). While this is great, by
default it hides any vector layers rendered by the underlying Mapbox GL JS,
because those layers have elevation 0. This means that it's hard to interpret
the terrain or lose track of where you are.

[mapbox_3d_tweet]: https://twitter.com/Mapbox/status/1222605626053783552
[deckgl_terrain_layer]: https://github.com/uber/deck.gl/blob/master/docs/layers/terrain-layer.md
[martini]: https://github.com/mapbox/martini

However deck.gl correctly renders vector features that have 3D coordinates.
Thus, this spec is part of my attempt to create a workaround, so that I can
render vector features on top of 3D terrain.

1. Snap vector features to the terrain mesh on the fly using [kylebarron/snap-features-to-mesh][kylebarron/snap-features-to-mesh]. This adds Z values to every coordinate of the vector feature.
2. Style each feature using a deck.gl layer.

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
