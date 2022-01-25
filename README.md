# LocalPrinter

IoT Pi printer based on the Cashino CSN-A2 receipt printer. Heavily inspired by Berg [Little Printers](https://nordprojects.co/projects/littleprinters/). 

All fetching, processing and rendering is done on the device, no server needed.

**🚨 Alpha: This project is under active development. It's likely to break at any time.**

## Parts

* Raspberri Pi Zero 2 W
* Cashino [CSN-A2](https://www.alibaba.com/product-detail/CASHINO-58mm-Embedded-ticket-printer-CSN_60531714536.html) printer (alternatively [CSN-A2L](https://www.alibaba.com/product-detail/Cashino-CSN-A2-2inch-58mm-Kiosk_1600441215807.html?spm=a2700.galleryofferlist.normal_offer.d_title.658922e1AFb4oR))
* 9V-5V step down ([example](https://www.ebay.co.uk/itm/193632397779?var=493943066064))
* Momentary button with LED ([example](https://www.ebay.co.uk/itm/183415145654?var=690724911342))
* 2.1mm DC panel mount ([example](https://www.ebay.co.uk/itm/362281631986?var=631486269634))
* 9V 2A power supply ([example](https://www.ebay.co.uk/itm/203296688898))
* Wooden box

## Demo

Demo images here.

## Installation

Clone the repository, create a config file according to the below and `npm install`. You can also enable `DEV_MODE` to skip printing and render straight to file for testing.

I also recommend installing Tailscale + SSH to make managing the printer remotely easier.

## Running

Run with `node index.js`. You'll likely want to use another tool to launch the printer at boot and restart it if it crashes.

## Hardware

Hardware is heavily based on the [Adafruit IoT printer](https://learn.adafruit.com/pi-thermal-printer), with the addition of a 9V power supply for the printer (and stepped down to 5V for Pi).

[Enable the serial port](https://learn.adafruit.com/adafruits-raspberry-pi-lesson-5-using-a-console-cable/enabling-serial-console#option-2-enabling-via-raspi-config-1961278-5) and connect the data port on the printer to the Pi GND, GPIO14 and GPIO15. Connect the printer power to 9V power supply. You can actually power the printer off 5V if you need to, but the print quality is much better with more power.

Connect the button to 

## Configuration

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
TG_ALLOWED_IDS = "" # comma seperated
TG_IMMEDIATE = true # print received messages immediately, rather than in next update

# Headlines from The Guardian
GUARDIAN_TOKEN = ""

# Weather and rain/snow alerts
OPENWEATHER_TOKEN = ""
WEATHER_CITY = ""

# Daily quote
# Expects a CSV with quote, author (optional)
# Will randomly pick unseen options until all are used and reset
QUOTES_DB = "./quotes.csv"
```


## Missing modules

I'd like to add these but I haven't had time yet. Pull requests welcome!

* Daily image (could be used for cross words, sudoku etc)
* Calendar providers
* Todo/reminders providers

## Adding new modules

You can easily create your own module by creating a `provider`, which fetches the data required, and
a set of `blocks` which render it. Then add the blocks required to the issue in `IssueGenerator._createBlocks`.

Real-time providers are also supported (see `providers/Messages` for an example Telegram integration), which
can wake up and print immediately.