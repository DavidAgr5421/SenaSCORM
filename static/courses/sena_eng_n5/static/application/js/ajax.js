function ajax_get_config(type, client_id, config_file, lang)
{
    var ret = undefined;
    $.ajax({
        url: "assets/"+type+"/config/"+client_id+"/"+lang+"/"+config_file+".JSON"+'?ts='+new Date().getTime(),
        dataType: "json",
        async: false,
        success: function (data, status, xhr) {
            ret = data;
        }
    });
    return ret;
}

function ajax_get_testing_startup_config(path)
{
    var ret = undefined;
    $.ajax({
        url: path,
        dataType: "json",
        async: false,
        success: function (data, status, xhr) {
            ret = data;
        }
    });
    return ret;
}

function ajax_get_startup_config(launch_config)
{
    var ret = undefined;
    $.ajax({
        type: 'POST',
        data: {'launch_config': launch_config},
        url: 's3/s3proxy.php',
        dataType: "json",
        async: false,
        success: function (data, status, xhr) {
           ret = data;
        }
    });
    return ret;
}

function ajax_get_localization(type, lang)
{
    var ret = undefined;
    $.ajax({
        url: "assets/"+type+"/common/localization/"+lang+"/localize.JSON"+'?ts='+new Date().getTime(),
        dataType: "json",
        async: false,
        success: function (data, status, xhr) {
            ret = data;
        }
    });
    return ret;
}

function ajax_get_sco_json(type, sco_number, lang)
{
    var url = "assets/"+type+"/scos/"+sco_number+"/"+lang+"/lesson.JSON"+'?ts='+new Date().getTime();
    if(typeof lms_config.sco_json !== 'undefined'){
        url = "assets/"+type+"/scos/"+sco_number+"/"+lang+"/"+lms_config.sco_json+'?ts='+new Date().getTime();
    }
    var ret = undefined;
    $.ajax({
        url: url,
        dataType: "json",
        async: false,
        success: function (data, status, xhr) {
            ret = data;
        }
    });
    return ret;
}

function ajax_get_dictionary_json(type, lang)
{
    var ret = undefined;
    $.ajax({
        url: "assets/"+type+"/common/dictionary/"+lang+"/dictionary.JSON",
        dataType: "json",
        async: false,
        success: function (data, status, xhr) {
            ret = data;
        }
    });
    return ret;
}

function ajax_get_grammar_json(type, lang)
{
    var ret = undefined;
    $.ajax({
        url: "assets/"+type+"/common/grammar/"+lang+"/grammar.JSON",
        dataType: "json",
        async: false,
        success: function (data, status, xhr) {
            ret = data;
        }
    });
    return ret;
}

function ajax_get_wordlist_json(type, lang)
{
    var ret = undefined;
    $.ajax({
        url: "assets/"+type+"/common/wordlist/"+lang+"/wordlist.JSON",
        dataType: "json",
        async: false,
        success: function (data, status, xhr) {
            $.each(data, function( i, obj ) {
                if( obj.SCOs.indexOf(parseInt(sco_number)) >=0 ){
                    ret = obj;
                    return ret;
                }
            });
        }
    });    
    return ret;
}

function ajax_get_irregular_verbs_json(type, lang){
    var ret = undefined;
    $.ajax({
        url: "assets/"+type+"/common/irregular_verbs/"+lang+"/irregular_verbs.JSON",
        dataType: "json",
        async: false,
        success: function (data, status, xhr) {
            ret = data;
        }
    });
    return ret;
}

function ajax_get_common_modal_json(type, lang, json){
    var ret = undefined;
    $.ajax({
        url: "assets/"+type+"/common/"+json+"/"+lang+"/"+json+".JSON",
        dataType: "json",
        async: false,
        success: function (data, status, xhr) {
            ret = data;
        }
    });
    return ret;
}

function ajax_get_text_tips_json(type, lang){
    var ret = undefined;
    $.ajax({
        url: "assets/"+type+"/common/text_tips/"+lang+"/text_tips.JSON",
        dataType: "json",
        async: false,
        success: function (data, status, xhr) {
            ret = data;
        }
    });
    return ret;
}

function ajax_get_comprehension_tips_json(type, lang){
    var ret = undefined;
    $.ajax({
        url: "assets/"+type+"/common/comprehension_tips/"+lang+"/comprehension_tips.JSON",
        dataType: "json",
        async: false,
        success: function (data, status, xhr) {
            ret = data;
        }
    });
    return ret;
}

function ajax_get_target_words_json(type, sco_num,lang){
    var ret = undefined;
    $.ajax({
        url: "assets/"+type+"/common/target_words/"+sco_num+"/"+lang+"/"+sco_num+"-target-words.JSON",
        dataType: "json",
        async: false,
        success: function (data, status, xhr) {
            ret = data;
        }
    });
    return ret;
}

function ajax_get_writing_tips_json(type, lang){
    var ret = undefined;
    $.ajax({
        url: "assets/"+type+"/common/writing_tips/"+lang+"/writing_tips.JSON",
        dataType: "json",
        async: false,
        success: function (data, status, xhr) {
            ret = data;
        }
    });
    return ret;
}

function ajax_get_sidebar_template(template_type)
{    
    var ret = undefined;
    $.ajax({
        url: "assets/mono/templates/"+template_type+".html"+'?ts='+new Date().getTime(),
        dataType: "html",
        async: false,
        success: function (data, status, xhr) {
            ret = new template(template_type, data);
        }
    });
    return ret;
}

function ajax_get_product_template(product_type, template_type)
{
    var url = undefined;
    if(typeof lms_config.editable !== 'undefined' && lms_config.editable && (template_type == 'header' || template_type == 'learning_modals')){
        url = "assets/"+product_type+"/templates/product/edit_"+template_type+".html"+'?ts='+new Date().getTime()
    }
    else{
        url = "assets/"+product_type+"/templates/product/"+template_type+".html"+'?ts='+new Date().getTime()
    }
    var ret = undefined;
    $.ajax({
        url: url,
        dataType: "html",
        async: false,
        success: function (data, status, xhr) {
            ret = new template(template_type, data);
        }

    });
    return ret;
}

function ajax_get_product_index_html(product_type)
{
    var url = undefined;
    url = "assets/"+product_type+"/templates/product/index.html"+'?ts='+new Date().getTime()
    var ret = undefined;
    $.ajax({
        url: url,
        dataType: "html",
        async: false,
        success: function (data, status, xhr) {
            ret = new template(product_type, data);
        }
    });
    return ret;
}

function ajax_get_lab_template(type, product_type)
{    
    var ret = undefined;
    $.ajax({
        url: "assets/"+product_type+"/templates/lab/"+type+"/1.html"+'?ts='+new Date().getTime(),
        dataType: "html",
        async: false,
        success: function (data, status, xhr) {            
            ret = new lab_template(new template(type,data), new Array());
        }          
    });
    return ret;
}

function ajax_get_subtemplate(type, sub_type, product_type, override)
{
    var url = "assets/"+product_type+"/templates/"+sub_type+"/"+type+"/1.html"+'?ts='+new Date().getTime();
    if(typeof override !== 'undefined')
    {
        var url = "assets/"+product_type+"/templates/"+sub_type+"/"+type+"/"+override+".html"+'?ts='+new Date().getTime();
    }         
    var ret = undefined;
    $.ajax({
        url: url,
        dataType: "html",
        async: false,
        success: function (data, status, xhr) {            
            ret = new template(type,data);
        }          
    });
    return ret;
}

function ajax_get_mono_system_modal_template(modal)
{
    var url = "assets/mono/templates/sidebar_modals/"+modal+'?ts='+new Date().getTime();
    var ret = undefined;
    $.ajax({
        url: url,
        dataType: "html",
        async: false,
        success: function (data, status, xhr) {            
            ret = new template(modal,data);
        }          
    });
    return ret;
}

function ajax_write_progress(progress_json)
{
    var ret = undefined;
    if(!progress_sent)
    {
        //progress_sent = true;
        var url = lms_config.set_progress_url+'?ts='+new Date().getTime(); 
        payload = "";
        if (lms_config.new_lms == true)
            payload = JSON.stringify({progress_data: progress_json, lesson:lms_config.lesson_id, sco_number:lms_config.sco_number, swordfish_1_progress:true, pk:viewModel.lesson_pk});
        else
            payload = progress_json;


        $.ajax({
            type: "POST",
            url: url,
            data: {progress:payload},
            async: false,
            success: function (data, status, xhr) {    
                ret = data;        
            }          
        });
    }
    if (lms_config.new_lms == true)
        viewModel.lesson_pk = JSON.parse(ret)["pk"]
    return ret;
}

function ajax_get_progress()
{
    var url = lms_config.get_progress_url+'&ts='+new Date().getTime();      
    var ret = undefined;
    $.ajax({
        type: "GET",
        url: url,
        async: false,
        success: function (data, status, xhr) {            
            ret = data;            
        }          
    });
    return ret;
}
