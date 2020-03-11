import stylespec from "@mapbox/mapbox-gl-style-spec";
import { SUPPORTED_LAYER_TYPES, SUPPORTED_PROPERTY_KEYS } from "./constants";

const Reference = stylespec.latest;

export function filterFeatures(features, filter, globalProperties) {
  if (!features || features.length === 0) return [];

  // filterFun will be a function that returns a boolean
  var filterFun = stylespec.featureFilter(filter);

  // Filter array of features based on filter function
  return (filteredFeatures = features.filter(feature =>
    filterFun(globalProperties, feature)
  ));
}

export function visitLayers(style, layerCallback) {
  style.layers.forEach(layer => {
    // Skip if not a supported layer type
    if (!SUPPORTED_LAYER_TYPES.includes(layer.type)) return;
    layerCallback(layer);
  });
}

export function visitProperties(layer, options, callback) {
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
