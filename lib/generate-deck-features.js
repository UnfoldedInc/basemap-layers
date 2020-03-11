import polygonToLine from "@turf/polygon-to-line";
import { MAPBOX_DECK_PROPERTY_XW } from "./constants";

// Generate an object consisting of a list of line features that should all be styled the same way
export function generateDeckLineFeatures(
  features,
  properties,
  globalProperties
) {
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
    if (!deckPropertyKey) console.error("unknown property key");

    if (result instanceof stylespec.Color) {
      deckProperties[deckPropertyKey] = result.toArray();
    }
    // Is numeric
    else if (!isNaN(result)) {
      deckProperties[deckPropertyKey] = result;
    } else {
      console.error("unknown property value type");
    }
  }

  return { lines: lineGeometries, properties: deckProperties };
}

// returns array of `LineString` geojson geometries
// This is because some input types, like MultiLineString or MultiPolygon constitute multiple lines
function geometryToLines(geometry) {
  if (geometry.type === "LineString") {
    return [geometry];
  } else if (geometry.type === "MultiLineString") {
    return geometry.coordinates.map(c => {
      return { type: "LineString", coordinates: c };
    });
  } else if (geometry.type === "Polygon") {
    return [polygonToLine(geometry).geometry];
  } else if (geometry.type === "MultiPolygon") {
    return polygonToLine(geometry).features.map(f => f.geometry);
  }
}
