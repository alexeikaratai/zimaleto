import { type ReactElement, useState } from "react";
import { Controls } from "./controls/Controls";
import { INITIAL_OPTIONS, type PlaygroundOptions, type TargetMode } from "./options/playgroundOptions";
import { SnowStage } from "./stage/SnowStage";

export function App(): ReactElement {
    const [options, setOptions] = useState<PlaygroundOptions>(INITIAL_OPTIONS);
    const [mode, setMode] = useState<TargetMode>("container");
    const [isPaused, setIsPaused] = useState(false);
    const [restartCount, setRestartCount] = useState(0);

    function handleOptionsChange(changes: Partial<PlaygroundOptions>): void {
        setOptions((current) => ({ ...current, ...changes }));
    }

    function handleRestart(): void {
        setRestartCount((count) => count + 1);
    }

    return (
        <div className="layout">
            <Controls
                options={options}
                mode={mode}
                isPaused={isPaused}
                onOptionsChange={handleOptionsChange}
                onModeChange={setMode}
                onPausedChange={setIsPaused}
                onRestart={handleRestart}
            />
            <SnowStage
                key={restartCount}
                mode={mode}
                options={options}
                isPaused={isPaused}
            />
        </div>
    );
}
