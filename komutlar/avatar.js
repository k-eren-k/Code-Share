const Discord = require('discord.js');

module.exports = {
    name: 'avatar',
    description: 'Etiketlenen kullanıcının veya komutu kullanan kullanıcının avatarını gösterir.',
    execute(message, args) {
        // Etiketlenen kullanıcıyı veya komutu kullanan kullanıcıyı al
        const user = message.mentions.users.first() || message.author;

        // Kullanıcının avatar URL'sini al
        const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

        // Mesajı oluştur ve gönder
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${user.tag} Adlı Kullanıcının Avatarı`)
            .setImage(avatarURL);

        message.channel.send(embed);
    },
};
