var stylespec = require("@mapbox/mapbox-gl-style-spec");
var style = require("./style.json");
// vt2geojson https://mbtiles.nst.guide/services/openmaptiles/us/tiles/12/666/1433.pbf > openmaptiles-12-666-1433.json
var featureCollection = require("../tests/fixtures/openmaptiles-12-666-1433.json");
var features = featuresArrayToObject(featureCollection.features, 'vt_layer', 'openmaptiles');

var SUPPORTED_PROPERTY_KEYS = {
  line: ["line-color", "line-width", "visibility"]
};

var SUPPORTED_LAYER_TYPES = ["line"];

var MAPBOX_DECK_LAYER_XW = {
  line: "PathLayer"
};

var MAPBOX_DECK_PROPERTY_XW = {
  "line-color": "getColor"
};

// features expected to be
// {sourceName: {layerName: [features]}}
export function parseMapboxStyle(options = {}) {
  var { style, features, zoom } = options;

  var globalProperties = { zoom: zoom };
  var generatedFeatures = {};

  // Loop over layers
  // For each style layer, find all the features that
  // Note that there can be a 1:n mapping of features to style layers
  // I.e. each feature can be styled more than once. Therefore you really need to loop over style
  // layers, not features
  visitLayers(style, layer => {
    // Features relevant to this layer
    var layerFeatures = findFeaturesStyledByLayer(features, layer);
    var layerProperties = [];
    visitProperties(layer, { paint: true }, property =>
      layerProperties.push(property)
    );

    var deckFeatures;
    switch (layer.type) {
      case "line":
        deckFeatures = generateDeckLineFeatures(
          layerFeatures,
          layerProperties,
          globalProperties
        );
        break;
      default:
        console.error("Incorrect layer type");
    }

    // TODO: fix append -> push
    generatedFeatures[layer.type].append(deckFeatures);
  });

  // Convert to binary represenatation for deck.gl
  return finalizeGeneratedFeatures(generatedFeatures);
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

// features expected to be
// {sourceName: {layerName: [features]}}
function findFeaturesStyledByLayer(features, layer) {
  // features matching the source and source-layer
  var sourceLayerFeatures = features[layer.source][layer["source-layer"]];

  // TODO filter the features within this source layer if the layer has a `filter` key
  return sourceLayerFeatures;
}

// Generate an object consisting of a list of line features that should all be styled the same way
function generateDeckLineFeatures(features, properties, globalProperties) {
  var lineGeometries = [];
  for (var feature of features) {
    var lines = geometryToLines(feature.geometry);
    lines.forEach(x => lineGeometries.push(x.coordinates));
  }

  var deckProperties = {};
  for (var property of properties) {
    var expression = stylespec.expression.normalizePropertyExpression(
      property.value,
      property.reference
    );
    var result = expression.evaluate(globalProperties);
    var deckPropertyKey = MAPBOX_DECK_PROPERTY_XW[property.key];
    if (result instanceof stylespec.Color) {
      deckProperties[deckPropertyKey] = result.toArray();
    }
  }

  return { lines: lineGeometries, properties: deckProperties };
}

// returns array of `LineString` geojson geometries
// This is because some input types, like MultiLineString or MultiPolygon constitute multiple lines
function geometryToLines(geometry) {
  if (geometry.type === "Polygon") {
    return [polygonToLine(geometry).geometry];
  } else if (geometry.type === "MultiPolygon") {
    return polygonToLine(geometry).features.map(f => f.geometry);
  }
}

// TODO: add optional layerNames property, so that you don't have to iterate over features once just
// to get layer names. This also would support creating an object with a known subset of layers.
export function featuresArrayToObject(features, layerProperty, sourceName) {
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
  return { [sourceName]: featuresByLayer };
}

