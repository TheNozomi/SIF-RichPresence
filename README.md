SIF-RichPresence
====
![SIF-RichPresence](https://i.imgur.com/OSzQa31.png)

Discord Rich Presence for Love Live! School idol festival

This application acts as a man-in-the-middle proxy betweeen your PC and your phone/tablet with SIF installed.

Requirements
----
* (http://nodejs.org/)[Node.js] version 8 or later installed on your PC
* Have your PC and your mobile device connected on the same network
* A proxy on your device. While you can use the "proxy settings" of your device, on most devices SIF will ignore the proxy and connect directly to the game servers, so you'll need to use a "global proxy" app. On Android you can use (https://play.google.com/store/apps/details?id=org.proxydroid&hl=en)[ProxyDroid] (for root users only) or (https://play.google.com/store/apps/details?id=org.sandroproxy.drony&hl=en)[Drony] (root and non-root). Haven't tested on iOS, so I don't know if it works out-of-the-box or if you need some special app. If you get this working on iOS, let me know how and I'll add it to this page.


Setup
----
1. Clone or download this repository
2. Run `npm install` (or `yarn` if you use Yarn for package management)
3. Run `npm start` (or `node server.js`)
4. Get the local IP address of your machine (you can use `ipconfig` on Windows systems and `ifconfig` on Linux-based systems)
5. Configure your proxy app with that IP and the port (by default is 8081, you can specify another port in the `config.json` file)
6. Start SIF. When you log in to the game, you should start seeing state updates on the console and your Discord playing status should update

Configuration
----
The `config.json` file has two configuration options:

* `port`: The port that the proxy server will use. By default is 8081. Note that if you change the port there, you'll need to change it also on your mobile proxy settings/app. (duh)
* `hideUser`: Whether to hide your user data (name, friend ID and rank) on the Discord status. By default a small "user" icon shows and when hovering over it, it will show that data. Set to `true` to hide.

Development
----
Contributions are welcome. The current code is hacky as hell but it works ¯\_(ツ)_/¯ so if you have made some improvement to the code, or added a new feature, feel free to submit a pull request.