import { filterFeatures } from "../src/mapbox-style";

describe("filterFeatures", () => {
  test("filter correctly", () => {
    const features = [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: []
        },
        properties: {
          class: "minor"
        }
      }
    ];
    const filter = [
      "all",
      ["==", "$type", "LineString"],
      ["!in", "brunnel", "bridge", "tunnel"],
      ["in", "class", "minor"]
    ];
    const result = filterFeatures({features, filter});
    expect(result).toStrictEqual(features);
  });
});
