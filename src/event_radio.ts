import { Button } from "./button";

class IndicatorButton {
    div: HTMLElement;
    button: HTMLElement;
    expanded: boolean;

    constructor(opts: {label: string, show: () => void, hide: () => void}) {
        const self = this;
        const { label,show, hide } = opts;

        this.expanded = false;

        const div = document.createElement("div");

        const button = document.createElement("div");
        button.innerText = label;
        button.style.border = "1px black solid";
        button.style.borderRadius = "2px";
        button.style.padding = "2px";
        button.style.userSelect = "none";

        button.addEventListener("click", () => {
            console.log(self.expanded);
            if (self.expanded) {
                hide();
                self.off();
            } else {
                show();
                self.on();
            }
        });

        div.append(button);

        this.button = button;
        this.div = div;

        this.off();
   }

   off(): void {
       this.button.style.backgroundColor = "white";
       this.button.style.color = "green";
       this.expanded = false;
   }

   on(): void {
       this.button.style.backgroundColor = "white";
       this.button.style.color = "red";
       this.expanded = true;
   }

   ready(): void {
       this.button.style.backgroundColor = "violet";
       this.button.style.color = "white";
   }
}

export class EventRadioWidgetSingleton {
    div: HTMLDivElement;
    button: IndicatorButton;
    main_content: HTMLDivElement;

    constructor() {
        const self = this;

        const div = document.createElement("div");
        Object.assign(div.style, <CSSStyleDeclaration>{
            position: "absolute",
            top: "6px",
            right: "22px",
            display: "flex",
            flexDirection: "column",
            width: "400px",
        });

        const button = new IndicatorButton({
            label: "Events",
            show() { self.show() },
            hide() { self.hide() },
        });

        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.justifyContent = "flex-end";
        header.append(button.div);

        const main_content = this.build_main_content();

        div.append(header);
        div.append(main_content);

        this.button = button;
        this.main_content = main_content;
        this.div = div;

        this.hide();
    }

    show(): void {
        this.main_content.style.visibility = "visible";
    }

    hide(): void {
        this.main_content.style.visibility = "hidden";
    }

    build_main_content(): HTMLDivElement {
        const main_content = document.createElement("div");
        Object.assign(main_content.style, <CSSStyleDeclaration>{
            backgroundColor: "tan",
            overflowY: "auto",
            overflowX: "hidden",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap",
            height: "400px",
            borderRadius: "6px",
            padding: "3px",
            border: "1px blue solid",
        });
        return main_content;
    }

    add_event(event: Object): void {
        this.button.ready();

        this.main_content.textContent += "\n--------\n" + JSON.stringify(event);
        this.scroll_to_bottom();
    }

    scroll_to_bottom(): void {
        this.main_content.scrollTop =
            this.main_content.scrollHeight - this.main_content.clientHeight;
    }
}
