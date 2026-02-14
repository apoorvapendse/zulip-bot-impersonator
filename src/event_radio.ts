export class EventRadioWidgetSingleton{
    div:HTMLDivElement
    constructor() {
        this.div = this.render_event_radio();
    }

    render_event_radio() {
        const div = document.createElement("div");
        Object.assign(div.style, <CSSStyleDeclaration>{
            position: "absolute",
            bottom: "0",
            left: "0",
            height: "400px",
            width: "400px",
            border:"1px solid",
            backgroundColor: "yellow",
            overflowY:"auto",
            overflowX: "hidden",
            overflowWrap: "break-word",
           whiteSpace : "pre-wrap"
        })
        div.textContent = "Events Widget"
        return div;
    }
    add_event(event:Object) {
      this.div.textContent += "\n--------\n" +JSON.stringify(event)
      // Scroll to bottom after adding an event.
      this.div.scrollTop = this.div.scrollHeight - this.div.clientHeight;
    }
}
