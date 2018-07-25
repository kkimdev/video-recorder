import { LitElement, html } from '@polymer/lit-element';
import '@material/mwc-button/mwc-button.js';
import '@material/mwc-radio/mwc-radio.js';
import '@material/mwc-formfield/mwc-formfield.js';
import '@polymer/iron-pages'
import './material-components-web-components/packages/slider/mwc-slider.js';
import './material-components-web-components/packages/tabs/mwc-tab.js';
import { TabBar } from './material-components-web-components/packages/tabs/mwc-tab-bar.js';
import './material-components-web-components/packages/tabs/mwc-tab-bar-scroller.js';
import './settings.js'

class TabBarFix extends TabBar {
    constructor() {
        super();
        this._requestRender = this.requestRender; //() => { this.requestRender() };
    }
}
customElements.define('mwc-tab-bar-fix', TabBarFix);

class App extends LitElement {

    static get properties() {
        return {
            devices: Array,
            tracks: Array,
        };
    }

    _render({ devices, tracks }) {
        if (devices === undefined) devices = [];
        if (tracks === undefined) tracks = [];

        const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
        const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
        const audioOutputDevices = devices.filter(device => device.kind === 'audiooutput');

        console.log(tracks);
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
                <mwc-button raised onclick="${this._start.bind(this)}">Record</mwc-button>
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
                <vr-settings id="settings"></vr-settings>
            </div>
        </iron-pages>
        `;
    }

    _showPage(index) {
        const pages = this.shadowRoot.getElementById('pages');
        pages.selected = index;
    }

    //     <mwc-tab-bar-scroller>
    //     <mwc-tab-bar id="tab-bar">
    //         ${tracks.map(track => html`<mwc-tab label="${track.kind}"></mwc-tab>`)}
    //     </mwc-tab-bar>
    // </mwc-tab-bar-scroller>
    async _start() {
        if (this._stream instanceof MediaStream) {
            this._stream.getTracks().forEach(track => track.stop());
        }
        delete this._stream;
        this._settings.track = null;

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
        window.setTimeout(() => {
            const track = this._stream.getVideoTracks()[0];
            this._settings.track = track;
        }, 1000);

    }

    async ready() {
        super.ready();
        this._settings = this.shadowRoot.getElementById('settings');
        this.devices = await navigator.mediaDevices.enumerateDevices();
    }
}

window.customElements.define('vr-app', App);
