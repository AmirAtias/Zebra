class crawlerUtilities {
    x = 4;
    addZeroToStart(t) {
        if (t.length == 1) {
            t = '0' + "" + t;
        }

        return t;
    }

    getDateAndTime() {
        var houer = this.addZeroToStart(new Date().getHours().toString());
        var minuets = this.addZeroToStart(new Date().getMinutes().toString());
        var secondes = this.addZeroToStart(new Date().getSeconds().toString());
        var month = this.addZeroToStart((new Date().getMonth() + 1).toString());
        var day = this.addZeroToStart(new Date().getDate().toString());

        return day + "/" + month + " " + houer + ":" + minuets + ":" + secondes;
    }
}
module.exports.crawlerUtilities = crawlerUtilities;
