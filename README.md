# printer-backend

## Notes

Should have three endpoints:

* `/issue`: fetch todays issue
* `/inbox`: poll to fetch messages. This endpoint should automatically return no messages from 23:00 to 07:00 to prevent printer waking
* `/wh/email`: webhook to receive inbound emails for sending messages

Needs to also listen for cronjob, which generates the issue before the client fetches