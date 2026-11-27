/**
 * Demo proxy: an Ajax proxy that waits before it sends the request, to simulate a slow
 * server, and that can be told to fail the next request.
 */
Ext.define('MyApp.proxy.Slow', {
    extend: 'Ext.data.proxy.Ajax',
    alias: 'proxy.slow',

    config: {
        /**
         * @cfg {Number} delay
         * Milliseconds to wait before the request is sent.
         */
        delay: 1500,

        /**
         * @cfg {Boolean} failNext
         * `true` to make the next request go to a file that does not exist, so it fails.
         * It goes back to `false` once used.
         */
        failNext: false
    },

    doRequest: function (operation) {
        var me = this,
            fail = me.getFailNext();

        me.setFailNext(false);

        Ext.defer(function () {
            if (me.destroyed) {
                return;
            }

            if (fail) {
                operation.setUrl('resources/data/missing.json');
            }

            me.superclass.doRequest.call(me, operation);
        }, me.getDelay());
    }
});
