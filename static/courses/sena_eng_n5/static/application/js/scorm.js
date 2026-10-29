function FindObjectiveIndex(objectiveId){
   var objCount = doGetValue("cmi.objectives._count", true);

   for (var i=0; i < objCount; i++){
      var objId = doGetValue("cmi.objectives." + i + ".id", true);
      
      if (objId == objectiveId){
          return i;
      }
   }

   alert("ERROR - could not find objective: " + objectiveId);
}

//SCORM requires time to be formatted in a specific way
function ConvertMilliSecondsIntoSCORM2004Time(intTotalMilliseconds){

   var ScormTime = "";

   var HundredthsOfASecond;  //decrementing counter - work at the hundreths of a second level because that is all the precision that is required

   var Seconds;  // 100 hundreths of a seconds
   var Minutes;  // 60 seconds
   var Hours;    // 60 minutes
   var Days;     // 24 hours
   var Months;      // assumed to be an "average" month (figures a leap year every 4 years) = ((365*4) + 1) / 48 days - 30.4375 days per month
   var Years;    // assumed to be 12 "average" months

   var HUNDREDTHS_PER_SECOND = 100;
   var HUNDREDTHS_PER_MINUTE = HUNDREDTHS_PER_SECOND * 60;
   var HUNDREDTHS_PER_HOUR   = HUNDREDTHS_PER_MINUTE * 60;
   var HUNDREDTHS_PER_DAY    = HUNDREDTHS_PER_HOUR * 24;
   var HUNDREDTHS_PER_MONTH  = HUNDREDTHS_PER_DAY * (((365 * 4) + 1) / 48);
   var HUNDREDTHS_PER_YEAR   = HUNDREDTHS_PER_MONTH * 12;

   HundredthsOfASecond = Math.floor(intTotalMilliseconds / 10);

   Years = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_YEAR);
   HundredthsOfASecond -= (Years * HUNDREDTHS_PER_YEAR);

   Months = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_MONTH);
   HundredthsOfASecond -= (Months * HUNDREDTHS_PER_MONTH);

   Days = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_DAY);
   HundredthsOfASecond -= (Days * HUNDREDTHS_PER_DAY);

   Hours = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_HOUR);
   HundredthsOfASecond -= (Hours * HUNDREDTHS_PER_HOUR);

   Minutes = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_MINUTE);
   HundredthsOfASecond -= (Minutes * HUNDREDTHS_PER_MINUTE);

   Seconds = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_SECOND);
   HundredthsOfASecond -= (Seconds * HUNDREDTHS_PER_SECOND);

   if (Years > 0) {
    ScormTime += Years + "Y";
   }
   if (Months > 0){
    ScormTime += Months + "M";
   }
   if (Days > 0){
    ScormTime += Days + "D";
   }

   //check to see if we have any time before adding the "T"
   if ((HundredthsOfASecond + Seconds + Minutes + Hours) > 0 ){

    ScormTime += "T";

    if (Hours > 0){
       ScormTime += Hours + "H";
    }

    if (Minutes > 0){
       ScormTime += Minutes + "M";
    }

    if ((HundredthsOfASecond + Seconds) > 0){
       ScormTime += Seconds;
      
       if (HundredthsOfASecond > 0){
          ScormTime += "." + HundredthsOfASecond;
       }
      
       ScormTime += "S";
    }

   }

   if (ScormTime == ""){
    ScormTime = "0S";
   }

   ScormTime = "P" + ScormTime;

   return ScormTime;
}

//var processedUnload = false;

// function doUnload(pressedExit){
    
//     //don't call this function twice
//     if (processedUnload == true){return;}
    
//     processedUnload = true;
    
//     //if the user just closes the browser, we will default to saving 
//     //their progress data. If the user presses exit, he is prompted.
//     //If the user reached the end, the exit normall to submit results.
//     if (pressedExit == false){
//         doSetValue("cmi.exit", "suspend");
//     }  
//     doTerminate();
// }