export default class BaseComponent {

    constructor () {
        this.el = null;
    }

    mount (root = document.body) {
        root.appendChild(this.el);
    }

    unmount () {
        this.el.parentElement.removeChild(this.el);
    }

    /**
     * @param {string} string
     * @return {HTMLElement}
     */
    html (string) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = string.trim();
        return /** @type HTMLElement */ wrapper.firstElementChild;
    }

    /**
     * @abstract
     */
    render () {}

}