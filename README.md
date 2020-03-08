# deck-style-spec

A specification for styling vector tiles/GeoJSON layers using only deck.gl
layers. Inspired by the Mapbox Style Specification.

## Overview

Currently, Mapbox GL JS does not have 3D terrain support, and despite [an
enticing tweet][mapbox_3d_tweet], no support is imminent. As of version 8.1,
Deck.gl will have support for a [terrain layer][deckgl_terrain_layer], which
generates a terrain mesh on the fly using [MARTINI][martini] and overlays an
image texture on the mesh (i.e. satellite imagery). While this is great, by
default it hides any vector layers rendered by the underlying Mapbox GL JS,
because those layers have elevation 0.

However deck.gl correctly renders vector features that have 3D coordinates.
Thus, this spec is part of my attempt to create a workaround.

1. Snap vector features to the terrain mesh on the fly using [kylebarron/snap-features-to-mesh][kylebarron/snap-features-to-mesh]. This adds Z values to every coordinate of the vector feature.
2. Style each feature using a deck.gl layer.
