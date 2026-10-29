var recorder = ko.observable(undefined);

function rec_request_mic_connection(){
    var mediaConstraints = {
        audio: true
    };
    
    //Don't use mediadevices yet... Chrome is not supporting yet...
    if(detectSafari() || detectIE()){
        return false;
    }
    else if(detectChrome() && typeof navigator.getUserMedia !== 'undefined'){
        //console.log('im chrome so i use navigator.getUserMedia cause im old school');
        navigator.getUserMedia(mediaConstraints, rec_start_user_media, function(){});
        return true;
    }
    else if(!detectSafari() && typeof navigator.mediaDevices != 'undefined'){ //not sure if safari gets this, so putting in this Safari check so it goes to flash fallback just in case
        //console.log('i use mediadevices cause im new school');
        navigator.mediaDevices.getUserMedia(mediaConstraints).then(function(stream){
            rec_start_user_media(stream);
        });
        return true;
    }
    else{
        return false;
    }
}

/*Chrome and Firefox*/
function rec_start_user_media(stream) {
    recorder(new StereoRecorder(stream));
    recorder().mimeType = 'audio/ogg';
    rec_update_voice_recorder(undefined);
}

function rec_start_recording(id) {
    rec_stop_recording(id);
    recorder() && recorder().start();
}

function rec_stop_recording(id) {
    recorder() && recorder().stop();
    rec_update_voice_recorder(id);
}

function rec_update_voice_recorder(id){
    recorder().ondataavailable = function (blob) {
        if(typeof id !== 'undefined'){
            var url = URL.createObjectURL(blob);
            var voice_recorder = document.getElementById(id);
            voice_recorder.src = url;
        }
    };
}

/*Flash fallback for IE and Safari*/

function sendToFlash(movieName) {
    if (navigator.appName.indexOf("Microsoft") != -1) {
        return window[movieName] || document[movieName];
    } else {
        return document[movieName] || window[movieName];
    }
}

function flashDidPlay() {
    //check if the recorder is on the question or exercise level and handle the playing_recording observable accordingly
    // //console.log("I played");
    var obj = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()];
    if(typeof obj.question_playing_flash !== 'undefined'){
        obj.questions()[obj.question_playing_flash()].playing_recording(false);
    }
    else{
        obj.playing_recording(false);
    }
}

function flashSecure() {
    ////console.log(document.getElementById('e'));
    //var flash_player = document.getElementById('flashContent');
    // //console.log("flash security chosen");
    //document.getElementById('e').style.display = "none";
    viewModel.flash_initialized(true);
    // //console.log(viewModel.flash_initialized());
}

function flashWillRecord(){
    // //console.log("I am recording");
}

function flashDidRecord(){
    // //console.log("I recorded");
}

function flashWillPlay(){
    // //console.log("I will play");
}

function flashMicExists(existsValue) {
    // //console.log("flashMicExists:"+existsValue);
    viewModel.flash_has_mic(existsValue);             
}


function rec_stop_flash_audio(obj){
    //have to pass obj unfortunately because different products have their playing_recording observable on different levels
    obj.playing_recording(false);
    sendToFlash('flash_player').stopSound();
}
