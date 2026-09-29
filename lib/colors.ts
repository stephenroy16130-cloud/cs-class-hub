export const unitColorClasses = [
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-purple-50 text-purple-700 border-purple-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-cyan-50 text-cyan-700 border-cyan-200",
  "bg-orange-50 text-orange-700 border-orange-200",
];

export function colorForUnit(unit: string, allUnits: string[]) {
  const index = allUnits.indexOf(unit);
  return unitColorClasses[index % unitColorClasses.length];
}
