// Generic recycling-industry averages, applied to total weight recycled.
// Per-material factors aren't tracked on the Category model (owned by another
// feature), so a single blended estimate is used across all materials.
const CO2_SAVED_KG_PER_KG = 1.5;
const WATER_SAVED_LITERS_PER_KG = 7;
const TREES_EQUIVALENT_PER_1000KG = 17;

function calculateEnvironmentalImpact(totalWeightKg) {
  return {
    co2SavedKg: Math.round(totalWeightKg * CO2_SAVED_KG_PER_KG * 10) / 10,
    waterSavedLiters: Math.round(totalWeightKg * WATER_SAVED_LITERS_PER_KG),
    treesEquivalent: Math.round((totalWeightKg / 1000) * TREES_EQUIVALENT_PER_1000KG * 100) / 100,
  };
}

module.exports = { calculateEnvironmentalImpact };
