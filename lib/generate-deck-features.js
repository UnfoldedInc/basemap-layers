import polygonToLine from "@turf/polygon-to-line";
import { expression, Color } from "@mapbox/mapbox-gl-style-spec";

const MAPBOX_DECK_PROPERTY_XW = {
  "line-color": "getColor",
  "line-width": "getWidth"
};

// Generate an object consisting of a list of line features that should all be
// styled the same way
export function generateDeckLineFeatures({
  features,
  properties,
  globalProperties
}) {
  const lineGeometries = [];
  for (const feature of features) {
    const lines = geometryToLines(feature.geometry);
    lines.forEach(x => lineGeometries.push(x.coordinates));
  }

  const deckProperties = {};
  for (const property of properties) {
    const exp = expression.normalizePropertyExpression(
      property.value,
      property.reference
    );
    const result = exp.evaluate(globalProperties);
    const deckPropertyKey = MAPBOX_DECK_PROPERTY_XW[property.key];
    if (!deckPropertyKey) console.error("unknown property key");

    if (result instanceof Color) {
      // just rgb, not rgba
      deckProperties[deckPropertyKey] = result.toArray().slice(0, 3);
    }
    // Is numeric
    else if (!isNaN(result)) {
      deckProperties[deckPropertyKey] = result;
    } else {
      console.error("unknown property value type");
    }
  }

  if (deckProperties.getWidth === 0) {
    return;
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
