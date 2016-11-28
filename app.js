const argv = require("yargs").argv;

const inputPath = argv.i || argv.input || (() => {
  console.log("-i/--input required");
  process.exit(1);
})();

const ngramSize = argv.n || argv.ngramSize || 3;
const length    = argv.l || argv.length || 200;

const fs      = require("fs");
const natural = require("natural");

const text = fs.readFileSync(inputPath, {
  encoding: "utf-8"
});

const tkz = new natural.RegexpTokenizer({
  pattern: /\s+/
});

const tokenized = tkz.tokenize(text);

const getIndexes = (search) => {
  return tokenized.map((tkn, ndx) => {
    return tkn == search ? ndx : null;
  }).filter((tkn) => { 
    return tkn; 
  });
};

const randStart = () => {
  let start;
  
  let randNdx = () => {
    return Math.floor(Math.random() * tokenized.length);
  }

  let good = (ndx) => {
    let tkn    = tokenized[ndx];
    let before = tokenized[ndx - 1] || "";

    // Token before start should end with sentence-ending punctuation
    // and start should be capitalized
    return ndx && before.match(/[.!?]$/) && tkn.match(/^[A-Z]/);
  }

  let ndx = null;
  while(!good(ndx)) ndx = randNdx();

  return tokenized[ndx];
};

String.prototype.isSentenceEnd = function() {
  return !!this.match(/[.!?]$/);
};

let last = randStart();
let output = [last];
let ndxs, ndx;

while(output.length < length || !output.slice(-1)[0].isSentenceEnd()) {
  ndxs = getIndexes(last);
  ndx  = ndxs[Math.floor(Math.random() * ndxs.length)];

  output = output.concat(
    tokenized.slice(ndx, ndx + ngramSize + 1).slice(-ngramSize));

  last = output.slice(-1)[0];
}

console.log(output.join(" "));
