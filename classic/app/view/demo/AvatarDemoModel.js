/**
 * Data of the avatar demo: the values edited in the playground and the people of the group
 * that uses a store.
 */
Ext.define('MyApp.view.demo.AvatarDemoModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.avatardemo',

    data: {
        name: 'María José López Hernández',
        avatarSize: 'large',
        shape: 'circle',
        status: 'online'
    },

    stores: {
        people: {
            fields: ['name', 'src', 'status'],
            data: [
                { name: 'Ana', status: 'online' },
                { name: 'Juan Pérez', src: 'resources/avatars/user1.svg' },
                { name: 'Luis Gómez', status: 'busy' },
                { name: 'Zoë Smith', src: 'resources/avatars/user2.svg', status: 'away' }
            ]
        }
    }
});
