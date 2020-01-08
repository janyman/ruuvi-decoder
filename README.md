# ruuvi-decoder

A node.js program for decoding data sent by Ruuvi tags. It listens to the BLE adverts sent by the tag and prints out the measurement results.

The program supports data format 3 & 5 (RAWv1 and RAWv2) for the moment. See https://github.com/ruuvi/ruuvi-sensor-protocols

## Installation & Usage

```sh
npm i 
node src/ruuvi-decoder.js
```
