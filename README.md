# 🖨 LocalPrinter

LocalPrinter can receive messages on Telegram, get news headlines, spotify playlist updates, weather forcasts, daily quotes and more. All fetching, processing and rendering is done on the device, no server needed.

By default it automatically prints an update issue every morning at 7am and a full issue when the button is pushed.

**🚨 Pre Release: This project is under active development. It's likely to break at any time (or be broken right now).**

## Demo

Demo images here.

## 🛠 Parts

* Raspberri Pi Zero 2 W
* Cashino thermal printer
  * [CSN-A2](https://www.alibaba.com/product-detail/2-Inch-58mm-Thermal-Embedded-Kiosk_1600327916804.html) (mine, you can also find this at UK/US suppliers under the name Adafruit Mini Thermal Printer but a lot cheaper to order a sample unit from Alibaba)
  * [CSN-A2L](https://www.alibaba.com/product-detail/Cashino-CSN-A2-2inch-58mm-Kiosk_1600441215807.html?spm=a2700.galleryofferlist.normal_offer.d_title.658922e1AFb4oR) (slightly smaller form factor)
  * [DB-486F](https://www.cashinotech.com/58mm-thermal-printer-control-board-db-486f_p57.html) (printer guts only)
* 9V-5V step down ([mine](https://www.ebay.co.uk/itm/193632397779))
* Momentary button with LED ([mine](https://www.ebay.co.uk/itm/183415145654))
* 2.1mm DC panel mount ([mine](https://www.ebay.co.uk/itm/362281631986))
* 9V 2A power supply ([mine](https://www.ebay.co.uk/itm/203296688898))
* 4700uf capacitor ([mine](https://www.ebay.co.uk/itm/255081124842?var=555061255318))
* Strip board, electrical wire & soldering iron
* Wooden box

## 🧑‍💻 Prerequisites

* [Enable the serial port](https://learn.adafruit.com/adafruits-raspberry-pi-lesson-5-using-a-console-cable/enabling-serial-console#option-2-enabling-via-raspi-config-1961278-5)
* Install `nodejs`
  * `curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -`
  * `apt-get install -y nodejs`
* Install `canvas` dependancies: `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`

## 📂 Installation

Clone the repository, create a config file according to the below and `npm install`. You can also enable `DEV_MODE` to skip printing and render straight to file for testing.

I also recommend installing Tailscale + SSH to make managing the printer remotely easier (expecially if you're making one for a friend).

## ⏯ Running

Run with `node index.js`. 

### Running as a service

You can keep the printer running and launch at boot by creating a service:

```
sudo nano /lib/systemd/system/localprinter.service
```

You may need to change the `ExecStart` path below depending on where you cloned the repository.

```
[Unit]
Description=localprinter
Documentation=https://github.com/0x62/LocalPrinter
After=network.target

[Service]
Type=simple
User=pi
ExecStart=/usr/bin/node /home/pi/LocalPrinter/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Reload and start the service

```
sudo systemctl daemon-reload
sudo systemctl start localprinter
```

## 💻 Hardware

Hardware is heavily based on the [Adafruit IoT printer](https://learn.adafruit.com/pi-thermal-printer), with the addition of a 9V power supply for the printer (and step down to 5V for Pi).

Connect the data port on the printer to the Pi GND, GPIO14 and GPIO15. Connect the printer power to 9V power supply. You can actually power the printer off 5V if you need to, but the print quality is much better with more power.

Connect the button to GPIOX, GPIOY, and the LED+ to GPIOZ (if applicable). A button with LED isn't required, but recomended as the LED will flash to indicate activity.

## ⚙️ Configuration

You need to create a `.env` file with the following options:

```
# Required
# =========

# Serial port
SERIAL_PORT = "/dev/serial0"

# Delete rendered issue after printing
DELETE_AFTER_PRINT = true

# Set to true to disable printing and automatic delete (see `output/`)
DEV_MODE = false

# Issue header
ISSUE_TITLE_FULL = "THE DAILY 0x62"
ISSUE_TITLE_UPDATE = "YOU'VE GOT MAIL"
ISSUE_DATE_FMT = "MMMM Do YYYY, hA"

# Time of day to print automatic issue
AUTO_ISSUE_TIME = "7:00"
# Type of automatic issue
# update = only print if there are updates
# full = print last update from all modules
AUTO_ISSUE_TYPE = "update"

# Type of issue to print when pushing button
BUTTON_TYPE = "full"

# Modules (provide all options to enable)
# =======================================

# Monitor a playlist and print 3 new songs a day
SPOTIFY_CLIENT_ID = ""
SPOTIFY_SECRET = ""
SPOTIFY_PLAYLIST = "" # Playlist ID (public only)

# Instagram user to print each new post in daily update
# Public profiles only & endpoint is highly rate limited
# will probably break at some point
INSTAGAM_USER = ""

# Print messages received to Telegram bot
TELEGRAM_TOKEN = ""
TG_ALLOWED_IDS = "" # Comma seperated
TG_IMMEDIATE = true # Print received messages immediately, rather than in next update

# Headlines from The Guardian
GUARDIAN_TOKEN = ""

# Weather and rain/snow alerts
OPENWEATHER_TOKEN = ""
WEATHER_CITY = ""

# Daily quote
# Expects a CSV with quote, author (optional)
# Will randomly pick unseen options until all are used and reset
QUOTE_DB = "./data/quotes.csv"
QUOTE_IS_UPDATE = false # Set to true to still print this if no other providers have updates 
```

## 📰 Issue types

There are two kinds of issue, `full` and `update`. Full issues print content from every module
regardless of whether there are updates (in this case it'll use the most recent data), and update
issues only include modules where there is an update.

There is also a special kind of issue used for real-time modules like the Telegram bot, which print
immediately after receiving an update. Unlike `full` or `update`, these issues do not increment the
issue number, and don't include the header/footer.

## Modules

### 🎶 Spotify

Monitor a Spotify playlist for changes, and include new songs in update issues. At most three new 
songs will be printed (oldest first). If more than three songs have been added since the last update
the next three songs will be printed in the following update (allowing you to add many at a time
without printing them all).

### 📸 Instagram

Prints out your latest post the following morning. This module uses an undocumented Instagram API
(instagram.com/username/?\_\_a=1), which works well but is highly rate limited (a few calls an hour).
Expect this module to break during development.

### 💬 Telegram

Prints out messages and images received to a Telegram bot. The first time you message the bot it
will reply with your user ID. Add this ID (and any friends) to `TG_ALLOWED_IDS` to grant permission. 

You can also disable immediate printing (and only include new messages in update/full issues) by
setting `TG_IMMEDIATE = false`.

I'd like to add some other commands to this bot in future, e.g. printing out a custom message with
the same renderer as the Quotes module (for massive poster-style text).

### 🌦 Weather

In full issues this module will print the daily forcast and any weather alerts. In update issues,
this module will only be included if the forecast includes adverse conditions (e.g rain, snow or hail)

### 📣 Quotes

Print a daily motivation (or demotivational!) quote from a CSV database. This module could do with
some TLC (probably should be connected to an API instead?).

## Missing modules

I'd like to add these but I haven't had time yet. Ideally for calendar and reminders it would
integrate with iOS (perhaps using a public calendar link and `node-ical`?). Pull requests welcome!

* Puzzles (cross words, sudoku etc)
* Calendar providers
* Todo/reminders providers

## Adding new modules

You can easily create your own module by creating a `provider`, which fetches the data required, and
a set of `blocks` which render it. Then add the blocks required to the issue in `IssueGenerator._createBlocks`.

Real-time providers are also supported (see `providers/Messages` for an example Telegram integration), which
can wake up and print immediately.