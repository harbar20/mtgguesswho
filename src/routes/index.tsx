import { Suspense } from "solid-js";
import Cards from "~/components/Cards";

export default function Home() {
    return (
        <>
            <header class="app-header">
                <div class="header-content">
                    <h1 class="main-title">
                        MTG Guess Who
                    </h1>
                    <p class="subtitle">Click cards to hid commanders</p>
                </div>
            </header>
            <main class="main-content">
                <Suspense
                    fallback={
                        <div class="loading-container">
                            <div class="loading-spinner"></div>
                            <p class="loading-text">Loading commanders...</p>
                        </div>
                    }
                >
                    <Cards />
                </Suspense>
            </main>
        </>
    );
}
