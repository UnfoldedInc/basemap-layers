# basemap-layers

> Note that this project has limited goals and scope. It is not intended to be a replacement for commercial basemaps, and it does not provide the level of support that is provided by commercial basemaps. The developer team behind this module certainly welcomes contributors and funding, but we are not currently able to provide the levels of active support for the community as the core deck.gl project.

[deck.gl](https://deck.gl) basemap layers.

The primary export is the `BaseMapLayer` layer, which accepts
- [A vector tile URL]()
- [A style specification]()

## Overview

Renders the desired datasets via a composite deck.gl layer that builds on `MVTTileLayer` or `TerrainLayer`.

## License

MIT License
