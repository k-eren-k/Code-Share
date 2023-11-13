module.exports = {
    name: 'kick',
    description: 'Kullanıcıyı sunucudan atar.',
    async execute(message, args) {
        if (!message.member.hasPermission('KICK_MEMBERS')) {
            return message.reply('Bu komutu kullanma yetkiniz yok.');
        }

        const user = message.mentions.users.first();
        if (user) {
            const member = message.guild.members.resolve(user);
            if (member) {
                try {
                    await member.kick();
                    message.reply(`${user.tag} kullanıcısı sunucudan atıldı.`);
                } catch (error) {
                    console.error(error);
                    message.reply('Bir hata oluştu ve kullanıcı atılamadı.');
                }
            } else {
                message.reply('Kullanıcı bulunamadı.');
            }
        } else {
            message.reply('Atılacak bir kullanıcı etiketleyin.');
        }
    },
};
