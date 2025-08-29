import { Title } from "@solidjs/meta";
import { createAsync, query } from "@solidjs/router";
import Counter from "~/components/Counter";
import jsdom from "jsdom";

type EDHRecCommander = {
    name: string;
    sanitized: string;
    sanitized_wo: string;
    url: string;
    inclusion: number;
    label: string;
    num_decks: number;
};

const NUM_COMMANDERS = 100;
const MAX_SCRYFALL = 75;

const fetchCommanders = query(async () => {
    "use server";

    // Getting top 100 commanders from EDHREC
    const response = await fetch("https://edhrec.com/commanders");
    const html = await response.text();

    const dom = new jsdom.JSDOM(html);
    // The selector below may need to be updated if the class names are dynamic or hashed
    const commanderData = dom.window.document.querySelector("#__NEXT_DATA__");

    if (!commanderData) {
        throw new Error(
            "Could not find commander images script element (#__NEXT_DATA__)"
        );
    }

    const fin = JSON.parse(commanderData.textContent ?? "");

    if (!fin) {
        throw new Error("Could not parse commander data JSON");
    }

    const commanders: EDHRecCommander[] =
        fin.props.pageProps.data.container.json_dict.cardlists[0].cardviews;
    const commanderNames = commanders.map((c) => {
        return { name: c.name };
    });

    const cardsFirstReq = await fetch(
        "https://api.scryfall.com/cards/collection",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "MTGGuessWho",
                Accept: "application/json",
            },
            body: JSON.stringify({
                identifiers: commanderNames.slice(0, NUM_COMMANDERS / 2),
            }),
        }
    );
    const cardsFirst = await cardsFirstReq.json();
    const cardsSecondReq = await fetch(
        "https://api.scryfall.com/cards/collection",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "MTGGuessWho",
                Accept: "application/json",
            },
            body: JSON.stringify({
                identifiers: commanderNames.slice(
                    NUM_COMMANDERS / 2,
                    NUM_COMMANDERS
                ),
            }),
        }
    );
    const cardsSecond = await cardsSecondReq.json();

    const cards = [...cardsFirst.data, ...cardsSecond.data];

    return cards;
}, "commanders");

export default function Home() {
    const commanders = createAsync(() => fetchCommanders());

    if (commanders()) {
        return <img src={commanders()[0].image_uris.normal} />
    }

    return (
        <main>
            <Title>Hello World</Title>
            <h1>Hello world!</h1>
            <Counter />
            <p>
                Visit{" "}
                <a href="https://start.solidjs.com" target="_blank">
                    start.solidjs.com
                </a>{" "}
                to learn how to build SolidStart apps.
            </p>
        </main>
    );
}
