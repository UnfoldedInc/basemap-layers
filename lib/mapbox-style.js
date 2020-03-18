import {
  latest as Reference,
  featureFilter
} from "@mapbox/mapbox-gl-style-spec";
import { SUPPORTED_PROPERTY_KEYS } from "./constants";

// See https://github.com/mapbox/vector-tile-spec/blob/b87a6a16abc3fcda9ea3f0a68264b40f48e039f3/2.1/vector_tile.proto#L7-L13
const GEOM_TYPE_XW = {
  Point: 1,
  MultiPoint: 1,
  LineString: 2,
  MultiLineString: 2,
  Polygon: 3,
  MultiPolygon: 3
};

/**
 * Apply Mapbox Style Spec filter on features
 *
 * @param  {[Array[Object]]} features   Note that each feature must have a `properties` object and a
 *  `type` value. `type` must be an integer, and should correspond to the geometry type.
 *
 * @param  {[Array]} filter           filter definition
 * @param  {[Object]} globalProperties {zoom: current zoom}
 * @return {[Array[Object]]}                  Filtered features
 */
function filterFeatures({ features, filter, globalProperties }) {
  if (!features || features.length === 0) return [];

  // filterFn will be a function that returns a boolean
  const filterFn = featureFilter(filter);

  // Filter array of features based on filter function
  return features.filter(feature => {
    if (![1, 2, 3].includes(feature.type)) {
      feature.type = GEOM_TYPE_XW[feature.geometry.type];
    }
    return filterFn(globalProperties, feature);
  });
}

// features expected to be
// {sourceName: {layerName: [features]}}
export function findFeaturesStyledByLayer({
  features,
  layer,
  globalProperties
}) {
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
