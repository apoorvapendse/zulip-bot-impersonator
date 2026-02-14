class DialogShell {
    popup_element: HTMLDialogElement;

    constructor() {
        this.popup_element = this.create_popup_element();
    }

    create_popup_element() {
        // See https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
        const dialog = document.createElement("dialog");
        const s = dialog.style;
        s.maxWidth = "150vw";
        s.borderRadius = "1rem";
        s.outline = "none";
        s.border = "1px #000080 solid";
        s.display = "flex";
        s.flexDirection = "column";
        s.gap = "0.5rem";
        s.alignItems = "center";
        return dialog;
    }

    invoke_with_custom_html(html: HTMLElement, background_color: string) {
        document.body.append(this.popup_element);
        this.popup_element.style.backgroundColor = background_color;

        // Ensures it is closed by nothing apart from what we define
        this.popup_element.setAttribute("closedby", "none");
        this.popup_element.append(html);
        this.popup_element.showModal();
    }

    finish(): void {
        this.popup_element.close();
        this.popup_element.innerHTML = "";
        this.popup_element.remove();
        this.popup_element.setAttribute("closedby", "any");
    }
}

type PopupType = "warning" | "success" | "info";
type PopupOptions = {
    content: string;
    type: PopupType;
    confirm_button_text: string;
    callback: () => void;
};

export class PopupSingleton {
    dialog_shell: DialogShell;

    constructor() {
        this.dialog_shell = new DialogShell();
    }

    make_button(text: string): HTMLElement {
        const button = document.createElement("button");
        button.style.cursor = "pointer";
        button.style.maxWidth = "fit-content";
        button.style.paddingLeft = "15px";
        button.style.paddingRight = "15px";
        button.style.paddingTop = "5px";
        button.style.paddingBottom = "5px";
        button.style.marginTop = "15px";
        button.style.backgroundColor = "#000080";
        button.style.color = "white";

        button.innerText = text;
        return button;
    }

    get_background_color(info_type: string): string {
        switch (info_type) {
            case "info":
                return "#ADD8E6";
            case "success":
                return "white";
            case "warning":
                return "#FFFFE0";
        }

        return "transparent";
    }

    show(info: PopupOptions) {
        const self = this;

        // AVATAR in left
        const left = document.createElement("div");
        left.style.marginRight = "30px";
        // TEXT and BUTTON in right
        const right = document.createElement("div");

        const content_div = document.createElement("pre");
        content_div.innerText = this.clean_multi_string(info.content);
        right.append(content_div);

        const button = this.make_button(info.confirm_button_text);
        button.addEventListener("click", () => self.finish(info.callback));
        right.append(button);

        // PUT THEM ALL TOGETHER
        const flex_div = document.createElement("div");
        flex_div.style.display = "flex";
        flex_div.append(left);
        flex_div.append(right);

        this.dialog_shell.invoke_with_custom_html(
            flex_div,
            this.get_background_color(info.type),
        );
    }

    clean_multi_string(text: string) {
        return text
            .split("\n")
            .map((s) => s.trimEnd())
            .join("\n");
    }

    finish(callback?: () => void) {
        this.dialog_shell.finish();
        if (callback) {
            callback();
        }
    }
}
