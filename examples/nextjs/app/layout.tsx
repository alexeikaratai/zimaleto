import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";

export const metadata: Metadata = {
    title: "zima in the Next.js App Router",
};

type RootLayoutProps = {
    children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): ReactElement {
    return (
        <html lang="en">
            <body style={{ margin: 0, minHeight: "100vh", background: "#070d1a", color: "#e8eef7" }}>{children}</body>
        </html>
    );
}
