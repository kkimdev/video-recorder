import { LitElement, html } from '@polymer/lit-element';
import '@material/mwc-button/mwc-button.js';
import '@material/mwc-radio/mwc-radio.js';
import '@material/mwc-formfield/mwc-formfield.js';
import './material-components-web-components/packages/slider/mwc-slider.js';

class App extends LitElement {
    static get properties() {
        return {
            capabilities: Object
        };
    }

    _render({ capabilities }) {
        console.log('cap : ', capabilities);
        const items = [1, 2, 3];
        const itemTemplates = [];
        if (capabilities !== undefined) {
            for (const capName in capabilities) {
                const value = capabilities[capName];
                // console.log(value);
                // console.log(value instanceof MediaSettingsRange);
                if (value instanceof Array) {
                    itemTemplates.push(html`<p> ${capName} </p>`);
                    for (const name of value) {
                        itemTemplates.push(html`
                            <mwc-formfield label=${name}>
                                <mwc-radio name=${capName}>
                                </mwc-radio>
                            </mwc-formfield>
                        `);
                    }
                } else if (typeof value === 'string' || value instanceof String) {
                    itemTemplates.push(html`
                    <div>
                        <mwc-formfield label=${capName}>
                            ${value}
                        </mwc-formfield>
                    </div>
                `);
                } else if (new Set(Object.keys(value)) === new Set(["max", "min"])) {
                    console.log('max min: ', value);
                } else {
                    console.log('jaja', value);
                    console.log('range', value.min, value.max);
                    itemTemplates.push(html`
                        <div>
                            <mwc-formfield label=${capName}>
                                <mwc-slider discrete markers min=${value.min} max=${value.max} value="" step=${value.step}></mwc-slider>
                            </mwc-formfield>
                        </div>
                    `);
                }
                // itemTemplates.push(html`<li>${capName} ${JSON.stringify(value)}</li>`);
            }
        }

        return html`
        <video id="video"></video>
        <div>
            <mwc-button raised>Apply</mwc-button>
        </div>
        <ul>
            ${itemTemplates}
        </ul>
        `;
    }

    async ready() {
        super.ready();
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        const video = this.shadowRoot.getElementById('video');

        const track = stream.getVideoTracks()[0];
        video.addEventListener('loadedmetadata', () => {
            window.setTimeout(() => (
                onCapabilitiesReady(track.getCapabilities())
            ), 500);
        });
        self = this;
        async function onCapabilitiesReady(capabilities) {
            self.capabilities = capabilities;
            console.log(capabilities);
            console.log(track.getSettings());
            await track.applyConstraints({
                advanced: [{
                    zoom: capabilities.zoom.min,
                    // frameRate: 2,
                    // aspectRatio: 1,
                    sharpness: 7,
                }]
            })
            await track.applyConstraints({
                advanced: [{
                    aspectRatio: 1,
                }]
            })
        }

        video.srcObject = stream;
        video.play();

        // const devices = await navigator.mediaDevices.enumerateDevices()
        // console.log(devices);
        // console.log(navigator.mediaDevices.getSupportedConstraints());
    }
}

window.customElements.define('video-recorder-app', App);