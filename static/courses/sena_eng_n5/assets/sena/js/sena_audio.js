/*
===========================Sena Audio Functions============================
*/

//This is sena_audio.js, it holds the functions responsible for the audio in sena.

//assing in the div element the audio is contained in will play that audio
//calling play_audio() with nothing passed in will pause all audios not in the stimuli
var binded_audios_to_play = []; //an array of loading audios preparing to be played

function play_audio(value)
{
    if(typeof value != "undefined"){
        if(value.children[0].paused == true)
        {
            stop_all_audio();

            //small timeout to accomodate updating of audio src
            setTimeout(function() { 
				value.children[0].load();
			}, 10);
            //push the audio to the list of loading audios
            binded_audios_to_play.push(value.children[0]);
            //bind to canplay, so the audio plays once it is loaded
            $(value.children[0]).bind("canplay", function(){
                value.children[0].play();
                clear_loading_audios();
            });

            //update UI to playing
            value.children[1].className = value.children[1].className.replace( /(?:^|\s)glyphicon-play(?!\S)/g , ' glyphicon-stop' );
            value.className = value.className.replace( /(?:^|\s)paused_audio(?!\S)/g , ' playing_audio' );
            $(value.children[0]).bind("ended", function() {
                value.children[1].className = value.children[1].className.replace( /(?:^|\s)glyphicon-stop(?!\S)/g , ' glyphicon-play' );
                value.className = value.className.replace( /(?:^|\s)playing_audio(?!\S)/g , ' paused_audio' );
                $(value.children[0]).unbind("ended");
            });
        }
        else{
            stop_all_audio();
        }
    }
    else{
        stop_all_audio();
    }
}

//stops ALL audio on the screen (stimuli and exercise audio)
function stop_all_audio()
{
    // console.log('stopping ALL audio');
    clear_loading_audios();
    
    stop_all_exercise_audio();
    stop_all_stim_audio();
    update_ui_all_audios();
}

//clear all loading audios
function clear_loading_audios(){
    var tmp;
    var count = 0;
    while(binded_audios_to_play.length){
        tmp = binded_audios_to_play.pop();
        $(tmp).unbind("canplay");
        if(count > 100)
            break;
    }
}

//used to do all the functions to completely stop all the playing and loading exercise audios and update their ui appropriately
function stop_all_exercise_audio(){
    clear_loading_audios();
    stop_exercise_audios();
    update_ui_all_audios();
}

//stops all the playing exercise audio
function stop_exercise_audios()
{
    //console.log('stopping all exercise audio');
    var audios = $('.audio_player');
    for (var l = 0; l < audios.length; ++l){
        audios[l].pause();
    }
}

//stops all stimulus audios
function stop_all_stim_audio()
{
    //console.log('stopping all stimuli audio');
    var stim_audio = $('.stim_audio');
    //console.log(stim_audio);
    for (var l = 0; l < stim_audio.length; ++l){
        //some elements tagged with the class stim_audio have not be initialized yet and thus don't have the pause function
        if(typeof stim_audio[l].pause == "function") {
            //console.log(stim_audio[l]);
            stim_audio[l].pause();
            if(typeof stim_audio[l].setCurrentTime == 'function' && stim_audio[l].currentTime > 0){ //for using mediaElementsJS
                stim_audio[l].setCurrentTime(0);
            }
            else if(typeof stim_audio[l].currentTime !== 'undefined' && stim_audio[l].currentTime > 0){ //for using regular HTML5 audio
                stim_audio[l].currentTime = 0;
            }
        }
    }
}

//updates the ui of all playing audios to be stopped
function update_ui_all_audios(){
    //console.log('updating all audio ui');
    var playing_audio = $('.playing_audio');
    if (playing_audio.length > 0){
        playing_audio[0].children[1].className = playing_audio[0].children[1].className.replace( /(?:^|\s)glyphicon-stop(?!\S)/g , ' glyphicon-play' );
        playing_audio[0].className = playing_audio[0].className.replace( /(?:^|\s)playing_audio(?!\S)/g , ' paused_audio' );
    }
}

function set_and_play(css_selector, time) {
    try{
        if(typeof $(css_selector)[0].player == 'undefined'){
            //console.log('isnt one')
            var player = new MediaElementPlayer(css_selector);
        }
        else{
            //console.log('is one')
        }
        $(css_selector)[0].player.load();
        $(css_selector)[0].player.play();
        //this event listener fires after the player loads so that the audio will set the time after the player loads
        $(css_selector)[0].addEventListener('loadeddata', function(){$(css_selector)[0].player.setCurrentTime(time / 1000)}, false);
        //the loadeddata event only fires once, we need a second call so that subsequent clicks will set the correct time
        $(css_selector)[0].player.setCurrentTime(time / 1000)
    }
    catch(err)
    {
        //console.log(err);
    }
}

function sfx_player_init(){
    viewModel.sfx_player = $('#sfx_player').mediaelementplayer({
        videoWidth: 0,
        videoHeight: 0,
        defaultVideoWidth: 0,
        defaultVideoHeight: 0,
        audioWidth: 0,
        audioHeight: 0,
        loop: false,
        startVolume: 0.8,
        preLoad: true,
        alwaysShowHours: false,
        showTimecodeFrameCount: false,
        pluginPath: '/static/framework/media-elements/',
        flashName: 'flashmediaelement.swf',
        pauseOtherPlayers: false,
        enableKeyboard: false             
    });
    //console.log(viewModel.sfx_player)
    $(viewModel.sfx_player[0]).addClass("sfx-player");
    viewModel.audio_extension = '.mp3';
    if(typeof viewModel.sfx_player != 'undefined'){
        if (viewModel.sfx_player[0].canPlayType('audio/mpeg;')) {
            $(viewModel.sfx_player[0]).attr("type", 'audio/mpeg');
        }
        else{
            $(viewModel.sfx_player[0]).attr("type", 'audio/ogg');
            viewModel.audio_extension = '.ogg';
        }
    }
}

function sfx_player(audio_file){
    if(viewModel.sfx_on() && typeof viewModel.sfx_player != 'undefined'){
        $(viewModel.sfx_player[0]).attr("src", 'assets/'+lms_config.product_type+'/sounds/'+audio_file+viewModel.audio_extension);
        viewModel.sfx_player[0].load();
        viewModel.sfx_player[0].addEventListener('loadeddata', sfx_player_play, false);
    }
}

function sfx_player_play(){
    viewModel.sfx_player[0].play();
    viewModel.sfx_player[0].removeEventListener('loadeddata', sfx_player_play, false);
}