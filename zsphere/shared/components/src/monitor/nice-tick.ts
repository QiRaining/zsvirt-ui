function toStr(str: number) {
  return `${str}`;
}

// return float part length
function fLen(n: number) {
  const s = toStr(n);
  const a = s.split(".");
  if (a.length > 1) {
    return a[1].length;
  }
  return 0;
}

// return float as int
function fInt(n: number) {
  const s = toStr(n);
  return parseInt(s.replace(".", ""), 10);
}

function add(n1: number, n2: number) {
  const r1 = fLen(n1);
  const r2 = fLen(n2);
  if (r1 + r2 === 0) {
    return n1 + n2;
  }
  const m = 10 ** Math.max(r1, r2);
  return (Math.round(n1 * m) + Math.round(n2 * m)) / m;
}

function mul(n1: number, n2: number) {
  const r1 = fLen(n1);
  const r2 = fLen(n2);
  if (r1 + r2 === 0) {
    return n1 * n2;
  }
  const m1 = fInt(n1);
  const m2 = fInt(n2);
  return (m1 * m2) / 10 ** (r1 + r2);
}

function nice(x: number, round: boolean) {
  const exp = Math.floor(Math.log(x) / Math.log(10));
  const f = x / 10 ** exp;
  let nf: number;
  if (round) {
    if (f < 1.5) {
      nf = 1;
    } else if (f < 3) {
      nf = 2;
    } else if (f < 7) {
      nf = 5;
    } else {
      nf = 10;
    }
  } else if (f <= 1) {
    nf = 1;
  } else if (f <= 2) {
    nf = 2;
  } else if (f <= 5) {
    nf = 5;
  } else {
    nf = 10;
  }
  return nf * 10 ** exp;
}

const toNum = (num: string | number) => {
  if (typeof num !== "number") {
    return parseFloat(num);
  }
  if (Number.isNaN(num)) {
    return 0;
  }
  return num;
};

// https://wiki.tcl-lang.org/page/Chart+generation+support

const niceTicks = (domain: number[], count = 4): number[] => {
  const [min, max] = domain;
  let maxNum = toNum(max);
  let minNum = toNum(min);

  if (minNum === maxNum) {
    maxNum = minNum + 1;
  } else if (minNum > maxNum) {
    const n = minNum;
    minNum = maxNum;
    maxNum = n;
  }

  const r = nice(maxNum - minNum, false);
  const d = nice(r / (count - 1), true);
  const s = mul(Math.floor(minNum / d), d);
  const e = mul(Math.ceil(maxNum / d), d);
  const arr: number[] = [];
  let v = s;
  while (v <= e) {
    arr.push(v);
    v = add(v, d);
  }
  return arr;
};

export default niceTicks;
