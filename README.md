# GruveEventWidgets

**GruveEventWidgets** is a React component that allows users to display and manage event ticket selections easily.  
It handles event display, ticket purchase flows, and supports customization like theme color and ticket selection handling.

---

## 📦 Installation

```bash
npm install echo
```

#### or

```bash
yarn add echo
```

### 🚀 Usage

```
import { GruveEventWidgets } from "echo";

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
       isTest={false} //default to false
      />
    </div>
  );
}

export default App;

```

### ⚙️ Props

Prop Name Type Required Description
eventAddress string ✅ Yes The unique address of the event you want to display.
config object (hex code) ❌ No Primary color for theming the widget (e.g., #FF5733). Defaults if not set.

## 📜 License

This project is licensed under the MIT License.
You are free to use, modify, and distribute this package for personal and commercial purposes.

---

# 🤝 Contributions

Contributions are welcome! Feel free to submit a pull request or open an issue if you encounter any bugs or want to add features.
