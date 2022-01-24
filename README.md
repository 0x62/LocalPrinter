# Local Printer

IoT printer based on the Adafruit receipt printer. Heavily inspired by Berg Little Printers.

## Demo

Demo images here.

## Adding new modules

You can easily create your own module by creating a `provider`, which fetches the data required, and
a set of `blocks` which render it. Then add the blocks required to the issue in `IssueGenerator._createBlocks`.

Real-time providers are also supported (see `providers/Messages` for an example Telegram integration), which
can wake up and print immediately.