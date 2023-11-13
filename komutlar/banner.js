const Discord = require('discord.js');

module.exports = {
    name: 'banner',
    description: 'Sunucunun banner resmini gösterir.',
    async execute(message, args) {
        const user = message.mentions.users.first() || message.author;

        // Sunucunun bilgilerini al
        const guild = message.guild;
        await guild.fetch();

        // Sunucunun banner URL'sini al
        const bannerURL = guild.bannerURL({ format: 'png', size: 2048 });

        if (!bannerURL) {
            return message.reply('Bu sunucunun bir banner resmi bulunmuyor.');
        }

        // Mesajı oluştur ve gönder
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${guild.name} Sunucu Bannerı`)
            .setImage(bannerURL);

        message.channel.send(embed);
    },
};
