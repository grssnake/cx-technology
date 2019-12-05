var lightSensor = require('@amperka/light-sensor').connect(A0);

var myLed = require('@amperka/led').connect(P13);
myLed.turnOff();

var hist = require('@amperka/hysteresis').create(
  {
    "low":5,
    "high":8,
    "lowLag": 10,
    "highLag":10
  }
);

var manualMode = false;
var manualModeLed = require('@amperka/led').connect(P13);
manualModeLed.turnOff();

var receiver = require('@amperka/ir-receiver').connect(P2);

receiver.on('receive', function(code) {
  console.log('REMOTE CODE: ', code);
  // в зависимости от нажатой кнопки пульта
  // даём разные команды роботу
  if (code === 378101919 && manualMode) {
    console.log('UP!!!');
  } else if (code === 378124359 && manualMode){
    console.log('DOWN!!!');
  } else if (code === 378130479) {
    console.log(manualMode ? "Manual mode off" : "Manual mode on");
    manualMode = manualMode ? false : true;
    manualModeLed.toggle();
  }
});

var ledOnAnim = require('@amperka/animation').create({
  from: 0,             // анимация от 0
  to: 1.1,              // до 1.
  duration: 4,          // продолжительностью 2 секунды
  updateInterval: 0.02  // с обновлением каждые 20 мс
});
ledOnAnim.on('update', function(val) {
  console.log('Led brightness:', val, ' from 0 to 1');
  myLed.brightness(val);
  myLed.turnOn();
  // Заставляем по мере обновления анимации поворачиваться сервопривод
  //myServo.write(val);
});


// выводим в консоль данные с датчика освещённости во всех возможных форматах
setInterval( function() {
  if ( ! manualMode ) {
    hist.push(lightSensor.read('lx'));
    console.log('Room lightness:', lightSensor.read('lx'), 'luxes');
    console.log('Room lightness:', lightSensor.read('V'), 'V');
    console.log('Room lightness:', lightSensor.read('mV'), 'mV');
    console.log('Room lightness:', lightSensor.read(), 'from 0 to 1');
    console.log('---------------');
  }
 },1000);

hist.on('high', function() {
  console.log('HIGH!!!', myLed);
  myLed.blink(1, 1);
});

hist.on('low', function() {
  console.log('LOW!!!');
  ledOnAnim.play();
});
