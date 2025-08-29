
import type { ScryfallCommander } from "~/types";
import "./Card.css";

export default function Card(props: {data: ScryfallCommander}) {
    const commander = props.data;

    // If commander has 2 faces
    if (!commander.image_uris) {
        console.log(commander);
    }

    if (commander.image_uris)
        return (
            <div class="card" id={commander.name}>
                <img
                    src={commander.image_uris.large}
                    width={100}
                    height={140}
                />
            </div>
        );
}
