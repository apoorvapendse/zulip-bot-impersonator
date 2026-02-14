type DivButton = {
    div: HTMLElement;
    button: HTMLElement;
};

function render_div_button(label: string): DivButton {
    const div = document.createElement("div");
    div.style.marginTop = "2px";

    const button = document.createElement("button");
    button.innerText = label;
    button.style.color = "white";
    button.style.backgroundColor = "#000080";
    button.style.marginRight = "3px";

    button.addEventListener("focus", () => {
        button.style.backgroundColor = "green";
    });

    button.addEventListener("blur", () => {
        button.style.backgroundColor = "#000080";
    });

    div.append(button);
    return { div, button };
}

export class Button {
    div: HTMLElement;
    button: HTMLElement;
    width: string;

    constructor(label: string, callback: () => void) {
        const { div, button } = render_div_button(label);
        this.div = div;
        this.button = button;

        this.width = div.style.width;

        button.addEventListener("click", () => {
            callback();
        });

        this.show();
    }

    show(): void {
        this.div.style.visibility = "visible";
        this.div.style.width = this.width;
    }

    hide(): void {
        this.div.style.visibility = "hidden";
        this.div.style.width = "0px";
    }

    focus(): void {
        this.button.focus();
    }
}
