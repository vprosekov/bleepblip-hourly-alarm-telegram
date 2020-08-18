# bleepblip-hourly-alarm-telegram
Blip Blip mobile app analogue on Telegram which notifies you every N time
# How to use existing bot

Find @blipblip_notify_bot on Telegram or follow [this link.](https://t.me/blipblip_notify_bot)

# How to run your own

* Open Telegram app and create your own bot and aquire HTTP_API_TOKEN from @botfather
* Clone the repo into desired folder (```git clone https://github.com/vsekov/bleepblip-hourly-alarm-telegram/```)
* Navigate to ```bleepblip-hourly-alarm-telegram``` folder (```cd bleepblip-hourly-alarm-telegram```)
* Open file named ```config.js``` and replace ```YOUR-TOKEN``` with your previously aquired token.
* Make sure that you have Node.js installed and execute ```npm run deploy```
* Optionally consider using ```npm run undeploy``` and ```npm run dev``` if you want to tear down installation or make changes
