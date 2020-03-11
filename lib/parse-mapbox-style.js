var stylespec = require("@mapbox/mapbox-gl-style-spec");
var style = require("./style.json");
// vt2geojson https://mbtiles.nst.guide/services/openmaptiles/us/tiles/12/666/1433.pbf > openmaptiles-12-666-1433.json
var featureCollection = require("../tests/fixtures/openmaptiles-12-666-1433.json");
var features = featureCollection.features;

var SUPPORTED_PROPERTY_KEYS = {
  line: ["line-color", "line-width", "visibility"]
};

var SUPPORTED_LAYER_TYPES = ["line"];

function parseMapboxStyle(options = {}) {
  var { style, features, layerProperty = "vt_layer" } = options;

  // convert list of features into {layer: layer_features}
  var layerNames = Array.from(
    features.reduce(
      (set, feature) => set.add(feature.properties[layerProperty]),
      new Set()
    )
  );
  var featuresByLayer = {};
  layerNames.forEach(layerName => {
    featuresByLayer[layerName] = features.filter(
      feature => feature.properties[layerProperty] === layerName
    );
  });

  // Loop over layers
  var properties = [];
  visitLayers(style, layer => {
    visitProperties(layer, {paint: true}, property => properties.push(property))
  });

  var property = properties[0]
  property

  properties.length
}

function visitLayers(style, layerCallback) {
  style.layers.forEach(layer => {
    // Skip if not a supported layer type
    if (!SUPPORTED_LAYER_TYPES.includes(layer.type)) return;
    layerCallback(layer);
  });
}

function visitProperties(layer, options, callback) {
  // Modified from https://github.com/mapbox/mapbox-gl-js/blob/d144fbc34ddec9e7a8fc34125d3a92558fa99318/src/style-spec/visit.js#L53-L67
  function inner(layer, propertyType) {
    const properties = layer[propertyType];
    if (!properties) return;
    Object.keys(properties).forEach(key => {
      // Skip if not a supported property key
      if (!SUPPORTED_PROPERTY_KEYS[layer.type].includes(key)) return;
      callback({
        layer: layer,
        path: [layer.id, propertyType, key],
        key,
        value: properties[key],
        reference: getPropertyReference(key),
        set(x) {
          properties[key] = x;
        }
      });
    });
  }

  if (options.paint) {
    inner(layer, "paint");
  }
  if (options.layout) {
    inner(layer, "layout");
  }
}

// https://github.com/mapbox/mapbox-gl-js/blob/d144fbc34ddec9e7a8fc34125d3a92558fa99318/src/style-spec/visit.js#L13-L26
function getPropertyReference(propertyName) {
  const Reference = stylespec.latest;
  for (let i = 0; i < Reference.layout.length; i++) {
    for (const key in Reference[Reference.layout[i]]) {
      if (key === propertyName) return Reference[Reference.layout[i]][key];
    }
  }
  for (let i = 0; i < Reference.paint.length; i++) {
    for (const key in Reference[Reference.paint[i]]) {
      if (key === propertyName) return Reference[Reference.paint[i]][key];
    }
  }

  return null;
}

