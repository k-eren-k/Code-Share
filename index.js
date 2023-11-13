const express = require("express");
const ejs = require("ejs");
const passport = require("passport");
const session = require("express-session");
const bodyParser = require('body-parser');
const { Strategy } = require("passport-discord");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const app = express();
const port = 3001;

// Passport ayarları
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const strategy = new Strategy(
    {
        clientID: "ID",
        clientSecret: "SECRET",
        callbackURL: `CALLBACK`,
        scope: ["identify"],
    },
    (_access_token, _refresh_token, user, done) =>
        process.nextTick(() => done(null, user))
);

passport.use(strategy);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Express ayarları
app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.session());
app.use(passport.initialize());

app.set("view engine", "ejs");

// Discord girişi
app.get("/giris", passport.authenticate("discord", { scope: ["identify"] }));

const usersFilePath = path.join(__dirname, "db", "users.json");
app.get(
    "/callback",
    passport.authenticate("discord", {
        failureRedirect: "/hata",
    }),
    async (req, res) => {
        const user = req.user;

        try {
            // Webhook'u çağırma
            const webhookUrl = "GİRİS_WEBHOOK"; // Webhook URL'sini güncelleyin
            const randomColor = Math.floor(Math.random() * 16777215).toString(16);

            await axios.post(webhookUrl, {
                embeds: [
                    {
                        description: `** > ${user.username} Adlı Kullanıcı Giriş Yaptı <:login:1142189587666587679> **`,
                        color: parseInt(randomColor, 16),
                    },
                ],
            });

            // Kullanıcının bilgilerini JSON dosyasına ekleme
            try {
                let usersData = [];
                const usersFileContent = fs.readFileSync(usersFilePath, "utf8");
                usersData = JSON.parse(usersFileContent);

                // Kullanıcının zaten kaydedilip kaydedilmediğini kontrol et
                const existingUser = usersData.find(u => u.id === user.id);
                if (!existingUser) {
                    const newUser = {
                        id: user.id,
                        username: user.username,
                        avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=80`,
                        banner: "https://codeshare.me/assets/img/profile/profile-cover/profile-cover-big-1.jpg",
                        eklenen_sw: [],
                        eklenen_bot: []
                    };

                    usersData.push(newUser);

                    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 4), "utf8");
                }
            } catch (error) {
                console.error("Dosya işlemleri hatası:", error);
            }
        } catch (error) {
            console.error("Webhook çağrısı başarısız:", error);
        }

        res.redirect("/");
    }
);


const { Client } = require('discord.js');

const client = new Client();


client.once('ready', () => {
    console.log(`Bot ${client.user.tag} olarak giriş yaptı.`);
});
const webhookUrl = "WEBHOOK"; // Webhook URL'sini güncelleyin

app.use(express.static(path.join(__dirname, 'public')));
app.get('/u/ban/:username', async (req, res) => {
    const guildId = 'GUİLD_iD';
    const roleId = 'ROLE_İD';

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        return res.status(404).send('Sunucu bulunamadı.');
    }

    const role = guild.roles.cache.get(roleId);
    if (!role) {
        return res.status(404).send('Rol bulunamadı.');
    }

    const username = req.params.username;
    const member = guild.members.cache.find(member => member.user.username === username);

    if (!member) {
        return res.status(404).send('Kullanıcı bulunamadı.');
    }

    const randomColor = Math.floor(Math.random() * 16777215).toString(16);

    await axios.post(webhookUrl, {
        embeds: [
            {
                description: `** > ${member.user.username} Adlı Kullanıcı Sunucudan Banlandı ⚒ **`,
                color: parseInt(randomColor, 16),
            },
        ],
    });

    member.ban()
        .then(() => {
            console.log(`${member.user.tag} kullanıcısı banlandı.`);
            res.send(`${member.user.tag} kullanıcısı sunucudan banlandı.`);
        })
        .catch(error => {
            console.error('Ban işlemi sırasında hata oluştu:', error);
            res.status(500).send('Ban işlemi sırasında bir hata oluştu.');
        });
});

const isAdmin = (req, res, next) => {
    if (req.user && req.user.id === 'ADMİN_İD') { // KULLANICI_ID, gerçek yönetici kullanıcının ID'si ile değiştirilmelidir
        return next(); // Yönetici ise, sonraki işleme devam et
    } else {
        return res.status(403).send('Bu sayfaya erişim izniniz yok.'); // Yönetici değilse, erişimi reddet
    }
};

app.get("/admin", isAdmin, (req, res) => {
    const guildId = 'GUİLD_İD';
    const roleId = 'ROLE_İD';
    const codesFilePath = 'db/codes.json'; // JSON dosyasının yolu

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        return res.status(404).send('Sunucu bulunamadı.');
    }

    const role = guild.roles.cache.get(roleId);
    if (!role) {
        return res.status(404).send('Rol bulunamadı.');
    }

    // JSON dosyasını okuma işlemi
    fs.readFile(codesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Dosya okuma hatası:', err);
            return res.status(500).send('Dosya okuma hatası.');
        }

        try {
            const codes = JSON.parse(data);

            const membersWithRole = role.members.array();

            res.render("admin_panel.ejs", { user: req.user, members: membersWithRole, roles: guild.roles.cache, codes });
        } catch (error) {
            console.error('JSON ayrıştırma hatası:', error);
            res.status(500).send('JSON ayrıştırma hatası.');
        }
    });
});




app.get('/team', (req, res) => {
    const guildId = 'GUİLD_İD';
    const roleId = 'ROLE_İD';

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        return res.status(404).send('Sunucu bulunamadı.');
    }

    const role = guild.roles.cache.get(roleId);
    if (!role) {
        return res.status(404).send('Rol bulunamadı.');
    }

    const membersWithRole = role.members.array();

    res.render('members.ejs', {  user: req.user, members: membersWithRole });
});


client.login('WEB_SİTE_BOT_TOKEN');


// Express sunucu dinlemesi
app.listen(port, () => {
    console.log(`Site ${port} portunda hazır!`);
});

// Botu başlat
// Botu başlat
app.get("/", (req, res) => {
    const codesFileContent = fs.readFileSync('db/codes.json', 'utf8');
    const codesData = JSON.parse(codesFileContent);

    // Kesfet sayfasına kodları ve diğer bilgileri gönderiyoruz
 
    res.render("index.ejs", { user: req.user, codes: codesData  });
});
app.get("/profile", (req, res) => {
        const codesFileContent = fs.readFileSync('db/codes.json', 'utf8');
        const codesData = JSON.parse(codesFileContent);
        
        // Kullanıcının eklediği kodları çek
        const kullaniciKodlari = codesData.filter(code => code.authorUsername === req.user.username);
        
        res.render("profile.ejs", { user: req.user, kullaniciKodlari });
   
});



    // Kesfet sayfasına kodları ve diğer bilgileri gönderiyoruz

// Botu başlat
const { spawn } = require("child_process");
const botProcess = spawn("node", ["bot.js"]);

botProcess.stdout.on("data", (data) => {
    console.log(`Bot: ${data}`);
});

botProcess.stderr.on("data", (data) => {
    console.error(`Bot Hata: ${data}`);
});// Dosyadan veriyi oku ve kullanıcı sayısını hesapla
try {
    const usersFileContent = fs.readFileSync(usersFilePath, "utf8");
    const usersData = JSON.parse(usersFileContent);
    const userCount = usersData.length;

    console.log(`Toplam kayıtlı kullanıcı sayısı: ${userCount}`);
} catch (error) {
    console.error("Dosya işlemleri hatası:", error);
}app.use(express.json());

app.post('/submit', (req, res) => {
    const { serverName } = req.body;

    if (!serverName) {
        res.status(400).json({ message: 'Lütfen bir sunucu adı girin.' });
        return;
    }

    const serverData = {
        id: Date.now().toString(),
        serverName
    };

    const servers = require('./db/servers.json');
    servers.push(serverData);

    fs.writeFileSync('./db/servers.json', JSON.stringify(servers, null, 2), err => {
        if (err) {
            console.error('Veri dosyasına yazılırken bir hata oluştu:', err);
            res.status(500).json({ message: 'Sunucu hatası: Veri kaydedilemedi.' });
        } else {
            res.status(200).json({ message: 'Sunucu adı başarıyla kaydedildi.' });
        }
    });
});

app.get('/add', (req, res) => {
    res.render('add', { user: req.user }); // add.ejs dosyasını render eder
});// Handle form submission and store data in JSON file

app.post('/ekle', async (req, res) => {
    const currentDate = new Date().toLocaleDateString('tr-TR'); // Get the current date in the format "dd/mm/yyyy"
    const authorAvatar = `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.webp?size=80`;

    const newData = {
        codeName: req.body.codeName.toLowerCase(),
        shortDescription: req.body.shortDescription,
      
        authorId: req.user.id,
        authorUsername: req.user.username,
        licenseType: req.body.licenseTypeSc,
        codeType: req.body.codeTypeSc,
        viewCount: 0,
        codeMain: req.body.codeMain, // Assuming the textarea's name is "codeMain"
        komutlar: req.body.cmd, // Assuming the textarea's name is "komutlar"
        moduller: req.body.modules, // Assuming the textarea's name is "moduller"
        authorAvatar: authorAvatar,
        addDate: currentDate // Add the current date to the addDate field
    };

    try {
        const codesFileContent = fs.readFileSync('db/codes.json', 'utf8');
        const codesData = JSON.parse(codesFileContent);

        codesData.push(newData);

        fs.writeFileSync('db/codes.json', JSON.stringify(codesData, null, 2), 'utf8');

        const webhookUrl = 'PAYLASTI_WEBHOOK'; // Webhook URL'sini buraya girin
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);

        await axios.post(webhookUrl, {
            embeds: [
                {
                    description: `** > ${req.user.username} Adlı Kullanıcı Yeni Bir Kod Ekledi <:add:1142938411242627132> **`,
                    color: parseInt(randomColor, 16),
                },
            ],
        });

        const updatedCodesFileContent = fs.readFileSync('db/codes.json', 'utf8');
        const updatedCodesData = JSON.parse(updatedCodesFileContent);
        // Burada res.render işlemini yapabilirsiniz, kodunuzun geri kalan kısmını buraya eklemelisiniz.

        res.json({ message: 'Kod Başarılı Şekilde Sisteme Eklendi!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Kod Sisteme Eklenmemiş Ola Bilir :D' });
    }
});

function getTodayAddedCodes(codes) {
    const currentDate = new Date().toLocaleDateString('tr-TR'); // Get the current date in "dd/mm/yyyy" format
    return codes.filter(code => code.addDate === currentDate);
}

app.post('/kod/:codeName/sil', (req, res) => {
    const codeName = req.params.codeName;

    try {
        const codesFileContent = fs.readFileSync('db/codes.json', 'utf8');
        const codesData = JSON.parse(codesFileContent);

        // İlgili kodu bul ve sil
        const updatedCodesData = codesData.filter(code => code.codeName !== codeName);

        // Güncellenmiş kodları dosyaya yaz
        fs.writeFileSync('db/codes.json', JSON.stringify(updatedCodesData, null, 2), 'utf8');

        res.redirect('/admin'); // Admin paneline geri yönlendir
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Kod çıkartma hatası.' });
    }
});

const codesFileContent = fs.readFileSync('db/codes.json', 'utf8');
const codesData = JSON.parse(codesFileContent);
const authorInfo = codesData.map(code => ({
    authorId: code.authorId,
    authorUsername: code.authorUsername
}));
app.get('/u/:username/:codeName', (req, res) => {
    const username = req.params.username;
    const codeName = req.params.codeName;
    // Convert codeName to a URL-friendly format
    const formattedCodeName = codeName.replace(/-/g, ' '); // Replace dashes with spaces

    // Check if user is authenticated
    if (!req.user) {
        return res.render("not.ejs", { user: req.user }); // If not authenticated, render the 'not.ejs' view
    }

    // Fetch code details using the username and formatted codeName
    const codesFileContent = fs.readFileSync('db/codes.json', 'utf8');
    const codesData = JSON.parse(codesFileContent);
    const codeIndex = codesData.findIndex(code => code.authorUsername === username && code.codeName === formattedCodeName);

    if (codeIndex === -1) {
        return res.status(404).send('Code not found'); // Return the 404 response and stop execution
    }

    const viewedByUser = codesData[codeIndex].viewedByUsers || [];

    // Check if the current user's ID is in the viewedByUsers array
    if (!viewedByUser.includes(req.user.id)) {
        // Increment view count and update JSON data
        codesData[codeIndex].viewCount++;
        viewedByUser.push(req.user.id);
        codesData[codeIndex].viewedByUsers = viewedByUser;

        fs.writeFileSync('db/codes.json', JSON.stringify(codesData, null, 2));
    }

    res.render('codewiew.ejs', { user: req.user, codeDetails: codesData[codeIndex] });
});




app.get('/ara', (req, res) => {
    try {
        const searchTerm = req.query.q; // Get the search term from the query parameter 'q'
        const codeType = req.query.codeType; // Get the selected code type from the query parameter 'codeType'

        // Read codes data from the JSON file
        const codesFileContent = fs.readFileSync('db/codes.json', 'utf8');
        const codesData = JSON.parse(codesFileContent);

        // Filter codes based on the search term and code type
        const filteredCodes = codesData.filter(code => {
            // Search in lowercase to make the search case-insensitive
            return code.codeName.toLowerCase().includes(searchTerm.toLowerCase()) && 
                   (codeType === 'diger' || code.codeType === codeType);
        });

        res.render('kesfet', { codes: filteredCodes, codes: codesData }); // Pass the filtered codes to the template
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Veri okuma hatası.' });
    }
});


app.get('/kesfet', (req, res) => {
    try {
        
        // db/codes.json dosyasını okuyarak kodları alıyoruz
        const codesFileContent = fs.readFileSync('db/codes.json', 'utf8');
        const codesData = JSON.parse(codesFileContent);

        // Kesfet sayfasına kodları ve diğer bilgileri gönderiyoruz
        res.render('kesfet', { user: req.user, codes: codesData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Veri okuma hatası.' });
    }
});
function updateUserInformation() {
    try {
      const usersFileContent = fs.readFileSync(usersFilePath, "utf8");
      usersData = JSON.parse(usersFileContent);
    } catch (error) {
      console.error("Error updating user information:", error);
    }
  }
  
  // Initial update of user information
  updateUserInformation();
  
  // Set up a periodic task to update user information every 10 seconds
  const updateInterval = 1 * 1000; // 10 seconds in milliseconds
  setInterval(updateUserInformation, updateInterval);
  
  // Define the user profile route
  app.get('/u/:kullaniciadi', (req, res) => {
    const kullaniciAdi = req.params.kullaniciadi;
  
    // Kullanıcı adına göre ilgili kullanıcıyı bul
    const kullanici = usersData.find(user => user.username === kullaniciAdi);
  
    if (kullanici) {
      // Kullanıcının eklediği kodları çek
      const kullaniciKodlari = codesData.filter(code => code.authorUsername === kullanici.username);
  
      res.render('user_wiew', { user: kullanici, kullaniciKodlari });
    } else {
      res.status(404).send('Kullanıcı bulunamadı');
    }
  });
  app.get("/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Çıkış hatası:", err);
        return res.redirect("/");
      }
  
      req.session.destroy((err) => {
        if (err) {
          console.error("Oturum yok etme hatası:", err);
          return res.redirect("/");
        }
  
        console.log(
          `Kullanıcı çıkış yaptı: ${req.user ? req.user.username : "Misafir"}`
        );
        res.redirect("/");
      });
    });
  });
  // Add this code after your existing routes and before the server listen code


// isAdmin middleware'i yalnızca yönetici olan kullanıcılar için çalışır




app.post('/report', (req, res) => {
    const reportText = req.body.reportText;

    // You can use the 'axios' library to send a message to the webhook
    const webhookUrl = 'REPORT_WEBHOOK';
    axios.post(webhookUrl, {
        content: `User reported: ${reportText}`
    }).then(response => {
        console.log('Webhook message sent:', response.data);
        res.status(200).send('Report submitted successfully.');
    }).catch(error => {
        console.error('Error sending webhook message:', error);
        res.status(500).send('Error submitting report.');
    });
});
const codesFilePath = path.join(__dirname, "db", "codes.json");

app.get('/getTotalUserCount', (req, res) => {
    try {
        const usersFileContent = fs.readFileSync(usersFilePath, "utf8");
        const usersData = JSON.parse(usersFileContent);
        const totalUserCount = usersData.length;
        res.json({ totalUserCount });
    } catch (error) {
        console.error('Veri alınamadı:', error);
        res.status(500).json({ error: 'Veri alınamadı' });
    }
});


app.get('/getTotalCodeCount', (req, res) => {
    try {
        const codesFileContent = fs.readFileSync(codesFilePath, "utf8");
        const codesData = JSON.parse(codesFileContent);
        const totalCodeCount = codesData.length;
        res.json({ totalCodeCount });
    } catch (error) {
        console.error('Veri alınamadı:', error);
        res.status(500).json({ error: 'Veri alınamadı' });
    }
});

