var noble = require('noble');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([], true); //Any service UUID, allow duplicates
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {

  if (peripheral.advertisement.manufacturerData && peripheral.advertisement.manufacturerData.length > 2) {
    //console.log("manuf data", peripheral.advertisement.manufacturerData);
    if (peripheral.advertisement.manufacturerData.readUInt16LE(0) == 0x0499) {
      /* Detected a Ruuvi tag, identified by manufacturer id */
      console.log("Found Ruuvi tag", peripheral.advertisement.localName ? peripheral.advertisement.localName : peripheral.address, "measurements", ruuviDecode(peripheral.advertisement.manufacturerData.slice(2)));
    }
  }
});


/**
 * Decode BLE advertisement data sent by a Ruuvi tag.
 * 
 * @param {Buffer} buffer 
 */
function ruuviDecode(buffer) {
  var dataFormat = buffer.readUInt8(0);
  if (dataFormat === 0x03) {
    /* The old RAWv1 format: Refer to https://github.com/ruuvi/ruuvi-sensor-protocols/blob/master/dataformat_03.md */
    var humidity = buffer.readUInt8(1) * 0.5;
    
    var temperature = buffer.readUInt8(2) & 0x7F; //temperature, without sign bit
    var temperatureFraction = buffer.readUInt8(3) * 1/100;
    temperature += temperatureFraction;
    if (buffer.readUInt8(2) >> 7) {
      temperature *= -1;
    }

    var pressure = buffer.readUInt16BE(4) + 50000;

    var accelX = buffer.readInt16BE(6) * 1 / 1000;
    var accelY = buffer.readInt16BE(8) * 1 / 1000;
    var accelZ = buffer.readInt16BE(10) * 1 / 1000;

    var batVoltage = buffer.readUInt16BE(12) * 1/1000;
    
    return { 
      "temperature": temperature, 
      "humidity": humidity,
      "pressure": pressure,
      "acceleration" : { "x": accelX, "y": accelY, "z": accelZ },
      "batVoltage": batVoltage
    };
  }
  else if (dataFormat === 0x05) {
    /* RAWv2 format: https://github.com/ruuvi/ruuvi-sensor-protocols/blob/master/dataformat_05.md */
    var temperature = buffer.readInt16BE(1) * 0.005;

    var humidity = buffer.readUInt16BE(3) * 0.0025;

    var pressure = buffer.readUInt16BE(5) + 50000;

    var accelX = buffer.readInt16BE(7) * 1 / 1000;
    var accelY = buffer.readInt16BE(9) * 1 / 1000;
    var accelZ = buffer.readInt16BE(11) * 1 / 1000;

    var batVoltage = (buffer.readUInt16BE(13) >> 5) / 1000 + 1.6;
    var txPower = (buffer.readUInt16BE(13) & 0x1f) * 2 - 40;
    var movementCounter = buffer.readUInt8(15);
    var seqNum = buffer.readUInt16BE(16);

    return {
      "temperature": temperature, 
      "humidity": humidity,
      "pressure": pressure,
      "acceleration" : { "x": accelX, "y": accelY, "z": accelZ },
      "batVoltage": batVoltage,
      "txPower": txPower,
      "movementCounter": movementCounter,
      "seqNum": seqNum,
    }
  }
  else {
    console.log("Unknown data format", dataFormat);
    return undefined;
  }
}

/* Test vectors from https://github.com/ruuvi/ruuvi-sensor-protocols/blob/master/dataformat_03.md */
//console.log("Test: valid data", ruuviDecode(Buffer.from("03291A1ECE1EFC18F94202CA0B53", "hex")));
//console.log("Test: max values", ruuviDecode(Buffer.from("03FF7F63FFFF7FFF7FFF7FFFFFFF", "hex")));
//console.log("Test: min values", ruuviDecode(Buffer.from("0300FF6300008001800180010000", "hex")));

//console.log("test: valid", ruuviDecode(Buffer.from("0512FC5394C37C0004FFFC040CAC364200CDCBB8334C884F", "hex")));
//console.log("test: max", ruuviDecode(Buffer.from("057FFFFFFEFFFE7FFF7FFF7FFFFFDEFEFFFECBB8334C884F", "hex")));
//console.log("test: min", ruuviDecode(Buffer.from("058001000000008001800180010000000000CBB8334C884F", "hex")));