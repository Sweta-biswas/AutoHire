import { useState } from "react";

const skillLevels = [
  { id: "novice", label: "Novice", color: "rgb(240, 173, 78)" },
  { id: "beginner", label: "Beginner", color: "rgb(231, 146, 107)" },
  { id: "skillful", label: "Skillful", color: "rgb(147, 112, 219)" },
  { id: "experienced", label: "Experienced", color: "rgb(84, 184, 132)" },
  { id: "expert", label: "Expert", color: "rgb(77, 182, 172)" },
];

export default function SkillLevel({
  defaultLevel = "novice",
  onChange = () => {},
}) {
  const [selectedLevel, setSelectedLevel] = useState(defaultLevel);
  const [hoveredLevel, setHoveredLevel] = useState(null); // Track hovered level

  const handleLevelChange = (levelId) => {
    setSelectedLevel(levelId);
    onChange(levelId);
  };

  const getPositionClass = (levelId) => {
    switch (levelId) {
      case "novice":
        return "left-0";
      case "beginner":
        return "left-[20%]";
      case "skillful":
        return "left-[40%]";
      case "experienced":
        return "left-[60%]";
      case "expert":
        return "left-[80%]";
      default:
        return "left-0";
    }
  };

  const getBackgroundColor = (levelId) => {
    const level = skillLevels.find((level) => level.id === levelId);
    return level?.color;
  };

  const currentLevel = hoveredLevel || selectedLevel;

  return (
    <div className="w-full max-w-md mx-auto p-4 ">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-black text-sm">Level —</span>
        <span
          className=" text-sm"
          style={{ color: getBackgroundColor(currentLevel) }}
        >
          {skillLevels.find((level) => level.id === currentLevel)?.label}
        </span>
      </div>
      {/* Slider */}
      <div
        className="relative h-10 rounded-md overflow-hidden"
        style={{
          backgroundColor:
            currentLevel === "expert"
              ? "#E0F7F3"
              : currentLevel === "experienced"
              ? "#F1FBF7"
              : currentLevel === "skillful"
              ? "#F7F1FB"
              : currentLevel === "beginner"
              ? "#F1F2FE"
              : "#FDF4F1",
        }}
      >
        {/* Marker lines */}
        <div className="absolute inset-0 flex">
          {skillLevels.map((_, index) => (
            index > 0 &&
            index < skillLevels.length && (
              <div
                key={index}
                className="h-4 mt-3 w-px bg-current opacity-20"
                style={{
                  position: "absolute",
                  left: `${(index * 100) / skillLevels.length}%`,
                }}
              />
            )
          ))}
        </div>

        {/* Hover block */}
        {hoveredLevel && (
          <div
            className={`absolute top-0 w-[20%] h-12 transition-all duration-200 ease-in-out rounded-sm ${getPositionClass(
              hoveredLevel
            )}`}
            style={{
              backgroundColor: getBackgroundColor(hoveredLevel),
              opacity: 0.4, // Semi-transparent for hover effect
            }}
          />
        )}

        {/* Active block */}
        <div
          className={`absolute top-0 w-[21%] h-12 transition-all duration-300 ease-in-out rounded-sm ${getPositionClass(
            selectedLevel
          )}`}
          style={{ backgroundColor: getBackgroundColor(selectedLevel) }}
        />

        {/* Clickable areas */}
        <div className="absolute inset-0 grid grid-cols-5">
          {skillLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => handleLevelChange(level.id)}
              onMouseEnter={() => setHoveredLevel(level.id)}
              onMouseLeave={() => setHoveredLevel(null)}
              className="h-full w-full"
              aria-label={`Select ${level.label} skill level`}
              aria-pressed={selectedLevel === level.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
