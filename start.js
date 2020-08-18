/*
    Данные хранятся в json файле

    Начать: "Представление. Для включения BleepBlop напишите /startwork. 
        Для выключения BleepBlop напишите /stop. 
        Для установки интервала напоминаний напишите /set [время в минутах]. 
        Для сброса бота напишите /restart"
    

*/

let { TOKEN } = require('./config');


var fs = require("fs");



try {
    var cc = fs.readFileSync("./db.json");
    var db = JSON.parse(cc);
    //console.log(db)
} catch (err) {
    /*
    console.log('JSON file is not valid, eliminate this error and run bot again.');
    require('process').exit();
    */
    db = {
        "users": {}
    };
}

async function saveDb()
{
	fs.writeFile('db.json', JSON.stringify(db, null, '\t'), function(err) {
		if(err) throw err;
	});
	return true;
}

setInterval(async () => {
    await saveDb();
	console.log('saved');
}, 3000);

function length(obj) {
    return Object.keys(obj).length;
}

const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const session = require('telegraf/session');
const { reply } = Telegraf

const bot = new Telegraf(TOKEN)

let keyboard = {
    "lang_choice": [["English"], ["Русский"]],
    "ru": {
        "kbstart": [[ "/startwork", "/stop"], ["❓Помощь"]]
    },
    
    "en": {
        "kbstart": [[ "/startwork", "/stop"], ["❓Guide"]]
    }
};

let timersDict = {};

//timer class
class timer {
    constructor(bot, chat_id, interval) {
        this.bot = bot;
        this.chat_id = chat_id;
        this.interval = interval;
        this.init(); // инициировать таймер при создании объекта
    }
    init () {
        this.timer = setInterval(() => {
           this.notify();
        }, this.interval*60000);
    }
    notify () {
        if(db.users[this.chat_id]){
            //creates object with every time notify
    
            switch(db.users[this.chat_id].language){
                case 'en':
                    return this.bot.telegram.sendMessage(this.chat_id, `🔔Notify
        I notify you every ${this.interval} minutes.
        To stop notify type me /stop command`, Markup.keyboard(keyboard["en"].kbstart).oneTime().resize().extra());
                case 'ru':
                    return this.bot.telegram.sendMessage(this.chat_id, `🔔Оповещение
        Я оповещаю тебя каждые ${this.interval} минут.
        Для приостановки работы оповещений напиши мне команду /stop`, Markup.keyboard(keyboard["ru"].kbstart).oneTime().resize().extra());
            }
        }
        else {
            this.destroyTimer();
        }
    }
    destroyTimer() {
        clearInterval(this.timer);
        delete this;
    }
  }

for (var i in db.users) {
    if(db.users[i].active) {
        try {
            switch(db.users[i].language){
                case 'en':
                    bot.telegram.sendMessage(i, `🔔Notify
        I notify you every ${db.users[i].interval} minutes.
        To stop notify type me /stop command`, Markup
        .keyboard(keyboard["en"].kbstart).oneTime().resize().extra());
                    break;
                case 'ru':
                    bot.telegram.sendMessage(i, `🔔Оповещение
        Я оповещаю тебя каждые ${db.users[i].interval} минут.
        Для приостановки работы оповещений напиши мне команду /stop`, Markup
        .keyboard(keyboard["ru"].kbstart).oneTime().resize().extra());
                break;
            }
        }
        catch(err) {
            console.log("err");
            db.users[i].active = false
            continue
        }
        console.log('ok')
        timersDict[i] = new timer(bot, i, db.users[i].interval)
    }
} 





// // Register session middleware
bot.use(session())

// Register logger middleware
bot.use((msg, next) => {
  const start = new Date()
  return next().then(() => {
    const ms = new Date() - start
    console.log('response time %sms', ms)
  })
})

// Login widget events
bot.on('connected_website', ({ reply }) => reply('Website connected'))
// Telegram passport events
bot.on('passport_data', ({ reply }) => reply('Telegram password connected'))

bot.command('start', (msg) => {
    if(db.users[msg.message.chat.id] && db.users[msg.message.chat.id].username==msg.message.chat.username){
        switch(db.users[msg.message.chat.id].language){
            case 'en':
                return msg.reply(`👋Hello, ${msg.message.from.first_name}!
    I am Blip Blop bot and I can notify you every N time
    
    Type /startwork to start working
    Type /stop to stop working
    Type /set [minutes] to set interval for notify
    Type /restart to restart`, Markup.keyboard(keyboard["en"].kbstart).oneTime().resize().extra());
            case 'ru':
                return msg.reply(`👋Привет, ${msg.message.from.first_name}!
    Я бот Блип Блоп, буду напоминать вам каждое N время\nПожалуйста, выбери свой язык
    
    Напиши /startwork для начала работы
    Напиши /stop для завершения работы
    Напиши /set [минуты] для установки интервала
    Напиши /restart для перезапуска бота`, Markup.keyboard(keyboard["ru"].kbstart).oneTime().resize().extra());
        }
    }
    else return msg.reply('👋Hello, ' + msg.message.from.first_name + '!\n I am Blip Blop bot and I can notify you every N time\nPlease, select language before start\n\n👋Привет, ' + msg.message.from.first_name + '!\n Я бот Блип Блоп, буду напоминать вам каждое N время\nПожалуйста, выбери свой язык', Markup.keyboard(keyboard["lang_choice"]).oneTime().resize().extra());
});


// Text messages handling
bot.hears('English', (msg) => {
    if(db.users[msg.message.chat.id] && db.users[msg.message.chat.id].username==msg.message.chat.username) {
        db.users[msg.message.chat.id].language = "en";
    }
    else {
        db.users[msg.message.chat.id] = {
            "username": msg.message.chat.username,
            "language": "en",
            "interval": 60,
            "active": false
        };
    }

    return msg.reply(`👋Hello, ${msg.message.from.first_name}!
    I am Blip Blop bot and I can notify you every N time
    
    Type /startwork to start working
    Type /stop to stop working
    Type /set [minutes] to set interval for notify
    Type /restart to restart`, Markup.keyboard(keyboard["en"].kbstart).oneTime().resize().extra());
})

bot.hears('Русский', (msg) => {
    if(db.users[msg.message.chat.id] && db.users[msg.message.chat.id].username==msg.message.chat.username) {
        db.users[msg.message.chat.id].language = "ru";
    }
    else {
        db.users[msg.message.chat.id] = {
            "username": msg.message.chat.username,
            "language": "ru",
            "interval": 60,
            "active": false
        };
    }

    return msg.reply(`👋Привет, ${msg.message.from.first_name}!
    Я бот Блип Блоп, буду напоминать вам каждое N время
    
    Напиши /startwork для начала работы
    Напиши /stop для завершения работы
    Напиши /set [минуты] для установки интервала
    Напиши /restart для перезапуска бота`, Markup.keyboard(keyboard["ru"].kbstart).oneTime().resize().extra());
})



bot.hears('❓Guide', (msg) => {
    if(db.users[msg.message.chat.id] && db.users[msg.message.chat.id].username==msg.message.chat.username){
        switch(db.users[msg.message.chat.id].language){
            case 'en':
                return msg.reply(`👋Hello, ${msg.message.from.first_name}!
    I am Blip Blop bot and I can notify you every N time
    
    Type /startwork to start working
    Type /stop to stop working
    Type /set [minutes] to set interval for notify
    Type /restart to restart`, Markup.keyboard(keyboard["en"].kbstart).oneTime().resize().extra());
            case 'ru':
                return msg.reply(`👋Привет, ${msg.message.from.first_name}!
    Я бот Блип Блоп, буду напоминать вам каждое N время\nПожалуйста, выбери свой язык
    
    Напиши /startwork для начала работы
    Напиши /stop для завершения работы
    Напиши /set [минуты] для установки интервала
    Напиши /restart для перезапуска бота`, Markup.keyboard(keyboard["ru"].kbstart).oneTime().resize().extra());
        }
    }
    else return msg.reply('👋Hello, ' + msg.message.from.first_name + '!\n I am Blip Blop bot and I can notify you every N time\nPlease, select language before start\n\n👋Привет, ' + msg.message.from.first_name + '!\n Я бот Блип Блоп, буду напоминать вам каждое N время\nПожалуйста, выбери свой язык', Markup.keyboard(keyboard["lang_choice"]).oneTime().resize().extra());
})

bot.hears('❓Помощь', (msg) => {
    if(db.users[msg.message.chat.id] && db.users[msg.message.chat.id].username==msg.message.chat.username){
        switch(db.users[msg.message.chat.id].language){
            case 'en':
                return msg.reply(`👋Hello, ${msg.message.from.first_name}!
    I am Blip Blop bot and I can notify you every N time
    
    Type /startwork to start working
    Type /stop to stop working
    Type /set [minutes] to set interval for notify
    Type /restart to restart`, Markup.keyboard(keyboard["en"].kbstart).oneTime().resize().extra());
            case 'ru':
                return msg.reply(`👋Привет, ${msg.message.from.first_name}!
    Я бот Блип Блоп, буду напоминать вам каждое N время\nПожалуйста, выбери свой язык
    
    Напиши /startwork для начала работы
    Напиши /stop для завершения работы
    Напиши /set [минуты] для установки интервала
    Напиши /restart для перезапуска бота`, Markup.keyboard(keyboard["ru"].kbstart).oneTime().resize().extra());
        }
    }
    else return msg.reply('👋Hello, ' + msg.message.from.first_name + '!\n I am Blip Blop bot and I can notify you every N time\nPlease, select language before start\n\n👋Привет, ' + msg.message.from.first_name + '!\n Я бот Блип Блоп, буду напоминать вам каждое N время\nПожалуйста, выбери свой язык', Markup.keyboard(keyboard["lang_choice"]).oneTime().resize().extra());
})

bot.hears(/^(?:\/set)\s(.*)$/i, (msg) => {
    let message = msg.message.text.split(' ')
    if(db.users[msg.message.chat.id] && db.users[msg.message.chat.id].username==msg.message.chat.username){

        if(!Number(message[1])) return;
        message[1] = Math.floor(Number(message[1]));

        if(message[1] <= 0) return;


        switch(db.users[msg.message.chat.id].language){
            case 'en':
                if(db.users[msg.message.chat.id].active){
                    return msg.reply(`First, stop notifier with /stop command`, Markup.keyboard(keyboard["en"].kbstart).oneTime().resize().extra());
                }
                db.users[msg.message.chat.id].interval = message[1]
                return msg.reply(`You set ${message[1]} minutes interval.`, Markup.keyboard(keyboard["en"].kbstart).oneTime().resize().extra());
            case 'ru':
                if(db.users[msg.message.chat.id].active){
                    return msg.reply(`Сначала остановите бота с помощью команды /stop`, Markup.keyboard(keyboard["en"].kbstart).oneTime().resize().extra());
                }
                db.users[msg.message.chat.id].interval = message[1]
                return msg.reply(`Выставлен интервал в ${message[1]} минут.`, Markup.keyboard(keyboard["ru"].kbstart).oneTime().resize().extra());
        }
    }
    else return msg.reply('👋Hello, ' + msg.message.from.first_name + '!\n I am Blip Blop bot and I can notify you every N time\nPlease, select language before start\n\n👋Привет, ' + msg.message.from.first_name + '!\n Я бот Блип Блоп, буду напоминать вам каждое N время\nПожалуйста, выбери свой язык', Markup.keyboard(keyboard["lang_choice"]).oneTime().resize().extra());
})

bot.command('startwork', (msg) => {
    if(db.users[msg.message.chat.id] && db.users[msg.message.chat.id].username==msg.message.chat.username){

        

        switch(db.users[msg.message.chat.id].language){
            case 'en':
                if(db.users[msg.message.chat.id].active) return msg.reply(`You have already started notifier with ${db.users[msg.message.chat.id].interval} minutes delay.\nTo stop notify type me /stop command`, Markup.keyboard(keyboard["en"].kbstart).oneTime().resize().extra());
                
                timersDict[msg.message.chat.id] = new timer(bot, msg.message.chat.id, db.users[msg.message.chat.id].interval)

                db.users[msg.message.chat.id].active = true;

                return msg.reply(`I notify you every ${db.users[msg.message.chat.id].interval} minutes.
    To stop notify type me /stop command`, Markup.keyboard(keyboard["en"].kbstart).oneTime().resize().extra());
            case 'ru':
                if(db.users[msg.message.chat.id].active) return msg.reply(`У тебя уже включён оповещатель с интервалом ${db.users[msg.message.chat.id].interval} минут.\nДля приостановки работы оповещений напиши мне команду /stop`, Markup.keyboard(keyboard["en"].kbstart).oneTime().resize().extra());

                timersDict[msg.message.chat.id] = new timer(bot, msg.message.chat.id, db.users[msg.message.chat.id].interval)

                db.users[msg.message.chat.id].active = true;

                return msg.reply(`Я буду оповещать тебя каждые ${db.users[msg.message.chat.id].interval} минут.
    Для приостановки работы оповещений напиши мне команду /stop`, Markup.keyboard(keyboard["ru"].kbstart).oneTime().resize().extra());
        }
    }
    else return msg.reply('👋Hello, ' + msg.message.from.first_name + '!\n I am Blip Blop bot and I can notify you every N time\nPlease, select language before start\n\n👋Привет, ' + msg.message.from.first_name + '!\n Я бот Блип Блоп, буду напоминать вам каждое N время\nПожалуйста, выбери свой язык', Markup.keyboard(keyboard["lang_choice"]).oneTime().resize().extra());
});






bot.command('stop', (msg) => {
    if(db.users[msg.message.chat.id] && db.users[msg.message.chat.id].username==msg.message.chat.username){

        

        switch(db.users[msg.message.chat.id].language){
            case 'en':
                if(!db.users[msg.message.chat.id].active) return msg.reply(`You have already stopped notifier.\nTo start notify type me /startwork command`, Markup.keyboard(keyboard["en"].kbstart).oneTime().resize().extra());
                
                timersDict[msg.message.chat.id].destroyTimer()
                delete timersDict[msg.message.chat.id]

                db.users[msg.message.chat.id].active = false;
                return msg.reply(`🔕Notifier was turned off.\nTo start notify type me /startwork command`, Markup.keyboard(keyboard["en"].kbstart).oneTime().resize().extra());
            case 'ru':
                if(!db.users[msg.message.chat.id].active) return msg.reply(`У тебя уже выключён оповещатель.\nДля начала работы оповещений напиши мне команду /startwork`, Markup.keyboard(keyboard["en"].kbstart).oneTime().resize().extra());

                timersDict[msg.message.chat.id].destroyTimer()
                delete timersDict[msg.message.chat.id]

                db.users[msg.message.chat.id].active = false;

                return msg.reply(`🔕Оповещатель успешно отключён.\nДля начала работы оповещений напиши мне команду /startwork`, Markup.keyboard(keyboard["ru"].kbstart).oneTime().resize().extra());
        }
    }
    else return msg.reply('👋Hello, ' + msg.message.from.first_name + '!\n I am Blip Blop bot and I can notify you every N time\nPlease, select language before start\n\n👋Привет, ' + msg.message.from.first_name + '!\n Я бот Блип Блоп, буду напоминать вам каждое N время\nПожалуйста, выбери свой язык', Markup.keyboard(keyboard["lang_choice"]).oneTime().resize().extra());
});


bot.command('restart', (msg) => {
    if(db.users[msg.message.chat.id] && db.users[msg.message.chat.id].username==msg.message.chat.username){
        if(db.users[msg.message.chat.id].active){
            timersDict[msg.message.chat.id].destroyTimer()
            delete timersDict[msg.message.chat.id]
        }
        delete db.users[msg.message.chat.id]
        return msg.reply('👋Hello, ' + msg.message.from.first_name + '!\n I am Blip Blop bot and I can notify you every N time\nPlease, select language before start\n\n👋Привет, ' + msg.message.from.first_name + '!\n Я бот Блип Блоп, буду напоминать вам каждое N время\nПожалуйста, выбери свой язык', Markup.keyboard(keyboard["lang_choice"]).oneTime().resize().extra());
    }
    else return msg.reply('👋Hello, ' + msg.message.from.first_name + '!\n I am Blip Blop bot and I can notify you every N time\nPlease, select language before start\n\n👋Привет, ' + msg.message.from.first_name + '!\n Я бот Блип Блоп, буду напоминать вам каждое N время\nПожалуйста, выбери свой язык', Markup.keyboard(keyboard["lang_choice"]).oneTime().resize().extra());
});







// Look ma, reply middleware factory
bot.command('foo', reply('http://coub.com/view/9cjmt'))

// Wow! RegEx
bot.hears(/reverse (.+)/, ({ match, reply }) => reply(match[1].split('').reverse().join('')))

// Launch bot
bot.launch()
