export const accentMap = {
  purple: "from-purple-600 to-fuchsia-600",
  pink: "from-pink-600 to-rose-600",
  blue: "from-blue-500 to-indigo-600",
  cyan: "from-cyan-500 to-blue-500",
  green: "from-green-500 to-emerald-600",
  orange: "from-orange-500 to-pink-600",
};

export const accentSolidMap = {
  purple: "bg-purple-600",
  pink: "bg-pink-600",
  blue: "bg-blue-600",
  cyan: "bg-cyan-500",
  green: "bg-green-600",
  orange: "bg-orange-500",
};

export const getAccentButton = (accent) => {
  return accentMap[accent] || accentMap.purple;
};