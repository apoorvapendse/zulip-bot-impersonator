class ModalManagerSingleton{
    callbacks: ((e:PointerEvent) => void)[];
    constructor() {
        this.callbacks = [];
        this.initialize();
    }
    register(callback:(e:PointerEvent)=>void) {
        this.callbacks.push(callback)
    }

    private initialize() {
        document.body.addEventListener("click", (e) => {
            for (const cb of this.callbacks) {
              cb(e)
            }
        })
    }

}

export const ModalManager = new ModalManagerSingleton();
