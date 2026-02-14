import { Button } from "./button";

export class EventRadioWidgetSingleton {
    div: HTMLDivElement;
    header!: HTMLDivElement;
    main_content!: HTMLDivElement;
    toggle_visibility_btn: Button;
    collapsed: boolean;
    constructor() {
        // order matters!
        this.toggle_visibility_btn = this.build_visibility_toggle_button();
        this.header = this.build_header_content();
        this.main_content = this.build_main_content();
        this.div = this.render_event_radio();
        this.collapsed = false;
    }

    render_event_radio() {
        const div = document.createElement("div");
        Object.assign(div.style, <CSSStyleDeclaration>{
            position: "absolute",
            bottom: "0",
            left: "0",
            display: "flex",
            flexDirection: "column",
            maxHeight: "400px",
            width: "400px",
        });
        div.append(this.header, this.main_content);
        return div;
    }

    build_main_content(): HTMLDivElement {
        const main_content = document.createElement("div");
        Object.assign(main_content.style, <CSSStyleDeclaration>{
            border: "1px solid",
            backgroundColor: "yellow",
            overflowY: "auto",
            overflowX: "hidden",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap",
            height: "300px",
        });
        return main_content;
    }

    build_header_content(): HTMLDivElement {
        const header = document.createElement("div");
        Object.assign(header.style, <CSSStyleDeclaration>{
            display: "flex",
            backgroundColor: "lightyellow",
            justifyContent: "space-between",
        });
        header.textContent = "Events Widget";
        header.append(this.toggle_visibility_btn.div);
        return header;
    }

    build_visibility_toggle_button(): Button {
        return new Button("show/hide", () => {
            if (this.collapsed) {
                this.main_content.style.display = "none";
            } else {
                this.main_content.style.display = "block";
            }
            this.collapsed = !this.collapsed;
        });
    }

    add_event(event: Object) {
        this.main_content.textContent += "\n--------\n" + JSON.stringify(event);
        // Scroll to bottom after adding an event.
        this.main_content.scrollTop =
            this.main_content.scrollHeight - this.main_content.clientHeight;
    }
}
