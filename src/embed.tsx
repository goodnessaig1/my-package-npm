import React from "react";
import ReactDOM from "react-dom/client";
// import GruveEventWidgets from "./components/GruveEventsWidget";
import type { GruveEventWidgetsProps } from "./components/GruveEventsWidget";
import GruveEventWidgets from "./components/GruveEventsWidget";

export class GruveWidget {
  private root: ReactDOM.Root | null = null;

  render(options: {
    target: HTMLElement | string;
    props: GruveEventWidgetsProps;
  }) {
    const container =
      typeof options.target === "string"
        ? document.querySelector(options.target)
        : options.target;

    if (!container) {
      throw new Error("Target container not found.");
    }

    this.root = ReactDOM.createRoot(container);
    this.root.render(<GruveEventWidgets {...(options.props || {})} />);
  }

  unmount() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
