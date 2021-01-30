export default class Component {

    constructor() {
        this.el = null;
    }

    mount (root = document.body) {
        root.appendChild(this.el);
    }

    remove () {
        this.el.parentElement.removeChild(this.el);
    }

    /**
     * @param {string} string
     * @return {Element}
     */
    html (string) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = string.trim();
        return wrapper.firstElementChild;
    }

    /**
     * @abstract
     */
    render () {}

}