import { createSnow, crystal, dot } from "@zimaleto/zima";
import "./style.css";

function setUpHero(hero: HTMLElement, toggle: HTMLButtonElement): void {
    // Snow inside the header: the engine adds a canvas that fills it and follows its size.
    const snow = createSnow(hero, {
        density: 0.4,
        shapes: [dot, { shape: crystal, weight: 0.3 }],
    });
    let isPaused = false;

    function handleToggleClick(): void {
        isPaused = !isPaused;
        if (isPaused) {
            snow.stop();
        } else {
            snow.start();
        }
        toggle.textContent = isPaused ? "Start" : "Stop";
    }

    toggle.addEventListener("click", handleToggleClick);
}

const hero = document.querySelector<HTMLElement>(".hero");
const toggle = document.querySelector<HTMLButtonElement>("#toggle");

if (hero && toggle) {
    setUpHero(hero, toggle);
}
