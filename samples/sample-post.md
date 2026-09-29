# Introduction to React

React is a JavaScript library for building user interfaces from reusable
components. This sample exercises every Markdown feature the editor
understands, so you can confirm the import worked.

## Features

- Components
- Virtual DOM
- Reusable UI
- Hooks for state and effects

## Getting started

Install the package, then render your first component:

```javascript
import React from "react";
import { createRoot } from "react-dom/client";

function Hello() {
  return <h1>Hello React</h1>;
}

createRoot(document.getElementById("root")).render(<Hello />);
```

> Components let you break a page into independent, testable pieces.

### Why the virtual DOM helps

1. You describe **what** the UI should look like.
2. React works out **what** changed.
3. Only those parts of the DOM are touched.

That means fewer manual `querySelector` calls and far less layout thrash.

### Styling notes

You can use **bold**, *italic*, ~~strikethrough~~ and `inline code`
in the same sentence.

- Parse Markdown into HTML
- Load it into the editor
- Keep editing after the import

Read more in the [official documentation](https://react.dev/learn).

![React component tree](https://picsum.photos/seed/sample-post/1200/600)

---

Thanks for reading. 🚀 Feel free to edit any of this before saving.
