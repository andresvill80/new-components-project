/**
 * Shared base of {@link NC.daterange.RangeCalendar} for both toolkits: one or more months side
 * by side (with an optional list of presets) in which the user picks a range of days with two
 * clicks. The toolkit classes only say which element is the root.
 *
 * The markup comes from an `Ext.XTemplate`, so both toolkits render the same thing:
 *
 *     .nc-rc-body
 *       .nc-rc-presets          column of buttons (.nc-rc-preset)
 *       .nc-rc-months
 *         .nc-rc-month          one per month shown
 *           .nc-rc-head         previous / next buttons (.nc-rc-nav) and the title
 *           table.nc-rc-grid    weekdays and six rows of days (button.nc-rc-day)
 *
 * The first click on a day starts a range, the second ends it (the two are swapped if the second
 * is earlier). While the first is picked the days that would make an invalid range are
 * disabled, and the range under the pointer (or the focused day) is previewed. Every day is a
 * button, so Enter and Space pick it. The active day is in the Tab order; the arrows, Home, End
 * and PageUp / PageDown move between days, and Esc cancels.
 *
 * Toolkit classes must set `calendarReady = true` once the component can take CSS classes
 * (`initComponent` in Classic, `initialize` in Modern) and `calendarDomReady = true` once the
 * root element exists, calling {@link #initCalendarEvents} and {@link #refreshCalendar}, and
 * implement {@link #getCalendarRoot}.
 *
 * @abstract
 */
Ext.define('NC.daterange.RangeCalendarBase', {
    extend: 'Ext.Component',

    requires: [
        'NC.daterange.DateRangeUtil',
        'Ext.Date',
        'Ext.XTemplate',
        'Ext.String'
    ],

    baseCls: 'nc-rangecalendar',

    /**
     * @event rangeselect
     * Fires when the user picks a range (the second day, or a preset).
     * @param {NC.daterange.RangeCalendar} calendar This calendar.
     * @param {Date} start First day of the range.
     * @param {Date} end Last day of the range, never before the start.
     */

    /**
     * @event cancel
     * Fires when the user presses Esc and no range is being picked.
     * @param {NC.daterange.RangeCalendar} calendar This calendar.
     */

    /**
     * @property {String} prevMonthText
     * Accessible label of the previous month button. Override for other languages.
     */
    prevMonthText: 'Previous month',

    /**
     * @property {String} nextMonthText
     * Accessible label of the next month button.
     */
    nextMonthText: 'Next month',

    /**
     * @property {String} presetsText
     * Accessible label of the group of presets.
     */
    presetsText: 'Quick ranges',

    /**
     * @property {String} dayLabelFormat
     * `Ext.Date` format of the accessible label of a day.
     */
    dayLabelFormat: 'l, F j, Y',

    /**
     * @property {Object} stateTexts
     * Accessible text added to the label of a day, by state. Override for other languages.
     */
    stateTexts: {
        start: 'range start',
        end: 'range end',
        inRange: 'in range',
        disabled: 'not available'
    },

    /**
     * @property {Number} narrowWidth
     * Below this viewport width (in pixels) a single month is shown, whatever `monthsShown`.
     */
    narrowWidth: 600,

    config: {
        /**
         * @cfg {Object} value
         * The picked range, `{ start: Date, end: Date }` (or `[start, end]`), or `null`.
         */
        value: null,

        /**
         * @cfg {Date} minDate
         * First day that can be picked.
         */
        minDate: null,

        /**
         * @cfg {Date} maxDate
         * Last day that can be picked.
         */
        maxDate: null,

        /**
         * @cfg {Number} maxSpan
         * Most days a range can have (both ends included); `null` for no limit.
         */
        maxSpan: null,

        /**
         * @cfg {Boolean} allowSameDay
         * `false` to require a range of at least two days.
         */
        allowSameDay: true,

        /**
         * @cfg {Number} monthsShown
         * Number of months side by side, 1 to 3. A narrow viewport shows only one.
         */
        monthsShown: 2,

        /**
         * @cfg {Number} startDay
         * First day of the week, from 0 (Sunday). Defaults to `Ext.Date.firstDayOfWeek`.
         */
        startDay: null,

        /**
         * @cfg {Date} visibleMonth
         * Any day of the first month shown. Defaults to the month of the range, or the current
         * one.
         */
        visibleMonth: null,

        /**
         * @cfg {Object[]} presets
         * Ranges the user can pick with one click: `{ text, getRange }`, where `getRange`
         * returns `{ start, end }`. Defaults to Today, Yesterday, Last 7 days, Last 30 days, This
         * month, Last month and This year.
         */
        presets: null,

        /**
         * @cfg {Boolean} showPresets
         * `true` to show the presets next to the months.
         */
        showPresets: true
    },

    applyValue: function (value) {
        return NC.daterange.DateRangeUtil.toRange(value);
    },

    applyMinDate: function (date) {
        return NC.daterange.DateRangeUtil.toDay(date);
    },

    applyMaxDate: function (date) {
        return NC.daterange.DateRangeUtil.toDay(date);
    },

    applyMaxSpan: function (span) {
        return Ext.isNumeric(span) && +span > 0 ? Math.floor(+span) : null;
    },

    applyMonthsShown: function (count) {
        return Ext.isNumeric(count) ? Math.max(1, Math.min(3, Math.floor(+count))) : 2;
    },

    applyStartDay: function (day) {
        return Ext.isNumeric(day) ? Math.floor(+day) % 7 : null;
    },

    applyVisibleMonth: function (date) {
        var day = NC.daterange.DateRangeUtil.toDay(date);

        return day ? NC.daterange.DateRangeUtil.getMonthStart(day) : null;
    },

    applyPresets: function (presets) {
        return presets ? Ext.Array.from(presets) : null;
    },

    updateValue: function (value) {
        var me = this;

        // The range has to be in view.
        if (value && !me.isMonthShown(value.start)) {
            me.setVisibleMonth(value.start);
        }

        me.refreshCalendar();
    },

    updateMinDate: function () {
        this.refreshCalendar();
    },

    updateMaxDate: function () {
        this.refreshCalendar();
    },

    updateMaxSpan: function () {
        this.refreshCalendar();
    },

    updateAllowSameDay: function () {
        this.refreshCalendar();
    },

    updateMonthsShown: function () {
        this.refreshCalendar();
    },

    updateStartDay: function () {
        this.refreshCalendar();
    },

    updateVisibleMonth: function () {
        this.refreshCalendar();
    },

    updatePresets: function () {
        this.refreshCalendar();
    },

    updateShowPresets: function () {
        this.refreshCalendar();
    },

    /**
     * Forgets a range that was being picked (the first day clicked) and the last day used.
     * Call before showing the calendar again.
     */
    cancelPicking: function () {
        var me = this;

        me.pendingStart = null;
        me.activeTime = null;
        me.refreshCalendar();
    },

    /**
     * Gives the focus to a day, showing its month if needed.
     * @param {Date} [date] The day; defaults to the active one (the start of the range, or today).
     */
    focusDate: function (date) {
        var me = this,
            util = NC.daterange.DateRangeUtil;

        if (date) {
            me.activeTime = util.toDay(date).getTime();
            me.showMonthOf(util.toDay(date));
        }

        me.refreshCalendar('.nc-rc-day[tabindex="0"]');
    },

    /**
     * Brings the CSS classes and, once it exists, the markup up to date with the configs.
     * @param {String} [focusSelector] Selector of the element to focus afterwards.
     * @protected
     */
    refreshCalendar: function (focusSelector) {
        var me = this,
            root, hadFocus, target, key;

        if (!me.calendarReady || !me.calendarDomReady || me.isDestroying || me.destroying ||
                me.destroyed) {
            return;
        }

        root = me.getCalendarRoot();
        key = me.getRenderKey();
        hadFocus = root.contains(Ext.Element.getActiveElement());

        root[me.pendingStart ? 'addCls' : 'removeCls']('nc-rc-selecting');

        if (key === me.renderedKey) {
            // The same months: only the state of the days changes, so the element that has the
            // focus stays (a picker field collapses its picker when the focus is lost).
            me.updateCalendarState();
        }
        else {
            if (hadFocus) {
                // Other months: the focused element is replaced. Focus the root meanwhile, so
                // the focus never leaves the component.
                me.focusElement(root);
            }

            root.setHtml(me.getCalendarTpl().apply(me.getCalendarData()));
            me.renderedKey = key;
        }

        if (focusSelector || hadFocus) {
            target = root.down(focusSelector || '.nc-rc-day[tabindex="0"]');

            if (target && target.dom !== Ext.Element.getActiveElement()) {
                me.focusElement(target);
            }
        }
    },

    /**
     * Listens to the events of the calendar. Call once the DOM exists.
     * @protected
     */
    initCalendarEvents: function () {
        var me = this,
            root = me.getCalendarRoot();

        me.mon(root, {
            click: 'onCalendarClick',
            delegate: '.nc-rc-day, .nc-rc-preset, .nc-rc-nav',
            scope: me
        });
        me.mon(root, {
            mouseover: 'onCalendarOver',
            focusin: 'onCalendarOver',
            delegate: '.nc-rc-day',
            scope: me
        });
        me.mon(root, {
            mouseleave: 'onCalendarLeave',
            keydown: 'onCalendarKeyDown',
            scope: me
        });
    },

    onCalendarClick: function (e, target) {
        var me = this,
            el = Ext.fly(target);

        if (el.hasCls('nc-rc-day')) {
            me.pickDay(NC.daterange.DateRangeUtil.fromTime(+el.getAttribute('data-ts')));
        }
        else if (el.hasCls('nc-rc-preset')) {
            me.pickPreset(+el.getAttribute('data-index'));
        }
        else {
            me.shiftMonths(+el.getAttribute('data-dir'));
        }
    },

    // The range under the pointer (or the focus) is previewed while the end is being picked.
    onCalendarOver: function (e, target) {
        if (this.pendingStart) {
            this.updatePreview(+Ext.fly(target).getAttribute('data-ts'));
        }
    },

    onCalendarLeave: function () {
        this.updatePreview(null);
    },

    onCalendarKeyDown: function (e, target) {
        var me = this,
            util = NC.daterange.DateRangeUtil,
            el = Ext.fly(target),
            key = e.getKey(),
            date, next, weekday;

        if (key === e.ESC) {
            e.stopEvent();

            if (me.pendingStart) {
                // First stop picking, a second Esc closes the picker.
                me.pendingStart = null;
                me.refreshCalendar();
            }
            else {
                me.fireEvent('cancel', me);
            }

            return;
        }

        if (!el.hasCls('nc-rc-day') || e.ctrlKey || e.altKey || e.metaKey) {
            return;
        }

        date = util.fromTime(+el.getAttribute('data-ts'));

        if (key === e.LEFT) {
            next = util.addDays(date, -1);
        }
        else if (key === e.RIGHT) {
            next = util.addDays(date, 1);
        }
        else if (key === e.UP) {
            next = util.addDays(date, -7);
        }
        else if (key === e.DOWN) {
            next = util.addDays(date, 7);
        }
        else if (key === e.PAGE_UP) {
            next = util.addMonths(date, e.shiftKey ? -12 : -1);
        }
        else if (key === e.PAGE_DOWN) {
            next = util.addMonths(date, e.shiftKey ? 12 : 1);
        }
        else if (key === e.HOME || key === e.END) {
            // First or last day of the week of the date.
            weekday = (date.getDay() - me.getEffectiveStartDay() + 7) % 7;
            next = util.addDays(date, key === e.HOME ? -weekday : 6 - weekday);
        }
        else {
            return;
        }

        e.stopEvent();
        me.focusDate(next);
    },

    /**
     * Picks a day: the first one starts a range, the second one ends it.
     * @param {Date} date
     * @private
     */
    pickDay: function (date) {
        var me = this,
            util = NC.daterange.DateRangeUtil,
            pending = me.pendingStart,
            start, end;

        if (util.isDayDisabled(date, me.getRules(), pending)) {
            return;
        }

        me.activeTime = date.getTime();

        if (!pending) {
            me.pendingStart = date;
            me.refreshCalendar('.nc-rc-day[tabindex="0"]');

            return;
        }

        me.pendingStart = null;
        start = util.compare(pending, date) <= 0 ? pending : date;
        end = start === pending ? date : pending;

        me.setValue({ start: start, end: end });
        // The range may be the same as before, and the pending state still has to go.
        me.refreshCalendar('.nc-rc-day[tabindex="0"]');

        me.fireEvent('rangeselect', me, start, end);
    },

    pickPreset: function (index) {
        var me = this,
            util = NC.daterange.DateRangeUtil,
            preset = me.getActivePresets()[index],
            range = preset && util.toRange(preset.getRange());

        if (!range || util.getErrors(range, me.getRules()).length) {
            return;
        }

        me.pendingStart = null;
        me.activeTime = range.start.getTime();
        me.setValue(range);
        me.refreshCalendar('.nc-rc-preset[data-index="' + index + '"]');

        me.fireEvent('rangeselect', me, range.start, range.end);
    },

    shiftMonths: function (direction) {
        var me = this,
            util = NC.daterange.DateRangeUtil;

        me.setVisibleMonth(util.addMonths(me.getFirstMonth(), direction));
        // Keep the focus on the button that was pressed.
        me.refreshCalendar(direction < 0 ? '.nc-rc-prev' : '.nc-rc-next');
    },

    /**
     * Shows the months that contain a day (the nearest edge when it is not in view).
     * @param {Date} date
     * @private
     */
    showMonthOf: function (date) {
        var me = this,
            util = NC.daterange.DateRangeUtil,
            first = me.getFirstMonth(),
            offset;

        if (!me.isMonthShown(date)) {
            offset = me.getMonthIndex(date) - me.getMonthIndex(first);

            me.setVisibleMonth(offset < 0
                ? util.getMonthStart(date)
                : util.addMonths(util.getMonthStart(date), -(me.getEffectiveMonths() - 1)));
        }
    },

    /**
     * Gets the rules the days and ranges are checked against.
     * @return {Object}
     * @private
     */
    getRules: function () {
        var me = this;

        return {
            minDate: me.getMinDate(),
            maxDate: me.getMaxDate(),
            maxSpan: me.getMaxSpan(),
            allowSameDay: me.getAllowSameDay()
        };
    },

    privates: {
        getEffectiveStartDay: function () {
            var day = this.getStartDay();

            return Ext.isNumber(day) ? day : Ext.Date.firstDayOfWeek;
        },

        getEffectiveMonths: function () {
            var me = this;

            return Ext.Element.getViewportWidth() < me.narrowWidth ? 1 : me.getMonthsShown();
        },

        getActivePresets: function () {
            var me = this;

            return me.getShowPresets()
                ? (me.getPresets() || NC.daterange.DateRangeUtil.getDefaultPresets())
                : [];
        },

        getMonthIndex: function (date) {
            return date.getFullYear() * 12 + date.getMonth();
        },

        // First month in view: the configured one, or the one of the range, or the current one
        // (kept inside min / max).
        getFirstMonth: function () {
            var me = this,
                util = NC.daterange.DateRangeUtil,
                value = me.getValue(),
                min = me.getMinDate(),
                max = me.getMaxDate(),
                first = me.getVisibleMonth(),
                day;

            if (!first) {
                day = value ? value.start : util.today();

                if (!value && min && util.compare(day, min) < 0) {
                    day = min;
                }
                else if (!value && max && util.compare(day, max) > 0) {
                    day = max;
                }

                first = util.getMonthStart(day);
            }

            return first;
        },

        isMonthShown: function (date) {
            var me = this,
                offset = me.getMonthIndex(date) - me.getMonthIndex(me.getFirstMonth());

            return offset >= 0 && offset < me.getEffectiveMonths();
        },

        // The day that is in the Tab order: the last one used, or the start of the range, or
        // today, whichever is in view.
        getFocusTime: function () {
            var me = this,
                util = NC.daterange.DateRangeUtil,
                value = me.getValue(),
                candidates = [me.activeTime, me.pendingStart, value && value.start, util.today()],
                time = null;

            Ext.Array.each(candidates, function (candidate) {
                var date = Ext.isNumber(candidate) ? util.fromTime(candidate) : candidate;

                if (date && me.isMonthShown(date)) {
                    time = date.getTime();

                    return false;
                }
            });

            return time === null ? me.getFirstMonth().getTime() : time;
        },

        // Identifies what the markup shows apart from the state of the days: the months, the
        // order of the weekdays and the presets. While it does not change the markup stays.
        getRenderKey: function () {
            var me = this,
                texts = Ext.Array.map(me.getActivePresets(), function (preset) {
                    return preset.text;
                });

            return [
                me.getFirstMonth().getTime(),
                me.getEffectiveMonths(),
                me.getEffectiveStartDay(),
                texts.join('\u0001')
            ].join('|');
        },

        // Focuses an element without letting the browser scroll to it: scrolling would make a
        // picker field collapse its picker.
        focusElement: function (el) {
            // native: Ext.dom.Element#focus has no option to prevent the scroll
            el.dom.focus({ preventScroll: true });
        },

        getCellContext: function () {
            var util = NC.daterange.DateRangeUtil;

            return {
                rules: this.getRules(),
                range: this.getValue(),
                pending: this.pendingStart,
                today: util.today(),
                focusTime: this.getFocusTime()
            };
        },

        // Brings the days and the presets of the markup that exists up to date.
        updateCalendarState: function () {
            var me = this,
                util = NC.daterange.DateRangeUtil,
                root = me.getCalendarRoot(),
                rules = me.getRules(),
                context = me.getCellContext(),
                presets = me.getActivePresets();

            Ext.Array.each(root.query('.nc-rc-day'), function (node) {
                var el = Ext.fly(node),
                    date = util.fromTime(+el.getAttribute('data-ts')),
                    cell = me.getCellData({ date: date, day: date.getDate(), inMonth: true }, context);

                el.set({
                    cls: 'nc-rc-day' + (cell.cls ? ' ' + cell.cls : ''),
                    tabindex: String(cell.tabindex),
                    'aria-label': cell.label,
                    'aria-disabled': cell.ariaDisabled ? 'true' : undefined
                });
                Ext.fly(node.parentNode).set({ 'aria-selected': cell.selected });
            });

            Ext.Array.each(root.query('.nc-rc-preset'), function (node) {
                var el = Ext.fly(node),
                    preset = presets[+el.getAttribute('data-index')],
                    range = preset && util.toRange(preset.getRange());

                el.set({
                    disabled: !range || util.getErrors(range, rules).length ? 'disabled' : undefined
                });
            });
        },

        getCalendarData: function () {
            var me = this,
                util = NC.daterange.DateRangeUtil,
                rules = me.getRules(),
                startDay = me.getEffectiveStartDay(),
                count = me.getEffectiveMonths(),
                first = me.getFirstMonth(),
                weekdays = util.getWeekdayNames(startDay),
                months = [],
                presets = [],
                context = me.getCellContext(),
                i, month;

            for (i = 0; i < count; i++) {
                month = util.addMonths(first, i);

                months.push({
                    title: util.getMonthTitle(month),
                    first: i === 0,
                    last: i === count - 1,
                    weekdays: weekdays,
                    weeks: Ext.Array.map(
                        util.getMonthMatrix(month.getFullYear(), month.getMonth(), startDay),
                        function (week) {
                            return Ext.Array.map(week, function (cell) {
                                return me.getCellData(cell, context);
                            });
                        })
                });
            }

            Ext.Array.each(me.getActivePresets(), function (preset, index) {
                var range = util.toRange(preset.getRange());

                presets.push({
                    index: index,
                    text: preset.text,
                    disabled: !range || util.getErrors(range, rules).length ? ' disabled' : ''
                });
            });

            return {
                presets: presets,
                months: months,
                prevText: me.prevMonthText,
                nextText: me.nextMonthText,
                presetsText: me.presetsText
            };
        },

        // What the markup needs for one day.
        getCellData: function (cell, context) {
            var me = this,
                util = NC.daterange.DateRangeUtil,
                texts = me.stateTexts,
                date = cell.date,
                range = context.range,
                pending = context.pending,
                // While picking, only the first day is shown as selected.
                from = pending || (range && range.start),
                to = pending ? null : (range && range.end),
                isStart = !!from && util.isSameDay(date, from),
                isEnd = !!to && util.isSameDay(date, to),
                inRange = !pending && !!range && util.compare(date, range.start) > 0 &&
                    util.compare(date, range.end) < 0,
                disabled = util.isDayDisabled(date, context.rules, pending),
                cls = [],
                label = Ext.Date.format(date, me.dayLabelFormat);

            if (!cell.inMonth) {
                return { empty: true };
            }

            if (util.isSameDay(date, context.today)) {
                cls.push('nc-rc-today');
            }

            if (isStart) {
                cls.push('nc-rc-start');
                label += ', ' + texts.start;
            }

            if (isEnd) {
                cls.push('nc-rc-end');
                label += ', ' + texts.end;
            }

            if (pending && isStart) {
                cls.push('nc-rc-pending');
            }

            if (inRange) {
                cls.push('nc-rc-inrange');
                label += ', ' + texts.inRange;
            }

            if (disabled) {
                cls.push('nc-rc-disabled');
                label += ', ' + texts.disabled;
            }

            return {
                empty: false,
                day: cell.day,
                time: date.getTime(),
                cls: cls.join(' '),
                selected: isStart || isEnd || inRange,
                tabindex: date.getTime() === context.focusTime ? 0 : -1,
                ariaDisabled: disabled ? ' aria-disabled="true"' : '',
                label: label
            };
        },

        // Shows (or, with `null`, removes) the preview of the range from the first day picked
        // to the day under the pointer, without drawing the calendar again.
        updatePreview: function (time) {
            var me = this,
                pending = me.pendingStart,
                low, high;

            if (!me.calendarDomReady) {
                return;
            }

            if (pending && time !== null) {
                low = Math.min(pending.getTime(), time);
                high = Math.max(pending.getTime(), time);
            }

            Ext.Array.each(me.getCalendarRoot().query('.nc-rc-day'), function (node) {
                var el = Ext.fly(node),
                    day = +el.getAttribute('data-ts'),
                    preview = low !== undefined && day >= low && day <= high &&
                        !el.hasCls('nc-rc-disabled');

                el.toggleCls('nc-rc-preview', preview);
                el.toggleCls('nc-rc-preview-start', preview && day === low);
                el.toggleCls('nc-rc-preview-end', preview && day === high);
            });
        },

        getCalendarTpl: function () {
            var proto = NC.daterange.RangeCalendarBase.prototype;

            return proto.calendarTpl || (proto.calendarTpl = new Ext.XTemplate(
                '<div class="nc-rc-body">',
                    '<tpl if="presets.length">',
                        '<div class="nc-rc-presets" role="group" aria-label="{presetsText:htmlEncode}">',
                            '<tpl for="presets">',
                                '<button type="button" class="nc-rc-preset" data-index="{index}"{disabled}>',
                                    '{text:htmlEncode}',
                                '</button>',
                            '</tpl>',
                        '</div>',
                    '</tpl>',
                    '<div class="nc-rc-months">',
                        '<tpl for="months">',
                            '<div class="nc-rc-month">',
                                '<div class="nc-rc-head">',
                                    '<tpl if="first">',
                                        '<button type="button" class="nc-rc-nav nc-rc-prev" data-dir="-1" ',
                                            'aria-label="{parent.prevText:htmlEncode}"></button>',
                                    '<tpl else>',
                                        '<span class="nc-rc-navspace"></span>',
                                    '</tpl>',
                                    '<span class="nc-rc-title" aria-live="polite">{title:htmlEncode}</span>',
                                    '<tpl if="last">',
                                        '<button type="button" class="nc-rc-nav nc-rc-next" data-dir="1" ',
                                            'aria-label="{parent.nextText:htmlEncode}"></button>',
                                    '<tpl else>',
                                        '<span class="nc-rc-navspace"></span>',
                                    '</tpl>',
                                '</div>',
                                '<table class="nc-rc-grid" role="grid" aria-label="{title:htmlEncode}">',
                                    '<thead><tr>',
                                        '<tpl for="weekdays">',
                                            '<th scope="col" abbr="{full:htmlEncode}">{abbr:htmlEncode}</th>',
                                        '</tpl>',
                                    '</tr></thead>',
                                    '<tbody>',
                                        '<tpl for="weeks"><tr>',
                                            '<tpl for=".">',
                                                '<tpl if="empty">',
                                                    '<td class="nc-rc-empty" role="presentation"></td>',
                                                '<tpl else>',
                                                    '<td role="gridcell" aria-selected="{selected}">',
                                                        '<button type="button" class="nc-rc-day {cls}" ',
                                                            'data-ts="{time}" tabindex="{tabindex}" ',
                                                            'aria-label="{label:htmlEncode}"{ariaDisabled}>',
                                                            '{day}',
                                                        '</button>',
                                                    '</td>',
                                                '</tpl>',
                                            '</tpl>',
                                        '</tr></tpl>',
                                    '</tbody>',
                                '</table>',
                            '</div>',
                        '</tpl>',
                    '</div>',
                '</div>'
            ));
        }
    },

    doDestroy: function () {
        var me = this;

        me.calendarReady = me.calendarDomReady = false;
        me.callParent();
    },

    /**
     * Gets the element that receives the markup: the component's own element.
     * @return {Ext.dom.Element}
     * @abstract
     * @protected
     */
    getCalendarRoot: Ext.emptyFn
});
