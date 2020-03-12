import { toBinary } from "./features-to-binary";
import { generateDeckLineFeatures } from "./generate-deck-features";
import { filterFeatures, visitLayers, visitProperties } from "./mapbox-style";
import { SUPPORTED_LAYER_TYPES } from "./constants";

// var style = require("./style.json");
// // vt2geojson https://mbtiles.nst.guide/services/openmaptiles/us/tiles/12/666/1433.pbf > openmaptiles-12-666-1433.json
// var featureCollection = require("../tests/fixtures/openmaptiles-12-666-1433.json");
// var features = featuresArrayToObject(
//   featureCollection.features,
//   "vt_layer",
//   "openmaptiles"
// );

// features expected to be
// {sourceName: {layerName: [features]}}
export function parseMapboxStyle(options = {}) {
  const { style, features, zoom } = options;

  const globalProperties = { zoom: zoom };
  const generatedFeatures = {};
  // Instantiate arrays
  SUPPORTED_LAYER_TYPES.forEach(x => (generatedFeatures[x] = []));

  // Loop over layers
  // For each style layer, find all the features that
  // Note that there can be a 1:n mapping of features to style layers
  // I.e. each feature can be styled more than once. Therefore you really need to loop over style
  // layers, not features
  visitLayers(style, layer => {
    // Features relevant to this layer
    const layerFeatures = findFeaturesStyledByLayer(features, layer);
    if (!layerFeatures || layerFeatures.length === 0) return;

    const layerProperties = [];
    visitProperties(layer, { paint: true }, property =>
      layerProperties.push(property)
    );

    const deckFeatures;
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
  });

  // TODO: Convert to binary represenatation for deck.gl
  return generatedFeatures;
}

// features expected to be
// {sourceName: {layerName: [features]}}
function findFeaturesStyledByLayer(features, layer) {
  // features matching the source and source-layer
  const sourceLayerFeatures = features[layer.source][layer["source-layer"]];
  if (!sourceLayerFeatures) return [];

  if (layer.filter && layer.filter.length > 0) {
    sourceLayerFeatures = filterFeatures(sourceLayerFeatures, layer.filter);
  }

  return sourceLayerFeatures;
}
