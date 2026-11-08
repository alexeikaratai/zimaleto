import type { ReactElement, ReactNode } from "react";

export type PanelSectionProps = {
    title: string;
    children: ReactNode;
};

/** A titled group of controls in the side panel. */
export function PanelSection({ title, children }: PanelSectionProps): ReactElement {
    return (
        <section className="panel-section">
            <h2>{title}</h2>
            {children}
        </section>
    );
}
