type Opts = {
    size: number;
    get_div: (index: number) => HTMLElement;
};

export class SmartList {
    div: HTMLElement;

    constructor(opts: Opts) {
        const self = this;
        const div = document.createElement("div");
        div.innerText = "loading";

        setTimeout(() => {
            self.populate(opts);
        }, 0);

        this.div = div;
    }

    populate(opts: Opts): void {
        const {size, get_div} = opts;
        const div = this.div;

        div.innerHTML = "";

        for (let i = 0; i < size; ++i) {
            div.append(get_div(i));
        }
    }
}
