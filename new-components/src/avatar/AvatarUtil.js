/**
 * Pure helpers for the avatar components. No DOM and no components, so the same logic gives
 * the same result in both toolkits (the same person always gets the same initials and color).
 */
Ext.define('NC.avatar.AvatarUtil', {
    singleton: true,

    requires: [
        'Ext.String',
        'Ext.util.Format'
    ],

    /**
     * @property {Number} paletteSize
     * Number of colors in the SASS palette `$nc-avatar-palette` (classes `nc-avatar-color-0`
     * to `nc-avatar-color-N`). Keep both in sync.
     */
    paletteSize: 8,

    /**
     * Gets the initials of a name: the first letter of the first and of the last word,
     * uppercased. A single word gives one letter, an empty name gives `''`.
     *
     *     NC.avatar.AvatarUtil.getInitials('Juan Pérez');  // 'JP'
     *     NC.avatar.AvatarUtil.getInitials('Ana');         // 'A'
     *
     * @param {String} name
     * @return {String}
     */
    getInitials: function (name) {
        var words = Ext.String.splitWords(Ext.String.trim(Ext.valueFrom(name, '') + '')),
            first, last;

        if (Ext.isEmpty(words)) {
            return '';
        }

        first = words[0].charAt(0);
        last = words.length > 1 ? words[words.length - 1].charAt(0) : '';

        return Ext.util.Format.uppercase(first + last);
    },

    /**
     * Gets a stable palette index for a name, so the same name always gets the same color.
     * The comparison ignores case and surrounding spaces.
     *
     * @param {String} name
     * @param {Number} [paletteSize] Defaults to {@link #paletteSize}.
     * @return {Number} A number from `0` to `paletteSize - 1`.
     */
    getColorIndex: function (name, paletteSize) {
        var key = Ext.util.Format.lowercase(Ext.String.trim(Ext.valueFrom(name, '') + '')),
            size = paletteSize || this.paletteSize,
            hash = 0,
            length = key.length,
            i;

        for (i = 0; i < length; i++) {
            // native: Ext JS has no API to get the character code of a string
            hash = (hash * 31 + key.charCodeAt(i)) % 2147483647;
        }

        return hash % size;
    }
});
