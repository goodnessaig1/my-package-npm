# GruveEventWidgets

**GruveEventWidgets** is a React component that allows users to display and manage event ticket selections easily.  
It handles event display, ticket purchase flows, and supports customization like theme color and ticket selection handling.

---

## 📦 Installation

```bash
npm install gruve-event-widgets
```

#### or

```bash
yarn add gruve-event-widgets
```

### 🚀 Usage

```
import GruveEventWidgets from "gruve-event-widgets";

function App() {
  return (
    <div>
      <GruveEventWidgets
        eventId="your-event-id"
        themeColor="#3498db"
        onTicketSelect={(ticketData) => {
          console.log("Selected ticket:", ticketData);
        }}
      />
    </div>
  );
}

export default App;

```

### ⚙️ Props

Prop Name Type Required Description
eventId string ✅ Yes The unique ID of the event you want to display.
themeColor string (hex code) ❌ No Primary color for theming the widget (e.g., #FF5733). Defaults if not set.
onTicketSelect (ticketData: any) => void ❌ No Callback triggered when a ticket is selected. Receives the selected ticket data.
