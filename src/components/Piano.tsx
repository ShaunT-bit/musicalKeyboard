import { useState } from "react";

interface PianoKeyProps {
  note: string;
  type: "white" | "black";
  isPressed?: boolean;
  onClick?: () => void;
}

const PianoKey = ({ note, type, isPressed = false, onClick }: PianoKeyProps) => {
  const [isActive, setIsActive] = useState(false);

  const handleMouseDown = () => {
    setIsActive(true);
    onClick?.();
    setTimeout(() => setIsActive(false), 150);
  };

  if (type === "white") {
    return (
      <button
        className={`
          w-14 h-48 
          ${isActive || isPressed 
            ? 'bg-white-key-active shadow-key-pressed translate-y-1' 
            : 'bg-white-key hover:bg-white-key-hover shadow-key'
          }
          border border-gray-300 rounded-b-lg
          transition-all duration-150 ease-smooth
          flex items-end justify-center pb-4
          text-gray-600 font-medium text-sm
          cursor-pointer select-none
          hover:shadow-lg
        `}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {note}
      </button>
    );
  }

  return (
    <button
      className={`
        w-8 h-32 -mx-4 z-10
        ${isActive || isPressed 
          ? 'bg-black-key-active shadow-key-pressed translate-y-1' 
          : 'bg-black-key hover:bg-black-key-hover shadow-key'
        }
        rounded-b-lg
        transition-all duration-150 ease-smooth
        flex items-end justify-center pb-2
        text-white font-medium text-xs
        cursor-pointer select-none
        hover:shadow-lg
      `}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {note}
    </button>
  );
};

export const Piano = () => {
  // Piano keys layout: 2 octaves starting from C
  const keys = [
    { note: "C", type: "white" as const },
    { note: "C#", type: "black" as const },
    { note: "D", type: "white" as const },
    { note: "D#", type: "black" as const },
    { note: "E", type: "white" as const },
    { note: "F", type: "white" as const },
    { note: "F#", type: "black" as const },
    { note: "G", type: "white" as const },
    { note: "G#", type: "black" as const },
    { note: "A", type: "white" as const },
    { note: "A#", type: "black" as const },
    { note: "B", type: "white" as const },
    // Second octave
    { note: "C", type: "white" as const },
    { note: "C#", type: "black" as const },
    { note: "D", type: "white" as const },
    { note: "D#", type: "black" as const },
    { note: "E", type: "white" as const },
    { note: "F", type: "white" as const },
    { note: "F#", type: "black" as const },
    { note: "G", type: "white" as const },
    { note: "G#", type: "black" as const },
    { note: "A", type: "white" as const },
    { note: "A#", type: "black" as const },
    { note: "B", type: "white" as const },
  ];

  // Separate white and black keys for proper layering
  const whiteKeys = keys.filter(key => key.type === "white");
  const blackKeys = keys.filter((key, index) => key.type === "black" && index < keys.length);

  return (
    <div className="relative p-8 bg-card rounded-2xl border border-border shadow-2xl">
      {/* White keys - bottom layer */}
      <div className="flex">
        {whiteKeys.map((key, index) => (
          <PianoKey
            key={`white-${index}`}
            note={key.note}
            type="white"
            onClick={() => console.log(`Playing ${key.note}`)}
          />
        ))}
      </div>
      
      {/* Black keys - top layer, positioned absolutely */}
      <div className="absolute top-8 left-8 flex">
        {/* First octave black keys */}
        <div className="flex">
          <div className="w-14"></div> {/* C space */}
          <PianoKey note="C#" type="black" onClick={() => console.log("Playing C#")} />
          <div className="w-14"></div> {/* D space */}
          <PianoKey note="D#" type="black" onClick={() => console.log("Playing D#")} />
          <div className="w-14"></div> {/* E space */}
          <div className="w-14"></div> {/* F space */}
          <PianoKey note="F#" type="black" onClick={() => console.log("Playing F#")} />
          <div className="w-14"></div> {/* G space */}
          <PianoKey note="G#" type="black" onClick={() => console.log("Playing G#")} />
          <div className="w-14"></div> {/* A space */}
          <PianoKey note="A#" type="black" onClick={() => console.log("Playing A#")} />
          <div className="w-14"></div> {/* B space */}
          
          {/* Second octave black keys */}
          <div className="w-14"></div> {/* C space */}
          <PianoKey note="C#" type="black" onClick={() => console.log("Playing C#")} />
          <div className="w-14"></div> {/* D space */}
          <PianoKey note="D#" type="black" onClick={() => console.log("Playing D#")} />
          <div className="w-14"></div> {/* E space */}
          <div className="w-14"></div> {/* F space */}
          <PianoKey note="F#" type="black" onClick={() => console.log("Playing F#")} />
          <div className="w-14"></div> {/* G space */}
          <PianoKey note="G#" type="black" onClick={() => console.log("Playing G#")} />
          <div className="w-14"></div> {/* A space */}
          <PianoKey note="A#" type="black" onClick={() => console.log("Playing A#")} />
        </div>
      </div>
    </div>
  );
};