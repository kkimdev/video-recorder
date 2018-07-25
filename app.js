import { LitElement, html } from '@polymer/lit-element';
import '@material/mwc-button/mwc-button.js';
import '@material/mwc-radio/mwc-radio.js';
import '@material/mwc-formfield/mwc-formfield.js';
import '@polymer/iron-pages'
import 'material-design-lite/material.js'

import './material-components-web-components/packages/slider/mwc-slider.js';
import './material-components-web-components/packages/tabs/mwc-tab.js';
import './material-components-web-components/packages/tabs/mwc-tab-bar-scroller.js';
import { TabBar } from './material-components-web-components/packages/tabs/mwc-tab-bar.js';

import './settings.js'

class TabBarFix extends TabBar {
    constructor() {
        super();
        this._requestRender = this.requestRender;
    }
}
customElements.define('mwc-tab-bar-fix', TabBarFix);

class App extends LitElement {

    constructor() {
        super();
        this._isRecording = false;
    }

    async ready() {
        super.ready();
        this.devices = await navigator.mediaDevices.enumerateDevices();
    }

    static get properties() {
        return {
            devices: Array,
            tracks: Array,
            _isRecording: Boolean,
        };
    }

    _propertiesChanged(props, changedProps, prevProps) {
        super._propertiesChanged(props, changedProps, prevProps);
        if (changedProps !== null && 'devices' in changedProps) {
            this._start();
        }
    }

    _render({ devices, tracks }) {
        if (devices === undefined) devices = [];
        if (tracks === undefined) tracks = [];

        const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
        const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
        const audioOutputDevices = devices.filter(device => device.kind === 'audiooutput');

        return html`
        <style>
        * {
            --mdc-theme-primary: black;
            --mdc-theme-secondary: black;
        }
        </style>

        <video id="video"></video>
        
        <mwc-tab-bar-fix id="tabBar" on-MDCTabBar:change="${e => this._showPage(e.detail.activeTabIndex)}">
            <mwc-tab label="Record"></mwc-tab>
            <mwc-tab label="Settings"></mwc-tab>
        </mwc-tab-bar-fix>
        <iron-pages id="pages" selected="0">
            <div>
                <mwc-button raised onclick="${this._startOrStopRecording.bind(this)}">Record</mwc-button>
            </div>
            <div>                
                <div class="select">
                    <label for="audioSource">Audio input source: </label>
                    <select id="audioSource" onchange="${this._start.bind(this)}">
                        ${audioInputDevices.map(device => html`<option value="${device.deviceId}">${device.label}</option>`)}
                    </select>
                </div>

                <div class="select">
                    <label for="audioOutput">Audio output destination: </label>
                    <select id="audioOutput" onchange="${this._start.bind(this)}">
                        ${audioOutputDevices.map(device => html`<option value="${device.deviceId}">${device.label}</option>`)}
                    </select>
                </div>

                <div class="select">
                    <label for="videoSource">Video source: </label>
                    <select id="videoSource" onchange="${this._start.bind(this)}">
                        ${videoInputDevices.map(device => html`<option value="${device.deviceId}">${device.label}</option>`)}
                    </select>
                </div>
                ${tracks.map(track => html`<vr-settings track="${track}"></vr-settings>`)}
            </div>
        </iron-pages>
        `;
    }

    _showPage(index) {
        const pages = this.shadowRoot.getElementById('pages');
        pages.selected = index;
    }

    async _start() {
        if (this._stream instanceof MediaStream) {
            this._stream.getTracks().forEach(track => track.stop());
        }
        delete this._stream;

        const audioInputSelect = this.shadowRoot.querySelector('select#audioSource');
        const videoInputSelect = this.shadowRoot.querySelector('select#videoSource');
        const audioOutputSelect = this.shadowRoot.querySelector('select#audioOutput');
        const constraints = {
            audio: { deviceId: { exact: audioInputSelect.value } },
            video: { deviceId: { exact: videoInputSelect.value } },
        };

        this._stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.tracks = this._stream.getTracks();
        const video = this.shadowRoot.getElementById('video');
        video.srcObject = this._stream;
        await video.setSinkId(audioOutputSelect.value);
        video.play();
    }

    _startOrStopRecording() {
        if (this._isRecording)
            this._stopRecording();
        else
            this._startRecording();
    }

    _startRecording() {
        this._isRecording = true;
        this._recordedBlobs = [];
        this._mediaRecorder = new MediaRecorder(this._stream, {});
        this._mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                this._recordedBlobs.push(event.data);
            }
        };
        this._mediaRecorder.start(10); // collect 10ms of data
    }

    _stopRecording() {
        this._isRecording = false;
        this._mediaRecorder.stop();
        const blob = new Blob(this._recordedBlobs, { type: 'video/webm' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
    }
}

window.customElements.define('vr-app', App);
