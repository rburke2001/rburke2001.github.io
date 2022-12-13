const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let nyquist = audioCtx.sampleRate / 2;
let oscilBank = [];

const synthList = document.querySelector("#synthTypeList");

synthList.addEventListener("input", selectSynthType);

let oscNum = 3;

function selectSynthType() {
    synthChoice = synthList.selectedIndex;  // .selectedIndex will show which option in the list is selected

}

function createOscillator(incomingFrequency) {  // 'incomingFrequency' is the fundamental frequency of the note
        if (synthChoice === 0 || synthChoice === 1) {

        let freq = incomingFrequency;
        let partial = 1;

        while (freq <= nyquist) {  // 'while' loops run while a condition remains true
            let amp = 0.3 * 1;
            amp /= partial;

            let oscilBankLen = oscilBank.length;

            oscilBank[oscilBankLen] = [] // Two-dimensional Array
            oscilBank[oscilBankLen][0] = incomingFrequency;

            for (i = 0; i < oscNum; i++) {
                let randomOffset = Math.random() * 5;     // Math.random() will produce a pseudo-random number >= 0 but < 1;
                // But, I want a range from 0 - 2!
                // the more the randomOffset multiplier increases, the partials become less harmonic.
                let fatFreq = freq - randomOffset;
                fatFreq += i
                oscilBank[oscilBankLen][i + 1] = new Oscil(audioCtx, fatFreq, amp).play(attackVal, decayVal, sustainVal);

            }
            partial++;
            freq = incomingFrequency * partial;
        }
    } else if (synthChoice === 2) {
        let freq = incomingFrequency;
        let partial = 1;

// == Create a Filter == //
        let filter = new Filter(audioCtx, filterChoice, 1, 750);

        function selectFilterType() {
            filterChoice = filterList.selectedIndex;  // .selectedIndex will show which option in the list is selected
            filter.type = filterOptions[filterChoice];
            console.log(filter.type);
        }
        
        function setCutoffFrequency() {
            let cutoff = freqSlider.value;
            filter.frequency.value = cutoff;
            freqSpan.innerHTML = cutoff;
        }
        
        function setQValue() {
            let qValue = qSlider.value;
            filter.Q.value = qValue;
            qSpan.innerHTML = qValue;
        }

        while (freq <= nyquist) {  // 'while' loops run while a condition remains true
            let amp = 0.3 * 1;
            amp /= partial;

            let oscilBankLen = oscilBank.length;

            oscilBank[oscilBankLen] = [] // Two-dimensional Array
            oscilBank[oscilBankLen][0] = incomingFrequency;

            for (i = 0; i < oscNum; i++) {
                let randomOffset = Math.random() * 5;     // Math.random() will produce a pseudo-random number >= 0 but < 1;
                // But, I want a range from 0 - 2!
                // the more the randomOffset multiplier increases, the partials become less harmonic.
                let fatFreq = freq - randomOffset;
                fatFreq += i
                oscilBank[oscilBankLen][i + 1] = new Oscil(audioCtx, fatFreq, amp).play(attackVal, decayVal, sustainVal, filter);

            }
            partial++;
            freq = incomingFrequency * partial;
        } 
    }
};

function stopOscillator(e) {
    let freqVal;

    if (e.type === "mouseup") {
        let clickedKey = e.target.id;
        clickedKey = clickedKey.slice(3);
        clickedKey = parseInt(clickedKey);
        freqVal = Object.values(keyFreqMap)[clickedKey];
    } else {
        if (e.repeat === false) {
            let typedKey = e.key;
            freqVal = keyFreqMap[typedKey];
        }
    }
        
    const oscilsOff = oscilBank.filter( (origOscilBank) => {
        if (origOscilBank[0] === freqVal) {
            return true;
        }
    });

    for (i = 0; i < oscilsOff.length; i++) { // 'i' created in a "for loop" is a local variable
        for (j = 0; j < oscNum; j++) {   // 'j' is used for a loop within a loop
            oscilsOff[i][j + 1].stop(sustainVal, releaseVal);
        }
    }
    
};

function getFrequency(e) { // 'e' as an argument to the function in an event listener accesses the 'event' object
    if (e.repeat === false) {
        let typedKey = e.key;
        let freqVal = keyFreqMap[typedKey];
        createOscillator(freqVal);
    }
}

function getClickedFrequency(e) {
    let clickedKey = e.target.id;
    clickedKey = clickedKey.slice(3);   // the .slice Array method chops off the characters in an item starting from the beginning and going to the X number of places in the string.
    clickedKey = parseInt(clickedKey);  // turn the string number into a number number
    let keyFreq = Object.values(keyFreqMap)[clickedKey];
    createOscillator(keyFreq);
}

// ===== KEYBOARD SYNTHESIZER ===== //
const keyFreqMap = {
//  "keys": "values"    
    "a": 261.63,    // C4
    "w": 277.18,    // C#4/Db4
    "s": 293.66,    // D4
    "e": 311.13,    // etc.
    "d": 329.63,
    "f": 349.23,
    "t": 369.99,
    "g": 392.00,
    "y": 415.30,
    "h": 440.00,
    "u": 466.16,
    "j": 493.88,
    "k": 523.25,
    "o": 554.37,
    "l": 587.33,
    "p": 622.25,
    ";": 659.25     // E5
}

window.addEventListener('keydown', getFrequency);

window.addEventListener('keyup', stopOscillator);

// ===== CLICK ON KEYS TO PLAY SYNTH ===== //
const keys = document.querySelectorAll(".key"); // this creates a 'nodeList' --> an array-like collection of data

const keysArray = Array.from(keys);

keysArray.forEach(key => key.addEventListener('mousedown', getClickedFrequency) ) //'key' is a local variable (local to this .forEach method) that is a stand-in name for the key being clicked)

keysArray.forEach(key => key.addEventListener('mouseup', stopOscillator));

// ========== SUBSTRACTIVE SYNTHESIS ========== //
/* const bufferSize = audioCtx.sampleRate * 3;

const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);

let data = noiseBuffer.getChannelData(0);

for (i=0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
}

const noise = audioCtx.createBufferSource();

noise.buffer = noiseBuffer;

const noiseGain = audioCtx.createGain();

noise.connect(noiseGain);

noiseGain.gain.value = 0.3; */

// ======= CREATE A FILTER ======== //
let filterOptions = ["none", "lowpass", "highpass", "bandpass", "notch"]

const filterBtn = document.querySelector("#filterBtn");
const filterList = document.querySelector("#filterList");
const freqSlider = document.querySelector("#cutoffFreq");
const qSlider = document.querySelector("#qValue");
const freqSpan = document.querySelector("#freqValue");
const qSpan = document.querySelector("#qualValue");

let filterChoice;

// const filter = audioCtx.createBiquadFilter();

function selectFilterType() {
    filterChoice = filterList.selectedIndex;  // .selectedIndex will show which option in the list is selected
    filter.type = filterOptions[filterChoice];
    console.log(filter.type);
}

function setCutoffFrequency() {
    let cutoff = freqSlider.value;
    filter.frequency.value = cutoff;
    freqSpan.innerHTML = cutoff;
}

function setQValue() {
    let qValue = qSlider.value;
    filter.Q.value = qValue;
    qSpan.innerHTML = qValue;
}

/* filter.frequency.value = 750;
freqSpan.innerHTML = filter.frequency.value;

filter.Q.value = 1;  // resonance factor at cutoff
qSpan.innerHTML = filter.Q.value; */

filterBtn.addEventListener("click", selectFilterType);

freqSlider.addEventListener("input", setCutoffFrequency);

qSlider.addEventListener("input", setQValue);

//noiseGain.connect(filter);

//filter.connect(audioCtx.destination);

// ===== ENVELOPE GENERATOR ===== //

// ===== SLIDERS FOR ADSR ===== //
const attack = document.querySelector("#attackTime");
const decay = document.querySelector("#decayTime");
const sustain = document.querySelector("#sustainLevel");
const release = document.querySelector("#releaseTime");

// ===== SPANS FOR SLIDER VALUES //
const attackSpan = document.querySelector("#attackVal");
const decaySpan = document.querySelector("#decayVal");
const sustainSpan = document.querySelector("#sustainVal");
const releaseSpan = document.querySelector("#releaseVal");

// for some reason, JavaScript interprets the value of the range sliders as a string, not as a number. parseFloat() converts the decimal-point string into a decimal-point number
let attackVal = parseFloat(attack.value);
let decayVal = parseFloat(decay.value);
let sustainVal = parseFloat(sustain.value);
let releaseVal = parseFloat(release.value);

attackSpan.innerHTML = attackVal;
decaySpan.innerHTML = decayVal;
sustainSpan.innerHTML = parseInt(100 * sustainVal); // remove decimal points from the display value of the percentage
releaseSpan.innerHTML = releaseVal;



// ===== Event Listeners for Changing ADSR Values ===== //
attack.addEventListener("input", () => {
    attackVal = parseFloat(attack.value);
    attackSpan.innerHTML = attackVal;
});

decay.addEventListener("input", () => {
    decayVal = parseFloat(decay.value);
    decaySpan.innerHTML = decayVal;
});

sustain.addEventListener("input", () => {
    sustainVal = parseFloat(sustain.value);
    sustainSpan.innerHTML = parseInt(100 * sustainVal);
});

release.addEventListener("input", () => {
    releaseVal = parseFloat(release.value);
    releaseSpan.innerHTML = releaseVal;
});

/* ===== REVERB =====*/

class SimpleReverb extends Effect {
  constructor (context) {
    super(context);
    this.name = "SimpleReverb";
  }

  setup (reverbTime=1) {
    this.effect = this.context.createConvolver();

    this.reverbTime = reverbTime;

    this.attack = 0.0001;
    this.decay = 0.1;
    this.release = reverbTime;

    this.wet = this.context.createGain();
    this.input.connect(this.wet);
    this.wet.connect(this.effect);
    this.effect.connect(this.output);    
  }

  renderTail () {

    const tailContext = new audioContext( 2, this.context.sampleRate * this.reverbTime, this.context.sampleRate );
          tailContext.oncomplete = (buffer) => {
            this.effect.buffer = buffer.renderedBuffer;
          }
    
    const tailOsc = new Noise(tailContext, 1);
          tailOsc.init();
          tailOsc.connect(tailContext.destination);
          tailOsc.attack = this.attack;
          tailOsc.decay = this.decay;
          tailOsc.release = this.release;
    
      
      tailOsc.on({frequency: 500, velocity: 1});
      tailContext.startRendering();
    setTimeout(()=>{
      tailOsc.off(); 
    },20)
      
     
  }

  set decayTime(value) {
    let dc = value/3;
    this.reverbTime = value;
    this.attack = 0;
    this.decay = 0;
    this.release = dc;
    return this.renderTail();
  }

}

class AdvancedReverb extends SimpleReverb {
  constructor (context) {
    super(context);
    this.name = "AdvancedReverb";
  }

  setup (reverbTime=1, preDelay = 0.03) {
    this.effect = this.context.createConvolver();

    this.reverbTime = reverbTime;

    this.attack = 0.001;
    this.decay = 0.1;
    this.release = reverbTime;

    this.preDelay = this.context.createDelay(reverbTime);
    this.preDelay.delayTime.setValueAtTime(preDelay, this.context.currentTime);
    
    this.multitap = [];
    
    for(let i = 2; i > 0; i--) {
      this.multitap.push(this.context.createDelay(reverbTime));
    }
    this.multitap.map((t,i)=>{
      if(this.multitap[i+1]) {
        t.connect(this.multitap[i+1])
      }
      t.delayTime.setValueAtTime(0.001+(i*(preDelay/2)), this.context.currentTime);
    })
    
    this.multitapGain = this.context.createGain();
    this.multitap[this.multitap.length-1].connect(this.multitapGain);
    
    this.multitapGain.gain.value = 0.2;
    
    this.multitapGain.connect(this.output);
    
    this.wet = this.context.createGain();
     
    this.input.connect(this.wet);
    this.wet.connect(this.preDelay);
    this.wet.connect(this.multitap[0]);
    this.preDelay.connect(this.effect);
    this.effect.connect(this.output);
   
  }
  renderTail () {

    const tailContext = new audioContext( 2, this.context.sampleRate * this.reverbTime, this.context.sampleRate );
          tailContext.oncomplete = (buffer) => {
            this.effect.buffer = buffer.renderedBuffer;
          }
    const tailOsc = new Noise(tailContext, 1);
    const tailLPFilter = new Filter(tailContext, "lowpass", 2000, 0.2);
    const tailHPFilter = new Filter(tailContext, "highpass", 500, 0.1);
    
    tailOsc.init();
    tailOsc.connect(tailHPFilter.input);
    tailHPFilter.connect(tailLPFilter.input);
    tailLPFilter.connect(tailContext.destination);
    tailOsc.attack = this.attack;
    tailOsc.decay = this.decay;
    tailOsc.release = this.release;
    
    tailContext.startRendering()

    tailOsc.on({frequency: 500, velocity: 1});
    setTimeout(()=>{
          tailOsc.off();
    },20)
  }

  set decayTime(value) {
    let dc = value/3;
    this.reverbTime = value;
    this.attack = 0;
    this.decay = 0;
    this.release = dc;
    return this.renderTail();
  }
}


let Audio = new (window.AudioContext || window.webkitAudioContext)();     

let filter = new Filter(Audio, "lowpass", 50000, 0.8);
    filter.setup();
let verb = new AdvancedReverb(Audio); 
      verb.setup(2,0.01);
      verb.renderTail();
      verb.wet.gain.value = 1;
   
 
let compressor = Audio.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, Audio.currentTime);
    compressor.knee.setValueAtTime(40, Audio.currentTime);
    compressor.ratio.setValueAtTime(12, Audio.currentTime);
    compressor.attack.setValueAtTime(0, Audio.currentTime);
    compressor.release.setValueAtTime(0.25, Audio.currentTime);
    compressor.connect(Audio.destination);

filter.connect(verb.input);
verb.connect(compressor);

document.getElementById("dry").addEventListener("mousedown",(e)=>{
  drySound.play();
});
document.getElementById("wet").addEventListener("mousedown",(e)=>{
  wetSound.play();
})
document.getElementById("combined").addEventListener("mousedown",(e)=>{
  combined.play();
})


/* dateHeader.addEventListener("click", () => {
    noise.start();
})  */
