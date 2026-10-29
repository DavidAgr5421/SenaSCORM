function core_set_events_listeners()
{
    //Called when the dictionary modal has finished closing
    // $('#myDictionary').on('hidden.bs.modal', function () {
        // viewModel.current_selected_sub_item(-1); //Clear sub items
        // viewModel.displayed_search_term(""); //Clear search box
    // });
    // //Called when the grammar modal has finished closing
    // $('#myGrammar').on('hidden.bs.modal', function () {
        // viewModel.current_selected_sub_item(-1) //Clear sub items
    // });
    // $('#myWordList').on('hidden.bs.modal', function () {
        // viewModel.current_selected_sub_item(-1) //Clear sub items
    // });
    // $('#myIrregularVerbs').on('hidden.bs.modal', function () {
        // viewModel.current_selected_sub_item(-1); //Clear sub items
        // viewModel.modal_common_selected_item(""); //Clear selected verb
        // viewModel.modal_common_search_term(""); //Clear search box
    // });
    // $('#myCommonModal').on('hidden.bs.modal', function () {
        // viewModel.current_selected_sub_item(-1) //Clear sub items
        // viewModel.modal_common_selected_item(""); //Clear selected verb
        // viewModel.modal_common_search_term(""); //Clear search box
    // });
    // $('#myGettingStarted').on('hidden.bs.modal', function () {
        // viewModel.current_selected_sub_item(-1) //Clear sub items
    // });
    // $('#myToolbar').on('hidden.bs.modal', function () {
        // viewModel.current_selected_sub_item(-1) //Clear sub items
    // });
    // $('#myExercises').on('hidden.bs.modal', function () {
        // viewModel.current_selected_sub_item(-1) //Clear sub items
    // });
    // $('#myExerciseBar').on('hidden.bs.modal', function () {
        // viewModel.current_selected_sub_item(-1) //Clear sub items
    // });
    // $('#mySavingProgress').on('hidden.bs.modal', function () {
        // viewModel.current_selected_sub_item(-1) //Clear sub items
    // });
    $( window ).resize(function() {
    if(typeof resize_interval !== 'undefined')
    {
        clearInterval(resize_interval);
    }
    resize_interval=setInterval(function(){helper_fire_resize_events()},50);
});
}

function core_get_product_scripts()
{
    $.getScript('assets/'+lms_config.product_type+'/'+lms_config.product_type+'.js', function()
    {
        ++script_loaded;
    });
    $.getScript('assets/mono/system.js', function()
    {
        ++script_loaded;
    });
}

function core_get_lesson_templates(type, product_templates, sidebar_templates)
{
    var t = new Array();
    for (var i = 0; i < product_templates.length; ++i)
    {
        t[i] = ajax_get_product_template(type, product_templates[i]);
    }
    for (var i = 0; i < sidebar_templates.length; ++i)
    {
        t.push(ajax_get_sidebar_template(sidebar_templates[i]));
    }
    return t;
}

function core_get_product_index_html(type)
{
    var t = new Array();
    t[0] = ajax_get_product_index_html(type);
    return t;
}

function core_build_framework_html(templates, index_html)
{
    if(typeof index_html !== 'undefined'){
        $('#index_html').html(index_html[0].content);
    }

    for (var i = 0; i < templates.length; ++i)
    {
        if(templates[i].type == "header")
        {
            $('#framework_header').html(templates[i].content);
        }
        else if (templates[i].type == "lab_selector")
        {
            $('#lab_selector').html(templates[i].content);
        }
        else if (templates[i].type == "sidebar_modals")
        {
            $('#framework_sidebar_modals').html(templates[i].content);
        }
        else if (templates[i].type == "sidebar")
        {
            $('#framework_sidebar').html(templates[i].content);
        }
        else if (templates[i].type == "welcome")
        {
            $('#framework_welcome').html(templates[i].content);
        }
        else if (templates[i].type == "ko_templates")
        {
            $('#ko_templates').html(templates[i].content);
        }
        else if (templates[i].type == "learning_modals")
        {
            $('#framework_sidebar_modals').append(templates[i].content);
        }
        else if (templates[i].type == "header_modals")
        {
            $('#framework_sidebar_modals').append(templates[i].content);
        }
    }
}

function core_build_lesson_html(templates)
{
    $('#lab_container').html(product_helper_build_lab_html_block(templates));
    product_core_build_lesson_html(templates);
}

function core_close()
{
    window.close();
}

function core_soft_reload(){
    ko.cleanNode(document.getElementsByTagName('html')[0]);
    helper_show_loading();
    $('#framework_sidebar_modals').html('');
    $('#framework_sidebar').html('');
    $('#framework_header').html('');
    $('#framework_welcome').html('');
    $('#lab_selector').html('');
    $('#lab_container').html('');
    $('.modal-backdrop').remove();
    viewModel = undefined;
    lab_templates = product_core_get_lab_templates(sco_json);
    framework_templates = core_get_lesson_templates(lms_config.product_type,lesson_config_json.product_templates, lesson_config_json.sidebar_templates);
    product_index_html_template = core_get_product_index_html(lms_config.product_type);
    viewModel = new lesson_model(sco_json,lms_config,sco_number, lesson_config_json);
    core_build_framework_html(framework_templates);
    core_build_lesson_html(lab_templates);
    ko.applyBindings(viewModel,document.getElementsByTagName('html')[0]);
    product_core_start_lesson();
    helper_hide_loading();
}
