import { Booster, ResourceThroughput } from "./buildings/parseBuildingDefinitions";

// Given a building's boosters and the amounts currently connected to each booster input,
// returns the total boost added to each output resource: connectedInputAmount * boostFactor.
export function calculateBoost(boosters: Booster[], connectedBoosterInputAmounts: ResourceThroughput[]): ResourceThroughput[] {
  const totalBoostByOutput = new Map<string, number>();
  for (const booster of boosters) {
    const connectedInputAmount = connectedBoosterInputAmounts.find(amount => amount.name === booster.input.name)?.value ?? 0;
    for (const outputBoost of booster.outputBoost) {
      totalBoostByOutput.set(
        outputBoost.name,
        (totalBoostByOutput.get(outputBoost.name) ?? 0) + connectedInputAmount * outputBoost.value,
      );
    }
  }
  return Array.from(totalBoostByOutput.entries()).map(([name, value]) => ({ name, value }));
}
