//Doohan's Orders

//Attpemt to create the API varible using SCORM 2004 4th edition methods
function Miles_are_we_scorm()
{
    // //log('Are we scorm?');
    // //log("initialized: "+initialized);
    // initialized = true;
    // //log("initialized: "+initialized);
    // return true;


    if(getURLParameter('launch_config') !== null){
        //log("not scorm");
        return false;
    }
    else
    {
        doInitialize();
        //log(initialized);
        if(initialized)
            return true;
        return false;
    }
}

function Miles_get_me_the_config_files()
{
    getting_lms_config();
    if(typeof lms_config.lang ==='undefined' || lms_config.lang === ""){
        lms_config.lang = "eng";
    }
    lesson_config_json = ajax_get_config(lms_config.product_type, client_id, config_file, lms_config.lang);
    localize_json = ajax_get_localization(lms_config.product_type, lms_config.lang);
    sco_number = lms_config.sco_number;
}

function Miles_get_me_the_scorm_launch_data()
{
    //For scorm cloud testing
    var scorm_launch_data = doGetValue("cmi.launch_data");
    //var scorm_launch_json = JSON.parse(scorm_launch_data);
    var scorm_progress_data = doGetValue("cmi.suspend_data");
    if(scorm_progress_data){
        scorm_progress_obj = JSON.parse(scorm_progress_data);
    }
    else{
        scorm_progress_obj = scorm_progress_data;
    }
    doSetValue("cmi.exit", "suspend");

    //For testing not on scorm cloud
    //var scorm_launch_json = {"startup":{"product_type": "sena", "client_id": 1, "client_config": "default", "sco_number": 5001, "lang": "eng"}, "progress":""};
    //scorm_progress_obj = scorm_launch_json.progress;

    //log(scorm_progress_obj);
    lms_config = JSON.parse(scorm_launch_data);
    //log(lms_config);
    lesson_config_json = ajax_get_config(lms_config.product_type, lms_config.client_id, lms_config.client_config, lms_config.lang);
    localize_json = ajax_get_localization(lms_config.product_type, lms_config.lang);
    sco_number = lms_config.sco_number;
}

function Miles_do_they_want_editing()
{
    if(typeof lms_config.editable !== 'undefined' && lms_config.editable)
        is_editable = true;
}

function Miles_get_the_scripts()
{
    for(var i = 0; i < lesson_config_json.swordfish_js.required_scripts.length; ++i)
    {
        var script_path = '';
        if(lesson_config_json.swordfish_js.required_scripts[i].type == "generic")
        {
            script_path = 'static/application/js/';
            //check for editing
            if(is_editable)
            {
                lesson_config_json.swordfish_js.required_scripts[i].contents.push("edit");
            }
        }
        else if(lesson_config_json.swordfish_js.required_scripts[i].type == "product")
        {
            script_path = 'assets/'+lms_config.product_type+'/js/';
            if(is_editable)
            {
                lesson_config_json.swordfish_js.required_scripts[i].contents.push(lms_config.product_type+"_edit");
            }
        }
        else if(lesson_config_json.swordfish_js.required_scripts[i].type == "mono")
        {
            script_path = 'assets/mono/js/';
        }
        for(var w = 0; w < lesson_config_json.swordfish_js.required_scripts[i].contents.length; ++w)
        {
            ++scripts_to_load;
            $.getScript(script_path+lesson_config_json.swordfish_js.required_scripts[i].contents[w]+'.js'+'?ts='+new Date().getTime(), function()
            {
                ++scripts_loaded;
            });
        }
    }
    //get_product_scripts();//old code
}

function Miles_shut_the_hanger_doors()
{
    $('.page_wrapper').css({opacity: 0});
    $('.page_wrapper').css({'z-index': 3000});
}

function Miles_jettison_the_blast_shields()
{
    $('#loading_pane').fadeOut(500);
    $('.page_wrapper').fadeTo("slow", 1, function() {
        product_helper_update_container_height();
    });
}

//Hate styling via js, fixed for sena so that it only targets one element instead of multiple
function Miles_remove_loader()
{
    $('#loading_pane').fadeTo("slow", 0, function(){
        $('#loading_pane').hide();
        product_helper_update_container_height();
    });
}

function Miles_determine_launch_vectors()
{
    if(lms_config.product_type.match(/scholar|master/gi)) {
		use_mono_system = true;
        return "old";
	} else {
		return "new";
	}

}

function Miles_get_the_css()
{
    for(var i = 0; i < lesson_config_json.product_css.length; ++i)
    {
        $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'assets/'+lms_config.product_type+'/css/'+lesson_config_json.product_css[i]+'.css') );
    }

}
//Miles Functions

function getting_lms_config()
{
    var config_file_name = getURLParameter('launch_config');
    //console.log(config_file_name)
    //var config_url = '';
    if(typeof config_file_name !== 'undefined' && config_file_name == null)
    {
        //log(lms_config);
        //lms_config set by scorm deployment creation of startup js
    }
    else if(config_file_name.match("^http")){
        lms_config = ajax_get_startup_config(config_file_name);
        //log(lms_config);
        if(typeof lms_config ==='undefined' ){
            //BAD PEOPLE STUFF
        }
    }
    else
    {
        lms_config = ajax_get_testing_startup_config("startup/"+config_file_name+".JSON");
    }
}

function check_propulsion_levels()//do we have all we need to fly
{
    if(scripts_loaded == scripts_to_load)
    {
        clearInterval(loader_timer);
        window.addEventListener("popstate", function(e) {
            helper_close_product();
        });
        Maximum_Propulsion();
    }
    else
    {
        //alert('This is an error on dynamic script loading');
    }
}

function check_altitude_level()// are we flying yet?
{
    if(race_condition_ended)
    {
        clearInterval(altitude);
        if(!lms_config.product_type.match(/sena|me_english/gi)){
            Miles_jettison_the_blast_shields();
        }
        else{
            Miles_remove_loader();
        }
        //In Safari, flash needs to have proper CSS and proper load sequence to work. 
        //Becareful of moving this elsewhere
        
        load_safari_flash_if_needed()
    }
    else
    {
        //alert('This is an error on dynamic script loading');
    }
}

function load_product_css(product_css)
{

}

function load_safari_flash_if_needed()
{
    //In cases where lesson don't have recording, set up the observable
    //flash_initialized
    if(!viewModel.flash_initialized) {
        viewModel.flash_initialized = ko.observable(false);
        viewModel.flash_has_mic = ko.observable(true);
    }
    
    if(detectSafari()) {
        $("#flash_wrapper").load("static/framework/ELLRecorder/safari_recorder.html")
        $("#flash_wrapper").css("z-index","10")
        $("#flash_wrapper").attr("data-bind","css: {'hide-flash': $root.flash_initialized() || !$root.flash_has_mic()}")
        
        //Need to wait until attribute is present. Otherwise, it will cause a timing issue.
        poll_for_data_bind_and_apply_bindings()
    }  
}

function poll_for_data_bind_and_apply_bindings()
{
    try {
        if(!$("#flash_wrapper").attr("data-bind")) {
            //console.log("Haven't found data-bind on #flash_wrapper yet...")
            setTimeout(poll_for_data_bind_and_apply_bindings, 1000);
        }
        else {
            ko.applyBindings(viewModel, $("#flash_wrapper")[0])
        }
    } catch(err) {
        //console.log("Error occurred while binding. Waiting another second before binding...")
        //console.log(err)
        if(err instanceof TypeError) {
            ko.cleanNode($("#flash_wrapper")[0])
            setTimeout(poll_for_data_bind_and_apply_bindings, 1000);
        }
    }
}
    
    
