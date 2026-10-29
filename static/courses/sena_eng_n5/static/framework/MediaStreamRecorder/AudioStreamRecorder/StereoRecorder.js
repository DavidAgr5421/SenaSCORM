// =================
// StereoRecorder.js

function StereoRecorder(mediaStream) {
    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    
    // *****
    // Time slice removed by Lial. no limit on recording time
    // *****
    // this.start = function(timeSlice) {
    this.start = function() {
        // timeSlice = timeSlice || 1000;

        mediaRecorder = new StereoAudioRecorder(mediaStream, this);

        mediaRecorder.record();

        // timeout = setInterval(function() {
        //     mediaRecorder.requestData();
        // }, timeSlice);
    };

    this.stop = function() {
        if (mediaRecorder) {
            mediaRecorder.stop();
            // clearTimeout(timeout);
            mediaRecorder.requestData();
        }
    };

    this.ondataavailable = function() {
    };

    // Reference to "StereoAudioRecorder" object
    var mediaRecorder;
    // var timeout;
}
