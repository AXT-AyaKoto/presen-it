import { render } from "preact";
import { deck } from "virtual:presenit-deck";
import { App } from "./App";
import { setDeck } from "./store";
import "./viewer.css";

setDeck(deck);

const root = document.getElementById("app");
if (root) {
    render(<App />, root);
}
