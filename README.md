# LocalPrinter

IoT Pi printer based on the Cashino CSN-A2 receipt printer. Heavily inspired by Berg Little Printers.

## Parts

* Raspberri Pi Zero 2 W
* Cashino [CSN-A2](https://www.alibaba.com/product-detail/CASHINO-58mm-Embedded-ticket-printer-CSN_60531714536.html) printer (alternatively [CSN-A2L](https://www.alibaba.com/product-detail/Cashino-CSN-A2-2inch-58mm-Kiosk_1600441215807.html?spm=a2700.galleryofferlist.normal_offer.d_title.658922e1AFb4oR))
* 9V-5V step down ([example](https://www.ebay.co.uk/itm/193632397779?var=493943066064))
* 2.1mm DC panel mount
* 9V 2A power supply
* Wooden box

## Demo

Demo images here.

## Installation

Clone the repository, create a config file according to the below and run with `node index.js`. You'll likely want to use another tool to launch the printer at boot and restart it if it crashes.

I also recommend installing Tailscale + SSH to make managing the printer remotely easier.

## Configuration

You need to create a `.env` file with the following options:

```
# Required
# =========

# Serial port
SERIAL_PORT = "/dev/serial0"

# Time of day to print automatic issue
ISSUE_TITLE_FULL = "THE DAILY 0x62"
ISSUE_TITLE_UPDATE = "YOU'VE GOT MAIL"

# Time of day to print automatic issue
AUTO_ISSUE_TIME = "7:00"
# Type of automatic issue
# update = only print if there are updates
# full = print last update from all modules
AUTO_ISSUE_TYPE = "update"

# Type of issue to print when pushing button
BUTTON_TYPE = "full"

# Data Providers (provide all options to enable)
# ===============================================

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


## Planned providers

* Daily image (could be used for cross words, sudoku etc)

## Adding new modules

You can easily create your own module by creating a `provider`, which fetches the data required, and
a set of `blocks` which render it. Then add the blocks required to the issue in `IssueGenerator._createBlocks`.

Real-time providers are also supported (see `providers/Messages` for an example Telegram integration), which
can wake up and print immediately.