/**
 * Shared base of {@link NC.stepper.StepIndicator} for both toolkits: the row (or column) of
 * steps with their state, and the keyboard and pointer handling. The toolkit classes only say
 * which element is the root.
 *
 * Every step is a native `<button>`, so Enter and Space work without code. When
 * {@link #cfg-selectable} the active step is in the Tab order and the arrow keys, Home and End
 * move the focus between steps. Otherwise the buttons are disabled.
 *
 * Toolkit classes must set `indicatorReady = true` once the component can take CSS classes
 * (`initComponent` in Classic, `initialize` in Modern) and `indicatorDomReady = true` once the
 * root element exists, calling {@link #initIndicatorEvents} and {@link #refreshIndicator}, and
 * implement {@link #getIndicatorRoot}.
 *
 * @abstract
 */
Ext.define('NC.stepper.StepIndicatorBase', {
    extend: 'Ext.Component',

    requires: [
        'Ext.XTemplate',
        'Ext.String'
    ],

    baseCls: 'nc-stepindicator',

    /**
     * @event stepselect
     * Fires when the user picks a step (pointer, or Enter / Space on its button). Only possible
     * when {@link #cfg-selectable} is `true`.
     * @param {NC.stepper.StepIndicator} indicator This indicator.
     * @param {Number} index Index of the picked step.
     */

    /**
     * @property {String} stepLabel
     * Accessible label of a step button: `{0}` is the step number, `{1}` the number of steps,
     * `{2}` the title and `{3}` the state text. Override for other languages.
     */
    stepLabel: 'Step {0} of {1}: {2}, {3}',

    config: {
        /**
         * @cfg {Object[]} steps
         * What to show for each step: `title`, `description`, `optional`, `iconCls`, `complete`
         * (Boolean) and `error` (message String). All text is HTML-encoded.
         */
        steps: null,

        /**
         * @cfg {Number} activeStep
         * Index of the current step.
         */
        activeStep: 0,

        /**
         * @cfg {Boolean} selectable
         * `true` to let the user pick steps.
         */
        selectable: true,

        /**
         * @cfg {String} orientation
         * `'horizontal'` (a row) or `'vertical'` (a column).
         */
        orientation: 'horizontal',

        /**
         * @cfg {Number} compactWidth
         * Below this width (in pixels) a horizontal indicator shows only the numbers and the
         * title of the active step.
         */
        compactWidth: 480,

        /**
         * @cfg {Object} stateLabels
         * Accessible text of each state, and the label of an optional step. Override for other
         * languages.
         */
        stateLabels: {
            upcoming: 'not started',
            active: 'current step',
            complete: 'complete',
            error: 'has errors',
            optional: 'Optional'
        }
    },

    applySteps: function (steps) {
        return Ext.Array.from(steps);
    },

    applyActiveStep: function (index) {
        return Ext.isNumeric(index) ? Math.max(0, Math.floor(+index)) : 0;
    },

    applyOrientation: function (orientation) {
        return orientation === 'vertical' ? 'vertical' : 'horizontal';
    },

    applyCompactWidth: function (width) {
        return Ext.isNumeric(width) ? +width : 480;
    },

    applyStateLabels: function (labels) {
        return Ext.apply({
            upcoming: 'not started',
            active: 'current step',
            complete: 'complete',
            error: 'has errors',
            optional: 'Optional'
        }, labels);
    },

    updateSteps: function () {
        this.refreshIndicator();
    },

    updateActiveStep: function () {
        this.refreshIndicator();
    },

    updateSelectable: function () {
        this.refreshIndicator();
    },

    updateOrientation: function () {
        this.refreshIndicator();
    },

    updateCompactWidth: function () {
        this.refreshIndicator();
    },

    updateStateLabels: function () {
        this.refreshIndicator();
    },

    /**
     * Brings the CSS classes and, once it exists, the markup up to date with the configs.
     * @protected
     */
    refreshIndicator: function () {
        var me = this,
            vertical = me.getOrientation() === 'vertical';

        if (!me.indicatorReady || me.isDestroying || me.destroying || me.destroyed) {
            return;
        }

        me[vertical ? 'addCls' : 'removeCls']('nc-stepindicator-vertical');

        if (me.indicatorDomReady) {
            me.getIndicatorRoot().setHtml(me.getStepsTpl().apply({
                steps: me.getStepViews()
            }));
            me.checkCompact(me.getIndicatorRoot().getWidth());
        }
    },

    /**
     * Listens to the events of the indicator. Call once the DOM exists.
     * @protected
     */
    initIndicatorEvents: function () {
        var me = this,
            root = me.getIndicatorRoot();

        me.mon(root, {
            click: 'onIndicatorClick',
            keydown: 'onIndicatorKeyDown',
            delegate: '.nc-step-btn',
            scope: me
        });

        me.on('resize', 'onIndicatorResize', me);
    },

    onIndicatorResize: function (indicator, width) {
        this.checkCompact(width);
    },

    // Narrow horizontal indicators drop the text of the steps that are not active.
    checkCompact: function (width) {
        var me = this,
            compact = me.getOrientation() === 'horizontal' && width > 0 &&
                width < me.getCompactWidth();

        me[compact ? 'addCls' : 'removeCls']('nc-stepindicator-compact');
    },

    onIndicatorClick: function (e, target) {
        var me = this,
            index = +Ext.fly(target).getAttribute('data-index');

        if (me.getSelectable() && index !== me.getActiveStep()) {
            me.fireEvent('stepselect', me, index);
        }
    },

    // Arrow keys, Home and End move the focus between the step buttons.
    onIndicatorKeyDown: function (e, target) {
        var me = this,
            buttons = me.getIndicatorRoot().query('.nc-step-btn:not([disabled])'),
            index = Ext.Array.indexOf(buttons, target),
            key = e.getKey(),
            next;

        if (index < 0) {
            return;
        }

        if (key === e.RIGHT || key === e.DOWN) {
            next = Math.min(buttons.length - 1, index + 1);
        }
        else if (key === e.LEFT || key === e.UP) {
            next = Math.max(0, index - 1);
        }
        else if (key === e.HOME) {
            next = 0;
        }
        else if (key === e.END) {
            next = buttons.length - 1;
        }
        else {
            return;
        }

        e.stopEvent();
        Ext.fly(buttons[next]).focus();
    },

    privates: {
        /** Gets what the markup needs for each step. */
        getStepViews: function () {
            var me = this,
                // A `null` default is not passed through applySteps.
                steps = Ext.Array.from(me.getSteps()),
                active = me.getActiveStep(),
                labels = me.getStateLabels(),
                selectable = me.getSelectable(),
                total = steps.length,
                views = [];

            Ext.Array.each(steps, function (step, index) {
                var isActive = index === active,
                    error = step.error,
                    complete = !!step.complete,
                    state = error ? 'error' : (isActive ? 'active' : (complete ? 'complete' : 'upcoming')),
                    title = step.title || '';

                views.push({
                    index: index,
                    title: title,
                    description: step.description || '',
                    // The error message takes the place of the "Optional" label.
                    note: error || (step.optional ? labels.optional : ''),
                    cls: Ext.String.format('nc-step-{0}{1}{2}{3}', state,
                        isActive ? ' nc-step-active' : '',
                        complete && !isActive && !error ? ' nc-step-complete' : '',
                        step.optional ? ' nc-step-optional' : ''),
                    marker: error ? '!' : ((complete && !isActive) ? '' : index + 1),
                    iconCls: !error && !(complete && !isActive) ? step.iconCls : '',
                    tabindex: isActive ? 0 : -1,
                    disabled: selectable ? '' : ' disabled',
                    current: isActive ? ' aria-current="step"' : '',
                    label: Ext.String.format(me.stepLabel, index + 1, total, title, labels[state])
                });
            });

            return views;
        },

        getStepsTpl: function () {
            var proto = NC.stepper.StepIndicatorBase.prototype;

            return proto.stepsTpl || (proto.stepsTpl = new Ext.XTemplate(
                '<ol class="nc-step-list">',
                    '<tpl for="steps">',
                        '<li class="nc-step {cls}">',
                            '<button type="button" class="nc-step-btn" data-index="{index}" ',
                                'tabindex="{tabindex}"{disabled}{current} aria-label="{label:htmlEncode}">',
                                '<span class="nc-step-marker" aria-hidden="true">',
                                    '<tpl if="iconCls"><span class="{iconCls:htmlEncode}"></span>',
                                    '<tpl else>{marker}</tpl>',
                                '</span>',
                                '<span class="nc-step-text">',
                                    '<span class="nc-step-title">{title:htmlEncode}</span>',
                                    '<tpl if="description"><span class="nc-step-desc">{description:htmlEncode}</span></tpl>',
                                    '<tpl if="note"><span class="nc-step-note">{note:htmlEncode}</span></tpl>',
                                '</span>',
                            '</button>',
                            '<span class="nc-step-connector" aria-hidden="true"></span>',
                        '</li>',
                    '</tpl>',
                '</ol>'
            ));
        }
    },

    doDestroy: function () {
        var me = this;

        me.indicatorReady = me.indicatorDomReady = false;
        me.callParent();
    },

    /**
     * Gets the element that receives the markup: the component's own element.
     * @return {Ext.dom.Element}
     * @abstract
     * @protected
     */
    getIndicatorRoot: Ext.emptyFn
});
