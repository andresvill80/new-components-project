/**
 * Version of the new-components package. Lives in shared code, so it also proves
 * that `new-components/src` loads in both the Classic and Modern toolkits.
 */
Ext.define('NC.Version', {
    singleton: true,

    /**
     * @property {String} version
     * Keep in sync with `version` in package.json.
     */
    version: '0.5.0'
});
