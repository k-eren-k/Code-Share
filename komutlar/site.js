const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const usersDB = require('../db/users.json');

module.exports = {
  name: 'site',
  description: 'Sitede kayıtlı kullanıcı sayısını ve kullanıcıları gösterir.',
  execute(message, args) {
    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Site Kullanıcıları')
      .setDescription(`Sitede kayıtlı kullanıcı sayısı: ${usersDB.length}`)
      .addField('Kullanıcılar:', formatUsers(usersDB))
      .setTimestamp()
      .setFooter('Site Komutu', message.client.user.displayAvatarURL());

    message.channel.send(embed);
  },
};

function formatUsers(users) {
  let formatted = '';
  users.forEach((user, index) => {
    formatted += `${index + 1}. ${user.username}\n`;
  });
  return formatted;
}
