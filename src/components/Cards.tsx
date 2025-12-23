import { createAsync, query } from "@solidjs/router";
import { createSignal, For, onMount } from "solid-js";
import jsdom from "jsdom";
import { EDHRecCommander, ScryfallCardFace, ScryfallCommander } from "~/types";
import Card from "./Card";
import { getCachedCommanders, setCachedCommanders } from "~/utils/cache";

const NUM_COMMANDERS = 100;

const fetchCommanders = query(async () => {
    "use server";

    // Check cache first
    const cached = await getCachedCommanders();
    if (cached) {
        return cached;
    }

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

    // Create a map of commander name to EDHRec rank (1-indexed)
    const edhrecRankMap = new Map<string, number>();
    commanders.forEach((c, index) => {
        edhrecRankMap.set(c.name, index + 1);
    });

    const partnerCommanderNames: { name: string }[] = [];
    const partnerNames: string[] = [];
    const commanderNames = commanders.map((c) => {
        if (c.name.includes("//")) {
            const [firstName, secondName] = c.name.split("//");
            partnerCommanderNames.push({ name: firstName });
            partnerCommanderNames.push({ name: secondName });
            partnerNames.push(c.name);
            return;
        }

        return { name: c.name };
    });

    // Have to split the requests in 2 because the API has a limit of 50 card names per request
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
    const partnerCardsReq = await fetch(
        "https://api.scryfall.com/cards/collection",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "MTGGuessWho",
                Accept: "application/json",
            },
            body: JSON.stringify({
                identifiers: partnerCommanderNames,
            }),
        }
    );
    const partnerCards = await partnerCardsReq.json();

    // Turning partner commanders into a commander with 2 faces
    const doubleCardFaces: ScryfallCardFace[] = partnerCards.data;
    const cardsThird: ScryfallCommander[] = [];
    for (let i = 0; i < doubleCardFaces.length; i += 2) {
        const partnerName = partnerNames[Math.floor(i / 2)];
        cardsThird.push({
            ...partnerCards.data[i],
            name: partnerName,
            card_faces: [doubleCardFaces[i], doubleCardFaces[i + 1]],
            edhrec_rank: edhrecRankMap.get(partnerName),
        });
    }

    // Assign EDHRec ranks to all cards based on the original order
    const cards: ScryfallCommander[] = [
        ...cardsFirst.data.map((card: ScryfallCommander) => ({
            ...card,
            edhrec_rank: edhrecRankMap.get(card.name),
        })),
        ...cardsSecond.data.map((card: ScryfallCommander) => ({
            ...card,
            edhrec_rank: edhrecRankMap.get(card.name),
        })),
        ...cardsThird.map((card: ScryfallCommander) => ({
            ...card,
            edhrec_rank: edhrecRankMap.get(card.name),
        })),
    ];

    // Cache the results
    await setCachedCommanders(cards);

    return cards;
}, "commanders");

export default function Cards() {
    const commandersFunc = createAsync(() => fetchCommanders());
    const commanders = commandersFunc();

    if (!commanders) {
        return;
    }

    return (
        <div class="card-grid">
            <For each={commanders}>
                {(commander, index) => <Card data={commander} id={index()} />}
            </For>
        </div>
    );
}
