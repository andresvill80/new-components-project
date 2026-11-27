/**
 * Shared behavior of {@link NC.otp.OtpField} for both toolkits: the configs, the one-character
 * boxes, the keyboard and paste handling and the `complete` event. It is a mixin because the
 * field extends each toolkit's own field class (`Ext.form.field.Base` in Classic,
 * `Ext.field.Field` in Modern).
 *
 * The markup is the same in both toolkits:
 *
 *     <div class="nc-otp-boxes" role="group">
 *         <input class="nc-otp-box" data-index="0" ...>
 *         <input class="nc-otp-box" data-index="1" ...>
 *         <span class="nc-otp-sep" aria-hidden="true"></span>   (after `separatorAfter` boxes)
 *         ...
 *     </div>
 *
 * The characters live in `otpChars` (an array with one string per box, empty or one character).
 * The toolkit class must:
 *
 * - put {@link #getOtpMarkup} inside the boxes element when it renders;
 * - call {@link #initOtp} once that element exists and {@link #destroyOtp} from `doDestroy`;
 * - implement {@link #getOtpRoot} (the boxes element), {@link #isOtpDisabled},
 *   {@link #isOtpReadOnly} and {@link #commitOtp} (store the new characters as the field value);
 * - call {@link #setOtpChars} when the value is set from code, and {@link #otpValueChanged}
 *   after every value change.
 */
Ext.define('NC.otp.OtpFieldMixin', {
    mixinId: 'otpfield',

    requires: [
        'NC.otp.OtpUtil',
        'Ext.XTemplate',
        'Ext.String'
    ],

    /**
     * @event complete
     * Fires when every box has a character.
     * @param {NC.otp.OtpField} field This field.
     * @param {String} value The entered characters.
     */

    /**
     * @property {String} digitLabel
     * Accessible label of a box of a numeric field: `{0}` is the box number and `{1}` the
     * number of boxes. Override for other languages.
     */
    digitLabel: 'Digit {0} of {1}',

    /**
     * @property {String} charLabel
     * Accessible label of a box of an alphanumeric field. Override for other languages.
     */
    charLabel: 'Character {0} of {1}',

    /**
     * @property {String} incompleteMessage
     * Error of a required field in which some boxes are empty: `{0}` is the number of boxes.
     * Override for other languages.
     */
    incompleteMessage: 'Enter all {0} characters',

    config: {
        /**
         * @cfg {Number} length
         * Number of boxes.
         */
        length: 6,

        /**
         * @cfg {String} charType
         * Characters the boxes accept: `'numeric'` (0-9) or `'alphanumeric'` (0-9, a-z, A-Z).
         * Anything else is ignored when typed and removed when pasted.
         */
        charType: 'numeric',

        /**
         * @cfg {Boolean} masked
         * `true` to show dots instead of the characters (a PIN).
         */
        masked: false,

        /**
         * @cfg {Boolean} autoFocus
         * `true` to focus the first box when the field is shown.
         */
        autoFocus: false,

        /**
         * @cfg {Number} separatorAfter
         * Shows a visual separator after this many boxes (`3` makes "123 - 456" of six boxes).
         * `null` for none. The separator is not part of the value.
         */
        separatorAfter: null
    },

    applyLength: function (length) {
        return Ext.isNumeric(length) ? Math.max(1, Math.floor(+length)) : 6;
    },

    applyCharType: function (charType) {
        return NC.otp.OtpUtil.normalizeCharType(charType);
    },

    applySeparatorAfter: function (count) {
        return Ext.isNumeric(count) && +count > 0 ? Math.floor(+count) : null;
    },

    updateLength: function () {
        this.refreshOtp(true);
    },

    updateCharType: function () {
        this.refreshOtp(true);
    },

    updateMasked: function () {
        this.refreshOtp(false);
    },

    updateSeparatorAfter: function () {
        this.refreshOtp(false);
    },

    /**
     * Clears every box.
     */
    clear: function () {
        var me = this;

        me.setValue('');
        // The boxes are emptied even when the value already was empty and did not change.
        me.setOtpChars('');
    },

    /**
     * Gives the focus to a box.
     * @param {Number} index Index of the box, from 0. Out-of-range values are brought into range.
     */
    focusBox: function (index) {
        var me = this,
            box = me.otpReady && me.getBoxDom(Math.max(0, Math.min(me.getLength() - 1, index)));

        if (box) {
            Ext.fly(box).focus();
        }
    },

    /**
     * Tells whether every box has a character.
     * @return {Boolean}
     */
    isComplete: function () {
        var chars = this.getOtpChars();

        return chars.join('').length === chars.length;
    },

    /**
     * Gets the box that should receive the focus when the field is focused as a whole (a click
     * on its label, `focus()`): the first empty one, or the last one when all are filled.
     * @return {Number}
     * @protected
     */
    getOtpFocusIndex: function () {
        var chars = this.getOtpChars(),
            index = Ext.Array.indexOf(chars, '');

        return index < 0 ? chars.length - 1 : index;
    },

    /**
     * Gets the entered characters as one string.
     * @return {String}
     * @protected
     */
    getOtpString: function () {
        return this.getOtpChars().join('');
    },

    /**
     * Gets one string per box, empty or one character. Always `length` items.
     * @return {String[]}
     * @protected
     */
    getOtpChars: function () {
        var me = this,
            length = me.getLength(),
            chars = me.otpChars;

        if (!chars || chars.length !== length) {
            chars = me.otpChars = NC.otp.OtpUtil.toChars(chars || '', length, me.getCharType());
        }

        return chars;
    },

    /**
     * Sets the characters (from the value of the field) and shows them.
     * @param {String} value
     * @protected
     */
    setOtpChars: function (value) {
        var me = this;

        me.otpChars = NC.otp.OtpUtil.toChars(value, me.getLength(), me.getCharType());
        me.syncBoxes();
    },

    /**
     * Gets the markup of the boxes.
     * @return {String}
     * @protected
     */
    getOtpMarkup: function () {
        var me = this,
            chars = me.getOtpChars(),
            length = chars.length,
            numeric = me.getCharType() === 'numeric',
            separatorAfter = me.getSeparatorAfter(),
            disabled = me.isOtpDisabled(),
            readOnly = me.isOtpReadOnly(),
            boxes = [],
            i;

        for (i = 0; i < length; i++) {
            boxes.push({
                index: i,
                value: chars[i],
                type: me.getMasked() ? 'password' : 'text',
                mode: numeric ? 'numeric' : 'text',
                // The first box takes the code that the keyboard or the browser suggests.
                autocomplete: i === 0 ? 'one-time-code' : 'off',
                label: Ext.String.format(numeric ? me.digitLabel : me.charLabel, i + 1, length),
                disabled: disabled ? ' disabled' : '',
                readOnly: readOnly ? ' readonly' : '',
                // The separator comes between two boxes.
                separator: separatorAfter && i + 1 === separatorAfter && i + 1 < length
            });
        }

        return me.getOtpTpl().apply({ boxes: boxes });
    },

    /**
     * Listens to the events of the boxes and shows the characters. Call once the boxes exist.
     * @protected
     */
    initOtp: function () {
        var me = this;

        me.otpReady = true;

        me.mon(me.getOtpRoot(), {
            keydown: 'onOtpKeyDown',
            input: 'onOtpInput',
            paste: 'onOtpPaste',
            focusin: 'onOtpFocusIn',
            delegate: '.nc-otp-box',
            scope: me
        });

        me.otpWasComplete = me.isComplete();

        if (me.getAutoFocus()) {
            // After the layout, so the box can take the focus.
            me.focusTimer = Ext.defer(me.focusBox, 10, me, [0]);
        }
    },

    /**
     * Releases the timers. Call from `doDestroy`.
     * @protected
     */
    destroyOtp: function () {
        var me = this;

        Ext.undefer(me.focusTimer);
        me.otpReady = false;
    },

    /**
     * Fires `complete` when the value just became complete. Call after every value change.
     * @param {String} value
     * @protected
     */
    otpValueChanged: function (value) {
        var me = this,
            complete;

        if (!me.otpReady || me.destroying || me.destroyed) {
            return;
        }

        complete = me.isComplete();

        if (complete && !me.otpWasComplete) {
            me.fireEvent('complete', me, value);
        }

        me.otpWasComplete = complete;
    },

    /**
     * Tells whether the field takes input now.
     * @return {Boolean}
     * @protected
     */
    isOtpEditable: function () {
        return !this.isOtpDisabled() && !this.isOtpReadOnly();
    },

    /**
     * Brings the boxes up to date with the configs: the markup is built again when they
     * changed (`rebuild`) or the characters and states are only refreshed.
     * @param {Boolean} rebuild `true` when the number or kind of boxes changed.
     * @protected
     */
    refreshOtp: function (rebuild) {
        var me = this,
            root;

        if (!me.otpReady || me.isDestroying || me.destroying || me.destroyed) {
            return;
        }

        root = me.getOtpRoot();

        if (rebuild) {
            // The characters may not fit the new length or type.
            me.otpChars = NC.otp.OtpUtil.toChars(me.otpChars, me.getLength(), me.getCharType());
            me.commitOtp();
        }

        root.setHtml(me.getOtpMarkup());
    },

    /**
     * Shows the characters and the disabled / read-only state in the boxes.
     * @protected
     */
    syncBoxes: function () {
        var me = this,
            chars, locked;

        if (!me.otpReady || me.isDestroying || me.destroying || me.destroyed) {
            return;
        }

        chars = me.getOtpChars();

        Ext.Array.each(me.getBoxDoms(), function (box, index) {
            // native: Ext JS has no setter for the value of an input element
            box.value = chars[index] || '';
            Ext.fly(box).set({
                disabled: me.isOtpDisabled() ? 'disabled' : undefined,
                readonly: me.isOtpReadOnly() ? 'readonly' : undefined
            });
        });

        locked = !me.isOtpEditable();
        me.getOtpRoot()[locked ? 'addCls' : 'removeCls']('nc-otp-locked');
    },

    privates: {
        getBoxDoms: function () {
            return this.getOtpRoot().query('.nc-otp-box');
        },

        getBoxDom: function (index) {
            return this.getBoxDoms()[index];
        },

        getBoxIndex: function (target) {
            return +Ext.fly(target).getAttribute('data-index');
        },

        getOtpTpl: function () {
            var proto = NC.otp.OtpFieldMixin.prototype;

            return proto.otpTpl || (proto.otpTpl = new Ext.XTemplate(
                '<tpl for="boxes">',
                    '<input type="{type}" class="nc-otp-box" data-index="{index}" ',
                        'value="{value:htmlEncode}" inputmode="{mode}" autocomplete="{autocomplete}" ',
                        'autocapitalize="off" autocorrect="off" spellcheck="false" size="1" ',
                        'aria-label="{label:htmlEncode}"{disabled}{readOnly}>',
                    '<tpl if="separator"><span class="nc-otp-sep" aria-hidden="true"></span></tpl>',
                '</tpl>'
            ));
        },

        // Takes the new characters and moves the focus.
        applyOtpChars: function (chars, focusIndex) {
            var me = this;

            me.otpChars = chars;
            me.syncBoxes();
            me.commitOtp();
            me.focusBox(focusIndex);
        },

        // Selecting the character makes the next one replace it.
        onOtpFocusIn: function (e, target) {
            Ext.fly(target).selectText();
        },

        onOtpKeyDown: function (e, target) {
            var me = this,
                index = me.getBoxIndex(target),
                chars = me.getOtpChars(),
                last = chars.length - 1,
                key = e.getKey(),
                edited;

            if (e.ctrlKey || e.altKey || e.metaKey) {
                return;
            }

            if (key === e.LEFT) {
                me.focusBox(index - 1);
            }
            else if (key === e.RIGHT) {
                me.focusBox(index + 1);
            }
            else if (key === e.HOME) {
                me.focusBox(0);
            }
            else if (key === e.END) {
                me.focusBox(last);
            }
            else if (key === e.BACKSPACE || key === e.DELETE) {
                if (me.isOtpEditable()) {
                    edited = Ext.Array.clone(chars);

                    if (key === e.BACKSPACE && !edited[index] && index > 0) {
                        // An empty box: clear the previous one and go there.
                        index--;
                    }

                    edited[index] = '';
                    me.applyOtpChars(edited, index);
                }
            }
            else {
                return;
            }

            e.stopEvent();
        },

        // Typing, and also what the browser or the keyboard fills in (a whole code).
        onOtpInput: function (e, target) {
            var me = this,
                index = me.getBoxIndex(target),
                chars = me.getOtpChars(),
                util = NC.otp.OtpUtil,
                result;

            if (!me.isOtpEditable()) {
                // native: a read-only box does not change, but restore it anyway
                target.value = chars[index] || '';
                return;
            }

            // native: Ext JS has no getter for the live value of a box other than the raw DOM one
            result = util.distribute(chars, index, util.extractTyped(chars[index], target.value),
                me.getCharType());

            if (!target.value) {
                // Emptied (cut, or selected and deleted).
                result.chars[index] = '';
                me.applyOtpChars(result.chars, index);
            }
            else if (result.count) {
                // One typed character goes to the next box; a whole code to the one after it.
                me.applyOtpChars(result.chars, result.count > 1 ? result.next : Math.min(index + 1,
                    chars.length - 1));
            }
            else {
                // Nothing valid was typed: leave the box as it was.
                me.syncBoxes();
            }
        },

        onOtpPaste: function (e, target) {
            var me = this,
                // native: Ext JS has no clipboard API
                clip = e.browserEvent.clipboardData,
                text = clip ? clip.getData('text') : '',
                index = me.getBoxIndex(target),
                result;

            e.stopEvent();

            if (me.isOtpEditable()) {
                result = NC.otp.OtpUtil.distribute(me.getOtpChars(), index, text, me.getCharType());

                if (result.count) {
                    me.applyOtpChars(result.chars, result.next);
                }
            }
        }
    },

    /**
     * Gets the element that holds the boxes.
     * @return {Ext.dom.Element}
     * @abstract
     * @protected
     */
    getOtpRoot: Ext.emptyFn,

    /**
     * Tells whether the field is disabled.
     * @return {Boolean}
     * @abstract
     * @protected
     */
    isOtpDisabled: Ext.emptyFn,

    /**
     * Tells whether the field is read only.
     * @return {Boolean}
     * @abstract
     * @protected
     */
    isOtpReadOnly: Ext.emptyFn,

    /**
     * Stores `otpChars` as the value of the field. Called after the user changed a box.
     * @abstract
     * @protected
     */
    commitOtp: Ext.emptyFn
});
