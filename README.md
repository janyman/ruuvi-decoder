# ruuvi-decoder

A node.js program for decoding data sent by Ruuvi tags. It listens to the BLE adverts sent by the tag and prints out the measurement results.

The program only supports data format 3 for the moment. See https://github.com/ruuvi/ruuvi-sensor-protocols/blob/master/dataformat_03.md

## Installation

```sh
npm i 
```

## Usage

```sh
node cli.js
```