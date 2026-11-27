/**
 * A wizard for the Modern toolkit: a card layout whose child items are the steps, with a
 * {@link NC.stepper.StepIndicator} header and a Back / Next navigation bar.
 *
 *     Ext.create('NC.stepper.Stepper', {
 *         renderTo: Ext.getBody(),
 *         width: 600,
 *         height: 360,
 *         items: [{
 *             xtype: 'formpanel',
 *             step: { title: 'Account', description: 'Your login' },
 *             items: [{ xtype: 'textfield', label: 'Name', required: true }]
 *         }, {
 *             xtype: 'panel',
 *             step: { title: 'Extras', optional: true },
 *             html: 'Optional settings'
 *         }, {
 *             xtype: 'panel',
 *             step: { title: 'Review' },
 *             html: 'All done?'
 *         }],
 *         listeners: {
 *             finish: function (stepper) { Ext.toast('Finished'); }
 *         }
 *     });
 *
 * All configs, methods and events live in {@link NC.stepper.StepperMixin} and are the same in
 * the Classic toolkit. This class only provides the Modern panel, layout and form validation.
 * Give the stepper a height (or a layout that sizes it): a card layout needs one.
 */
Ext.define('NC.stepper.Stepper', {
    extend: 'Ext.Panel',
    xtype: 'nc-stepper',

    mixins: [
        'NC.stepper.StepperMixin'
    ],

    requires: [
        'NC.stepper.StepIndicator',
        'Ext.Button',
        'Ext.Spacer',
        'Ext.Toolbar',
        'Ext.layout.Card'
    ],

    publishes: ['activeStep'],

    twoWayBindable: ['activeStep'],

    cls: 'nc-stepper',

    layout: 'card',

    initialize: function () {
        var me = this,
            left = me.getIndicatorPosition() === 'left',
            indicator, back, next, toolbar;

        me.callParent();

        indicator = Ext.create('NC.stepper.StepIndicator', {
            docked: left ? 'left' : 'top',
            orientation: left ? 'vertical' : 'horizontal',
            selectable: me.getAllowStepSelect(),
            listeners: {
                stepselect: me.onStepIndicatorSelect,
                scope: me
            }
        });

        back = Ext.create('Ext.Button', {
            text: me.getBackText(),
            handler: me.onStepBack,
            scope: me
        });

        next = Ext.create('Ext.Button', {
            text: me.getNextText(),
            handler: me.onStepNext,
            scope: me
        });

        toolbar = Ext.create('Ext.Toolbar', {
            docked: 'bottom',
            items: [back, { xtype: 'spacer' }, next]
        });

        me.stepIndicator = indicator;
        me.stepNav = {
            toolbar: toolbar,
            back: back,
            next: next
        };

        me.add([indicator, toolbar]);

        me.initStepper();
    },

    getStepItems: function () {
        return this.getInnerItems();
    },

    activateStepItem: function (item) {
        this.setActiveItem(item);
    },

    // The item itself and every form inside it; all of them validate, so every field shows
    // its error.
    validateStepItem: function (item) {
        var forms = item.isFormPanel ? [item] : [],
            valid = true;

        forms = forms.concat(item.query('formpanel'));

        Ext.Array.each(forms, function (form) {
            if (!form.validate()) {
                valid = false;
            }
        });

        return valid;
    },

    doDestroy: function () {
        this.destroyStepper();
        this.callParent();
    }
});
