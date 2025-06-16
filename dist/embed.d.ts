import type { GruveEventWidgetsProps } from "./components/GruveEventsWidget";
export declare class GruveWidget {
    private root;
    render(options: {
        target: HTMLElement | string;
        props: GruveEventWidgetsProps;
    }): void;
    unmount(): void;
}
