function render_topic_heading_count(count: number): HTMLElement {
    const div = document.createElement("div");
    div.innerText = `(${count})`;
    div.style.padding = "3px";
    div.style.marginLeft = "3px";

    return div;
}

function render_topic_heading(topic_name: string): HTMLElement {
    const div = document.createElement("div");
    div.innerText = topic_name;
    div.style.color = "#000080";
    div.style.fontSize = "19px";

    return div;
}

export class MessageViewHeader {
    div: HTMLElement;

    constructor(topic_name: string, topic_count: number) {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.borderBottom = "1px solid black";
        div.style.paddingBottom = "6px";
        div.style.marginBottom = "12px";

        div.append(render_topic_heading(topic_name));
        div.append(render_topic_heading_count(topic_count));

        this.div = div;
    }
}

