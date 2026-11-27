/**
 * A wizard for the Classic toolkit: a card layout whose child items are the steps, with a
 * {@link NC.stepper.StepIndicator} header and a Back / Next navigation bar.
 *
 *     Ext.create('NC.stepper.Stepper', {
 *         renderTo: Ext.getBody(),
 *         width: 600,
 *         height: 360,
 *         items: [{
 *             xtype: 'form',
 *             step: { title: 'Account', description: 'Your login' },
 *             items: [{ xtype: 'textfield', fieldLabel: 'Name', allowBlank: false }]
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
 * the Modern toolkit. This class only provides the Classic panel, layout and form validation.
 * Give the stepper a height (or a layout that sizes it): a card layout needs one.
 */
Ext.define('NC.stepper.Stepper', {
    extend: 'Ext.panel.Panel',
    xtype: 'nc-stepper',

    mixins: [
        'NC.stepper.StepperMixin'
    ],

    requires: [
        'NC.stepper.StepIndicator',
        'Ext.button.Button',
        'Ext.layout.container.Card',
        'Ext.toolbar.Toolbar'
    ],

    publishes: ['activeStep'],

    twoWayBindable: ['activeStep'],

    cls: 'nc-stepper',

    layout: 'card',

    initComponent: function () {
        var me = this,
            left = me.getIndicatorPosition() === 'left',
            indicator, back, next, toolbar;

        indicator = Ext.create('NC.stepper.StepIndicator', {
            dock: left ? 'left' : 'top',
            orientation: left ? 'vertical' : 'horizontal',
            selectable: me.getAllowStepSelect(),
            listeners: {
                stepselect: me.onStepIndicatorSelect,
                scope: me
            }
        });

        back = Ext.create('Ext.button.Button', {
            text: me.getBackText(),
            handler: me.onStepBack,
            scope: me
        });

        next = Ext.create('Ext.button.Button', {
            text: me.getNextText(),
            handler: me.onStepNext,
            scope: me
        });

        toolbar = Ext.create('Ext.toolbar.Toolbar', {
            dock: 'bottom',
            items: [back, '->', next]
        });

        me.stepIndicator = indicator;
        me.stepNav = {
            toolbar: toolbar,
            back: back,
            next: next
        };

        me.dockedItems = Ext.Array.from(me.dockedItems).concat([indicator, toolbar]);

        me.callParent();

        me.initStepper();
    },

    // Until the panel is initialized `items` is still the plain config, not a collection.
    getStepItems: function () {
        var items = this.items;

        return items && Ext.isFunction(items.getRange) ? items.getRange() : [];
    },

    activateStepItem: function (item) {
        this.setActiveItem(item);
    },

    // The item itself and every form inside it; all of them validate, so every field shows
    // its error.
    validateStepItem: function (item) {
        var forms = item.isXType('form') ? [item] : [],
            valid = true;

        forms = forms.concat(item.query('form'));

        Ext.Array.each(forms, function (form) {
            if (!form.isValid()) {
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
