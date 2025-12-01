import type { ScryfallCommander } from "~/types";
import "./Card.css";
import { createSignal } from "solid-js";

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
        const isMobile = window.innerWidth <= 768;
        const previewWidth = isMobile ? 250 : 350;
        const previewHeight = isMobile ? 350 : 490;
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
        const frontImage1 = commander.card_faces[0]?.image_uris?.large ?? "";
        const frontImage2 = commander.card_faces[1]?.image_uris?.large ?? "";
        const backImage = "https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg";

        return (
            <>
                <div
                    class="double-face"
                    id={commander.name}
                    onMouseEnter={handleMouseEnter}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
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
                                    onMouseEnter={() => setPreviewImage(frontImage2)}
                                />
                            </div>
                            <div class="back">
                                <img
                                    src={backImage}
                                    alt="Back of card"
                                    onMouseEnter={() => setPreviewImage(frontImage2)}
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
                                    onMouseEnter={() => setPreviewImage(frontImage1)}
                                />
                            </div>
                            <div class="back">
                                <img
                                    src={backImage}
                                    alt="Back of card"
                                    onMouseEnter={() => setPreviewImage(frontImage1)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {isHovered() && previewImage() && (
                    <div
                        class="card-preview"
                        style={{
                            left: `${mousePosition().x}px`,
                            top: `${mousePosition().y}px`,
                        }}
                    >
                        <img src={previewImage()!} alt="Card preview" />
                    </div>
                )}
            </>
        );
    }

    if (commander.image_uris) {
        const frontImage = commander.image_uris.large;
        const backImage = "https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg";

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
                            />
                        </div>
                        <div class="back">
                            <img
                                src={backImage}
                                alt="Back of card"
                                onMouseEnter={() => setPreviewImage(frontImage)}
                            />
                        </div>
                    </div>
                </div>
                {isHovered() && previewImage() && (
                    <div
                        class="card-preview"
                        style={{
                            left: `${mousePosition().x}px`,
                            top: `${mousePosition().y}px`,
                        }}
                    >
                        <img src={previewImage()!} alt="Card preview" />
                    </div>
                )}
            </>
        );
    }
}
