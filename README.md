#sublimate
---
**Warning:** It's a little rough around the edges right now.

##Dependencies
```js
npm install
```
The above code *probably* works, but I haven't tested it.

##License
MIT. I know you know what that means.

##How to Use
Register your app at the School Portal first. Then create a file named **config.js** in the root directory, with the following stuff in it:
```js
module.exports = {
  id     : "APP ID",
  secret : "APP SECRET",
  host   : "APP HOST"
}
```
Oh, and make sure your redirect is registered as `/callback`.

##Credits
Well, the epic thingumabobs used  are:
- JQuery, the cheap way to code your client. (TM)
- Countdown.js, which doesn't seem to have a good CDN behind it. = (
- Node.js, which I don't think I have to *actually* credit, but meh.
- Express, the cheap way to code your server. (TM)
