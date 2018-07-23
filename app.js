import { LitElement, html } from '@polymer/lit-element';
import '@material/mwc-button/mwc-button.js';
import '@material/mwc-radio/mwc-radio.js';
import '@material/mwc-formfield/mwc-formfield.js';
import './material-components-web-components/packages/slider/mwc-slider.js';

import './settings.js'

class App extends LitElement {
    static get properties() {
        return {
            devices: Array,
        };
    }

    _render({ devices }) {
        if (devices === undefined) devices = [];

        console.log('devices: ', devices);
        const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
        const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
        const audioOutputDevices = devices.filter(device => device.kind === 'audiooutput');

        return html`
        <video id="video"></video>
        
        <div class="select">
            <label for="audioSource">Audio input source: </label>
            <select id="audioSource" onchange="${this._start}">
                ${audioInputDevices.map((device) => html`<option value="${device.deviceId}">${device.label}</option>`)}
            </select>
        </div>

        <div class="select">
            <label for="audioOutput">Audio output destination: </label>
            <select id="audioOutput" onchange="${this._start}">
                ${audioOutputDevices.map((device) => html`<option value="${device.deviceId}">${device.label}</option>`)}
            </select>
        </div>

        <div class="select">
            <label for="videoSource">Video source: </label>
            <select id="videoSource" onchange="${this._start}">
                ${videoInputDevices.map((device) => html`<option value="${device.deviceId}">${device.label}</option>`)}
            </select>
        </div>

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

    _start() {
        // if (window.stream) {
        //     window.stream.getTracks().forEach(track => {
        //         track.stop();
        //     });
        // }
    }

    async ready() {
        super.ready();
        const video = this.shadowRoot.getElementById('video');
        this._settings = this.shadowRoot.getElementById('settings');
        const audioInputSelect = this.shadowRoot.querySelector('select#audioSource');
        const audioOutputSelect = this.shadowRoot.querySelector('select#audioOutput');
        const videoSelect = this.shadowRoot.querySelector('select#videoSource');

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

        this.devices = await navigator.mediaDevices.enumerateDevices();
    }
}

window.customElements.define('vr-app', App);