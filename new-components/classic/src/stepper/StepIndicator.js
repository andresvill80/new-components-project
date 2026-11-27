/**
 * The header of a stepper for the Classic toolkit: numbered steps with their state (upcoming,
 * active, complete, error, optional). {@link NC.stepper.Stepper} uses it, and it can also be
 * used on its own.
 *
 *     Ext.create('NC.stepper.StepIndicator', {
 *         renderTo: Ext.getBody(),
 *         activeStep: 1,
 *         steps: [
 *             { title: 'Account', complete: true },
 *             { title: 'Profile', description: 'About you' },
 *             { title: 'Review', optional: true }
 *         ],
 *         listeners: {
 *             stepselect: function (indicator, index) {
 *                 indicator.setActiveStep(index);
 *             }
 *         }
 *     });
 *
 * All configs and events live in {@link NC.stepper.StepIndicatorBase} and are the same in the
 * Modern toolkit.
 */
Ext.define('NC.stepper.StepIndicator', {
    extend: 'NC.stepper.StepIndicatorBase',
    xtype: 'nc-stepindicator',

    initComponent: function () {
        var me = this;

        me.callParent();

        // From here on config changes can add CSS classes.
        me.indicatorReady = true;
        me.refreshIndicator();
    },

    afterRender: function () {
        var me = this;

        me.callParent();

        me.indicatorDomReady = true;
        me.initIndicatorEvents();
        me.refreshIndicator();
    },

    getIndicatorRoot: function () {
        return this.el;
    }
});
