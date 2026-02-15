type Opts = {
    size: number;
    get_div: (index: number) => HTMLElement;
    when_done: () => void;
};

export class SmartList {
    div: HTMLElement;
    queue: HTMLElement[];
    done: boolean;

    constructor(opts: Opts) {
        const self = this;
        const div = document.createElement("div");
        div.innerText = "loading";

        this.done = false;

        setTimeout(() => {
            self.populate(opts);
        }, 0);

        this.queue = [];

        this.div = div;
    }

    append(new_div: HTMLElement): void {
        if (this.done) {
            this.div.append(new_div);
        } else {
            this.queue.push(new_div);
        }
    }

    populate(opts: Opts): void {
        const { size, get_div } = opts;
        const div = this.div;

        div.innerHTML = "";

        for (let i = 0; i < size; ++i) {
            div.append(get_div(i));
        }

        this.done = true;

        for (const new_div of this.queue) {
            div.append(new_div);
        }
        this.queue = [];

        opts.when_done();
    }
}
