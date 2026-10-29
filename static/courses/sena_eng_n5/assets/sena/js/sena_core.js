
/*
===========================Product Core Functions============================
*/

//These functions are core to how sena behaves
//Things such as what the product does whenever it starts a lesson, how to load the html, etc.

function product_core_build_lesson_html(templates)
{
    for(var i = 0; i < templates.length; ++i)
    {
        if(templates[i].exercise_templates.length > 0)
        {
            if (templates[i].exercise_templates){
                $('#'+templates[i].template.type+'_exercises').html(product_helper_build_exercise_html_block(templates[i].exercise_templates, templates[i].edit_templates));//deploy exercise templates
            }
            $('#'+templates[i].template.type+'_stimulus').html(product_helper_build_stimuli_html_block(templates[i].stimuli_templates, templates[i].stimuli_edit_templates));
            $('#'+templates[i].template.type+'_tss_stimulus').html(product_helper_build_stimuli_html_block(templates[i].stimuli_templates, templates[i].stimuli_edit_templates));
        }
        $('#'+templates[i].template.type+'_nav').html(templates[i].nav_template.content);
        $('#group_bar').html(templates[i].group_bar_template.content);
    }
    product_build_welcome_page();
}

function product_core_get_lab_templates(sco_json)
{
    var t = new Array();
    for(var i = 0; i < sco_json.labs.length; ++i)
    {
        if( sco_json.labs[i].type == "oed" )
        {
            t[i] = ajax_get_lab_template(sco_json.labs[i].type+sco_json.labs[i].id, lms_config.product_type)
            t[i]["exercise_templates"] = new Array();
            t[i]["exercise_templates"].push(new exercise_template(ajax_get_subtemplate(sco_json.labs[i].type, 'exercises', lms_config.product_type), helper_get_stimuli_templates(sco_json.labs[i].exercises[0].stimuli)));
            t[i]["edit_templates"] = ajax_get_subtemplate(sco_json.labs[i].type, 'exercises', lms_config.product_type, 'edit_1');
            t[i]["stimuli_templates"] = helper_get_stimuli_templates(sco_json.labs[i].stimuli);
            t[i]["nav_template"] = ajax_get_subtemplate(sco_json.labs[i].type, "nav", lms_config.product_type);
        }
        else
        {

            t[i] = ajax_get_lab_template(sco_json.labs[i].type, lms_config.product_type);
            t[i]["exercise_templates"] = helper_get_subtemplates(sco_json.labs[i].type, sco_json.labs[i].exercises);
            t[i]["edit_templates"] = helper_get_subtemplates(sco_json.labs[i].type, sco_json.labs[i].exercises, 1);
            t[i]["nav_template"] = ajax_get_subtemplate(sco_json.labs[i].type, "nav", lms_config.product_type);
            t[i]["stimuli_templates"] = helper_get_stimuli_templates(sco_json.labs[i].stimuli);
            t[i]["stimuli_edit_templates"] = helper_get_stimuli_templates(sco_json.labs[i].stimuli,1);
            t[i]["group_bar_template"] = ajax_get_subtemplate(sco_json.labs[i].type, 'group_bar', lms_config.product_type);
        }
    }
    return t;
}

function start_lesson_from_the_start(starting_group)
{
    viewModel.select_lab(0);
    viewModel.started_writing_task(0);
    viewModel.labs()[viewModel.selected_lab()].change_group(starting_group);
}

function product_core_start_lesson()
{
    // initialized = true;
    //log("initialized: "+initialized);
    //Get the exercise group counts to disable the correct radio buttons in the editor
    //Sets the observables in exercise_group_types
    viewModel.selected_lab(0);
    viewModel.labs()[0].get_group_count();
    var starting_group = 0;
    if(viewModel.number_of_sco_groups() == 1)
    {
        for(var i = 0, len = viewModel.exercise_group_types().length; i < len; ++i)
        {
            if(viewModel.exercise_group_types()[i].count() > 0)
            {
                starting_group = i;
            }
        }
    }

    if (viewModel.number_of_sco_groups() > 1 && initialized){ // don't report objects for single dr's
        product_map_scorm_question_ids();
        product_map_scorm_lesson_objectives(viewModel);
        product_define_scorm_grading(viewModel);
    }
    //check for progress
    if(initialized)
    {
        //console.log("Handling SCORM progress");
        if(typeof SCORE_CAN_ONLY_IMPROVE != "undefined"){
            SCORE_CAN_ONLY_IMPROVE = true;
        }
        //get progress via scorm methods
        if(scorm_progress_obj == "" || (viewModel._data.test() == 'true' && scorm_progress_obj.at_score == -1)){
            viewModel.progress("");
        }
        else if(viewModel._data.test() == 'true' && scorm_progress_obj.at_score >= 0){
            alert("This test has been completed.");
            viewModel.progress(scorm_progress_obj);
        }
        else{
            if(confirm("Would you like to resume from where you previously left off?")){
                viewModel.progress(scorm_progress_obj);
            }
            else{
                viewModel.progress("");
            }
        }

        if(viewModel.progress()){
            viewModel.restoring_progress(true);
            product_load_scorm_progress();
            viewModel.restore_progress();
            viewModel.restoring_progress(false);
        }
        else{
            product_first_load_scorm_actions();
            start_lesson_from_the_start(starting_group);
        }
    }
    else
    {
        //get progress from progress obj
        if(!helper_restore_progress())
        {
            start_lesson_from_the_start(starting_group);
        }
    }

    sena_core_set_event_listeners();
    // viewModel.on_welcome_page(0); //sena doesn't use this.
    product_helper_update_container_height();
    helper_create_scrollbar();
    product_helper_adjust_single_drop_positions();

    //Disable the lab selector if it is not needed
    if (viewModel.type() != "writing")
    {
        $('#lab_selector').hide();
    }

    //viewModel.labs()[viewModel.selected_lab()].change_group(viewModel.labs()[viewModel.selected_lab()].selected_group());

    viewModel.use_slide_transition(true); // TK: none user switches should be done at this point.
    //viewModel.labs()[viewModel.selected_lab()].change_group(0);
    sfx_player_init();
    sfx_player('navigate-begin');

    viewModel.set_frameset_flag();

    if(viewModel.is_gen()){
        $(window).bind('beforeunload', function(){
            return "Use the 'x' button or you may lose your data.";
        });
    }

    //doing hackey stuff for testing
    //check count of at least two groups welcome and content
    // if either is 0 single dr
    viewModel.loaded(true);
    //console.log("Setting race_condition_ended to true, the lesson has also now finished loading");
    race_condition_ended = true;
    
    realign_ie_breadcrumbs()
}

function realign_ie_breadcrumbs() {
    if(detectIE()) {
        setTimeout(function() {
            $(".header-breadcrumb-text").css("margin-right", "2px")
        }, 1000)
        
        setTimeout(function() {
            $(".header-breadcrumb-text").css("margin-right", "0px")
        }, 2000)
        setTimeout(function() {
            $(".header-breadcrumb-text").css("margin-right", "2px")
        }, 3000)
        setTimeout(function() {
            $(".header-breadcrumb-text").css("margin-right", "0px")
        }, 4000)
        setTimeout(function() {
            $(".header-breadcrumb-text").css("margin-right", "2px")
        }, 5000)
        setTimeout(function() {
            $(".header-breadcrumb-text").css("margin-right", "0px")
        }, 6000)
        setTimeout(function() {
            $(".header-breadcrumb-text").css("margin-right", "2px")
        }, 7000)
        setTimeout(function() {
            $(".header-breadcrumb-text").css("margin-right", "0px")
        }, 8000)
        setTimeout(function() {
            $(".header-breadcrumb-text").css("margin-right", "2px")
        }, 9000)
        setTimeout(function() {
            $(".header-breadcrumb-text").css("margin-right", "0px")
        }, 10000)
    }
}

function product_core_grade_LO(group) //group is the string name of the group, ie 'Quiz'
{
    var group_scores = 0;
    var group_exercise_count = 0;
    for (var i = 0, len = viewModel.labs()[0].exercises().length; i < len; ++i)
    {
        if(viewModel.labs()[0].exercises()[i].type()!="RSLT" && viewModel.labs()[0].exercises()[i].type()!="RSLT2"){ //don't count the rslt page as an exercise
            for(var k = 0, k_len = viewModel.labs()[0].exercises()[i]._data().length; k < k_len; ++k)
            {
                if( viewModel.labs()[0].exercises()[i]._data()[k].type() == "group" )
                {
                    for(var w = 0, w_len = viewModel.labs()[0].exercises()[i]._data()[k].contents().length; w < w_len; ++w)
                    {
                        if(viewModel.labs()[0].exercises()[i]._data()[k].contents()[w].type() == "group_name" && viewModel.labs()[0].exercises()[i]._data()[k].contents()[w].content() == group)
                        {
                            group_scores += viewModel.labs()[0].exercises()[i].score();
                            ++group_exercise_count;
                        }
                    }
                }
            }
        }
    }
    return (group_scores + 0.0) / (group_exercise_count + 0.0);
}



function sena_core_set_event_listeners()
{
    $('.modal').on('shown.bs.modal', function () {
        product_helper_fire_resize_events();
        stop_all_audio();
    });
    $('#myTargetWordsModal').on('hidden.bs.modal', function () {
        play_audio();
    });

    if ('ontouchstart' in document.documentElement == false) {
        $('[data-toggle="tooltip"]').tooltip();
    }

    $('#myTargetWordsModal').on('shown.bs.modal', function () {
        sfx_player('navigate-modal');
    });

    $('#learning-point').on('shown.bs.modal', function () {
        sfx_player('navigate-modal');
    });

     $('#feedback-modal').on('shown.bs.modal', function () {
        if(viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].state() == 1 &&
            viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].showing_answer()){
            sfx_player('attempt-fail');
        }
        else if(viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].state() == 2 &&
                !viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].showing_answer()){
            sfx_player('attempt-try-again');
        }
        else{
            sfx_player('attempt-success');
        }
    });

    // document.body.onmousedown = function(){sfx_player('control-down');}
}
