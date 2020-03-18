import { generateDeckLineFeatures } from "./generate-deck-features";
import { filterFeatures, visitLayers, visitProperties } from "./mapbox-style";
import { SUPPORTED_MAPBOX_LAYER_TYPES } from "./constants";

// var style = require("../tests/fixtures/style/osm-liberty.json");
// // vt2geojson https://mbtiles.nst.guide/services/openmaptiles/us/tiles/12/666/1433.pbf > openmaptiles-12-666-1433.json
// var featureCollection = require("../tests/fixtures/geojson/openmaptiles-12-666-1433.json");
// var features = featuresArrayToObject({
//   features: featureCollection.features,
//   layerName: "vt_layer",
//   sourceName: "openmaptiles"
// });
// var zoom = 12;

// features expected to be
// {sourceName: {layerName: [features]}}
export function parseMapboxStyle(options = {}) {
  const { style, features, zoom } = options;

  const globalProperties = { zoom: zoom };
  const generatedFeatures = {};
  // Instantiate arrays in generatedFeatures
  SUPPORTED_MAPBOX_LAYER_TYPES.forEach(layer_type => {
    generatedFeatures[layer_type] = [];
  });


  // Since each feature can be styled more than once, you need to loop over
  // layers, not features
  for (const layer of style.layers) {
    // Skip if not a supported layer type
    if (!SUPPORTED_MAPBOX_LAYER_TYPES.includes(layer.type)) continue;

    // Features relevant to this layer
    const layerFeatures = findFeaturesStyledByLayer({
      features,
      layer,
      globalProperties
    });
    if (!layerFeatures || layerFeatures.length === 0) return;

    // An array of Property objects for this specific layer
    const layerProperties = [];
    visitProperties(layer, { paint: true }, property =>
      layerProperties.push(property)
    );

    let deckFeatures;
    if (layer.type === "line") {
      deckFeatures = generateDeckLineFeatures(
        layerFeatures,
        layerProperties,
        globalProperties
      );
    }

    if (deckFeatures) {
      generatedFeatures[layer.type].push(deckFeatures);
    }
  }

  // TODO: Convert to binary represenatation for deck.gl
  return generatedFeatures;
}

// features expected to be
// {sourceName: {layerName: [features]}}
function findFeaturesStyledByLayer({ features, layer, globalProperties }) {
  // features matching the source and source-layer
  const sourceLayerFeatures = features[layer.source][layer["source-layer"]];
  if (!sourceLayerFeatures) return [];

  if (layer.filter && layer.filter.length > 0) {
    return filterFeatures({
      features: sourceLayerFeatures,
      filter: layer.filter,
      globalProperties
    });
  }

  return [];
}
