/**
 * Shared behavior of {@link NC.stepper.Stepper} for both toolkits: the configs, the state of
 * every step (complete, error), the navigation rules, validation on Next, and the events. It
 * is a mixin because the stepper extends each toolkit's own panel class.
 *
 * The toolkit class must:
 *
 * - create the indicator and the navigation toolbar, and assign them to `stepIndicator` and
 *   `stepNav` (an object with `toolbar`, `back` and `next`);
 * - call {@link #initStepper} at the end of `initComponent` (Classic) or `initialize` (Modern)
 *   and {@link #destroyStepper} from `doDestroy`;
 * - implement {@link #getStepItems}, {@link #activateStepItem} and {@link #validateStepItem}.
 *
 * The steps are the child items of the stepper (the docked indicator and toolbar are not
 * steps). Each item can describe its step with a `step` property:
 * `{ title, description, optional, iconCls }`.
 */
Ext.define('NC.stepper.StepperMixin', {
    mixinId: 'stepper',

    requires: [
        'NC.stepper.StepIndicator'
    ],

    /**
     * @event beforestepchange
     * Fires before the active step changes, whatever the cause (buttons, indicator, `goTo`,
     * binding). Return `false` to cancel the change.
     * @param {NC.stepper.Stepper} stepper This stepper.
     * @param {Number} newIndex Index of the step to go to.
     * @param {Number} oldIndex Index of the current step.
     */

    /**
     * @event stepchange
     * Fires after the active step changed.
     * @param {NC.stepper.Stepper} stepper This stepper.
     * @param {Number} newIndex Index of the new active step.
     * @param {Number} oldIndex Index of the previous step.
     */

    /**
     * @event finish
     * Fires when Finish is pressed on the last step and the step is valid.
     * @param {NC.stepper.Stepper} stepper This stepper.
     */

    /**
     * @property {String} invalidMessage
     * Error shown on a step whose form is invalid when Next is pressed. Override for other
     * languages.
     */
    invalidMessage: 'Please correct the highlighted fields',

    /**
     * @property {String} stepTitle
     * Title of a step that has none; `{0}` is the step number. Override for other languages.
     */
    stepTitle: 'Step {0}',

    config: {
        /**
         * @cfg {Number} activeStep
         * Index of the current step. Bindable and published, so a view model can read it and
         * change it (`bind: { activeStep: '{step}' }`). A change that the rules or a
         * `beforestepchange` listener refuse is not applied, and a binding gets the real value
         * back.
         */
        activeStep: 0,

        /**
         * @cfg {String} indicatorPosition
         * `'top'` (a row) or `'left'` (a column). Applied when the stepper is created.
         */
        indicatorPosition: 'top',

        /**
         * @cfg {Boolean} linear
         * `true` to require each step to be complete (or optional) before going past it.
         * Going back is always allowed.
         */
        linear: true,

        /**
         * @cfg {Boolean} allowStepSelect
         * `true` to let the user click or tap a step in the indicator to go to it. The
         * `linear` rule still applies.
         */
        allowStepSelect: true,

        /**
         * @cfg {Boolean} showNavigation
         * `true` to show the Back and Next / Finish buttons.
         */
        showNavigation: true,

        /**
         * @cfg {String} backText
         * Text of the Back button.
         */
        backText: 'Back',

        /**
         * @cfg {String} nextText
         * Text of the Next button.
         */
        nextText: 'Next',

        /**
         * @cfg {String} finishText
         * Text of the Next button on the last step.
         */
        finishText: 'Finish',

        /**
         * @cfg {Boolean} validateOnNext
         * `true` to validate the forms of the active step when Next is pressed. Optional steps
         * are not validated.
         */
        validateOnNext: true
    },

    applyActiveStep: function (value, oldValue) {
        var me = this;

        value = Ext.isNumeric(value) ? Math.max(0, Math.floor(+value)) : 0;

        if (!me.stepperReady || value === oldValue) {
            return value;
        }

        if (!me.canGoTo(value) || me.fireEvent('beforestepchange', me, value, oldValue) === false) {
            // Refused: a binding must hear which step is really active.
            me.publishState('activeStep', oldValue);

            // `undefined` cancels the change.
            return undefined;
        }

        return value;
    },

    updateActiveStep: function (value, oldValue) {
        var me = this;

        if (!me.stepperReady) {
            return;
        }

        me.showStep(value);
        me.refreshStepper();
        me.fireEvent('stepchange', me, value, oldValue);
    },

    applyIndicatorPosition: function (position) {
        return position === 'left' ? 'left' : 'top';
    },

    updateAllowStepSelect: function () {
        this.refreshStepper();
    },

    updateShowNavigation: function () {
        this.refreshStepper();
    },

    updateBackText: function () {
        this.refreshStepper();
    },

    updateNextText: function () {
        this.refreshStepper();
    },

    updateFinishText: function () {
        this.refreshStepper();
    },

    /**
     * Gets the number of steps.
     * @return {Number}
     */
    getStepCount: function () {
        return this.getStepItems().length;
    },

    /**
     * Gets the item of a step.
     * @param {Number} index
     * @return {Ext.Component} `undefined` when there is no such step.
     */
    getStepItem: function (index) {
        return this.getStepItems()[index];
    },

    /**
     * Tells whether a step is complete.
     * @param {Number} index
     * @return {Boolean}
     */
    isStepComplete: function (index) {
        var state = this.stepStates && this.stepStates[index];

        return !!(state && state.complete);
    },

    /**
     * Gets the error message of a step.
     * @param {Number} index
     * @return {String} `null` when the step has no error.
     */
    getStepError: function (index) {
        var state = this.stepStates && this.stepStates[index];

        return state && state.error || null;
    },

    /**
     * Marks a step as complete or not. Completing a step clears its error.
     * @param {Number} index
     * @param {Boolean} complete
     */
    setStepComplete: function (index, complete) {
        var state = this.getStepState(index);

        if (state) {
            state.complete = !!complete;

            if (complete) {
                state.error = null;
            }

            this.refreshStepper();
        }
    },

    /**
     * Shows an error on a step, or clears it. A step with an error is not complete.
     * @param {Number} index
     * @param {String} message The error message, or `null` / `''` to clear the error.
     */
    setStepError: function (index, message) {
        var state = this.getStepState(index);

        if (state) {
            state.error = message ? message + '' : null;

            if (state.error) {
                state.complete = false;
            }

            this.refreshStepper();
        }
    },

    /**
     * Goes to a step, if the rules and the `beforestepchange` listeners allow it.
     * @param {Number} index
     * @return {Boolean} `true` if that step is now the active one.
     */
    goTo: function (index) {
        this.setActiveStep(index);

        return this.getActiveStep() === index;
    },

    /**
     * Validates the active step (see {@link #cfg-validateOnNext}), marks it complete and goes
     * to the next step. On the last step it fires `finish` instead.
     * @return {Boolean} `true` if it moved on or finished.
     */
    nextStep: function () {
        var me = this,
            active = me.getActiveStep();

        if (!me.validateStep(active)) {
            return false;
        }

        me.setStepComplete(active, true);

        if (active >= me.getStepCount() - 1) {
            me.fireEvent('finish', me);

            return true;
        }

        return me.goTo(active + 1);
    },

    /**
     * Goes to the previous step.
     * @return {Boolean} `true` if it moved back.
     */
    previousStep: function () {
        var active = this.getActiveStep();

        return active > 0 && this.goTo(active - 1);
    },

    /**
     * Clears the completion and the errors of every step and goes back to the first step.
     */
    reset: function () {
        var me = this;

        me.stepStates = [];
        me.syncStepStates();
        me.setActiveStep(0);
        me.refreshStepper();
    },

    /**
     * Tells whether the user may go to a step now: it exists and, in a `linear` stepper, every
     * step before it is complete or optional (going back is always allowed).
     * @param {Number} index
     * @return {Boolean}
     */
    canGoTo: function (index) {
        var me = this,
            i;

        if (index < 0 || index >= me.getStepCount()) {
            return false;
        }

        if (index <= me.getActiveStep() || !me.getLinear()) {
            return true;
        }

        for (i = 0; i < index; i++) {
            if (!me.isStepComplete(i) && !me.isStepOptional(i)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Call at the end of `initComponent` / `initialize`, once the items, the indicator and the
     * toolbar exist.
     * @protected
     */
    initStepper: function () {
        var me = this,
            count = me.getStepCount();

        me.stepStates = [];
        me.syncStepStates();

        // Not ready yet, so the rules do not apply to the first step.
        me.setActiveStep(Math.min(me.getActiveStep(), Math.max(0, count - 1)));
        me.stepperReady = true;

        me.showStep(me.getActiveStep());
        me.refreshStepper();

        me.on({
            add: 'onStepItemsChanged',
            remove: 'onStepItemsChanged',
            scope: me
        });
    },

    /**
     * Call from `doDestroy`, before the parent.
     * @protected
     */
    destroyStepper: function () {
        var me = this;

        me.stepperReady = false;
        me.stepIndicator = me.stepNav = null;
    },

    onStepIndicatorSelect: function (indicator, index) {
        if (this.getAllowStepSelect()) {
            this.goTo(index);
        }
    },

    onStepBack: function () {
        this.previousStep();
    },

    onStepNext: function () {
        this.nextStep();
    },

    onStepItemsChanged: function () {
        var me = this,
            count = me.getStepCount();

        if (!me.stepperReady) {
            return;
        }

        me.syncStepStates();

        if (me.getActiveStep() >= count && count) {
            // Going back is always allowed.
            me.setActiveStep(count - 1);
        }

        me.showStep(me.getActiveStep());
        me.refreshStepper();
    },

    privates: {
        getStepState: function (index) {
            return this.stepStates && this.stepStates[index];
        },

        isStepOptional: function (index) {
            var item = this.getStepItem(index);

            return !!(item && item.step && item.step.optional);
        },

        // One state object per step, kept in the order of the items.
        syncStepStates: function () {
            var me = this,
                states = me.stepStates,
                count = me.getStepCount();

            while (states.length < count) {
                states.push({ complete: false, error: null });
            }
            states.length = count;
        },

        showStep: function (index) {
            var item = this.getStepItem(index);

            if (item) {
                this.activateStepItem(item);
            }
        },

        // Validates the forms of a step; sets or clears its error. Optional steps are skipped.
        validateStep: function (index) {
            var me = this,
                item = me.getStepItem(index);

            if (!item) {
                return false;
            }

            if (!me.getValidateOnNext() || me.isStepOptional(index) || me.validateStepItem(item)) {
                me.setStepError(index, null);

                return true;
            }

            me.setStepError(index, me.invalidMessage);

            return false;
        },

        // What the indicator shows for each step.
        buildIndicatorSteps: function () {
            var me = this,
                steps = [];

            Ext.Array.each(me.getStepItems(), function (item, index) {
                var step = item.step || {},
                    state = me.stepStates[index];

                steps.push({
                    title: step.title || Ext.String.format(me.stepTitle, index + 1),
                    description: step.description,
                    optional: step.optional,
                    iconCls: step.iconCls,
                    complete: state.complete,
                    error: state.error
                });
            });

            return steps;
        },

        // Brings the indicator and the buttons up to date.
        refreshStepper: function () {
            var me = this,
                indicator = me.stepIndicator,
                nav = me.stepNav,
                active, last;

            // Config setters call this while the stepper is still being built, before its
            // items exist.
            if (!me.stepperReady || me.isDestroying || me.destroying || me.destroyed) {
                return;
            }

            active = me.getActiveStep();
            last = active >= me.getStepCount() - 1;

            if (indicator) {
                indicator.setSteps(me.buildIndicatorSteps());
                indicator.setActiveStep(active);
                indicator.setSelectable(me.getAllowStepSelect());
            }

            if (nav) {
                nav.toolbar.setHidden(!me.getShowNavigation());
                nav.back.setDisabled(active <= 0);
                nav.back.setText(me.getBackText());
                nav.next.setText(last ? me.getFinishText() : me.getNextText());
            }
        }
    },

    /**
     * Gets the items that are steps, in order (not the docked indicator and toolbar).
     * @return {Ext.Component[]}
     * @abstract
     * @protected
     */
    getStepItems: Ext.emptyFn,

    /**
     * Shows the card of a step.
     * @param {Ext.Component} item
     * @abstract
     * @protected
     */
    activateStepItem: Ext.emptyFn,

    /**
     * Validates every form inside a step item (the item itself and the forms nested in it),
     * showing the errors of all their fields.
     * @param {Ext.Component} item
     * @return {Boolean} `true` if all of them are valid, or if there are none.
     * @abstract
     * @protected
     */
    validateStepItem: Ext.emptyFn
});
