import { RestrictionsRequirements } from "../shared/sektorData";

const restrictionsRequirements: RestrictionsRequirements = {
  importRestrictions: [
    { name: "EnergyElectric", value: 4 },
    { name: "WaterPottable", value: 0 },
  ],
  exportRequirements: [
    { name: "FoodRaw", value: 10 },
  ],
};

export default restrictionsRequirements;
