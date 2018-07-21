import { LitElement, html } from '@polymer/lit-element';
import '@material/mwc-button/mwc-button.js';

class App extends LitElement {
    _render() {
        return html`
        <mwc-button> hoho </mwc-button>
        `;
    }
}

window.customElements.define('video-recorder-app', App);