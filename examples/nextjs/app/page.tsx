import type { ReactElement } from "react";
import { Snow } from "./Snow";

// A Server Component: it renders the page, and the snow comes from the client component it includes.
export default function Page(): ReactElement {
    return (
        <main style={{ display: "grid", placeContent: "center", minHeight: "100vh", fontFamily: "system-ui" }}>
            <h1>Let it snow</h1>
            <Snow />
        </main>
    );
}
