template Multiplier() {
   signal private input a;
   signal private input b;
   signal private input c;
   signal private input d;
   signal private input e;
   signal x;
   signal y;
   signal output f;
   x <== c*d;
   y <== x*e;
   f <== (x*y) + a;
}

component main = Multiplier(); 