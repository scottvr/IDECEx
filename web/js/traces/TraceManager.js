
let calculationHistory = {
    traces: [
         {
             id: 1,
             name: "Trace 1",
             calculations: [
                 {
                     timestamp: Date.now(),
                     R_star: 1,
                     f_p: 0.2,
                     n_e: 1,
                     f_l: 0.1,
                     f_i: 0.01,
                     f_c: 0.1,
                     L: 1000,
                     N: 2
                 }
                 // ... more calculations
             ]
         }
         // ... more traces
     ],
     currentTraceIndex: 0
 };

 const maxTraces = 5;

 function ensureTraceExists() {
     if (calculationHistory.traces.length === 0) {
         calculationHistory.traces.push({
             id: 1,
             name: "Trace 1",
             calculations: []
         });
         calculationHistory.currentTraceIndex = 0;
     }
 }
 
 function addCalculationToCurrentTrace(calculationResult) {
     ensureTraceExists();
     calculationHistory.traces[calculationHistory.currentTraceIndex].calculations.push(calculationResult);
 }
 