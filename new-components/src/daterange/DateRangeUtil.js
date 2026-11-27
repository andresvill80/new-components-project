/**
 * Pure helpers of {@link NC.daterange.DateRangeField} and {@link NC.daterange.RangeCalendar}:
 * the matrix of a month, range checks, parsing and formatting of "start – end" text and the
 * default presets. No DOM and no toolkit classes, so both toolkits share it.
 *
 * A range is `{ start: Date, end: Date }`, both at midnight. All functions return new dates
 * and never change the ones they get.
 *
 *     var util = NC.daterange.DateRangeUtil;
 *
 *     util.getMonthMatrix(2026, 1, 1);          // February 2026, weeks starting on Monday
 *     util.parseRange('01/02/2026 – 05/02/2026', 'd/m/Y', ' – ');
 */
Ext.define('NC.daterange.DateRangeUtil', {
    singleton: true,

    requires: [
        'Ext.Array',
        'Ext.Date',
        'Ext.String'
    ],

    /**
     * @property {Object} presetTexts
     * Text of each default preset. Override for other languages.
     */
    presetTexts: {
        today: 'Today',
        yesterday: 'Yesterday',
        last7: 'Last 7 days',
        last30: 'Last 30 days',
        thisMonth: 'This month',
        lastMonth: 'Last month',
        thisYear: 'This year'
    },

    /**
     * Gets today, at midnight.
     * @return {Date}
     */
    today: function () {
        // native: Ext JS has no factory for the current date
        return Ext.Date.clearTime(new Date(), true);
    },

    /**
     * Gets a copy of a date at midnight, or `null` if it is not a valid date.
     * @param {Date} date
     * @return {Date}
     */
    toDay: function (date) {
        return Ext.isDate(date) && !isNaN(date.getTime()) ? Ext.Date.clearTime(date, true) : null;
    },

    /**
     * Gets the day (at midnight) of a time in milliseconds, such as `date.getTime()`.
     * @param {Number} time
     * @return {Date}
     */
    fromTime: function (time) {
        // native: Ext JS has no factory for a date from milliseconds
        return this.toDay(new Date(time));
    },

    /**
     * Adds days to a date (negative to subtract), keeping it at midnight.
     * @param {Date} date
     * @param {Number} days
     * @return {Date}
     */
    addDays: function (date, days) {
        return Ext.Date.clearTime(Ext.Date.add(date, Ext.Date.DAY, days), true);
    },

    /**
     * Adds months to a date. A day that does not exist in the new month (the 31st) becomes the
     * last day of it.
     * @param {Date} date
     * @param {Number} months
     * @return {Date}
     */
    addMonths: function (date, months) {
        return Ext.Date.clearTime(Ext.Date.add(date, Ext.Date.MONTH, months), true);
    },

    /**
     * Compares two dates by day: negative, 0 or positive.
     * @param {Date} a
     * @param {Date} b
     * @return {Number}
     */
    compare: function (a, b) {
        return this.toDay(a).getTime() - this.toDay(b).getTime();
    },

    /**
     * Tells whether two dates are the same day.
     * @param {Date} a
     * @param {Date} b
     * @return {Boolean}
     */
    isSameDay: function (a, b) {
        return !!a && !!b && this.compare(a, b) === 0;
    },

    /**
     * Gets the number of days of a range, both ends included (one day for a same-day range).
     * @param {Date} start
     * @param {Date} end
     * @return {Number}
     */
    getSpanDays: function (start, end) {
        return Math.abs(Ext.Date.diff(this.toDay(start), this.toDay(end), Ext.Date.DAY)) + 1;
    },

    /**
     * Makes a range from `{ start, end }` or `[start, end]`. Returns `null` unless both are
     * valid dates. The order is not changed: {@link #getErrors} reports a start after the end.
     * @param {Object/Date[]} value
     * @return {Object} `{ start, end }` or `null`.
     */
    toRange: function (value) {
        var start, end;

        if (Ext.isArray(value)) {
            start = this.toDay(value[0]);
            end = this.toDay(value[1]);
        }
        else if (Ext.isObject(value)) {
            start = this.toDay(value.start);
            end = this.toDay(value.end);
        }

        return start && end ? { start: start, end: end } : null;
    },

    /**
     * Tells whether two ranges are the same (or both empty).
     * @param {Object} a
     * @param {Object} b
     * @return {Boolean}
     */
    isEqualRange: function (a, b) {
        a = this.toRange(a);
        b = this.toRange(b);

        if (!a || !b) {
            return !a && !b;
        }

        return this.isSameDay(a.start, b.start) && this.isSameDay(a.end, b.end);
    },

    /**
     * Formats a range as "start<separator>end".
     * @param {Object} range
     * @param {String} format An `Ext.Date` format.
     * @param {String} separator
     * @return {String} Empty for no range.
     */
    formatRange: function (range, format, separator) {
        range = this.toRange(range);

        return range
            ? Ext.Date.format(range.start, format) + separator + Ext.Date.format(range.end, format)
            : '';
    },

    /**
     * Parses one date typed by the user with an `Ext.Date` format. Strict: "31/02/2026" is not a
     * date.
     * @param {String} text
     * @param {String} format
     * @return {Date} A date at midnight, or `null`.
     */
    parseDate: function (text, format) {
        var date;

        text = Ext.String.trim(text || '');

        if (!text) {
            return null;
        }

        if (Ext.Date.formatContainsHourInfo(format)) {
            date = Ext.Date.parse(text, format, true);
        }
        else {
            // Noon, so a daylight saving change cannot move the day.
            date = Ext.Date.parse(text + ' 12', format + ' H', true);
        }

        return this.toDay(date);
    },

    /**
     * Parses "start<separator>end". The order is not corrected: {@link #getErrors} reports it.
     * @param {String} text
     * @param {String} format
     * @param {String} separator
     * @return {Object} `{ range }` when both dates were understood, otherwise `{ range: null }`
     * (also for empty text, which is not an error here).
     */
    parseRange: function (text, format, separator) {
        var me = this,
            // native: Ext JS has no split by an arbitrary separator
            parts = String(text || '').split(separator),
            trimmed = Ext.String.trim(separator),
            start, end;

        if (parts.length !== 2 && trimmed && trimmed !== separator) {
            // Typed without the spaces around the separator.
            // native: same as above
            parts = String(text || '').split(trimmed);
        }

        if (parts.length === 2) {
            start = me.parseDate(parts[0], format);
            end = me.parseDate(parts[1], format);
        }

        return { range: start && end ? { start: start, end: end } : null };
    },

    /**
     * Checks a range against the rules. Returns the codes of what is wrong: `'order'` (the
     * start is after the end), `'min'`, `'max'`, `'span'` and `'sameDay'`. The field turns them
     * into messages.
     * @param {Object} range
     * @param {Object} rules `{ minDate, maxDate, maxSpan, allowSameDay }`.
     * @return {String[]} Empty when the range is valid.
     */
    getErrors: function (range, rules) {
        var me = this,
            errors = [],
            start, end;

        range = me.toRange(range);

        if (!range) {
            return errors;
        }

        start = range.start;
        end = range.end;

        if (me.compare(start, end) > 0) {
            errors.push('order');

            return errors;
        }

        if (rules.minDate && me.compare(start, rules.minDate) < 0) {
            errors.push('min');
        }

        if (rules.maxDate && me.compare(end, rules.maxDate) > 0) {
            errors.push('max');
        }

        if (rules.maxSpan && me.getSpanDays(start, end) > rules.maxSpan) {
            errors.push('span');
        }

        if (rules.allowSameDay === false && me.isSameDay(start, end)) {
            errors.push('sameDay');
        }

        return errors;
    },

    /**
     * Tells whether a day cannot be picked.
     * @param {Date} date
     * @param {Object} rules `{ minDate, maxDate, maxSpan, allowSameDay }`.
     * @param {Date} [pendingStart] The start already picked: the day then has to make a valid
     * range with it.
     * @return {Boolean}
     */
    isDayDisabled: function (date, rules, pendingStart) {
        var me = this;

        if (rules.minDate && me.compare(date, rules.minDate) < 0) {
            return true;
        }

        if (rules.maxDate && me.compare(date, rules.maxDate) > 0) {
            return true;
        }

        if (pendingStart) {
            if (rules.allowSameDay === false && me.isSameDay(date, pendingStart)) {
                return true;
            }

            if (rules.maxSpan && me.getSpanDays(date, pendingStart) > rules.maxSpan) {
                return true;
            }
        }

        return false;
    },

    /**
     * Gets the matrix of a month: six weeks of seven days, so every month has the same height.
     * @param {Number} year
     * @param {Number} month From 0 (January).
     * @param {Number} [startDay] First day of the week, from 0 (Sunday); defaults to
     * `Ext.Date.firstDayOfWeek`.
     * @return {Object[][]} Weeks of `{ date, day, inMonth }`.
     */
    getMonthMatrix: function (year, month, startDay) {
        var me = this,
            first = new Date(year, month, 1),    // native: builds a date from numbers
            weeks = [],
            offset, current, week, i, j;

        startDay = Ext.isNumber(startDay) ? startDay % 7 : Ext.Date.firstDayOfWeek;
        offset = (first.getDay() - startDay + 7) % 7;
        current = me.addDays(first, -offset);

        for (i = 0; i < 6; i++) {
            week = [];

            for (j = 0; j < 7; j++) {
                week.push({
                    date: current,
                    day: current.getDate(),
                    inMonth: current.getMonth() === month
                });
                current = me.addDays(current, 1);
            }

            weeks.push(week);
        }

        return weeks;
    },

    /**
     * Gets the names of the days of the week in order, from `startDay`.
     * @param {Number} [startDay]
     * @return {Object[]} `{ full, abbr }` from `Ext.Date.dayNames`, so a locale applies.
     */
    getWeekdayNames: function (startDay) {
        var names = [],
            i, day;

        startDay = Ext.isNumber(startDay) ? startDay % 7 : Ext.Date.firstDayOfWeek;

        for (i = 0; i < 7; i++) {
            day = (startDay + i) % 7;
            names.push({
                full: Ext.Date.dayNames[day],
                abbr: Ext.Date.getShortDayName(day)
            });
        }

        return names;
    },

    /**
     * Gets the title of a month, such as "February 2026", from `Ext.Date.monthNames`.
     * @param {Date} date
     * @return {String}
     */
    getMonthTitle: function (date) {
        return Ext.Date.monthNames[date.getMonth()] + ' ' + date.getFullYear();
    },

    /**
     * Gets the first day of the month of a date.
     * @param {Date} date
     * @return {Date}
     */
    getMonthStart: function (date) {
        return Ext.Date.clearTime(Ext.Date.getFirstDateOfMonth(date), true);
    },

    /**
     * Gets the default presets: Today, Yesterday, Last 7 days, Last 30 days, This month, Last
     * month and This year. Each is `{ text, getRange }`, and `getRange` is evaluated when the
     * preset is picked, so "Today" is always today.
     * @return {Object[]}
     */
    getDefaultPresets: function () {
        var me = this,
            texts = me.presetTexts,
            month = function (offset) {
                var first = me.addMonths(me.getMonthStart(me.today()), offset);

                return {
                    start: first,
                    end: Ext.Date.clearTime(Ext.Date.getLastDateOfMonth(first), true)
                };
            };

        return [{
            text: texts.today,
            getRange: function () {
                return { start: me.today(), end: me.today() };
            }
        }, {
            text: texts.yesterday,
            getRange: function () {
                var day = me.addDays(me.today(), -1);

                return { start: day, end: day };
            }
        }, {
            text: texts.last7,
            getRange: function () {
                return { start: me.addDays(me.today(), -6), end: me.today() };
            }
        }, {
            text: texts.last30,
            getRange: function () {
                return { start: me.addDays(me.today(), -29), end: me.today() };
            }
        }, {
            text: texts.thisMonth,
            getRange: function () {
                return month(0);
            }
        }, {
            text: texts.lastMonth,
            getRange: function () {
                return month(-1);
            }
        }, {
            text: texts.thisYear,
            getRange: function () {
                var year = me.today().getFullYear();

                // native: builds dates from numbers
                return { start: new Date(year, 0, 1), end: new Date(year, 11, 31) };
            }
        }];
    }
});
