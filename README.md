# Gruve Event Widgets

GruveEventWidgets is a React component that lets you display and manage event ticket selections with minimal setup. It handles event display, ticket purchase flows, and supports custom styling and text via a single `config` prop.

---

## 📦 Installation

```bash
npm install @gruve/echo
```

or

```bash
yarn add @gruve/echo
```

---

## 🚀 Usage

### 1. Render a styled button with custom text

If you provide `config.displayText`, the component will render a button with that text. Any `children` passed will be ignored in this mode.

```tsx
import React from "react";
import { GruveEventWidgets } from "@gruve/echo";

function App() {
  return (
    <div>
      <GruveEventWidgets
        eventAddress="0x1508DfF27C5BfFC5810976fBCB3************"
        isTest={true}
        config={{
          backgroundColor: "#3498db",
          color: "white",
          padding: "12px 24px",
          borderRadius: "6px",
          themeColor: "#e74c3c",
          displayText: "View Event",
        }}
      />
    </div>
  );
}

export default App;
```

### 2. Render custom children content

If you omit `config.displayText`, the component will render whatever you pass as `children` instead of a default button.

```tsx
import React from "react";
import { GruveEventWidgets } from "@gruve/echo";

function App() {
  return (
    <div>
      <GruveEventWidgets
        eventAddress="0x1508DfF27C5BfFC5810976fBCB3************"
        config={{
          backgroundColor: "#2ecc71",
          themeColor: "#27ae60",
        }}
      >
        <button style={{ padding: "8px 16px" }}>
          Custom “Join Now” Button
        </button>
        <p style={{ marginTop: "8px" }}>Extra info or custom UI here.</p>
      </GruveEventWidgets>
    </div>
  );
}

export default App;
```

---

# 🌐 Usage with HTML (CDN)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@gruve/echo@latest/dist/index.umd.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script>
      const widget = new window.GruveEventsWidget.GruveWidget();
      widget.render({
        target: "#root",
        props: {
          eventAddress: "0x1508DfF27C5BfFC5810976fBCB3************",
          config: {
            backgroundColor: '#EA445A',
            ...
          }
        }
      });
    </script>
  </body>
</html>
```

---

## ⚙️ Props

| Prop Name      | Type                                                                  | Required | Description                                                                                                                              |
| -------------- | --------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `eventAddress` | `string`                                                              | ✅ Yes   | The unique identifier (address) of the event you want to display.                                                                        |
| `isTest`       | `boolean`                                                             | No       | When `true`, runs the widget in test/sandbox mode (skips real payment flows).                                                            |
| `config`       | `React.CSSProperties & { themeColor?: string; displayText?: string }` | No       | Optional styling and text overrides. If you specify `displayText`, a button with that text is shown; otherwise, `children` are rendered. |
| `children`     | `React.ReactNode`                                                     | No       | Custom nodes to render _only_ when `config.displayText` is **not** provided.                                                             |

---

### 📐 `config` properties

| Name           | Type                | Required | Description                                                                                                 |
| -------------- | ------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| CSS Properties | `string` / `number` | No       | Any valid React CSS property (e.g., `backgroundColor`, `color`, `padding`, `borderRadius`).                 |
| `themeColor`   | `string`            | No       | A semantic theme color for internal use (e.g., hover states or progress bars).                              |
| `displayText`  | `string`            | No       | If provided, renders a button with this text. If omitted, the component will render its `children` instead. |

---

## 📜 License

This project is licensed under the MIT License.  
You are free to use, modify, and distribute this package for personal and commercial purposes.

---

## 🤝 Contributions

Contributions are welcome! Feel free to submit a pull request or open an issue if you encounter any bugs or want to add features.

```

```
