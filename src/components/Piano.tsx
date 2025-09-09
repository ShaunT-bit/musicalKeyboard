import { useState, useEffect, useCallback } from "react";
import { audioEngine, noteColors } from "@/logic/audioEngine";

interface PianoKeyProps {
    note: string;
    type: "white" | "black";
    isPressed?: boolean;
    octave?: number;
    onClick?: () => void;
}

const PianoKey = ({ note, type, isPressed = false, octave = 4, onClick }: PianoKeyProps) => {
    const [isActive, setIsActive] = useState(false);
    const [glowColor, setGlowColor] = useState<string | null>(null);

    const handleMouseDown = () => {
        setIsActive(true);
        const color = noteColors[note];
        setGlowColor(color);
        onClick?.();
        audioEngine.playNote(note, octave);


        setTimeout(() => {
            setIsActive(false);
            setGlowColor(null);
        }, 300);
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
          transition-all duration-300 ease-smooth
          flex items-end justify-center pb-4
          text-gray-600 font-medium text-sm
          cursor-pointer select-none
          hover:shadow-lg
        `}
                style={{
                    boxShadow: glowColor
                        ? `0 0 10px ${glowColor}, 0 0 30px ${glowColor}, 0 0 50px ${glowColor}`
                        : undefined
                }}
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
        transition-all duration-300 ease-smooth
        flex items-end justify-center pb-2
        text-white font-medium text-xs
        cursor-pointer select-none
        hover:shadow-lg
      `}
            style={{
                boxShadow: glowColor
                    ? `0 0 20px ${glowColor}, 0 0 40px ${glowColor}40`
                    : undefined
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            {note}
        </button>
    );
};

export const Piano = () => {
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

    // Piano keys layout: 2 octaves starting from C
    const keys = [
        { note: "C", type: "white" as const, octave: 4 },
        { note: "C#", type: "black" as const, octave: 4 },
        { note: "D", type: "white" as const, octave: 4 },
        { note: "D#", type: "black" as const, octave: 4 },
        { note: "E", type: "white" as const, octave: 4 },
        { note: "F", type: "white" as const, octave: 4 },
        { note: "F#", type: "black" as const, octave: 4 },
        { note: "G", type: "white" as const, octave: 4 },
        { note: "G#", type: "black" as const, octave: 4 },
        { note: "A", type: "white" as const, octave: 4 },
        { note: "A#", type: "black" as const, octave: 4 },
        { note: "B", type: "white" as const, octave: 4 },
        // Second octave
        { note: "C", type: "white" as const, octave: 5 },
        { note: "C#", type: "black" as const, octave: 5 },
        { note: "D", type: "white" as const, octave: 5 },
        { note: "D#", type: "black" as const, octave: 5 },
        { note: "E", type: "white" as const, octave: 5 },
        { note: "F", type: "white" as const, octave: 5 },
        { note: "F#", type: "black" as const, octave: 5 },
        { note: "G", type: "white" as const, octave: 5 },
        { note: "G#", type: "black" as const, octave: 5 },
        { note: "A", type: "white" as const, octave: 5 },
        { note: "A#", type: "black" as const, octave: 5 },
        { note: "B", type: "white" as const, octave: 5 },
    ];

    // Map home row keys to piano notes
    const keyboardToNote: { [key: string]: { note: string; octave: number } } = {
        'a': { note: 'C', octave: 4 },
        's': { note: 'D', octave: 4 },
        'd': { note: 'E', octave: 4 },
        'f': { note: 'F', octave: 4 },
        'j': { note: 'G', octave: 4 },
        'k': { note: 'A', octave: 4 },
        'l': { note: 'B', octave: 4 },
        ';': { note: 'C', octave: 5 },
    };

    const playNoteFromKeyboard = useCallback((key: string) => {
        const noteData = keyboardToNote[key.toLowerCase()];
        if (noteData) {
            audioEngine.playNote(noteData.note, noteData.octave);
            setPressedKeys(prev => new Set(prev).add(key.toLowerCase()));

            setTimeout(() => {
                setPressedKeys(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(key.toLowerCase());
                    return newSet;
                });
            }, 300);
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!event.repeat) {
                playNoteFromKeyboard(event.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [playNoteFromKeyboard]);

    const isKeyPressed = (note: string, octave: number) => {
        for (const [key, noteData] of Object.entries(keyboardToNote)) {
            if (noteData.note === note && noteData.octave === octave && pressedKeys.has(key)) {
                return true;
            }
        }
        return false;
    };

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
                        octave={key.octave}
                        isPressed={isKeyPressed(key.note, key.octave)}
                        onClick={() => console.log(`Playing ${key.note}${key.octave}`)}
                    />
                ))}
            </div>

            {/* Black keys - top layer, positioned absolutely */}
            <div className="absolute top-8 left-8 flex">
                {/* First octave black keys */}
                <div className="flex">
                    <div className="w-14"></div> {/* C space */}
                    <PianoKey note="C#" type="black" octave={4} onClick={() => console.log("Playing C#4")} />
                    <div className="w-14"></div> {/* D space */}
                    <PianoKey note="D#" type="black" octave={4} onClick={() => console.log("Playing D#4")} />
                    <div className="w-14"></div> {/* E space */}
                    <div className="w-14"></div> {/* F space */}
                    <PianoKey note="F#" type="black" octave={4} onClick={() => console.log("Playing F#4")} />
                    <div className="w-14"></div> {/* G space */}
                    <PianoKey note="G#" type="black" octave={4} onClick={() => console.log("Playing G#4")} />
                    <div className="w-14"></div> {/* A space */}
                    <PianoKey note="A#" type="black" octave={4} onClick={() => console.log("Playing A#4")} />
                    <div className="w-14"></div> {/* B space */}

                    {/* Second octave black keys */}
                    <div className="w-14"></div> {/* C space */}
                    <PianoKey note="C#" type="black" octave={5} onClick={() => console.log("Playing C#5")} />
                    <div className="w-14"></div> {/* D space */}
                    <PianoKey note="D#" type="black" octave={5} onClick={() => console.log("Playing D#5")} />
                    <div className="w-14"></div> {/* E space */}
                    <div className="w-14"></div> {/* F space */}
                    <PianoKey note="F#" type="black" octave={5} onClick={() => console.log("Playing F#5")} />
                    <div className="w-14"></div> {/* G space */}
                    <PianoKey note="G#" type="black" octave={5} onClick={() => console.log("Playing G#5")} />
                    <div className="w-14"></div> {/* A space */}
                    <PianoKey note="A#" type="black" octave={5} onClick={() => console.log("Playing A#5")} />
                </div>
            </div>
        </div>
    );
};