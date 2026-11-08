import type { ReducedMotion } from "@zimaleto/zima";
import type { ChangeEvent, ReactElement } from "react";
import { ColorPresets } from "./components/ColorPresets";
import { RangeField } from "./components/RangeField";
import { type SelectChoice, SelectField } from "./components/SelectField";
import { SliderField } from "./components/SliderField";
import { ToggleField } from "./components/ToggleField";
import type { PlaygroundOptions, TargetMode } from "./options";
import { SHAPE_LABELS, SHAPE_NAMES } from "./shapes";

type AmountMode = "count" | "density";

export type ControlsProps = {
    options: PlaygroundOptions;
    mode: TargetMode;
    paused: boolean;
    onOptionsChange: (changes: Partial<PlaygroundOptions>) => void;
    onModeChange: (mode: TargetMode) => void;
    onPausedChange: (paused: boolean) => void;
    onRestart: () => void;
};

const MODE_CHOICES: readonly SelectChoice<TargetMode>[] = [
    { value: "container", label: "Inside an element" },
    { value: "canvas", label: "On my own <canvas>" },
    { value: "page", label: "Over the whole page" },
];

const AMOUNT_CHOICES: readonly SelectChoice<AmountMode>[] = [
    { value: "count", label: "A fixed count" },
    { value: "density", label: "Density, per 100×100 px" },
];

const FPS_CHOICES: readonly SelectChoice<string>[] = [
    { value: "display", label: "Display refresh rate" },
    { value: "60", label: "60 fps" },
    { value: "30", label: "30 fps" },
    { value: "15", label: "15 fps" },
];

const DPR_CHOICES: readonly SelectChoice<string>[] = [
    { value: "1", label: "1×" },
    { value: "1.5", label: "1.5×" },
    { value: "2", label: "2×" },
    { value: "3", label: "3×" },
];

const REDUCED_MOTION_CHOICES: readonly SelectChoice<ReducedMotion>[] = [
    { value: "static", label: "Static: one still frame" },
    { value: "reduce", label: "Reduce: half the flakes, slower" },
    { value: "ignore", label: "Ignore: animate as usual" },
];

const DEFAULT_DENSITY = 0.6;

export function Controls({
    options,
    mode,
    paused,
    onOptionsChange,
    onModeChange,
    onPausedChange,
    onRestart,
}: ControlsProps): ReactElement {
    const amountMode: AmountMode = options.density === undefined ? "count" : "density";
    const fpsChoice = options.fps === undefined ? "display" : String(options.fps);

    function handleAmountModeChange(nextMode: AmountMode): void {
        onOptionsChange({ density: nextMode === "density" ? DEFAULT_DENSITY : undefined });
    }

    function handleFpsChange(value: string): void {
        onOptionsChange({ fps: value === "display" ? undefined : Number(value) });
    }

    function handleMaxDprChange(value: string): void {
        onOptionsChange({ maxDpr: Number(value) });
    }

    function handleSeedChange(event: ChangeEvent<HTMLInputElement>): void {
        const { value } = event.currentTarget;
        onOptionsChange({ seed: value === "" ? undefined : Number(value) });
    }

    function handlePlaybackClick(): void {
        onPausedChange(!paused);
    }

    return (
        <aside className="panel">
            <header className="panel-header">
                <h1>zima</h1>
                <p>
                    Every control calls <code>snow.update()</code> on a live snowfall.
                </p>
            </header>

            <section className="panel-section">
                <h2>Target</h2>
                <SelectField
                    label="Snow falls"
                    value={mode}
                    choices={MODE_CHOICES}
                    onChange={onModeChange}
                />
                <div className="buttons">
                    <button
                        type="button"
                        onClick={handlePlaybackClick}
                    >
                        {paused ? "Start" : "Stop"}
                    </button>
                    <button
                        type="button"
                        onClick={onRestart}
                    >
                        Restart
                    </button>
                </div>
            </section>

            <section className="panel-section">
                <h2>Amount</h2>
                <SelectField
                    label="Number of flakes"
                    value={amountMode}
                    choices={AMOUNT_CHOICES}
                    onChange={handleAmountModeChange}
                />
                {options.density === undefined ? (
                    <SliderField
                        label="Count"
                        value={options.count}
                        min={0}
                        max={1000}
                        step={10}
                        onChange={(count) => onOptionsChange({ count })}
                    />
                ) : (
                    <SliderField
                        label="Density"
                        value={options.density}
                        min={0}
                        max={5}
                        step={0.05}
                        onChange={(density) => onOptionsChange({ density })}
                    />
                )}
            </section>

            <section className="panel-section">
                <h2>Motion</h2>
                <RangeField
                    label="Speed"
                    value={options.speed}
                    min={0}
                    max={400}
                    step={5}
                    unit=" px/s"
                    onChange={(speed) => onOptionsChange({ speed })}
                />
                <SliderField
                    label="Wind"
                    value={options.wind}
                    min={-300}
                    max={300}
                    step={5}
                    unit=" px/s"
                    onChange={(wind) => onOptionsChange({ wind })}
                />
                <SliderField
                    label="Gusts"
                    value={options.gust}
                    min={0}
                    max={300}
                    step={5}
                    unit=" px/s"
                    onChange={(gust) => onOptionsChange({ gust })}
                />
                <RangeField
                    label="Sway"
                    value={options.sway}
                    min={0}
                    max={60}
                    step={1}
                    unit=" px"
                    onChange={(sway) => onOptionsChange({ sway })}
                />
                <RangeField
                    label="Rotation"
                    value={options.rotation}
                    min={-360}
                    max={360}
                    step={10}
                    unit="°/s"
                    onChange={(rotation) => onOptionsChange({ rotation })}
                />
                <p className="field-hint">Dots look the same at any angle; spin shows on the other shapes.</p>
            </section>

            <section className="panel-section">
                <h2>Shapes</h2>
                <p className="field-hint">Each flake picks a shape in proportion to its weight. 0 leaves it out.</p>
                {SHAPE_NAMES.map((name) => (
                    <SliderField
                        key={name}
                        label={SHAPE_LABELS[name]}
                        value={options.shapeWeights[name]}
                        min={0}
                        max={5}
                        step={0.5}
                        onChange={(weight) =>
                            onOptionsChange({ shapeWeights: { ...options.shapeWeights, [name]: weight } })
                        }
                    />
                ))}
            </section>

            <section className="panel-section">
                <h2>Look</h2>
                <RangeField
                    label="Size"
                    value={options.size}
                    min={0.5}
                    max={15}
                    step={0.5}
                    unit=" px"
                    onChange={(size) => onOptionsChange({ size })}
                />
                <RangeField
                    label="Opacity"
                    value={options.opacity}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(opacity) => onOptionsChange({ opacity })}
                />
                <ColorPresets
                    value={options.color}
                    onChange={(color) => onOptionsChange({ color })}
                />
                <ToggleField
                    label="Parallax"
                    checked={options.parallax}
                    hint="Bigger flakes fall faster and look closer."
                    onChange={(parallax) => onOptionsChange({ parallax })}
                />
            </section>

            <section className="panel-section">
                <h2>Rendering</h2>
                <SelectField
                    label="Frame rate"
                    value={fpsChoice}
                    choices={FPS_CHOICES}
                    onChange={handleFpsChange}
                />
                <SelectField
                    label="Max pixel ratio"
                    value={String(options.maxDpr)}
                    choices={DPR_CHOICES}
                    onChange={handleMaxDprChange}
                />
                <SelectField
                    label="Reduced motion"
                    value={options.reducedMotion}
                    choices={REDUCED_MOTION_CHOICES}
                    hint="Applies only when the OS asks for reduced motion."
                    onChange={(reducedMotion) => onOptionsChange({ reducedMotion })}
                />
                <ToggleField
                    label="Pause when hidden"
                    checked={options.pauseWhenHidden}
                    hint="In a background tab or when scrolled out of view."
                    onChange={(pauseWhenHidden) => onOptionsChange({ pauseWhenHidden })}
                />
                <label className="field">
                    <span className="field-label">Seed</span>
                    <input
                        type="number"
                        placeholder="Random"
                        value={options.seed ?? ""}
                        onChange={handleSeedChange}
                    />
                </label>
            </section>
        </aside>
    );
}
