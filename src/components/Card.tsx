import type { ScryfallCommander } from "~/types";
import "./Card.css";
import { createSignal } from "solid-js";
import CardPreview from "./CardPreview";

export default function Card(props: { data: ScryfallCommander; id: number }) {
    const [isFlipped, setIsFlipped] = createSignal(false);
    const [isHovered, setIsHovered] = createSignal(false);
    const [mousePosition, setMousePosition] = createSignal({ x: 0, y: 0 });
    const [previewImage, setPreviewImage] = createSignal<string | null>(null);

    const toggleFlipped = () => {
        setIsFlipped(!isFlipped());
    };

    const handleMouseEnter = (e: MouseEvent) => {
        setIsHovered(true);
        updateMousePosition(e);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isHovered()) {
            updateMousePosition(e);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const updateMousePosition = (e: MouseEvent) => {
        // Calculate preview position with offset to avoid going off-screen
        // Preview now includes image + info section, so it's taller
        const isMobile = window.innerWidth <= 768;
        const previewWidth = isMobile ? 250 : 350;
        const previewHeight = isMobile ? 450 : 650; // Increased to account for info section
        const offset = 20;

        let x = e.clientX + offset;
        let y = e.clientY + offset;

        // Adjust if preview would go off right edge
        if (x + previewWidth > window.innerWidth) {
            x = e.clientX - previewWidth - offset;
        }

        // Adjust if preview would go off bottom edge
        if (y + previewHeight > window.innerHeight) {
            y = e.clientY - previewHeight - offset;
        }

        // Adjust if preview would go off left edge
        if (x < 0) {
            x = offset;
        }

        // Adjust if preview would go off top edge
        if (y < 0) {
            y = offset;
        }

        setMousePosition({ x, y });
    };

    const commander = props.data;

    // If commander has 2 faces
    if (commander.card_faces) {
        // Use png for highest quality, fallback to border_crop, then border_crop
        const frontImage1 = commander.card_faces[0]?.image_uris?.border_crop ?? "";
        const frontImage2 = commander.card_faces[1]?.image_uris?.border_crop ?? "";
        const backImage =
            "https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg";

        return (
            <>
                <div
                    class="double-face"
                    id={commander.name}
                >
                    <div
                        class="flip-container face face-two"
                        classList={{ flipped: isFlipped() }}
                        onClick={toggleFlipped}
                        id={commander.card_faces[1].name}
                    >
                        <div class="flipper">
                            <div class="front">
                                <img
                                    src={frontImage2}
                                    alt="Front of card"
                                    onMouseEnter={(e) => {
                                        setPreviewImage(frontImage2);
                                        handleMouseEnter(e);
                                    }}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                    loading="lazy"
                                />
                            </div>
                            <div class="back">
                                <img
                                    src={backImage}
                                    alt="Back of card"
                                    onMouseEnter={(e) => {
                                        setPreviewImage(frontImage2);
                                        handleMouseEnter(e);
                                    }}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                    <div
                        class="flip-container face face-one"
                        classList={{ flipped: isFlipped() }}
                        onClick={toggleFlipped}
                        id={commander.card_faces[0].name}
                    >
                        <div class="flipper">
                            <div class="front">
                                <img
                                    src={frontImage1}
                                    alt="Front of card"
                                    onMouseEnter={(e) => {
                                        setPreviewImage(frontImage1);
                                        handleMouseEnter(e);
                                    }}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                    loading="lazy"
                                />
                            </div>
                            <div class="back">
                                <img
                                    src={backImage}
                                    alt="Back of card"
                                    onMouseEnter={(e) => {
                                        setPreviewImage(frontImage1);
                                        handleMouseEnter(e);
                                    }}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {isHovered() && previewImage() && (
                    <CardPreview
                        mouseX={mousePosition().x}
                        mouseY={mousePosition().y}
                        commander={commander}
                        src={previewImage()!}
                    />
                )}
            </>
        );
    }

    if (commander.image_uris) {
        // Use png for highest quality, fallback to border_crop, then large
        const frontImage = commander.image_uris.border_crop;
        const backImage =
            "https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg";

        return (
            <>
                <div
                    class="flip-container"
                    classList={{ flipped: isFlipped() }}
                    onClick={toggleFlipped}
                    id={commander.name}
                    onMouseEnter={handleMouseEnter}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <div class="flipper">
                        <div class="front">
                            <img
                                src={frontImage}
                                alt="Front of card"
                                onMouseEnter={() => setPreviewImage(frontImage)}
                                loading="lazy"
                            />
                        </div>
                        <div class="back">
                            <img
                                src={backImage}
                                alt="Back of card"
                                onMouseEnter={() => setPreviewImage(frontImage)}
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
                {isHovered() && previewImage() && (
                    <CardPreview
                        mouseX={mousePosition().x}
                        mouseY={mousePosition().y}
                        commander={commander}
                        src={previewImage()!}
                    />
                )}
            </>
        );
    }
}
