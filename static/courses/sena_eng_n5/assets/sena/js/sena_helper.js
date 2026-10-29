/*
===========================Product Helper Functions============================
*/

//This file contains functions that are used to assist with completing certain tasks
//Things such as sorting or shuffling arrays, getting id's from idx's, etc.

/*********/
/*Utility*/
/*********/
//Adds function to the Date variable type.
//Converts the current time to a formatted string.
Date.prototype.toTime = function() {
    return formatTime(this.getHours()) + ":" + formatTime(this.getMinutes()) + ":" + formatTime(this.getSeconds());
}

//Formats a number to always have 2 digits. If number is less then 10
//it will have a leading 0.
function formatTime(n){
    return n > 9 ? "" + n: "0" + n;
}

function checkResourceExist(partial_url) {
    try {
        len_partial_url = partial_url.length
        
        // If partial_url isn't a media file
        last_6_chars = partial_url.substring(len_partial_url-6)
        
        if(!(last_6_chars.indexOf('.')>=0)) {
            //console.log('Did not find a valid filename with .')
            return false 
        }
        
        // If partial_url contains space
        if(partial_url.indexOf(' ')>=0) {
            //console.log('Found spaces in url...')
            return false
        }
        
        //Assume resource exist (cannot try to get it because Chrome always throws network errors)
        return true
    } catch(exception) {
        //console.log("Could not check resources. Assuming resource exists...")
        return true
    }
}

function detectAndroidChrome() {
    var ret = false;

    var ua = navigator.userAgent.toLowerCase();
    var isAndroid = ua.indexOf("android") > -1;

    if(isAndroid) {
        ret = true;
    }

    ret = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

    return ret;
}

function detectAndroidOrMacFirefox() {
    var ua, isAndroid, isMac;
    ua = navigator.userAgent.toLowerCase();
    isAndroid = ua.indexOf("android") > -1;
    isMac = navigator.platform === 'MacIntel';

    //log(navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && isAndroid);
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && (isAndroid || isMac);
}

//Returns a string without the file extension.
//@item = The string with the file extension in it to be removed.
function product_helper_remove_extension(item)
{
    //Split the string at the start of the file extension
    var ret = item.split(".");
    //Return the first half of the string that doesn't contain the extension
    return ret[0];
}

function product_helper_get_random_percent(max)
{
    return Math.floor(Math.random() * max) + 1;
}

function product_helper_get_random_percent_range(min,max)
{
    return Math.floor(Math.random() * (max - min) + min);
}

/************************/
/*Template/html builders*/
/************************/

function product_helper_get_welcome_page_height()
{
    return window.innerHeight - 60;
}

function product_helper_fire_resize_events()
{
    product_helper_update_container_height();
    product_helper_adjust_single_drop_positions();
}

function product_helper_build_lab_html_block(templates)
{
    var html_output = '';

    for(var i = 0; i < templates.length; ++i)
    {
        html_output += '<div data-bind="visible: selected_lab() == '+i+', with: labs()['+i+']">';
        html_output += templates[i].template.content;
        html_output += '</div>';
    }
    return html_output;
}

function product_helper_build_exercise_html_block(exercise_templates, edit_templates)
{
    var html_output = '';
    for(var i = 0; i < exercise_templates.length; ++i)
    {
        // insert edit template
        if(edit_templates.length && edit_templates[i].template.content){
            var reg_str = '<span class="edit_container"></span>';
            exercise_templates[i].template.content = exercise_templates[i].template.content.replace(reg_str, edit_templates[i].template.content);
        }
        html_output += '<div data-bind="visible: selected_exercise() == '+i+', with: exercises()['+i+']">'
        html_output += exercise_templates[i].template.content;
        html_output += '</div>';
    }
    return html_output;
}

function product_helper_build_stimuli_html_block(stimuli_templates, stimuli_edit_templates)
{
    var html_output = '';

    for(var i = 0; i < stimuli_templates.length; ++i)
    {
        // insert edit template
        if(stimuli_edit_templates.length && stimuli_edit_templates[i].template.content){
            var reg_str = '<span class="edit_container"></span>';
            stimuli_templates[i].template.content = stimuli_templates[i].template.content.replace(reg_str, stimuli_edit_templates[i].template.content);
        }
        // here u are u sneaky div
        html_output += '<div class="exercise-padding" data-bind="visible: selected_stimuli() =='+i+', with: stimuli()['+i+']">'
        html_output += stimuli_templates[i].template.content;
        html_output += '</div>';
    }
    return html_output;
}

function product_build_welcome_page () { // readies wlc for flipping
    var welcome_div = $('.wlc-top-wrapper');
    if (welcome_div.length) {
        welcome_div.parent().detach().appendTo('.wlc-html');
    } else { // there is no wlc, flip to back immediately
        $('.flipper').addClass('flip');
    }
}

function product_helper_update_container_height()
{
    viewModel.windowHeight(window.innerHeight);
    viewModel.windowWidth(window.innerWidth);
    //Check to see if the current exercise is a dragdrop type
    if (product_helper_is_drag_drop_type(viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].type()))
    {
        viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].dragdrop.response_container().width($('.exercises').width() - 20);
    }

    viewModel.welcome_page_height(product_helper_get_welcome_page_height());

    viewModel.labs()[viewModel.selected_lab()].container_height(product_helper_get_lab_container_height(viewModel.labs()[viewModel.selected_lab()]._data.has_nav(), viewModel.labs()[viewModel.selected_lab()]._data.has_exercise_controls(), viewModel.selected_lab(), viewModel.labs()[viewModel.selected_lab()].type()));

    //Increase page height when there is no nav bar on the welcome page in achievement test and on lab 0 in a writing sco
    if ((viewModel._data.test() == 'true' || viewModel._data.test() == "PT") &&  viewModel.labs()[viewModel.selected_lab()].selected_exercise() == 0 || viewModel.type() == "writing" && viewModel.selected_lab() == 0)
        viewModel.labs()[viewModel.selected_lab()].container_height( viewModel.labs()[viewModel.selected_lab()].container_height() + 52);

    if(helper_get_current_excercise_type() != "SFL")
    {
        viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].drag_drop_container_width(product_helper_get_drag_drop_container_width(viewModel.labs()[viewModel.selected_lab()].type()));
    }
    if(helper_get_current_excercise_type() == "MCH")
    {
        viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].resize_cells();
    }
}

function product_helper_get_lab_container_height(nav,controls,lab_id, type)//this does alot more than lab container height
{
    //get client window height
    var inner_height = $('#framework_exercise').outerHeight();
    var controls_height = 1;

    if ($('#lab_selector').outerHeight() == 1)
        controls_height = 0;
    controls_height += ($('#lab_selector').outerHeight()) ? $('#lab_selector').outerHeight() : 0;
    controls_height += ($('#exercise_controls_'+lab_id).outerHeight()) ? $('#exercise_controls_'+lab_id).outerHeight() : 0;
    controls_height+= 45; //exercise container padding

    return inner_height - controls_height;
    //assume range .7 - .8 is 4:3 .5 - .6 is 16:9
}

function product_helper_get_objective_content_by_type(type)
{
    for(var i = 0, len = viewModel._data().length; i < len; ++i)
    {
        if(viewModel._data()[i].type() == "objectives")
        {
            for(var k = 0, k_len = viewModel._data()[i].contents().length; k < k_len; ++k)
            {
                if(viewModel._data()[i].contents()[k].type() == type)
                {
                    return viewModel._data()[i].contents()[k].content();
                }
            }
        }
    }
    return "Not Selected";
}

/*
    Checks the config file for any override templates for any specified template. Will return a list
    off template numbers that exist. Will return an array of 1, if none are found.
    @exercise_type = The exercise type that will be searched in the config.
*/
function product_helper_get_override_templates(exercise_type)
{
    //Start array off at 1 for the default template
    var ret = [1];

    for (var i = 0; i < lesson_config_json.template_overrides.length; ++i)
    {
        //Check to see if the current type is the one we are searching for
        if (lesson_config_json.template_overrides[i].type == exercise_type)
        {
            //Merge the array from the config with ret
            ret = ret.concat(lesson_config_json.template_overrides[i].overrides)
            //Exit the loop since we found what we want
            break;
        }
    }

    //Return the final array of all available templates for the exercise
    return ret;
}

/*
    Checks the current question to see if it is a rec question or not.
    @_data = The question _data where the rec information is stored.
*/
function product_helper_check_rec_question(_data)
{
    var ret = false;

    //Loop through the question data
    for (var d = 0; d < _data.length; ++d)
    {
        //Make sure it's question type, rec is only in a question
        if (_data[d].type() == "question")
        {
            for (var i = 0; i < _data[d].contents().length; ++i)
            {
                //Check to make sure it contains a rec
                if (_data[d].contents()[i].type() == "rec")
                    ret = true;
            }
        }
    }
    return ret;
}

// Handles highlighting and text scrolling for audio and video stimulus.
// Should be called as callback for media player's timeupdate event.
// obj = stimulus model, player = initiated mediaelementplayer object
function product_helper_av_text_events(obj, player) {
	try {
		//Update the position observable
		obj.player_pos(player.currentTime * 1000);

		//Get the current time
		var new_time = player.currentTime * 1000;

		var text_number_selecter = 0;

		if (obj.contents()[obj.slideshow_image_position()].value.images().length > 0)
		{
			//Check to see if we are past the first paragraph
			if (new_time >= obj.contents()[obj.slideshow_image_position()].value.images()[0].time())
			{
				for (i = 0 , i_len = obj.contents()[obj.slideshow_image_position()].value.images().length; i < i_len; ++i)
				{
					if(obj.contents()[obj.slideshow_image_position()].value.images()[i].time() < new_time)
					{
						text_number_selecter = obj.contents()[obj.slideshow_image_position()].value.images()[i].id();
					}
				}
				//Check to see if the last paragraph is selected. Exit since there is not one after
				if (obj.selected_audio_text() + 1 >= obj.contents()[obj.slideshow_image_position()].value.images().length)
				{
					if (new_time < obj.contents()[obj.slideshow_image_position()].value.images()[obj.selected_audio_text()].time())
					{
						obj.selected_audio_text(text_number_selecter -1);

						//$('.stimulus').animate({scrollTop: (obj.offset_top_scroll()-obj.offset_height_scroll()-100)+"px"});
						$('.video_text_wrapper').animate({scrollTop: (obj.offset_top_scroll()-obj.offset_height_scroll()-100)+"px"});
					}

					if (new_time >= (player.duration * 1000))
						// $('.stimulus').animate({scrollTop: "0px"});
						$('.video_text_wrapper').animate({scrollTop: "0px"});
				}
				//If the time is greater then the time of the next paragraph then change to that paragraph
				else if (new_time >= obj.contents()[obj.slideshow_image_position()].value.images()[obj.selected_audio_text() + 1].time())
				{
					obj.selected_audio_text(text_number_selecter);
					obj.scroll_setter();
					// $('.stimulus').animate({scrollTop: (obj.offset_top_scroll())+"px"});
					$('.video_text_wrapper').animate({scrollTop: (obj.offset_top_scroll())+"px"});
				}
				else if (new_time < obj.contents()[obj.slideshow_image_position()].value.images()[obj.selected_audio_text()].time())
				{
					obj.selected_audio_text(text_number_selecter);
					obj.scroll_setter();
					// $('.stimulus').animate({scrollTop: (obj.offset_top_scroll())+"px"});
					$('.video_text_wrapper').animate({scrollTop: (obj.offset_top_scroll())+"px"});
				}
			}
			else //Make sure it doesn't set on page load
			{
				obj.selected_audio_text(0);
			}
		}
	} catch(exception) {
		//console.log("Could not finish text highlighting properly...")
	}
}

function product_helper_get_question_idx_from_id(ex, q_id){
    if(q_id<ex.questions().length && ex.questions()[q_id].id() == q_id){
        return q_id;
    }
    else{
        for(var q=0, q_len=ex.questions().length; q<q_len; ++q){
            if(ex.questions()[q].id() == q_id){
                return q;
            }
        }
    }
}

function nav_act_onload_back(img_obj) {
	//console.log("Inside of nav_act_onload_back")
	
	img_obj.onmouseover = function() {
		img_obj.src='assets/' + lms_config.product_type + '/icons/lessonNav_back_button-over.png'
	}
	
	img_obj.onmouseout = function() {
		img_obj.src='assets/' + lms_config.product_type + '/icons/lessonNav_back_button.png';
	}
}


function nav_act_onload_next(img_obj) {
	//console.log("Inside of nav_act_onload_next")
	
	img_obj.onmouseover = function() {
		img_obj.src='assets/' + lms_config.product_type + '/icons/lessonNav_next_button-over.png'
	}
	
	img_obj.onmouseout = function() {
		img_obj.src='assets/' + lms_config.product_type + '/icons/lessonNav_next_button.png';
	}
}

function product_helper_check_media_players_visible(player){
    var media = $(player);
    var ret = true;
    for (var l = 0; l < media.length; ++l){
        if(media[l].offsetParent === null){
            ret = false;
        }
    }
    return ret;
}