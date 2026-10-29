/*
===========================Sena Progress Functions============================
*/

// This is sena_progress.js it holds all the functions responsible for saving and restoring lesson progress.
// It does not include the specific functions that handle doing SCORM progress (that lives with all the SCORM specific code in sena_scorm.js)
// It does not include the functions used to produce dragdrop progress strings and restore them (this lives with the dragdrop specific code in sena_dragdrop.js)

/*Saves all progress*/
function do_progress_actions(){
    //console.log("Do all progress actions");
    viewModel.get_progress(); //get progress has to be first so that the question info is set
    if(initialized && viewModel.number_of_sco_groups() > 1){ // don't send objectives for single DR's
        product_save_scorm_progress();
        product_save_scorm_interactions();
    }
}
//Only the scorm progress*/
function do_scorm_progress_actions(){
    //console.log("Do scorm progress actions");
    if(initialized && viewModel.number_of_sco_groups() > 1){ // don't send objectives for single DR's
        product_save_scorm_progress();
        product_save_scorm_interactions();
    }
}

/*Builds the progress string and writes it to the LMS*/
function product_get_progress(obj) //HRC
{
    //console.log("Begin saving progress");
    var response_str = "";
    var group_selected_exercise = [];
    var exercise_attempts = [];
    var shown_pre_screen = [];
    var items = []; //used for Minedu
    var restore_states = [];
    var feedback_showing_answer = [];

    var typ_progress = [];
    var kar_progress = [];
    var giw_progress = [];
    var hng_progress = [];
    var gwr_progress = [];
    var cwd_progress = [];
    var dragdrop_progress = [];
    var ttt_progress = [];
    var mch_progress = {'attempts' : [], 'responses' : []};
    var oed_progress = '';
    var spk_progress = [];
    var rec_dragdrop_progress = [];
    var last_progress = undefined;

    var scorm_question_info = [];
    
    var time_spent = 0;
    obj.exit_time = Date.now();
    obj.elapsed_seconds = (obj.exit_time - obj.start_time)/1000;

    //Check if you need to use SCORM's progress
    if(initialized){
        if(typeof obj.progress() !== 'undefined'){
            last_progress == obj.progress();
        }
    }
    else if(typeof obj.progress() !== 'undefined')
    {
        last_progress = JSON.parse(obj.progress());
    }

    var date = new Date();
    var last_attempt = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
    
    //Update the elasped time spent on the lesson using the old progress data
    if(obj.elapsed_seconds > 7200){ //max out the amount of time for a session to 2 hours
        //console.log("Session took longer than 2 hours. Here are some stats:")
        //console.log("Start time: " + obj.start_time)
        //console.log("Exit time: " + obj.exit_time)
        obj.elapsed_seconds = 7200;
    }
    if(typeof last_progress !== 'undefined' && parseInt(last_progress.time_spent) > 0)
    {
        time_spent = obj.elapsed_seconds + parseInt(last_progress.time_spent);
    }
    else{
        time_spent = obj.elapsed_seconds;
    }

    //Save which exercise each group was on when the student left
    for(var i = 0; i<obj.exercise_group_types().length; ++i){
        group_selected_exercise.push('g'+i+'e'+obj.exercise_group_types()[i].group_selected_exercise_idx());
    }

    //Get all the lab progress data
    for (var i = 0; i < obj.labs().length; ++i)
    {
        //Sena only uses scholar type lab, so probably don't need the other checks anymore
        if(obj.labs()[i].type().match(/scholar/i) || obj.labs()[i].type() == "act" || obj.labs()[i].type() == "oed" )
        {
            //Get the exercise progress for the lab
            for (var w = 0; w < obj.labs()[i].exercises().length; ++w)
            {
                //Save how many attempts the student has used for the exercise
                exercise_attempts.push('l'+i+'e'+w+'a'+obj.labs()[i].exercises()[w].feedback().attempts());
                //Save whether the prescreen has been shown or not
                shown_pre_screen.push('l'+i+'e'+w+'p'+obj.labs()[i].exercises()[w].shown_pre_screen());
                
                //The welcome page, and result pages don't have any progress to restore (technically DWS, the takeaway, could be added... probably)
                if (obj.labs()[i].exercises()[w].type() != "WLC" && obj.labs()[i].exercises()[w].type() != "RSLT" && obj.labs()[i].exercises()[w].type() != "RSLT2" && obj.labs()[i].exercises()[w].type() != "DWS")
                {   
                    //TYP, HNG, CWD need generic progress done as well as special stuff
                    if( obj.labs()[i].exercises()[w].type() == "TYP" ) //EXS
                    {
                        if(obj.labs()[i].exercises()[w].showing_answer()){
                            typ_progress.push.apply(typ_progress, obj.labs()[i].exercises()[w].final_special_progress);
                        }
                        else{
                            typ_progress.push.apply(typ_progress, get_TYP_progress(i, w));
                        }
                    }

                    if( obj.labs()[i].exercises()[w].type() == "HNG" ) //EXS
                    {
                        if(obj.labs()[i].exercises()[w].showing_answer()){
                            hng_progress.push.apply(hng_progress, obj.labs()[i].exercises()[w].final_special_progress);
                        }
                        else{
                            hng_progress.push.apply(hng_progress, get_HNG_progress(i, w));
                        }
                    }

                    if( obj.labs()[i].exercises()[w].type() == "CWD" ) //EXS
                    {
                        if(obj.labs()[i].exercises()[w].showing_answer()){
                            cwd_progress.push.apply(cwd_progress, obj.labs()[i].exercises()[w].final_special_progress);
                        }
                        else{
                            cwd_progress.push.apply(cwd_progress, get_CWD_progress(i, w));
                        }
                    }

                    //Dragdrop Specific Progress, and the other exercises that have special progress and don't need generic progress saved
                    if(product_helper_is_drag_drop_type(obj.labs()[i].exercises()[w].type()) && !obj.labs()[i].exercises()[w].showing_answer())
                    {
                       //console.log("Getting dragdrop progress with no answer showing");
                       if(obj.labs()[i].exercises()[w].feedback_showing_answer()){ 
                            rec_dragdrop_progress += get_rec_progress(i,w); //only mark the recording complete if they are done the exercise (at least until we start actually saving recordings)
                       }
                        dragdrop_progress += obj.labs()[i].exercises()[w].dragdrop.get_progress_str(i,w);
                    }
                    else if(product_helper_is_drag_drop_type(obj.labs()[i].exercises()[w].type()) && obj.labs()[i].exercises()[w].showing_answer()){
                        //console.log("Getting dragdrop progress with answer showing");
                        rec_dragdrop_progress += get_rec_progress(i,w);
                        dragdrop_progress += obj.labs()[i].exercises()[w].final_special_progress;
                    }
                    else if( obj.labs()[i].exercises()[w].type() == "KAR" ) //EXS
                    {
                        if(obj.labs()[i].exercises()[w].showing_answer()){
                            kar_progress.push.apply(kar_progress, obj.labs()[i].exercises()[w].final_special_progress);
                        }
                        else{
                            kar_progress.push.apply(kar_progress, get_KAR_progress(i, w));
                        }
                    }
                    else if( obj.labs()[i].exercises()[w].type() == "GWR" ) //EXS
                    {
                        if(obj.labs()[i].exercises()[w].showing_answer()){
                            gwr_progress.push.apply(gwr_progress, obj.labs()[i].exercises()[w].final_special_progress);
                        }
                        else{
                            gwr_progress.push.apply(gwr_progress, get_GWR_progress(i, w));
                        }
                    }
                    else if( obj.labs()[i].exercises()[w].type() == "TTT" ) //EXS
                    {
                        if(obj.labs()[i].exercises()[w].showing_answer()){
                            ttt_progress.push.apply(ttt_progress, obj.labs()[i].exercises()[w].final_special_progress);
                        }
                        else{
                            ttt_progress.push.apply(ttt_progress, get_TTT_progress(i, w));
                        }
                    }
                    else if( obj.labs()[i].exercises()[w].type() == "GIW" ) //EXS
                    {
                        if(obj.labs()[i].exercises()[w].showing_answer()){
                            giw_progress.push.apply(giw_progress, obj.labs()[i].exercises()[w].final_special_progress);
                        }
                        else{
                            giw_progress.push.apply(giw_progress, get_GIW_progress(i, w));
                        }
                    }
                    else if( obj.labs()[i].exercises()[w].type() == "MCH" ) //EXS
                    {
                        if(obj.labs()[i].exercises()[w].showing_answer()){
                            mch_progress.responses.push.apply(mch_progress.responses, obj.labs()[i].exercises()[w].final_special_progress.responses);
                            mch_progress.attempts.push.apply(mch_progress.attempts, obj.labs()[i].exercises()[w].final_special_progress.attempts);
                        }
                        else{
                            var tmp_mch_progress = get_MCH_progress(i, w);
                            mch_progress.responses.push.apply(mch_progress.responses, tmp_mch_progress.responses);
                            mch_progress.attempts.push.apply(mch_progress.attempts, tmp_mch_progress.attempts);
                        }
                    }
                    else if( obj.labs()[i].exercises()[w].type() == "oea" ) //EXS ... there's no sena ex type oea, it's oed, not sure if this was a typo, but afraid to change it
                    {
                        if(obj.labs()[i].exercises()[w].showing_answer()){
                            oed_progress += obj.labs()[i].exercises()[w].final_special_progress;
                        }
                        else{
                            oed_progress += get_oed_progress(i, w);
                        }
                    }
                    else{ //all the generic progress stuff
                        if(obj.labs()[i].exercises()[w].showing_answer()){
                            response_str += obj.labs()[i].exercises()[w].final_generic_progress;
                        }
                        else{
                            var tmp_response_str = get_generic_exercise_progress(i, w);
                            //console.log(tmp_response_str);
                            response_str += tmp_response_str;
                        }
                    }
                }

                //Do old progress stuff (for Minedu)
                if(obj.is_gen()){
                    //console.log("Do Minedu progress stuff");
                    var temp_items = items.slice();
                    items = get_old_method_of_progress(obj, temp_items, i, w);
                }

                //this check should probably include RSTL2 as well (RSLT2 is just for placement tests though)
                // if(obj.labs()[i].exercises()[w].checked_answer() && obj.labs()[i].exercises()[w].state() != 2 && obj.labs()[i].exercises()[w].state() != 4 && obj.labs()[i].exercises()[w].type() !="RSLT" && obj.labs()[i].exercises()[w].type() != "STI")
                // {
                if(obj.labs()[i].exercises()[w].checked_answer() && obj.labs()[i].exercises()[w].type() !="RSLT" && obj.labs()[i].exercises()[w].type() !="RSLT2" && obj.labs()[i].exercises()[w].type() != "WLC" && obj.labs()[i].exercises()[w].type() != "DWS")
                {
                    restore_states.push('l'+i+'e'+w);
                }

                if(obj.labs()[i].exercises()[w].feedback_showing_answer())
                {
                    feedback_showing_answer.push('l'+i+'e'+w);
                }

                //Hack because there was bad code adding more items then there were exercises, but that was fixed and this shouldn't be needed anymore
                if(items.length > 8 && viewModel._data.test() != 'true'  && viewModel._data.test() != 'PT'){
                    items = items.splice(0,8)
                }

                if(obj.labs()[i].exercises()[w].type() == "SPK" && obj.labs()[i].exercises()[w].started())
                {
                    for(var k = 0, k_len = obj.labs()[i].exercises()[w].attempt_times().length; k < k_len; ++k)
                    {
                        spk_progress.push('l'+i+'e'+w+'|'+obj.labs()[i].exercises()[w].attempt_times()[k]);
                    }
                }
            }
        }
    }
    //Stringify items for old progress (Minedu)
    var items_str = JSON.stringify(items);

    //Add missing comma for splitting TYP progress
    if(typ_progress.length) //EXS
    {
        var typ_length = typ_progress.length;
        var temp_response = typ_progress[typ_length-1]+',';
        typ_progress[typ_length-1] = temp_response;
        for(var i = 0; i<typ_length;++i){
            //get rid of the last few characters that can break TYP and just replace them with spaces
            typ_progress[i] = typ_progress[i].replace(/[\"]/g, " ");
            typ_progress[i] = typ_progress[i].replace(/[\\]/g, " ");
        }
    }

    //Quiz progress
    var quiz_score = -1;
    if(typeof obj.labs()[obj.selected_lab()].quiz_score() !== 'undefined'){
        quiz_score = obj.labs()[obj.selected_lab()].quiz_score();
        //used to only improve quiz score for Minedu, however it was decided that this would be done on the back end side
        // if(obj.is_gen() && parseInt(last_progress.quiz_score) > quiz_score){
        //     quiz_score = parseInt(last_progress.quiz_score);
        // }
    }

    var progress = "{\"datamodel\": { \"cmi\" : { \"core\" : { \"student_name\": \""+lms_config.student_name+"\", \"student_id\": \""+lms_config.student_id+"\", \"course_id\": \""+lms_config.course_id+"\", \"lesson_location\": \"l"+obj.selected_lab()+"e"+obj.labs()[obj.selected_lab()].selected_exercise()+"\"}, \"objectives\": { \"count\" : "+items.length+", \"items\" : "+items_str+"} } }, \"group_location\":\""+obj.labs()[obj.selected_lab()].selected_group()+"\", \"group_selected_exercise\":\""+group_selected_exercise+"\", \"exercise_attempts\":\""+exercise_attempts+"\", \"responses\": \""+response_str+"\", \"typ_progress\" : \""+typ_progress+"\", \"kar_progress\" : \""+kar_progress+"\", \"gwr_progress\" : \""+gwr_progress+"\", \"cwd_progress\" : \""+cwd_progress+"\", \"spk_progress\" : \""+spk_progress+"\", \"mch_progress\" : "+JSON.stringify(mch_progress)+", \"ttt_progress\" : \""+ttt_progress+"\", \"giw_progress\" : \""+giw_progress+"\", \"hng_progress\" : \""+hng_progress+"\", \"dragdrop_progress\" : \""+dragdrop_progress+"\", \"oed_progress\" : \""+oed_progress+"\", \"rec_dragdrop_progress\" : \""+rec_dragdrop_progress+"\", \"restore_states\" : \""+restore_states+"\", \"last_attempt\" : \""+last_attempt+"\", \"shown_pre_screen\" : \""+shown_pre_screen+"\", \"feedback_showing_answer\" : \""+feedback_showing_answer+"\", \"time_spent\" : \""+time_spent+"\", \"quiz_score\" : \""+quiz_score+"\", \"at_score\" : \""+(viewModel._data.test() == 'true'  || viewModel._data.test() == 'PT' ? viewModel.AT_score() : -1)+"\" }";
    
    if(viewModel.is_gen()){
        $(window).unbind('beforeunload'); //can unbind the exit prompt before Minedu only saves on exit, so if it is saving, they are exiting properly
    }
    if(!viewModel.restoring_progress()){
        if(initialized)
        {
            doSetValue("cmi.suspend_data", progress);
        }
        else{
            ajax_write_progress(progress);
        }
    }
    //console.log("Finished saving progress");
}

/*Returns the generic progress data for a given exercises*/
function get_specific_exercise_progress(i,w){
    if( viewModel.labs()[i].exercises()[w].type() == "KAR" ) //EXS
    {
        return '';
    }
    else if( viewModel.labs()[i].exercises()[w].type() == "GWR" ) //EXS
    {
        return '';
    }
    else if( viewModel.labs()[i].exercises()[w].type() == "TTT" ) //EXS
    {
        return '';
    }
    else if( viewModel.labs()[i].exercises()[w].type() == "GIW" ) //EXS
    {
        return '';
    }
    else if( viewModel.labs()[i].exercises()[w].type() == "MCH" ) //EXS
    {
        return '';
    }
    else if( viewModel.labs()[i].exercises()[w].type() == "oea" ) //EXS ... there's no sena ex type oea, it's oed, not sure if this was a typo, but afraid to change it
    {
        return '';
    }
    else{
        return get_generic_exercise_progress(i, w);
    }
}

/*Returns the special progress data for a given exercises*/
function get_specific_special_exercise_progress(i,w){
    //TYP, HNG, CWD need generic progress done as well as special stuff
    if( viewModel.labs()[i].exercises()[w].type() == "TYP" ) //EXS
    {
        return get_TYP_progress(i, w);
    }

    if( viewModel.labs()[i].exercises()[w].type() == "HNG" ) //EXS
    {
        return get_HNG_progress(i, w);
    }

    if( viewModel.labs()[i].exercises()[w].type() == "CWD" ) //EXS
    {
        return get_CWD_progress(i, w);
    }

    //Dragdrop Specific Progress
    if(product_helper_is_drag_drop_type(viewModel.labs()[i].exercises()[w].type()))
    {
        return viewModel.labs()[i].exercises()[w].dragdrop.get_progress_str(i,w);
    }

    if( viewModel.labs()[i].exercises()[w].type() == "KAR" ) //EXS
    {
        return get_KAR_progress(i, w);
    }
    else if( viewModel.labs()[i].exercises()[w].type() == "GWR" ) //EXS
    {
        return get_GWR_progress(i, w);
    }
    else if( viewModel.labs()[i].exercises()[w].type() == "TTT" ) //EXS
    {
        return get_TTT_progress(i, w);
    }
    else if( viewModel.labs()[i].exercises()[w].type() == "GIW" ) //EXS
    {
        return get_GIW_progress(i, w);
    }
    else if( viewModel.labs()[i].exercises()[w].type() == "MCH" ) //EXS
    {
        return get_MCH_progress(i, w);

    }
    else if( viewModel.labs()[i].exercises()[w].type() == "oea" ) //EXS ... there's no sena ex type oea, it's oed, not sure if this was a typo, but afraid to change it
    {
        return get_oed_progress(i, w);
    }
}


/*Restore progress from the progress string retreived from the LMS*/
function product_restore_progress(obj)
{
    //console.log("Begin restoring progress");
    var progress_obj = undefined;
    var current_exercise = undefined;
    var restored_lab = undefined;
    var restored_exercises = []; //used to keep track of exercises that were restored but wasn't being used, so it is now deprecated
    var restore_err_msg = (typeof viewModel.localization.restore_err_msg != 'undefined') ? viewModel.localization.restore_err_msg : 'Some progress was unable to be restored';
    try {
        if(initialized)
        {
            progress_obj = obj.progress();
            if(!progress_obj){ //don't to progress restore if there's no progress
                return;
            }
        }
        else if(obj.progress() && obj.progress() != '')
        {
            progress_obj = JSON.parse(obj.progress());
        }
        else
        {
            progress_obj = ajax_get_progress();
        }

        //Restore pre screen before dragdrop or things get ugly
        restore_prescreen_progress(progress_obj);

        if (viewModel._data.test() != 'true' && obj._data.test() != "PT")
        {
            //TYP restore
            restore_TYP_progress(progress_obj);

            //GWR restore
            restore_GWR_progress(progress_obj);

            //KAR restore
            restore_KAR_progress(progress_obj);

            //HNG restore
            restore_HNG_progress(progress_obj);
            
            //SPK restore
            restore_SPK_progress(progress_obj);
            
            //CWD restore
            restore_CWD_progress(progress_obj);

            //TTT restore
            restore_TTT_progress(progress_obj);
           
            //GIW restore
            restore_GIW_progress(progress_obj);

            //MCH restore
            restore_MCH_progress(progress_obj);

            //Restore all the progress from the generic progress string
            restore_generic_progress(progress_obj); //This needs to come after CWD

            //Dragdrop restore
            restore_dragdrop_progress(progress_obj);

            //restore oed progress if exists
            restore_oed_progress(progress_obj);

            //Restore exercise states
            restore_exercise_states(progress_obj);

            //Restore user attempts (must come after restore states, as checking answers increments attempts)
            restore_user_attempts(progress_obj);

            //Restore feedback showing answer states
            restore_showing_feedback(progress_obj);

            //do check for historical data here
            //This is just for Minedu, and was an old way of keeping score... this was implemented to carry over any old progress
            if(obj.is_gen()){
                var potentially_historical_items = progress_obj.datamodel.cmi.objectives.items;
                for(var i = 0; i < potentially_historical_items.length; ++i)
                {
                    if(potentially_historical_items[i].status != 'not passed')
                    {
                        if(obj.labs()[0].type().match(/scholar/i))//progress belongs in lab 0
                        {
                            obj.labs()[0].exercises()[i+1].historical_progress(potentially_historical_items[i]);
                        }
                        else//OED lab so the exercises are on the second lab
                        {
                            //No i+1 because there is no welcome page at the start
                            obj.labs()[1].exercises()[i].historical_progress(potentially_historical_items[i]);
                        }
                    }
                }
            }

            //Restore selected group
            var group_selected_exercise_progress = [];
            if ( typeof progress_obj.group_selected_exercise !== 'undefined' ){
                group_selected_exercise_progress = progress_obj.group_selected_exercise.split(',');
            }
            for (var i = 0; i < group_selected_exercise_progress.length; ++i)
            {
                if(typeof group_selected_exercise_progress[i] === 'undefined' || typeof group_selected_exercise_progress[i] === ''){continue;}
                var group_selected_exercise_progress_data = group_selected_exercise_progress[i].match(/g(\d+)e(\d+)/i);
                obj.exercise_group_types()[parseInt(group_selected_exercise_progress_data[1])].group_selected_exercise_idx(parseInt(group_selected_exercise_progress_data[2]));
                //console.log(obj.exercise_group_types()[parseInt(group_selected_exercise_progress_data[1])].group + ' restore selected ex to: '+obj.exercise_group_types()[parseInt(group_selected_exercise_progress_data[1])].group_selected_exercise_idx());
            }

            //Restore quiz score
            obj.labs()[obj.selected_lab()].quiz_score(progress_obj.quiz_score);

            //Restore the lab (always 0 because sena only uses one lab)
            obj.select_lab(0);

            //Change group to the selected group
            obj.labs()[obj.selected_lab()].selected_group(parseInt(progress_obj.group_location));
        }
        else if (viewModel._data.test() == 'true' || viewModel._data.test() == "PT") //Restoring an Achievement test or Placement test
        {
            viewModel.AT_score(progress_obj.at_score); //Get the score from the progress
            /*the following line is just for rel_001*/
            if(viewModel.is_gen()){
                viewModel.AT_score(-1); //Always restart the test for Minedu
            }
            //If the score is not -1, it means the AT was completed
            if(viewModel.AT_score() != -1)
            {
                //Restore the lab (always 0 because sena only uses one lab)
                obj.select_lab(0);
                //Make sure the Results page is showing
                obj.labs()[obj.selected_lab()].selected_group(6);
                //Lock all the other exercises
                obj.finished_test(true);
                //Restore SCORM progress for quiz
                if(initialized){
                    product_set_completion_for_test_lessons("completed");
                }
            }
        }

        //Something to do with the flip animation, but not exactly sure what
        // if(!(obj.labs()[obj.selected_lab()].selected_group()!= 0 && viewModel.number_of_sco_groups() > 1)){
        //     // obj.flipWelcomePanel(false,true);
        //     obj.labs()[obj.selected_lab()].change_group(obj.labs()[obj.selected_lab()].selected_group());
        //     //console.log("Setting race_condition_ended to true")
        //     race_condition_ended = true;
        // }
        obj.labs()[obj.selected_lab()].change_group(obj.labs()[obj.selected_lab()].selected_group());
        //console.log('Done restoring progress');
    }
    catch(err){
        alert(restore_err_msg);
        start_lesson_from_the_start(0)
    }
}

function product_set_completion_for_test_lessons(value){ //set primary objective for lessons with quizzes, AT's, and PT
    for(var i = 0; i<viewModel.global_objectives_array().length; ++i){
        if(viewModel.global_objectives_array()[i].name == 'primary'){
            //viewModel.global_objectives_array()[i].satisfied("passed");
            viewModel.global_objectives_array()[i].completed(value);
        }
    }
}


/***********************************/
/*Getting Product Specific Progress*/
/***********************************/

/*The generic method of getting progress that most exercises use*/
function get_generic_exercise_progress(i, w){
    var ret = '';
    //console.log("Getting generic progress");
    for (var k = 0; k < viewModel.labs()[i].exercises()[w].questions().length; ++k)
    {
        var is_rec = product_helper_check_rec_question(viewModel.labs()[i].exercises()[w].questions()[k]._data());
        if(!is_rec || (is_rec && viewModel.labs()[i].exercises()[w].feedback_showing_answer())){
            for (var t = 0; t < viewModel.labs()[i].exercises()[w].questions()[k].responses().length; ++t)
            {
                if(viewModel.labs()[i].exercises()[w].type() == "CAS"){
                    for (var z = 0; z < viewModel.labs()[i].exercises()[w].selected_questions().length; ++z)
                    {
                        if (viewModel.labs()[i].exercises()[w].selected_questions()[z].id() == k && viewModel.labs()[i].exercises()[w].selected_responses()[z] == t)
                        {
                            ret +='l'+i+'e'+w+'q'+k+'r'+t+',';
                        }
                    }
                }
                else{
                    if(viewModel.labs()[i].exercises()[w].questions()[k].responses()[t].selected())
                    {
                        ret +='l'+i+'e'+w+'q'+k+'r'+t+',';
                        //console.log(ret);
                    }
                }
            }
        }
    }
    return ret;
}

/*A way to get the progress for any rec question, currently just used by dragdrop exercises since they aren't built with the means to save their progress*/
function get_rec_progress(i, w){
    //console.log("Getting rec progress");
    var ret = '';
    for (var k = 0; k < viewModel.labs()[i].exercises()[w].questions().length; ++k)
    {
        if(product_helper_check_rec_question(viewModel.labs()[i].exercises()[w].questions()[k]._data())){
            for (var t = 0; t < viewModel.labs()[i].exercises()[w].questions()[k].responses().length; ++t)
            {
                if(viewModel.labs()[i].exercises()[w].questions()[k].responses()[t].selected())
                {
                    ret +='l'+i+'e'+w+'q'+k+'r'+t+',';
                    //console.log(ret);
                }
            }
        }
    }
    return ret;
}

function get_TYP_progress(i, w){
    //console.log("Getting TYP progress");
    var ret = [];
    for (var k = 0; k < viewModel.labs()[i].exercises()[w].questions().length; ++k)
    {
        for (var t = 0; t < viewModel.labs()[i].exercises()[w].questions()[k].responses().length; ++t)
        {
            if (typeof viewModel.labs()[i].exercises()[w].questions()[k].entered_response() !== 'undefined' && viewModel.labs()[i].exercises()[w].questions()[k].entered_response() != '' && viewModel.labs()[i].exercises()[w].questions()[k].state())
            {
                ret.push('l'+i+'e'+w+'q'+k+'r'+viewModel.labs()[i].exercises()[w].questions()[k].entered_response()+'_typ');
                break;//break outer response loop we have what they entered
            }
        }
    }
    return ret;
}

function get_HNG_progress(i, w){
    //console.log("Getting HNG progress");
    var ret = [];
    for (var k = 0; k < viewModel.labs()[i].exercises()[w].questions().length; ++k)
    {
        for (var t = 0; t < viewModel.labs()[i].exercises()[w].questions()[k].responses().length; ++t)
        {
            if(!viewModel.labs()[i].exercises()[w].questions()[k].responses()[t].selected()){
                var temp_word= "";
                for (var z = 0, z_len = viewModel.labs()[i].exercises()[w].questions()[k].letter_array().length; z < z_len; z++)
                {
                    if (viewModel.labs()[i].exercises()[w].questions()[k].letter_array()[z].selected() == 1)
                    {
                        temp_word += viewModel.labs()[i].exercises()[w].questions()[k].letter_array()[z].letter();
                    }
                }
                ret.push('l'+i+'e'+w+'q'+k+temp_word);
                break;//break outer response loop we have what they entered
            }
        }
    }
    return ret;
}

function get_CWD_progress(i, w){
    //console.log("Getting CWD progress");
    var ret = [];
    var temp_string= "";
    for (var g = 0; g < viewModel.labs()[i].exercises()[w].grid().length; ++g)
    {
        for (var l = 0; l < viewModel.labs()[i].exercises()[w].grid()[g].cols().length; ++l)
        {
            if (viewModel.labs()[i].exercises()[w].grid()[g].cols()[l].letter() != "" && viewModel.labs()[i].exercises()[w].grid()[g].cols()[l].question().length != 0)
            {
                temp_string += ("," + g +"|" + l +"|" + viewModel.labs()[i].exercises()[w].grid()[g].cols()[l].letter());
            }
        }
    }
    ret.push('l'+i+'e'+w+temp_string);
    return ret;
}

function get_KAR_progress(i, w){
    //console.log("Getting KAR progress");
    var ret = [];
    for (var k = 0; k < viewModel.labs()[i].exercises()[w].questions().length; ++k)
    {
        for (var t = 0; t < viewModel.labs()[i].exercises()[w].questions()[k].responses().length; ++t)
        {
            if(viewModel.labs()[i].exercises()[w].questions()[k].responses()[t].selected() && viewModel.labs()[i].exercises()[w].questions()[k]._data()[0].contents()[0].type() == 'text')
            {
                ret.push('l'+i+'e'+w+'q'+k+'r'+t+'|'+viewModel.labs()[i].exercises()[w].questions()[k]._data()[0].contents()[0].content().replace(/\n/g, "\\n"));
            }
            else if(viewModel.labs()[i].exercises()[w].questions()[k].responses()[t].selected())
            {
                ret.push('l'+i+'e'+w+'q'+k+'r'+t+'|'+"");
            }
        }
    }
    return ret;
}

function get_GWR_progress(i, w){
    //console.log("Getting GWR progress");
    var ret = [];
    for (var k = 0; k < viewModel.labs()[i].exercises()[w].questions().length; ++k)
    {
        for (var t = 0; t < viewModel.labs()[i].exercises()[w].questions()[k].responses().length; ++t)
        {
            if (typeof viewModel.labs()[i].exercises()[w].questions()[k].responses()[1]._data()[0].content() !== 'undefined' && viewModel.labs()[i].exercises()[w].questions()[k].responses()[1]._data()[0].content() != '' && k==0)
            {
                ret.push('l'+i+'e'+w+'|'+viewModel.labs()[i].exercises()[w].questions()[k].responses()[1]._data()[0].content().replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/'/g, "\'").replace(/"/g, "\\\""));
                break; //break outer response loop we have what they entered
            }
        }
    }
    return ret;
}

function get_TTT_progress(i, w){
    //console.log("Getting TTT progress");
    var ret = [];
    for (var k = 0; k < viewModel.labs()[i].exercises()[w].questions().length; ++k)
    {
        for (var t = 0; t < viewModel.labs()[i].exercises()[w].questions()[k].responses().length; ++t)
        {
            if(k == 0 && t == 0)
            {
                var temp_string= "";
                var selected_var;
                var quest_num;
                var resp_select;

                for (var g = 0; g < viewModel.labs()[i].exercises()[w].ttt_grid().length; ++g)
                {
                    for (var l = 0; l < viewModel.labs()[i].exercises()[w].ttt_grid()[g].cols().length; ++l)
                    {
                        resp_select = 0;
                        quest_num = viewModel.labs()[i].exercises()[w].ttt_grid()[g].cols()[l].question();
                        if(!viewModel.labs()[i].exercises()[w].ttt_grid()[g].cols()[l].selected())
                        {
                            selected_var = 0
                        }
                        else if(viewModel.labs()[i].exercises()[w].ttt_grid()[g].cols()[l].correct())
                        {
                            selected_var = 1
                        }
                        else if(!viewModel.labs()[i].exercises()[w].ttt_grid()[g].cols()[l].correct())
                        {
                            selected_var = 2
                        }
                        if(typeof viewModel.labs()[i].exercises()[w].questions()[quest_num] !== 'undefined')
                        {
                            for (var m = 0, m_len = viewModel.labs()[i].exercises()[w].questions()[quest_num].responses().length; m<m_len; ++m)
                            {
                                if(viewModel.labs()[i].exercises()[w].questions()[quest_num].responses()[m].selected())
                                {
                                    if(viewModel.labs()[i].exercises()[w].questions()[quest_num].responses()[m].correct())
                                    {
                                        resp_select = 1;
                                    }
                                    else
                                    {
                                        resp_select = 2;
                                    }
                                }
                            }
                        }
                        ret.push('l'+i+'e'+w+'x'+g+'y'+l+'q'+quest_num+'s'+selected_var+'r'+resp_select);
                    }
                }
            }
        }
    }
    return ret;
}

function get_GIW_progress(i, w){
    //console.log("Getting GIW progress");
    var ret = [];
    for (var k = 0; k < viewModel.labs()[i].exercises()[w].questions().length; ++k)
    {
        for (var t = 0; t < viewModel.labs()[i].exercises()[w].questions()[k].responses().length; ++t)
        {
            if(k == 0 && t == 0){
                for (var q = 0; q < viewModel.labs()[i].exercises()[w].word_list().length; ++q)
                {
                    if (viewModel.labs()[i].exercises()[w].word_list()[q].answered() == 1)
                        ret.push('l'+i+'e'+w+'q'+viewModel.labs()[i].exercises()[w].word_list()[q].question+'c'+q+viewModel.labs()[i].exercises()[w].questions()[viewModel.labs()[i].exercises()[w].word_list()[q].question].entered_response().replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/'/g, "\'").replace(/"/g, "\\\"")+'_giw');
                }
            }
        }
    }
    return ret;
}

function get_MCH_progress(i, w){
    //console.log("Getting MCH progress");
    var ret = {'attempts' : [], 'responses': []};
    for (var k = 0; k < viewModel.labs()[i].exercises()[w].questions().length; ++k)
    {
        for (var t = 0; t < viewModel.labs()[i].exercises()[w].questions()[k].responses().length; ++t)
        {
            if(k == 0 && t == 0)
            {
                var temp_string= "";

                for (var g = 0; g < viewModel.labs()[i].exercises()[w].mch_grid().length; ++g)
                {
                    for (var l = 0; l < viewModel.labs()[i].exercises()[w].mch_grid()[g].cols().length; ++l)
                    {
                    quest_num = viewModel.labs()[i].exercises()[w].mch_grid()[g].cols()[l].question();
                    resp_num = viewModel.labs()[i].exercises()[w].mch_grid()[g].cols()[l].response();
                    correct_var = viewModel.labs()[i].exercises()[w].mch_grid()[g].cols()[l].correct();
                    ret.responses.push('l'+i+'e'+w+'x'+g+'y'+l+'q'+quest_num+'r'+resp_num+'c'+correct_var);
                    }
                }
                ret.attempts.push('l'+i+'e'+w+'a'+viewModel.labs()[i].exercises()[w].mch_attempts());
            }
        }
    }
    return ret;
}

function get_oed_progress(i, w){
    //console.log("Getting oed progress");
    var ret = '';
    for (var k = 0; k < viewModel.labs()[i].exercises()[w].questions().length; ++k){
        for (var t = 0; t < viewModel.labs()[i].exercises()[w].questions()[k].responses().length; ++t)
        {
            if(i == 3 && k == 1)
            {
                ret += viewModel.labs()[i].exercises()[w].questions()[k].responses()[t].text().replace(/\n/g, "\\n");
            }
        }
    }
    return ret;
}

function get_old_method_of_progress(obj, items, i, w){
    if(!initialized && !(obj.labs()[i].exercises()[w].type() =="DWS" || obj.labs()[i].exercises()[w].type() == "STI" || obj.labs()[i].exercises()[w].type() == "WLC" || obj.labs()[i].exercises()[w].type() == "RSLT" || obj.labs()[i].exercises()[w].type() == "RSLT2"))
    {
        if(obj.labs()[i].exercises()[w].state() == 2)
        {
            items.push({"status": "failed", "score_raw": 0, "id" : w, "type" : obj.labs()[i].exercises()[w].type()});
        }else if(obj.labs()[i].exercises()[w].state() == 4)
        {
            items.push({"status": "passed", "score_raw": 100, "id" : w, "type" : obj.labs()[i].exercises()[w].type()});
        }else if(obj.labs()[i].exercises()[w].state() == 1)
        {                                            
            // items.push({"status": "incomplete", "score_raw": obj.labs()[i].exercises()[w].score(), "id" : w, "type" : obj.labs()[i].exercises()[w].type()});
            items.push({"status": "failed", "score_raw": 0, "id" : w, "type" : obj.labs()[i].exercises()[w].type()});
        }else if(obj.labs()[i].exercises()[w].state() == 0)
        {
            items.push({"status": "not passed", "score_raw": 0, "id" : w, "type" : obj.labs()[i].exercises()[w].type()});
        }
    }
    return items;
}

/*********************************** */
/*Specific Restore Progress Functions*/
/*********************************** */

/*Restore prescreen, must be done before dragdrop progress is restored*/
function restore_prescreen_progress(progress_obj){
    //console.log("Restoring prescreen progress");
    var pre_screen_progress = [];
    if ( typeof progress_obj.shown_pre_screen !== 'undefined' ){
        pre_screen_progress = progress_obj.shown_pre_screen.split(',');
    }

    for (var i = 0; i < pre_screen_progress.length; ++i)
    {
        if(typeof pre_screen_progress[i] === 'undefined' || typeof pre_screen_progress[i] === ''){continue;}
        var pre_screen_data = pre_screen_progress[i].match(/l(\d+)e(\d+)p(\d+)/i);
        viewModel.labs()[parseInt(pre_screen_data[1])].exercises()[parseInt(pre_screen_data[2])].shown_pre_screen(parseInt(pre_screen_data[3]));

    }
}

function restore_exercise_states(progress_obj){
    //console.log("Restoring exercise states progress");
    if(typeof progress_obj.restore_states !== 'undefined' && progress_obj.restore_states != '')
    {
        var state_array = progress_obj.restore_states.split(',');
        for(var i = 0; i < state_array.length; ++i)
        {
            var restore_item = state_array[i].match( /l(\d+)e(\d+)/i);
            viewModel.select_lab(parseInt(restore_item[1]));
            viewModel.labs()[viewModel.selected_lab()].select_exercise(parseInt(restore_item[2]));
            //viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].check_answers();
            if ( viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].type() == "TTT" )
            {
                viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].TTT_restore();
            }
            if ( viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].type() != "GWR" && viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].type() != "TTT")
            {
                viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].check_answers();
            }
        }
    }
}

function restore_user_attempts(progress_obj){
    //console.log("Restoring user attempts progress");
    var attempts_progress = [];
    if ( typeof progress_obj.exercise_attempts !== 'undefined' ){
        attempts_progress = progress_obj.exercise_attempts.split(',');
    }

    for (var i = 0; i < attempts_progress.length; ++i)
    {
        if(typeof attempts_progress[i] === 'undefined' || typeof attempts_progress[i] === ''){continue;}
        var attempts_progress_data = attempts_progress[i].match(/l(\d+)e(\d+)a(\d+)/i);
        viewModel.labs()[parseInt(attempts_progress_data[1])].exercises()[parseInt(attempts_progress_data[2])].feedback().attempts(parseInt(attempts_progress_data[3]));
    }
}

function restore_showing_feedback(progress_obj){
    //console.log("Restoring showing feedback progress");
    if(typeof progress_obj.feedback_showing_answer !== 'undefined' && progress_obj.feedback_showing_answer != '')
    {
        var feedback_showing_answer_array = progress_obj.feedback_showing_answer.split(',');
        for(var i = 0; i < feedback_showing_answer_array.length; ++i)
        {
            var feedback_showing_answer_item = feedback_showing_answer_array[i].match( /l(\d+)e(\d+)/i);
            //console.log('disable ex '+ feedback_showing_answer_item[2]);
            viewModel.select_lab(parseInt(feedback_showing_answer_item[1]));
            viewModel.labs()[parseInt(feedback_showing_answer_item[1])].select_exercise(parseInt(feedback_showing_answer_item[1]));
            product_disable_exercise(viewModel.labs()[parseInt(feedback_showing_answer_item[1])].exercises()[parseInt(feedback_showing_answer_item[2])]);
            viewModel.labs()[parseInt(feedback_showing_answer_item[1])].exercises()[parseInt(feedback_showing_answer_item[2])].feedback_showing_answer(true);
            viewModel.labs()[parseInt(feedback_showing_answer_item[1])].exercises()[parseInt(feedback_showing_answer_item[2])].check_answers();
        }
    }
}

function restore_generic_progress(progress_obj){
    //console.log("Restoring generic progress");
    var responses_array = progress_obj.responses.split(',');
    for (var i = 0; i < responses_array.length; ++i)
    {
        if(typeof responses_array[i] === 'undefined' || responses_array[i] == ''){continue;}//skip the final null string
        var progress_data = responses_array[i].match( /l(\d+)e(\d+)q(\d+)r(\d+)/i );
        if(typeof progress_data != 'undefined'){
            if(product_helper_is_drag_drop_type(viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].type()))
            {
                //shouldn't find any of these, but in case it does, do nothing.
            }
            else if(viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].type() == "MFL"){ //EXS
                viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[progress_data[3]].selectbox_response(progress_data[4]);
            }else if(viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].type() == "MMM" || viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].type() == "ELS" || viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].type() == "SLS"){ //EXS
                viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[progress_data[3]].responses()[progress_data[4]].selected(1);
            }else if(viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].type() == "TAB"){ //EXS
                viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[progress_data[3]].select_response_toggle(ko.observable(progress_data[4]));
            }else if(viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].type() == "CAS"){
                viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].restore_cas_progress();
            }else
            {
                viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[progress_data[3]].select_response(ko.observable(progress_data[4]));
            }
        }
    }
}

function restore_TYP_progress(progress_obj){
    //console.log("Restoring TYP progress");
    if(typeof progress_obj.typ_progress !== 'undefined' && progress_obj.typ_progress != '')
    {
        var typ_progress = progress_obj.typ_progress.split('_typ,');
        for (var i = 0; i < typ_progress.length; ++i)
        {
            if(typeof typ_progress[i] === 'undefined' || typ_progress[i] == ''){continue;}//skip the final null string
            var progress_data = typ_progress[i].match( /l(\d+)e(\d+)q(\d+)r(.+)/i );
            viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[progress_data[3]].entered_response(progress_data[4]);
            viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[progress_data[3]].check_entered_response('TYP');
        }
    }
}

function restore_GWR_progress(progress_obj){
    //console.log("Restoring GWR progress");
    if(typeof progress_obj.gwr_progress !== 'undefined' && progress_obj.gwr_progress != '')
    {
        var gwr_progress = progress_obj.gwr_progress;

        var progress_data = gwr_progress.match( /l(\d+)e(\d+)([\s\S]*)/i ); //[\s\S]* means match any character, even newlines and whitespace

        var safe_entered_response = progress_data[3].substr(1); //the substr removes the | that used to be used

        viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[0].responses()[1]._data()[0].content(safe_entered_response);
        viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].set_up_progress();
    }
}

function restore_KAR_progress(progress_obj){
    //console.log("Restoring KAR progress");
    if(typeof progress_obj.kar_progress !== 'undefined' && progress_obj.kar_progress != '') //EXS
    {
        var kar_progress = progress_obj.kar_progress.split(',');
        for (var i = 0; i < kar_progress.length; ++i)
        {
            if(typeof kar_progress[i] === 'undefined' || kar_progress[i] == ''){continue;}//skip the final null string
            var temp_data = kar_progress[i].split("|");

            var progress_data = kar_progress[i].match( /l(\d+)e(\d+)q(\d+)r(\d+)(.+)/i );

            if (temp_data[1] != "")
            {
                viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[progress_data[3]]._data()[0].contents()[0].content(temp_data[1]);
                viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[progress_data[3]].responses()[progress_data[4]].selected(1);
            }
            viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[progress_data[3]].responses()[progress_data[4]].selected(1);
        }
    }
}

function restore_HNG_progress(progress_obj){
    //console.log("Restoring HNG progress");
    if(typeof progress_obj.hng_progress !== 'undefined' && progress_obj.hng_progress != '') //EXS
    {
        var hng_progress = progress_obj.hng_progress.split(',');
        for (var i = 0; i < hng_progress.length; ++i)
        {
            if(typeof hng_progress[i] === 'undefined' || typeof hng_progress[i] === ''){continue;}
            var progress_data = hng_progress[i].match( /l(\d+)e(\d+)q(\d+)(.+)/i );
            if (progress_data == null){continue;}
            var safe_question_number = progress_data[3];
            var safe_entered_response = progress_data[4];
            if(viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions().length < progress_data[3])
            {
                safe_question_number = progress_data[3].substr(0, Math.ceil((viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions().length / 10)));
                safe_entered_response = '' + progress_data[3].substr(Math.ceil((viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions().length / 10))) + progress_data[4];
            }

            for (var k = 0, k_len = safe_entered_response.length; k <k_len; ++k)
            {
                for (var w = 0, w_len = viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[safe_question_number].letter_array().length; w <w_len; ++w)
                {
                    if (viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[safe_question_number].letter_array()[w].letter() == safe_entered_response.charAt(k))
                    {
                        viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].guessing_letter(w,safe_question_number, true);
                    }
                }
            }
            viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].build_word(safe_question_number,viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[safe_question_number].word_to_guess(),false);

        }
    }
}

function restore_SPK_progress(progress_obj){
    //console.log("Restoring SPK progress");
    if(typeof progress_obj.spk_progress !== 'undefined' && progress_obj.spk_progress != '') //EXS
    {
        var spk_progress = progress_obj.spk_progress.split(',');
        var current_lab = 0;
        var current_ex = 0;
        for (var i = 0; i < spk_progress.length; ++i)
        {
            if(typeof spk_progress[i] === 'undefined' || spk_progress[i] == '' || spk_progress[i] == null){continue;}//skip the final null string
            var progress_data = spk_progress[i].match( /l(\d+)e(\d+)\|(.*)/i );
            if (current_lab != progress_data[1] || current_ex != progress_data[2])
            {
                //loop and select all responses
                for(var w = 0, w_len = viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions().length; w < w_len; ++w)
                {
                    for(var k = 0, k_len = viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[w].responses().length; k < k_len; ++k)
                    {
                        viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[w].responses()[k].selected(1);
                    }
                }
            }

            viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].attempt_times.push(parseFloat(progress_data[3]));
        }
        if(viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].attempt_times().length)
            viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].timer(parseFloat(viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].attempt_times()[0]));
        viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].started(true);
    }
}

function restore_CWD_progress(progress_obj){
    //console.log("Restoring CWD progress");
    if(typeof progress_obj.cwd_progress !== 'undefined' && progress_obj.cwd_progress != '') //EXS
    {
        var cwd_progress = progress_obj.cwd_progress.split(',');
        var path = cwd_progress[0].match( /l(\d+)e(\d+)/i )
        for (var i = 1; i < cwd_progress.length; ++i)
        {
            var progress_data = cwd_progress[i].split('|');
            viewModel.labs()[path[1]].exercises()[path[2]].grid()[progress_data[0]].cols()[progress_data[1]].letter(progress_data[2]);
            viewModel.labs()[path[1]].exercises()[path[2]].questions()[viewModel.labs()[path[1]].exercises()[path[2]].grid()[progress_data[0]].cols()[progress_data[1]].question()[0].id()].check_entered_response();
        }
        viewModel.labs()[path[1]].exercises()[path[2]].check_cwd_answer();
    }    
}

function restore_TTT_progress(progress_obj){
    //console.log("Restoring TTT progress");
    if(typeof progress_obj.ttt_progress !== 'undefined' && progress_obj.ttt_progress != '') //EXS
    {
        var ttt_progress = progress_obj.ttt_progress.split(',');
        for (var i = 0; i < ttt_progress.length; ++i) //loop on each cell
        {
            var path = ttt_progress[i].match( /l(\d+)e(\d+)x(\d+)y(\d+)q(\d+)s(\d+)r(\d+)/i );

            if(path[5] == 9){continue;}//skip the middle cell

            viewModel.labs()[path[1]].exercises()[path[2]].ttt_grid()[path[3]].cols()[path[4]].question(path[5]);

            if(path[5] <= viewModel.labs()[path[1]].exercises()[path[2]].questions().length-1) //is the question number part of the real questions
            {
                if(path[6] == 1) // this cell was correctly selected
                {
                    viewModel.labs()[path[1]].exercises()[path[2]].ttt_grid()[path[3]].cols()[path[4]].selected(1);
                    viewModel.labs()[path[1]].exercises()[path[2]].ttt_grid()[path[3]].cols()[path[4]].correct(1);
                    viewModel.labs()[path[1]].exercises()[path[2]].questions()[path[5]].responses()[1].selected(1);

                }
                else if(path[6] == 2)// this cell was incorrectly selected
                {
                    viewModel.labs()[path[1]].exercises()[path[2]].ttt_grid()[path[3]].cols()[path[4]].selected(1);
                    //viewModel.labs()[path[1]].exercises()[path[2]].questions()[path[5]].responses()[0].selected(1);
                }
                //apply the cells question number, content and type
                viewModel.labs()[path[1]].exercises()[path[2]].ttt_grid()[path[3]].cols()[path[4]].question(path[5]);
                viewModel.labs()[path[1]].exercises()[path[2]].ttt_grid()[path[3]].cols()[path[4]].content(viewModel.labs()[path[1]].exercises()[path[2]].questions()[path[5]].responses()[1]._data()[0].content());
                viewModel.labs()[path[1]].exercises()[path[2]].ttt_grid()[path[3]].cols()[path[4]].type(viewModel.labs()[path[1]].exercises()[path[2]].questions()[path[5]].responses()[1]._data()[0].type());

                //the questions need to know if they have been answered
                for(var w = 0, w_len = viewModel.labs()[path[1]].exercises()[path[2]].questions().length; w < w_len; ++w)
                {
                    if(viewModel.labs()[path[1]].exercises()[path[2]].questions()[w].id() == path[5])
                    {
                        if(path[7] == 1)//question has been answered correctly
                        {
                            for(var k = 0, k_len = viewModel.labs()[path[1]].exercises()[path[2]].questions()[w].responses().length; k < k_len; ++k)
                            {
                                if(viewModel.labs()[path[1]].exercises()[path[2]].questions()[w].responses()[k].correct())
                                {
                                    viewModel.labs()[path[1]].exercises()[path[2]].questions()[w].responses()[k].selected(1);
                                }
                            }
                        }
                        else if(path[7] == 2)//question has been answered incorrectly
                        {
                            for(var k = 0, k_len = viewModel.labs()[path[1]].exercises()[path[2]].questions()[w].responses().length; k < k_len; ++k)
                            {
                                if(!viewModel.labs()[path[1]].exercises()[path[2]].questions()[w].responses()[k].correct())
                                {
                                    viewModel.labs()[path[1]].exercises()[path[2]].questions()[w].responses()[k].selected(1);
                                }
                            }
                        }
                    }
                }
            }
            else //these quesetion numbers are distracters
            {
                if(path[6] == 2) //distracter has been selected
                {
                    viewModel.labs()[path[1]].exercises()[path[2]].ttt_grid()[path[3]].cols()[path[4]].selected(1);
                }
                for (var w = 0; w < viewModel.labs()[path[1]].exercises()[path[2]]._data().length; ++w)//loop throught data
                {

                    if(viewModel.labs()[path[1]].exercises()[path[2]]._data()[w].type() == "options")//found the distracter
                    {
                        viewModel.labs()[path[1]].exercises()[path[2]].ttt_grid()[path[3]].cols()[path[4]].question(path[5]);//give it a question number
                        viewModel.labs()[path[1]].exercises()[path[2]].ttt_grid()[path[3]].cols()[path[4]].content(viewModel.labs()[path[1]].exercises()[path[2]]._data()[w].contents()[path[5]-(viewModel.labs()[path[1]].exercises()[path[2]].questions().length)].content());
                        viewModel.labs()[path[1]].exercises()[path[2]].ttt_grid()[path[3]].cols()[path[4]].type(viewModel.labs()[path[1]].exercises()[path[2]]._data()[w].contents()[path[5]-(viewModel.labs()[path[1]].exercises()[path[2]].questions().length)].type());
                    }
                }
            }
        }
    }
}

function restore_GIW_progress(progress_obj){
    //console.log("Restoring GIW progress");
    if(typeof progress_obj.giw_progress !== 'undefined' && progress_obj.giw_progress != '') //EXS
    {
        progress_obj.giw_progress = progress_obj.giw_progress+',';
        var giw_progress = progress_obj.giw_progress.split('_giw,');
        //console.log(giw_progress);
        for (var i = 0; i < giw_progress.length; ++i)
        {
            if(typeof giw_progress[i] === 'undefined' || giw_progress[i] == ''){continue;}//skip the final null string
            var progress_data = giw_progress[i].match( /l(\d+)e(\d+)q(\d+)c(\d+)(.+)/i );
            var safe_question_number = progress_data[3];
            var idx_number = progress_data[4]
            var safe_entered_response = progress_data[5];
            //console.log(progress_data[5]);
            viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[safe_question_number].entered_response(safe_entered_response);
            viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].questions()[safe_question_number].check_entered_response();
            viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].set_giw_progress(idx_number);
        }
    }
}

function restore_MCH_progress(progress_obj){
    //console.log("Restoring MCH progress");
    if(typeof progress_obj.mch_progress !== 'undefined' && progress_obj.mch_progress != '') //EXS
    {
        var mch_progress = progress_obj.mch_progress.responses;
        for (var i = 0; i < mch_progress.length; ++i)
        {
            var path = mch_progress[i].match( /l(\d+)e(\d+)x(\d+)y(\d+)q(\d+)r(\d+)c(\d+)/i );
            viewModel.labs()[path[1]].exercises()[path[2]].mch_grid()[path[3]].cols()[path[4]].question(path[5]);
            viewModel.labs()[path[1]].exercises()[path[2]].mch_grid()[path[3]].cols()[path[4]].response(path[6]);
            viewModel.labs()[path[1]].exercises()[path[2]].mch_grid()[path[3]].cols()[path[4]].correct(path[7]);
            viewModel.labs()[path[1]].exercises()[path[2]].mch_grid()[path[3]].cols()[path[4]].content(viewModel.labs()[path[1]].exercises()[path[2]].questions()[path[5]].responses()[path[6]]._data()[0].content());
            viewModel.labs()[path[1]].exercises()[path[2]].mch_grid()[path[3]].cols()[path[4]].type(viewModel.labs()[path[1]].exercises()[path[2]].questions()[path[5]].responses()[path[6]]._data()[0].type());
            if (viewModel.labs()[path[1]].exercises()[path[2]].mch_grid()[path[3]].cols()[path[4]].correct() == 1)
            {
                viewModel.labs()[path[1]].exercises()[path[2]].mch_grid()[path[3]].cols()[path[4]].selected(1);
                viewModel.labs()[path[1]].exercises()[path[2]].questions()[path[5]].responses()[1].selected(1);
            }
        }
        var mch_attempts = progress_obj.mch_progress.attempts;
        for (var i = 0; i < mch_attempts.length; ++i)
        {
            var path = mch_attempts[i].match( /l(\d+)e(\d+)a(\d+)/i );
            viewModel.labs()[path[1]].exercises()[path[2]].mch_attempts(path[3]);
        }
    }
}

function restore_dragdrop_progress(progress_obj){
    //console.log("Restoring dragdrop progress");
    if(typeof progress_obj.dragdrop_progress !== 'undefined' && progress_obj.dragdrop_progress != '') //EXS for dragdrop
    {
        product_helper_restore_drag_drop_progress(progress_obj.dragdrop_progress, viewModel);
        var dragdrop_progress = progress_obj.dragdrop_progress.split(',');
        for (var i = 0; i < dragdrop_progress.length; ++i)
        {
            if(typeof dragdrop_progress[i] === 'undefined' || dragdrop_progress[i] == ''){continue;}//skip the final null string
            var progress_data = dragdrop_progress[i].match( /l(\d+)e(\d+)q(\d+)r(\d+)/i );
        }
        //restore rec progress
        if ( typeof progress_obj.rec_dragdrop_progress !== 'undefined' ){
            var progress_data = progress_obj.rec_dragdrop_progress.split(',');
            //console.log(progress_data);
            for(var i = 0, i_len = progress_data.length; i<i_len; ++i){
                if(progress_data[i] == ''){continue;}//skip the final null string
                rec_data = progress_data[i].match( /l(\d+)e(\d+)q(\d+)/i );
                //console.log(rec_data);
                viewModel.labs()[parseInt(rec_data[1])].exercises()[parseInt(rec_data[2])].questions()[parseInt(rec_data[3])].select_response((viewModel.labs()[(rec_data[1])].exercises()[(rec_data[2])].questions()[(rec_data[3])].responses().length > 1 ? ko.observable(1) : ko.observable(0)));
            }
        }
    }
}

function restore_oed_progress(progress_obj){
    //console.log("Restoring oed progress");
     if(typeof progress_obj.oed_progress !== 'undefined' && progress_obj.oed_progress != '')
    {
        if(viewModel.labs().length == 4)//we are either in OED
        {
            if(viewModel.labs()[3].type() == "oed")
            {
                //restore writing task
                viewModel.labs()[3].exercises()[0].questions()[1].responses()[0].text(progress_obj.oed_progress);
                viewModel.started_writing_task(1);
                viewModel.labs()[2].disabled(true);
                viewModel.labs()[3].disabled(false);
            }
        }
    }
}