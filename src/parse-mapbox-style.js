import { findFeaturesStyledByLayer } from "./mapbox-style";

// var style = require("../tests/fixtures/style/osm-liberty.json");
// // vt2geojson https://mbtiles.nst.guide/services/openmaptiles/us/tiles/12/666/1433.pbf > openmaptiles-12-666-1433.json
// var featureCollection = require("../tests/fixtures/geojson/openmaptiles-12-666-1433.json");
// var features = featuresArrayToObject({
//   features: featureCollection.features,
//   layerName: "vt_layer",
//   sourceName: "openmaptiles"
// });
// var zoom = 12;

/**
 * Generate a new deck.gl layer for each StyleJSON layer
 *
 * @param  {object[]} layers StyleJSON layers
 * @return {objcet[]}        [description]
 */
const globalProperties = { zoom };
export function generateLayers(styleJson, globalProperties) {
  // TODO: a source can have a `url` argument, which means it has a hosted
  // TileJSON, whose properties need to be merged with the source defined in the
  // StyleJSON
  // In this case need to fetch the JSON
  const { sources, layers } = styleJson;
  const deckLayers = [];

  for (const layer of layers) {
    deckLayers.push(generateLayer(sources, layer, globalProperties));
  }

  return deckLayers;
}

const FILTERABLE_LAYERS = [
  "fill",
  "line",
  "symbol",
  "circle",
  "fill-extrusion"
];

function generateLayer(sources, layer, globalProperties) {
  const { type } = layer;

  // Parse property descriptions into values, resolving zoom
  const properties = parseProperties(layer, globalProperties);

  // Convert from Mapbox to Deck properties
  const deckProperties = {};
  for (const property of properties) {
    const key = Object.keys(property)[0];
    deckProperties[PROPERTY_XW[key]] = property[key];
  }

  // Make dataTransform function to filter data on each deck.gl layer
  let dataTransform;
  if (FILTERABLE_LAYERS.includes(type)) {
    dataTransform = constructDataTransform(layer, globalProperties);
  }

  // Render deck.gl layers
  switch (type) {
    case "background":
      return generateBackgroundLayer(
        sources,
        layer,
        deckProperties,
        dataTransform
      );
    case "fill":
      return generateFillLayer(sources, layer, deckProperties, dataTransform);
    case "line":
      return generateLineLayer(sources, layer, deckProperties, dataTransform);
    case "symbol":
      return generateSymbolLayer(sources, layer, deckProperties, dataTransform);
    case "raster":
      return generateRasterLayer(sources, layer, deckProperties, dataTransform);
    case "circle":
      return generateCircleLayer(sources, layer, deckProperties, dataTransform);
    case "fill-extrusion":
      return generateFillExtrusionLayer(
        sources,
        layer,
        deckProperties,
        dataTransform
      );
    case "heatmap":
      return generateHeatmapLayer(
        sources,
        layer,
        deckProperties,
        dataTransform
      );
    // case "hillshade":
    //   return generateHillshadeLayer(sources, layer);
    default:
      console.warn(`Invalid/unsupported layer type: ${type}`);
  }
}

function constructDataTransform(layer, globalProperties) {
  // Filter layer's data
  function dataTransform(data) {
    return findFeaturesStyledByLayer({
      features: data,
      layer,
      globalProperties
    });
  }

  return dataTransform;
}
