import { LitElement, html } from '@polymer/lit-element';
import '@material/mwc-button/mwc-button.js';
import '@material/mwc-radio/mwc-radio.js';
import '@material/mwc-formfield/mwc-formfield.js';
import './material-components-web-components/packages/slider/mwc-slider.js';

import './settings.js'

class App extends LitElement {
    _render({ capabilities, settings }) {
        return html`
        <video id="video"></video>
        <style>
        * {
            --mdc-theme-primary: black;
            --mdc-theme-secondary: black;
        }
        </style>
        <div>
            <mwc-button raised>Apply</mwc-button>
        </div>
        <vr-settings id="settings"></vr-settings>
        `;
    }

    async ready() {
        super.ready();
        const video = this.shadowRoot.getElementById('video');
        this._settings = this.shadowRoot.getElementById('settings');

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        
        video.srcObject = stream;
        video.play();

        window.setTimeout(() => {
            const track = stream.getVideoTracks()[0];
            this._settings.track = track;
        }, 500);

        // const devices = await navigator.mediaDevices.enumerateDevices()
        // console.log(devices);
        // console.log(navigator.mediaDevices.getSupportedConstraints());
    }
}

window.customElements.define('vr-app', App);