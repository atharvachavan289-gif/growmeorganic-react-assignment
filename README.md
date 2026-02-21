# Artic Table - React Internship Assignment

A React application displaying artwork data from the Art Institute of Chicago API. Built with Vite, TypeScript, and PrimeReact, focusing on efficient server-side pagination and optimized state management for bulk row selection.

## 🚀 Live Demo
[ https://artinstitute-chicago.netlify.app/ ]

## 🛠️ Tech Stack
* **Framework:** React 18 + Vite
* **Language:** TypeScript
* **UI Library:** PrimeReact
* **Styling:** Tailwind CSS (for layout utilities) + PrimeReact Themes
* **API:** Art Institute of Chicago API

## 🧠 Architecture & Selection Strategy
To comply with the strict performance requirements (avoiding background page pre-fetching and memory bloat), this application uses a **Deferred "Owed" Selection Strategy** for custom bulk selections across multiple pages.

**How it works:**
1.  **ID-Based State:** Selected rows are tracked globally using a dictionary (`Record<number, boolean>`) of Artwork IDs rather than storing full object payloads.
2.  **The "Debt" System:** When a user requests a bulk selection (e.g., 50 rows) via the custom overlay panel, the app immediately selects all available rows on the current page.
3.  **Deferred Execution:** The remaining required selections (the "debt") are saved in state (`owedRows`). 
4.  **Natural Fulfillment:** As the user naturally navigates to subsequent pages via server-side pagination, a dedicated `useEffect` intercepts the newly loaded data and automatically applies the remaining selections until the `owedRows` count reaches zero.

**Why this approach?**
This guarantees $O(1)$ network requests per page change. It strictly avoids the `while` loop anti-pattern that hammers the API and stores unseen data, ensuring the application remains lightweight and fast regardless of the selection size.

## 💻 Local Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone [Insert your repository link here]
    cd artic-table
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` in your browser.
