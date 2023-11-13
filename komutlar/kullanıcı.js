const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
    name: 'kullanıcı',
    description: 'Belirtilen kullanıcının kod sayısını ve kod linklerini gösterir.',
    execute(message, args) {
        // Etiketlenen kullanıcıyı al
        const mentionedUser = message.mentions.users.first();

        if (!mentionedUser) {
            return message.reply('Lütfen bir kullanıcı etiketleyin.');
        }

        // Kullanıcının kodlarını içeren JSON dosyasını oku
        const codesFileContent = fs.readFileSync('db/codes.json', 'utf8');
        const codesData = JSON.parse(codesFileContent);

        // Kullanıcının kodlarını filtrele
        const userCodes = codesData.filter(code => code.authorId === mentionedUser.id);

        // Kullanıcının kod sayısı ve kod linklerini oluştur
        const codeCount = userCodes.length;
        const codeLinks = userCodes.map(code => `Kod Adı: ${code.codeName}, Link: ${code.codeLink}`).join('\n');

        // Mesajı oluştur ve gönder
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Kullanıcının Kodları`)
            .setDescription(`${mentionedUser.tag} adlı kullanıcının ${codeCount} adet kodu bulunuyor:\n\n${codeLinks}`);

        message.channel.send(embed);
    },
};
