function uport() {
    this.init = init
    function init() {
        console.log('UPort Init')
    }
}

module.exports = new uport();