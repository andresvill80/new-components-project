/**
 * Pure helpers of {@link NC.otp.OtpField}: which characters are allowed and how typed or pasted
 * text is spread over the boxes. No DOM, so it is shared by both toolkits and easy to test.
 *
 *     NC.otp.OtpUtil.sanitize('12 34-56', 'numeric');   // '123456'
 *     NC.otp.OtpUtil.distribute(['', '', '', ''], 1, 'ab', 'alphanumeric');
 *     // { chars: ['', 'a', 'b', ''], next: 3 }
 */
Ext.define('NC.otp.OtpUtil', {
    singleton: true,

    requires: [
        'Ext.Array'
    ],

    // For each `charType`, a regular expression that matches the characters to REMOVE.
    invalidRe: {
        numeric: /[^0-9]/g,
        alphanumeric: /[^0-9A-Za-z]/g
    },

    /**
     * Checks a `charType` and falls back to `'numeric'`.
     * @param {String} charType
     * @return {String}
     */
    normalizeCharType: function (charType) {
        return charType === 'alphanumeric' ? 'alphanumeric' : 'numeric';
    },

    /**
     * Removes every character the type does not accept.
     * @param {String} text
     * @param {String} charType `'numeric'` or `'alphanumeric'`.
     * @return {String}
     */
    sanitize: function (text, charType) {
        var me = this;

        return String(Ext.valueFrom(text, '')).replace(me.invalidRe[me.normalizeCharType(charType)], '');
    },

    /**
     * Makes an array of `length` strings, each empty or one character.
     * @param {String/String[]} value Text, or an array of characters.
     * @param {Number} length
     * @param {String} charType
     * @return {String[]}
     */
    toChars: function (value, length, charType) {
        var text = Ext.isArray(value) ? value.join('') : value,
            clean = this.sanitize(text, charType),
            chars = [],
            i;

        for (i = 0; i < length; i++) {
            chars.push(clean.charAt(i));
        }

        return chars;
    },

    /**
     * Gets the character typed into a box that already held `previous`. A box holds one
     * character, so the browser reports two when the caret was not selecting the old one: the
     * one that is new wins.
     * @param {String} previous What the box held before.
     * @param {String} text What the box holds now.
     * @return {String} The text to distribute.
     */
    extractTyped: function (previous, text) {
        if (previous && text.length === 2) {
            return text.charAt(0) === previous ? text.charAt(1) : text.charAt(0);
        }

        return text;
    },

    /**
     * Puts the sanitized `text` into a copy of `chars`, starting at box `start`.
     * @param {String[]} chars The current characters (not modified).
     * @param {Number} start Index of the first box to fill.
     * @param {String} text Typed or pasted text, not sanitized yet.
     * @param {String} charType
     * @return {Object} `{ chars, next, count }`: the new characters, the index of the box
     * that should get the focus and how many characters were placed.
     */
    distribute: function (chars, start, text, charType) {
        var clean = this.sanitize(text, charType),
            result = Ext.Array.clone(chars),
            length = result.length,
            count = 0,
            index = start;

        while (count < clean.length && index < length) {
            result[index] = clean.charAt(count);
            count++;
            index++;
        }

        return {
            chars: result,
            next: Math.min(index, length - 1),
            count: count
        };
    }
});
