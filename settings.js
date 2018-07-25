import { LitElement, html } from '@polymer/lit-element';
import '@material/mwc-button/mwc-button.js';
import '@material/mwc-radio/mwc-radio.js';
import '@material/mwc-formfield/mwc-formfield.js';
import './material-components-web-components/packages/slider/mwc-slider.js';

class App extends LitElement {
    static get properties() {
        return {
            capabilities: Object,
            settings: Object,
        };
    }

    _render({ capabilities, settings }) {
        // console.log('capabilities : ', capabilities);
        // console.log('settings : ', settings);

        if (capabilities === undefined)
            return html``;

        let itemTemplates = [];
        for (const capName in capabilities) {
            const value = capabilities[capName];
            // console.log(value);
            // console.log(value instanceof MediaSettingsRange);
            if (value instanceof Array) {
                itemTemplates.push(html`<div>
    <mwc-formfield alignEnd label=${capName}>`);
                for (const name of value) {
                    itemTemplates.push(html`
                        <mwc-formfield label=${name}>
                            <mwc-radio name=${capName} checked?="${settings[capName] === capName}" on-change="${(e) => console.log(e)}">
                            </mwc-radio>
                        </mwc-formfield>
                    `);
                }
                itemTemplates.push(html`</mwc-formfield>
</div>`);
            } else if (typeof value === 'string' || value instanceof String) {
                itemTemplates.push(html`
                <div>
                    <mwc-formfield alignEnd label=${capName}>
                        ${value}
                    </mwc-formfield>
                </div>
            `);
            } else if (new Set(Object.keys(value)) === new Set(["max", "min"])) {
            } else {
                // TODO: continuous step
                // TODO: colorTemperature has "Error: Cannot set min to be greater than the slider's maximum value" error
                itemTemplates.push(html`
                    <div>
                        <mwc-formfield alignEnd label=${capName}>
                            <mwc-slider on-MDCSlider:input="${
                                        async (e) => {
                                            await this._track.applyConstraints({
                                                advanced: [{
                                                    [capName]: e.detail.value,
                                                }]
                                            })
                                        }}" id=${capName} discrete markers max=${value.max} min=${value.min} value=${settings[capName]}
                                step=${value.step}></mwc-slider>
                            <label>${settings[capName]}</label>
                        </mwc-formfield>
                    </div>
                `);
            }
        }

        return html`${itemTemplates}`;
    }

    get track() {
        return this._track;
    }

    set track(track) {
        this._track = track;
        if (track === null) {
            this.capabilities = undefined;
            this.settings = undefined;
        } else {
            this.capabilities = track.getCapabilities();
            this.settings = track.getSettings();
        }
    }
    ready() {
        super.ready();
        console.log(Object.keys(this));
        console.log(this.attributes);
    }
}

window.customElements.define('vr-settings', App);