const Discord = require('discord.js');
const config = require('./config/ayar.json');
const prefix = '!'; // Botunuzun komut öneki

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./komutlar').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./komutlar/${file}`);
  client.commands.set(command.name, command);
}

client.on('ready', () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı.`);
  client.user.setActivity('Prefix: !', { type: 'PLAYING' });

});
client.on('guildMemberAdd', member => {
  console.log(`Kullanıcı giriş yaptı: ${member.user.tag}`);
  
  const logChannelID = 'BURAYA_LOG_KANALININ_IDSI'; // Log kanalının ID'si
  const logChannel = member.guild.channels.cache.get(logChannelID);
  
  if (logChannel) {
    logChannel.send(`Kullanıcı giriş yaptı: ${member.user.tag}`);
  }
});

client.on('message', async message => {
  if (message.author.bot) return;

  // Komut işlemleri
  if (message.content.startsWith(config.prefix)) {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (client.commands.has(commandName)) {
      const command = client.commands.get(commandName);

      try {
        command.execute(message, args);
      } catch (error) {
        console.error(error);
        message.reply('Komut çalıştırılırken bir hata oluştu.');
      }
    }
  }
  client.on('guildMemberAdd', member => {
    console.log(`Kullanıcı giriş yaptı: ${member.user.tag}`);
    // İstediğiniz işlemleri burada yapabilirsiniz, örneğin bir log kanalına mesaj göndermek
    const logChannel = member.guild.channels.cache.find(channel => channel.name === 'log');
    if (logChannel) {
        logChannel.send(`Kullanıcı giriş yaptı: ${member.user.tag}`);
    }
});
  // Veritabanı işlemleri
  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'set') {
      // Örnek: !set anahtar değer
      const key = args[0];
      const value = args.slice(1).join(' ');

      db.set(key, value);
      message.channel.send(`Anahtar "${key}" için değer "${value}" olarak ayarlandı.`);
    } else if (command === 'get') {
      // Örnek: !get anahtar
      const key = args[0];

      const value = db.get(key);
      if (value === undefined) {
        message.channel.send(`Anahtar "${key}" için bir değer bulunamadı.`);
      } else {
        message.channel.send(`Anahtar "${key}" için değer: "${value}"`);
      }
    } else if (command === 'delete') {
      // Örnek: !delete anahtar
      const key = args[0];

      db.delete(key);
      message.channel.send(`Anahtar "${key}" ve değeri silindi.`);
    }
  }
});
client.on('message', message => {
  if (message.content === '!logo') {
      // Sunucunun avatarını al ve gönder
      if (message.guild.iconURL()) {
          const embed = new Discord.MessageEmbed()
              .setTitle(`${message.guild.name} Sunucusunun Logosu`)
              .setImage(message.guild.iconURL({ dynamic: true, size: 4096 }))
              .setColor('#0099ff');
          
          message.channel.send(embed);
      } else {
          message.channel.send('Sunucunun bir logosu bulunmuyor.');
      }
  }
});
client.login(config.token);
