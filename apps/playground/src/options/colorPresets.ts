export type ColorPreset = "Snow" | "Ice" | "Aurora" | "Ember";

/** Color lists to pick from, each one a mood for the snow. */
export const COLOR_PRESETS: Record<ColorPreset, readonly string[]> = {
    Snow: ["#ffffff"],
    Ice: ["#ffffff", "#cfe8ff", "#9ccfff"],
    Aurora: ["#e0fff4", "#9effd8", "#b7a6ff"],
    Ember: ["#fff4e0", "#ffd38a", "#ff9f7a"],
};

export const PRESET_NAMES: ColorPreset[] = Object.keys(COLOR_PRESETS) as ColorPreset[];
