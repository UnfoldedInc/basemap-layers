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
