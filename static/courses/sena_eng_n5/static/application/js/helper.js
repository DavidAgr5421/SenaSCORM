function helper_get_subtemplates(type, data, edit)//this templating is getting out of hand the extra ajax calls are likely less overhead
{
    var t = new Array();
    // if(data.length == 1)
    // {
        // t[0] = new exercise_template(ajax_get_subtemplate(type, 'exercises', lms_config.product_type), helper_get_stimuli_templates(data[0].stimuli));
    // }
    // else
    //{
        
        for(var i = 0; i < data.length; ++i)
        { 
            if (typeof data[i]._data === 'undefined')
                break;
            data[i].template_override = helper_check_tempalte_override(data[i]._data);
        }
        
        for(var i = 0; i < data.length; ++i)
        {   
            var new_type = true;
            for (var w = 0; w < t.length; ++w)
            {
                if (t[w].template.type == data[i].type && typeof data[i].template_override === 'undefined')
                {
                    t.push(t[w]);
                    new_type = false;
                    break;
                }
            }
            if(new_type)
            {
                if(typeof edit !== 'undefined' && edit)
                {
                    if(typeof lms_config.editable !== 'undefined' && lms_config.editable){
                        t.push(new exercise_template(ajax_get_subtemplate(data[i].type, 'exercises', lms_config.product_type, 'edit_1')));
                    }
                }
                else if(typeof data[i].template_override !== 'undefined')
                {                 
                    t.push(new exercise_template(ajax_get_subtemplate(data[i].type, 'exercises', lms_config.product_type, data[i].template_override)));
                }
                else
                {
                    t.push(new exercise_template(ajax_get_subtemplate(data[i].type, 'exercises', lms_config.product_type)));
                }                                
            }
        }   
    //}
    return t;
}

/*
    Checks to see if template override exists in the _data array and will set the return value
    to the template number that needs to be loaded.
*/
function helper_check_tempalte_override(data)
{
    var ret = 1;
    
    for(var i = 0; i < data.length; ++i)
    {
        if (data[i].type == "template_override")
        {
            ret = data[i].content;
        }
    }
    return ret;
}

function helper_get_stimuli_templates(stimuli, edit)
{
    var templates = new Array();
    if(stimuli)
    {
        
        for (var i = 0; i < stimuli.length; ++i)
        {
            var new_stim_type = true;
            for (var w = 0; w < templates.length; ++w)
            {
                if(stimuli[i].type == templates[w].template.type && typeof stimuli[i].template_override === 'undefined')
                {
                    new_stim_type = false;
                    templates[i] = templates[w];
                    break;
                }                
            }
            if(new_stim_type)
            {
                if(typeof edit !== 'undefined' && edit){
                    if(typeof lms_config.editable !== 'undefined' && lms_config.editable){
                        templates[i] = new stimuli_template(ajax_get_subtemplate(stimuli[i].type, 'stimuli', lms_config.product_type, 'edit_1'));
                    }
                }
                else if(typeof stimuli[i].template_override !== 'undefined')
                {                 
                    templates[i] = new stimuli_template(ajax_get_subtemplate(stimuli[i].type, 'stimuli', lms_config.product_type, stimuli[i].template_override));
                }
                else{
                    templates[i] = new stimuli_template(ajax_get_subtemplate(stimuli[i].type, 'stimuli', lms_config.product_type));
                }
            }
        }
    }
    return templates;
}

function helper_restore_progress()
{
    var progress = ajax_get_progress();

    if(progress)
    {   
        viewModel.restoring_progress(true);
        viewModel.progress(progress);
        viewModel.restore_progress();
        viewModel.restoring_progress(false);
        return true;
    }
    else
    {
        return false;
    }

}

function helper_get_state_css(state)
{
    if(state)
    {
        if(state == 1)
        {
            return "response-default";
        }else if(state == 2)
        {
            return "response-incorrect";
        }else if(state == 3)
        {
            return "response-progress";
        }else if(state == 4)
        {
            return "response-correct";
        }            
    }else
    {
        return "warning";
    }
}

function helper_get_local_string(identifier)
{
    if(typeof localize_json[identifier] !== 'undefined')
    {
        return localize_json[identifier];
    }
}

//Creates the enscroll scrollbar 
function helper_create_scrollbar()
{
    $('.nav-scrollbar').enscroll({
        easingDuration: 1000,
        horizontalScrolling: true,
        horizontalTrackClass: 'horizontal-track',
        horizontalHandleClass: 'horizontal-handle',
    });   
};

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

// LZW-compress a string
function lzw_encode(s) {
    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i=1; i<data.length; i++) {
        currChar=data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        }
        else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase=currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var i=0; i<out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join("");
}

// Decompress an LZW-encoded string
function lzw_decode(s) {
    var dict = {};
    var data = (s + "").split("");
    var currChar = data[0];
    var oldPhrase = currChar;
    var out = [currChar];
    var code = 256;
    var phrase;
    for (var i=1; i<data.length; i++) {
        var currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        }
        else {
           phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }
    return out.join("");
}

function helper_is_loaded()
{
    if(script_loaded == 2)
    {
        helper_clear_timer();
        clearInterval(loader_timer);       
        start_main();
    }
    else
    {
        //alert('This is an error on dynamic script loading');
    }
}

function helper_clear_timer()
{
    clearInterval(loader_timer);
}
//Returns the exercise type for the currently displayed exercise
function helper_get_current_excercise_type()
{
    return viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].type();
}

function helper_show_loading()
{
    $('.page_wrapper').css({opacity: 0}); 
}

function helper_hide_loading()
{    
    $('#loading_pane').fadeOut(500);
    $('.page_wrapper').fadeTo("slow", 1, function() {
        product_helper_update_container_height();
    }); 
}

function helper_fire_resize_events()
{
    clearInterval(resize_interval);
    product_helper_fire_resize_events();
}

function helper_load_product_css(product_css)
{
    for(var i = 0; i < product_css.length; ++i)
    {
        $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'assets/'+lms_config.product_type+'/css/'+product_css[i]+'.css') );
    }    
}

//Called from the top right X button. Will exit the product.
function helper_close_product()
{
    //Shows the loading bar
    helper_show_loading();
    $('#loading_pane').fadeTo("slow", 1); 
    $('.page_wrapper').fadeOut(500);
    //Show the bar briefly and then call the exit to save progress and close the product
    close_timer = setTimeout(function(){
        viewModel.exit();
    }, 500);
}

/*
    Checks for any browser keywords in the json that will prevent the sco
    from being loaded.
    @sco_json = The json file being loaded.
*/
function helper_check_json_keywords(sco_json)
{
    //Turn the sco object into a string
    sco_json = JSON.stringify(sco_json);

    //Check for any browser keywords that will cause problems
    sco_json = sco_json.replace(/"watch"/g, "\"watch \" ");

    //Turn string back into a json object
    sco_json = JSON.parse(sco_json);

    return sco_json
}

