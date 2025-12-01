import { createSignal, onMount } from "solid-js";
import { ScryfallCommander } from "~/types";

interface FirstPrinting {
    set_name: string;
    released_at: string;
}

export default function CardPreview(props: {
    mouseX: number;
    mouseY: number;
    commander: ScryfallCommander;
    src: string;
}) {
    const { mouseX, mouseY, commander, src } = props;
    const [firstPrinting, setFirstPrinting] =
        createSignal<FirstPrinting | null>(null);
    const [loading, setLoading] = createSignal(true);

    onMount(async () => {
        try {
            // Fetch first printing
            const printsResponse = await fetch(commander.prints_search_uri);
            const printsData = await printsResponse.json();

            if (printsData.data && printsData.data.length > 0) {
                // Sort by release date to find the earliest printing
                const sortedPrintings = [...printsData.data].sort(
                    (a: ScryfallCommander, b: ScryfallCommander) => {
                        const dateA = new Date(a.released_at).getTime();
                        const dateB = new Date(b.released_at).getTime();
                        return dateA - dateB;
                    }
                );

                const first = sortedPrintings[0];
                setFirstPrinting({
                    set_name: first.set_name,
                    released_at: first.released_at,
                });
            }
        } catch (error) {
            console.error("Error fetching card details:", error);
        } finally {
            setLoading(false);
        }
    });

    return (
        <div
            class="card-preview"
            style={{
                left: `${mouseX}px`,
                top: `${mouseY}px`,
            }}
        >
            <div class="preview-image-container">
                <img src={src} alt="Card preview" />
            </div>
            <div class="preview-info">
                {loading() ? (
                    <div class="info-loading">Loading details...</div>
                ) : (
                    <>
                        {firstPrinting() && (
                            <div class="info-item">
                                <span class="info-label">First Set:</span>
                                <span class="info-value">
                                    {firstPrinting()!.set_name}
                                </span>
                            </div>
                        )}
                        {commander.edhrec_rank && (
                            <div class="info-item">
                                <span class="info-label">EDHRec Rank:</span>
                                <span class="info-value">
                                    #{commander.edhrec_rank}
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
