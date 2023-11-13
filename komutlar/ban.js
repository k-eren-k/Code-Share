module.exports = {
    name: 'ban',
    description: 'Kullanıcıyı sunucudan yasaklar.',
    async execute(message, args) {
        if (!message.member.hasPermission('BAN_MEMBERS')) {
            return message.reply('Bu komutu kullanma yetkiniz yok.');
        }

        const user = message.mentions.users.first();
        if (user) {
            const member = message.guild.members.resolve(user);
            if (member) {
                try {
                    await member.ban();
                    message.reply(`${user.tag} kullanıcısı sunucudan yasaklandı.`);
                } catch (error) {
                    console.error(error);
                    message.reply('Bir hata oluştu ve kullanıcı yasaklanamadı.');
                }
            } else {
                message.reply('Kullanıcı bulunamadı.');
            }
        } else {
            message.reply('Yasaklanacak bir kullanıcı etiketleyin.');
        }
    },
};
