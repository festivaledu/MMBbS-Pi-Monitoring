# MMBbS Pi Monitoring

A simple tool for [Multi-Media Berufsbildende Schulen (MMBbS)](https://www.mmbbs.de) allowing you to connect multiple Raspberry Pis (or other devices with GPIO pins) to a central server in order to collect temperature and humidity data (eg. in a server rack).

This project consists of three sub-projects: the main server to collect the data, the client for running on the Raspberry Pi, and a Web UI to display temperature and humidity data in a user friendly way.

Running this project requires [Node.js](https://nodejs.org/en/) installed (>= 16.x recommended). For installing Node.js on your Pi, [NVM](https://github.com/nvm-sh/nvm) is recommended.

## Server

Running the server on its own does not depend on a Raspberry Pi, but you can run it on basically any device with a network connection that supports Node.js.

To start the server, run the following commands:

```sh
$ cd server

# Installing packages is required only once!
$ npm install

$ npm start
```

The server will be reachable on port 3000 (or whatever the `SERVER_PORT` env variable is set to).

### Options
Options can be set by editing `server/.env`.

| Variable | Default | Description |
|---|---|---|
| SERVER_PORT | `3000` | Sets the TCP port the server is listening on. |
| DATABASE_FILENAME | `db.sqlite` | Sets the filename of the SQLite database to use. |

## Client

The client is intended to be run on a Raspberry Pi with a connected temperature/humidity sensor, but for right now, it's pushing random data to the server so you can run it on any device you like.

To start the client, run the following commands:

```sh
$ cd client

# Installing packages is required only once!
$ npm install

$ npm start
```

The client will register with the server specified in `client/.env` automatically. If it fails to connect, it will retry every 10 seconds.  
Once connected, the client will start pushing its data to server every 10 seconds (or whatever the `UPDATE_INTERVAL` env variable is set to).

Please check your Ethernet/WiFi interface names! Pi defaults should be `eth0` and `wlan0` respectively.  
Queried interface names can be changed in `client/index.js`, lines 11 & 12;

### Options
Options can be set by editing `client/.env`.

| Variable | Default | Description |
|---|---|---|
| MONITOR_URL | `http://localhost:3000` | Sets the connection URL of the monitor server to connect to. |
| UPDATE_INTERVAL | `10` | Specifies the interval in which to push data to the monitor server. |

## Web UI

![WebUIPreview](./.assets/webui_preview.png)

The Web UI is used to display historical data of each known monitor node. Temperature can be displayed in Celsius, Fahrenheit, Kelvin, or even historical units such as Rankine and Réaumur.

Currently, the Web UI is independent of the main server and as such needs to be started seperately. Once Web UI development has finished, the main server will also serve the Web UI.

To start the client, run the following commands:

```sh
$ cd ui

# Installing packages is required only once!
$ npm install

$ npm run dev
```

After starting, the Web UI can be reached under `http://localhost:8080`.  
By default, it will connect to `http://localhost:3000` to display data. This can be overriden by specifying the `server` GET parameter (eg. `https://localhost:8080?server=10.3.3.7:42069`).