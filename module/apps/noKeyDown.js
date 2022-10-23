export class NoKeyDownDialog extends Application {
    constructor(data, options) {
        super(options);
        this.data = data;
    }

    /**
     * @override
     * @returns {DialogOptions}
     */
    static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
        template: "templates/hud/dialog.html",
        focus: true,
        classes: ["dialog"],
        width: 400,
        jQuery: true
    });
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    get title() {
    return this.data.title || "Dialog";
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    getData(options) {
    let buttons = Object.keys(this.data.buttons).reduce((obj, key) => {
        let b = this.data.buttons[key];
        b.cssClass = [key, this.data.default === key ? "default" : ""].filterJoin(" ");
        if ( b.condition !== false ) obj[key] = b;
        return obj;
    }, {});
    return {
        content: this.data.content,
        buttons: buttons
    };
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    activateListeners(html) {
    html.find(".dialog-button").click(this._onClickButton.bind(this));

    // Prevent the default form submission action if any forms are present in this dialog.
    html.find("form").each((i, el) => el.onsubmit = evt => evt.preventDefault());

    if ( this.data.render instanceof Function ) this.data.render(this.options.jQuery ? html : html[0]);

    if ( this.options.focus ) {
        // Focus the default option
        html.find(".default").focus();
    }

    html.find("[autofocus]")[0]?.focus();
    }

    /* -------------------------------------------- */

    /**
     * Handle a left-mouse click on one of the dialog choice buttons
     * @param {MouseEvent} event    The left-mouse click event
     * @private
     */
    _onClickButton(event) {
    const id = event.currentTarget.dataset.button;
    const button = this.data.buttons[id];
    this.submit(button, event);
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    async _renderOuter() {
    let html = await super._renderOuter();
    const app = html[0];
    app.setAttribute("role", "dialog");
    app.setAttribute("aria-modal", "true");
    return html;
    }

    /* -------------------------------------------- */

    /**
     * Submit the Dialog by selecting one of its buttons
     * @param {Object} button         The configuration of the chosen button
     * @param {PointerEvent} event    The originating click event
     * @private
     */
    submit(button, event) {
    try {
        if (button.callback) button.callback(this.options.jQuery ? this.element : this.element[0], event);
        this.close();
    } catch(err) {
        ui.notifications.error(err);
        throw new Error(err);
    }
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async close(options={}) {
    if ( this.data.close ) this.data.close(this.options.jQuery ? this.element : this.element[0]);
    return super.close(options);
    }
}