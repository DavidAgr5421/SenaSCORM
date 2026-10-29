var empty_function = function(){};

function disable_console_logs(){
    if(typeof console === 'undefined'){
        window.console.log = empty_function;
    }
    else{
        console.log = empty_function;
        console.error = empty_function;
    }
}

$( document ).ready(function()
{

    disable_console_logs();

    if(Miles_are_we_scorm())
    {
        Miles_get_me_the_scorm_launch_data();
    }
    else
    {
        Miles_get_me_the_config_files();
    }
    Miles_do_they_want_editing();
    //console.log("Getting scripts")
    Miles_get_the_scripts();
    Miles_get_the_css();
    if(!lms_config.product_type.match(/sena|me_english/gi))
    {
        Miles_shut_the_hanger_doors();
    }
    loader_timer=setInterval(function(){check_propulsion_levels()},250);
});
//MAXIMUM PROPULSION
function Maximum_Propulsion()
{
    //console.log("In maximum propulsion...")
    if(Miles_determine_launch_vectors() == "old")
    {
        //console.log("In old method")
        var sco_json = ajax_get_sco_json(lms_config.product_type, sco_number, lms_config.lang);
        sco_json = helper_check_json_keywords(sco_json);
        //get templates
        var lab_templates = product_core_get_lab_templates(sco_json);
        var framework_templates = core_get_lesson_templates(lms_config.product_type,lesson_config_json.product_templates, lesson_config_json.sidebar_templates);
        var product_index_html_template = core_get_product_index_html(lms_config.product_type);
        //build view model
        viewModel = new lesson_model(sco_json,lms_config,sco_number, lesson_config_json);
        //build html
        //console.log(framework_templates)
        core_build_framework_html(framework_templates, product_index_html_template);
        core_build_lesson_html(lab_templates);
        ko.applyBindings(viewModel,document.getElementsByTagName('html')[0]);
        core_set_events_listeners();
		mono_core_set_event_listeners(lesson_config_json.sidebar_tools);
        product_core_start_lesson();
        Miles_jettison_the_blast_shields();
    }
    else
    {
        //console.log("In new method")
        var sco_json = ajax_get_sco_json(lms_config.product_type, sco_number, lms_config.lang);
        sco_json = helper_check_json_keywords(sco_json);
        //get templates
        var lab_templates = product_core_get_lab_templates(sco_json);
        var framework_templates = core_get_lesson_templates(lms_config.product_type,lesson_config_json.product_templates, lesson_config_json.sidebar_templates);
        var product_index_html_template = core_get_product_index_html(lms_config.product_type);
        //build view model
        viewModel = new lesson_model(sco_json,lms_config,sco_number, lesson_config_json);
        //build html
        //console.log(framework_templates)
        core_build_framework_html(framework_templates, product_index_html_template);
        core_build_lesson_html(lab_templates);
        ko.applyBindings(viewModel,document.getElementsByTagName('html')[0]);
        core_set_events_listeners();
        //console.log("Starting product lesson")
        product_core_start_lesson();
        //console.log("Checking for race condition???")
        altitude = setInterval(function(){check_altitude_level()},250);
    }
}
