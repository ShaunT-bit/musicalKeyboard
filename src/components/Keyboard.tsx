import { useState } from "react";

interface KeyProps {
    label: string;
    width?: "normal" | "wide" | "extra-wide";
    onClick?: () => void;
}

const glowColors = [
    "ring-pink-400 shadow-pink-400/50",
    "ring-purple-400 shadow-purple-400/50",
    "ring-blue-400 shadow-blue-400/50",
    "ring-green-400 shadow-green-400/50",
    "ring-yellow-400 shadow-yellow-400/50",
    "ring-red-400 shadow-red-400/50",
];

const Key = ({ label, width = "normal", onClick }: KeyProps) => {
    const [isPressed, setIsPressed] = useState(false);

    const widthClasses = {
        normal: "w-12 h-12",
        wide: "w-20 h-12",
        "extra-wide": "w-32 h-12"
    };

    // pick a random glow color when pressed
    const getGlow = () => glowColors[Math.floor(Math.random() * glowColors.length)];

    const handleMouseDown = () => {
        setIsPressed(true);
        onClick?.();
        setTimeout(() => setIsPressed(false), 200);
    };

    return (
        <button
            className={`
        ${widthClasses[width]}
        bg-key hover:bg-key-hover
        ${isPressed ? `bg-key-active scale-95 ring-4 ${getGlow()}` : "scale-100"}
        text-foreground font-medium text-sm
        rounded-lg border border-border
        shadow-key hover:shadow-key-hover
        transition-all duration-200 ease-smooth
        hover:scale-105 active:scale-95
        flex items-center justify-center
        cursor-pointer select-none
      `}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            {label}
        </button>
    );
};

export const Keyboard = () => {
    const topRow = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="];
    const qwertyRow = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"];
    const asdfRow = ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"];
    const zxcvRow = ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"];

    return (
        <div className="flex flex-col items-center gap-2 p-8 bg-card rounded-2xl border border-border shadow-2xl">
            {/* Function keys row */}
            <div className="flex gap-1 mb-2">
                {["Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"].map((key) => (
                    <Key key={key} label={key} />
                ))}
            </div>

            {/* Number row */}
            <div className="flex gap-1">
                <Key label="`" />
                {topRow.map((key) => (
                    <Key key={key} label={key} />
                ))}
                <Key label="Delete" width="wide" />
            </div>

            {/* QWERTY row */}
            <div className="flex gap-1">
                <Key label="Tab" width="wide" />
                {qwertyRow.map((key) => (
                    <Key key={key} label={key} />
                ))}
                <Key label="\" />
            </div>

            {/* ASDF row */}
            <div className="flex gap-1">
                <Key label="Caps" width="wide" />
                {asdfRow.map((key) => (
                    <Key key={key} label={key} />
                ))}
                <Key label="Return" width="wide" />
            </div>

            {/* ZXCV row */}
            <div className="flex gap-1">
                <Key label="Shift" width="wide" />
                {zxcvRow.map((key) => (
                    <Key key={key} label={key} />
                ))}
                <Key label="Shift" width="wide" />
            </div>

            {/* Bottom row */}
            <div className="flex gap-1">
                <Key label="Ctrl" />
                <Key label="Alt" />
                <Key label="Cmd" />
                <Key label="" width="extra-wide" />
                <Key label="Cmd" />
                <Key label="Alt" />
                <Key label="Ctrl" />
            </div>
        </div>
    );
};
