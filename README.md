# GruveEventWidgets

**GruveEventWidgets** is a React component that allows users to display and manage event ticket selections easily.  
It handles event display, ticket purchase flows, and supports customization like theme color and ticket selection handling.

---

## 📦 Installation

```bash
npm install echo-test-goody
```

#### or

```bash
yarn add echo-test-goody
```

### 🚀 Usage

```
import { GruveEventWidgets } from "echo-test-goody";

function App() {
  return (
    <div>
      <GruveEventWidgets
        eventAddress="your-event-address. eg:0x1508DfF27C5BfFC5810976fBCB3************"
        config={{
           buttonColor: "#3498db",
            buttonText: "View event.....",
            buttonTextColor: "white",
        }}
      />
    </div>
  );
}

export default App;

```

---

<br>
<br>
<br>
<br>
<br>

### ⚙️ Props

| Prop Name    | Type   | Required | Description                                                             |
| ------------ | ------ | -------- | ----------------------------------------------------------------------- |
| eventAddress | string | ✅ Yes   | The unique eventAddress of the event you want to display.               |
| config       | object | No       | Optional UI configuration for customizing the widget button appearance. |

<br>
<br>
<br>

### config _object properties:_

| Name            | Type   | Required | Description                                                |
| --------------- | ------ | -------- | ---------------------------------------------------------- |
| buttonColor     | string | No       | Background color of the button. (default: "#ea445a")       |
| buttonText      | string | No       | Text displayed inside the button. (default: "Get Tickets") |
| buttonTextColor | string | No       | Color of the button text. (default: "white")               |

<br>
<br>
<br>
<br>
<br>
<br>

## 📜 License

This project is licensed under the MIT License.
You are free to use, modify, and distribute this package for personal and commercial purposes.

---

# 🤝 Contributions

Contributions are welcome! Feel free to submit a pull request or open an issue if you encounter any bugs or want to add features.
