/*
===========================Sena SCORM Functions============================
*/

// This is sena_scorm.js, it handles everything related to SCORM (tracking the grading of objectives, saving progress for them, and user interations as they work through the lesson)

//Saves Scorm Objectives Progress
function product_save_scorm_progress(){
    //console.log("Save SCORM progress");
    if(!viewModel.restoring_progress()){
        var save_time = Date.now();
        var scorm_save_time = ConvertMilliSecondsIntoSCORM2004Time(save_time - viewModel.scorm_start_time);
        for(i=0; i<viewModel.global_objectives_array().length; ++i){
            var name = viewModel.global_objectives_array()[i].name;
            var objIndex = FindObjectiveIndex(name);
            if(viewModel.global_objectives_array()[i].group == viewModel.selected_group_name()){
                doSetValue("cmi.objectives."+objIndex+".score.raw", viewModel.global_objectives_array()[i].score());
                doSetValue("cmi.objectives."+objIndex+".score.min", "0");
                doSetValue("cmi.objectives."+objIndex+".score.max", "100");
                doSetValue("cmi.objectives."+objIndex+".score.scaled", viewModel.global_objectives_array()[i].score_scaled());
                doSetValue("cmi.objectives."+objIndex+".progress_measure", viewModel.global_objectives_array()[i].score_scaled());
                doSetValue("cmi.objectives."+objIndex+".completion_status", viewModel.global_objectives_array()[i].completed());
                doSetValue("cmi.objectives."+objIndex+".success_status", viewModel.global_objectives_array()[i].satisfied());
                doSetValue("cmi.objectives."+objIndex+".description", viewModel.global_objectives_array()[i].description);
            }
            if(viewModel.global_objectives_array()[i].name == "primary"){
                if(viewModel.labs()[viewModel.selected_lab()].quiz_score() != -1 || viewModel._data.test() == 'true' || viewModel._data.test() == "PT"){
                    doSetValue("cmi.objectives."+objIndex+".score.raw", viewModel.global_objectives_array()[i].score());
                    doSetValue("cmi.objectives."+objIndex+".score.scaled", viewModel.global_objectives_array()[i].score_scaled());
                    doSetValue("cmi.objectives."+objIndex+".progress_measure", viewModel.global_objectives_array()[i].score_scaled());
                    doSetValue("cmi.score.raw", viewModel.global_objectives_array()[i].score());
                    doSetValue("cmi.score.scaled", viewModel.global_objectives_array()[i].score_scaled());
                    doSetValue("cmi.progress_measure", viewModel.global_objectives_array()[i].score_scaled());
                }
                else{
                    doSetValue("cmi.objectives."+objIndex+".score.raw", "0");
                    doSetValue("cmi.objectives."+objIndex+".score.scaled", "0");
                    doSetValue("cmi.objectives."+objIndex+".progress_measure", "0");
                    doSetValue("cmi.score.raw", "0");
                    doSetValue("cmi.score.scaled", "0");
                    doSetValue("cmi.progress_measure", "0");
                }
                doSetValue("cmi.score.min", "0");
                doSetValue("cmi.score.max", "100");
                doSetValue("cmi.objectives."+objIndex+".score.min", "0");
                doSetValue("cmi.objectives."+objIndex+".score.max", "100");
                doSetValue("cmi.objectives."+objIndex+".completion_status", viewModel.global_objectives_array()[i].completed());
                doSetValue("cmi.objectives."+objIndex+".success_status", viewModel.global_objectives_array()[i].satisfied());
                doSetValue("cmi.completion_status", viewModel.global_objectives_array()[i].completed());
                doSetValue("cmi.success_status", viewModel.global_objectives_array()[i].satisfied());
                doSetValue("cmi.objectives."+objIndex+".description", viewModel.global_objectives_array()[i].description);
            }
            //console.log("Scorm has successfully saved name: "+ name+", score: "+ doGetValue("cmi.objectives."+objIndex+".score.raw")+", completion: "+doGetValue("cmi.objectives."+objIndex+".completion_status") +", satisfied: "+doGetValue("cmi.objectives."+objIndex+".success_status"));
        }
        doSetValue("cmi.session_time", scorm_save_time);
        viewModel.scorm_start_time = save_time;
    }
}

// Saves Scorm Interaction Progress
function product_save_scorm_interactions(){
    //console.log("Save SCORM interactions");
    var current_ex_idx = viewModel.labs()[viewModel.selected_lab()].selected_exercise();
    if(viewModel.selected_group_name() == 'Quiz' || viewModel._data.test() == 'true'  || viewModel._data.test() == "PT"){ //do this when finishing quiz
        // save interactions for all exercises for a quiz or test
        for(var i = 0; i<viewModel.exercise_group_types().length;++i){
            if(viewModel.exercise_group_types()[i].group == 'Quiz' || viewModel._data.test() == 'true' || viewModel._data.test() == "PT"){
                for(var j = 0, j_len = viewModel.exercise_group_types()[i].exercises().length; j<j_len; ++j){
                    var quiz_ex_idx = viewModel.exercise_group_types()[i].exercises()[j];
                    product_save_scorm_interactions_helper(quiz_ex_idx);
                }
            }
        }
    }
    else{
        // only save the current exercise during a normal lesson
        if(typeof viewModel.labs()[viewModel.selected_lab()].exercises()[current_ex_idx] !== "undefined"){
            product_save_scorm_interactions_helper(current_ex_idx);
        }
    }
}

function product_save_scorm_interactions_helper(current_ex_idx){
    var numInts  = parseInt(doGetValue("cmi.interactions._count"));
    if(numInts){
        if(viewModel.labs()[viewModel.selected_lab()].exercises()[current_ex_idx].type() != "WLC" || viewModel.labs()[viewModel.selected_lab()].exercises()[current_ex_idx].type() != "STI" || viewModel.labs()[viewModel.selected_lab()].exercises()[current_ex_idx].type() != "RSLT" || viewModel.labs()[viewModel.selected_lab()].exercises()[current_ex_idx].type() != "RSLT2" || viewModel.labs()[viewModel.selected_lab()].exercises()[current_ex_idx].type() != "DWS"){
            for(var i = 0; i<viewModel.labs()[viewModel.selected_lab()].exercises()[current_ex_idx].questions().length; ++i){
                if(viewModel.labs()[viewModel.selected_lab()].exercises()[current_ex_idx].questions()[i].scorm_info.result() == "correct" || viewModel.labs()[viewModel.selected_lab()].exercises()[current_ex_idx].questions()[i].scorm_info.result() == "incorrect"){
                    doSetValue("cmi.interactions."+numInts+".id", viewModel.labs()[viewModel.selected_lab()].exercises()[current_ex_idx].questions()[i].scorm_info.id());
                    doSetValue("cmi.interactions."+numInts+".type", viewModel.labs()[viewModel.selected_lab()].exercises()[current_ex_idx].questions()[i].scorm_info.type());
                    doSetValue("cmi.interactions."+numInts+".description", viewModel.labs()[viewModel.selected_lab()].exercises()[current_ex_idx].questions()[i].scorm_info.description());
                    doSetValue("cmi.interactions."+numInts+".correct_responses.0.pattern", viewModel.labs()[viewModel.selected_lab()].exercises()[current_ex_idx].questions()[i].scorm_info.correct_ans());
                    doSetValue("cmi.interactions."+numInts+".learner_response", viewModel.labs()[viewModel.selected_lab()].exercises()[current_ex_idx].questions()[i].scorm_info.user_ans());
                    doSetValue("cmi.interactions."+numInts+".result", viewModel.labs()[viewModel.selected_lab()].exercises()[current_ex_idx].questions()[i].scorm_info.result());
                    numInts += 1;
                }
            }
        }
    }
}

function product_load_scorm_progress(){
    //console.log("Restore SCORM progress");
    for(i=0; i<viewModel.global_objectives_array().length; ++i){
        var name = viewModel.global_objectives_array()[i].name;
        if(!(name.match(/secondary_/))){
            var objIndex = FindObjectiveIndex(viewModel.global_objectives_array()[i].name);
            if(!(name.match(/primary/))){
                if(doGetValue("cmi.objectives."+objIndex+".score.raw")){
                    viewModel.global_objectives_array()[i].score(doGetValue("cmi.objectives."+objIndex+".score.raw"));
                }
                if(doGetValue("cmi.objectives."+objIndex+".completion_status")){
                    viewModel.global_objectives_array()[i].completed(doGetValue("cmi.objectives."+objIndex+".completion_status"));
                }
                if(doGetValue("cmi.objectives."+objIndex+".success_status")){
                    viewModel.global_objectives_array()[i].satisfied(doGetValue("cmi.objectives."+objIndex+".success_status"));
                }
            }
            else if(viewModel.has_quiz()){
                viewModel.global_objectives_array()[i].completed(doGetValue("cmi.objectives."+objIndex+".completion_status"));
                //viewModel.global_objectives_array()[i].satisfied(doGetValue("cmi.objectives."+objIndex+".success_status"));
            }
        }
    }
}

function product_first_load_scorm_actions(){
    //console.log("Do first load SCORM actions");
    for(i=0; i<viewModel.global_objectives_array().length; ++i){
        var name = viewModel.global_objectives_array()[i].name;
        var objIndex = FindObjectiveIndex(name);
        if(viewModel.global_objectives_array()[i].name == "primary"){
            if(viewModel.labs()[viewModel.selected_lab()].quiz_score() != -1 || (viewModel._data.test() == 'true' || viewModel._data.test() == "PT") && viewModel.AT_score() != -1){
                doSetValue("cmi.objectives."+objIndex+".score.raw", viewModel.global_objectives_array()[i].score());

                doSetValue("cmi.objectives."+objIndex+".score.scaled", viewModel.global_objectives_array()[i].score_scaled());
                doSetValue("cmi.objectives."+objIndex+".progress_measure", viewModel.global_objectives_array()[i].score_scaled());
                doSetValue("cmi.score.raw", viewModel.global_objectives_array()[i].score());

                doSetValue("cmi.score.scaled", viewModel.global_objectives_array()[i].score_scaled());
                doSetValue("cmi.progress_measure", viewModel.global_objectives_array()[i].score_scaled());
            }
            else{
                doSetValue("cmi.objectives."+objIndex+".score.raw", "0");

                doSetValue("cmi.objectives."+objIndex+".score.scaled", "0");
                doSetValue("cmi.objectives."+objIndex+".progress_measure", "0");
                doSetValue("cmi.score.raw", "0");

                doSetValue("cmi.score.scaled", "0");
                doSetValue("cmi.progress_measure", "0");
            }
            doSetValue("cmi.score.min", "0");
            doSetValue("cmi.score.max", "100");
            doSetValue("cmi.objectives."+objIndex+".score.min", "0");
            doSetValue("cmi.objectives."+objIndex+".score.max", "100");
            doSetValue("cmi.objectives."+objIndex+".completion_status", viewModel.global_objectives_array()[i].completed());
            doSetValue("cmi.objectives."+objIndex+".success_status", viewModel.global_objectives_array()[i].satisfied());
            doSetValue("cmi.completion_status", viewModel.global_objectives_array()[i].completed());
            doSetValue("cmi.success_status", viewModel.global_objectives_array()[i].satisfied());
        }
        else{
            doSetValue("cmi.objectives."+objIndex+".score.raw", viewModel.global_objectives_array()[i].score());
            doSetValue("cmi.objectives."+objIndex+".score.min", "0");
            doSetValue("cmi.objectives."+objIndex+".score.max", "100");
            doSetValue("cmi.objectives."+objIndex+".score.scaled", viewModel.global_objectives_array()[i].score_scaled());
            doSetValue("cmi.objectives."+objIndex+".progress_measure", viewModel.global_objectives_array()[i].score_scaled());
            doSetValue("cmi.objectives."+objIndex+".completion_status", viewModel.global_objectives_array()[i].completed());
            doSetValue("cmi.objectives."+objIndex+".success_status", viewModel.global_objectives_array()[i].satisfied());
        }
    }
}

//obj = exercise
function product_helper_set_question_scorm_info(obj)
{
    for(var i = 0; i<obj.questions().length;++i){
        var scorm_type_temp = "";
        for(var j = 0; j<lesson_config_json.exercise_scorm_types.length; ++j){
            if(lesson_config_json.exercise_scorm_types[j].exercise_type == obj.type()){
                scorm_type_temp = lesson_config_json.exercise_scorm_types[j].scorm_type;
                break;
            }
        }

        var is_rec = false;
        for(var j = 0; j<obj.questions()[i]._data().length; ++j){
            if(obj.questions()[i]._data()[j].type()=="question"){
                for(var k = 0; k<obj.questions()[i]._data()[j].contents().length;++k){
                    if(obj.questions()[i]._data()[j].contents()[k].type()=="rec"){
                        is_rec = true;
                    }
                }
            }
        }
        obj.questions()[i].scorm_info.type(scorm_type_temp);

        var scorm_description_temp = "";
        var scorm_description_other = "";
        var scorm_description_text = "";
        var scorm_description_post_text = "";
        var scorm_correct_ans_temp = "";

        if(!is_rec){
            //Get question description
            if(obj.type() == "WSB"){
                scorm_description_temp = obj.questions()[i].responses()[0]._data()[0].content(); //Yucky hard-coded 0's
            }
            else if(obj.type() == "SPK" || obj.type() == "FLC" || obj.type() == "MCH" || obj.type()=="HNG"){
                for(var j = 0; j<obj._data().length;++j){
                    if(obj._data()[j].type() == "instructions"){
                        for(var k = 0; k<obj._data()[j].contents().length; ++k){
                            if(obj._data()[j].contents()[k].type() == "text"){
                                scorm_description_temp += obj._data()[j].contents()[k].content();
                            }
                        }
                    }
                }
                for(var j = 0; j<obj._data().length;++j){
                    if(obj._data()[j].type() == "post_instructions"){
                        for(var k = 0; k<obj._data()[j].contents().length; ++k){
                            if(obj._data()[j].contents()[k].type() == "text"){
                                scorm_description_temp += obj._data()[j].contents()[k].content();
                            }
                        }
                    }
                }
            }
            else{
                for(var j = 0; j<obj.questions()[i]._data().length; ++j){
                    if(obj.questions()[i]._data()[j].type()=="question"){
                        for(var k = 0; k<obj.questions()[i]._data()[j].contents().length;++k){
                            if(obj.questions()[i]._data()[j].contents()[k].type()=="audio" || obj.questions()[i]._data()[j].contents()[k].type().match(/image/) || obj.questions()[i]._data()[j].contents()[k].type()=="video" || obj.questions()[i]._data()[j].contents()[k].type()=="pdf"){
                                scorm_description_other += obj.questions()[i]._data()[j].contents()[k].content() + ' ';
                            }
                            else if(obj.questions()[i]._data()[j].contents()[k].type()=="text"){
                                scorm_description_text += obj.questions()[i]._data()[j].contents()[k].content() + ' ';
                            }
                        }
                    }
                    else if(obj.questions()[i]._data()[j].type()=="post_question"){
                        scorm_description_post_text += obj.questions()[i]._data()[j].contents.content() + ' ';
                    }
                    else if(obj.questions()[i]._data()[j].type()=="flash_card"){
                        scorm_description_other = obj.questions()[i]._data()[j].contents()[0].name(); //yucky hard coded 0
                    }
                }
                if(scorm_description_post_text){
                    scorm_description_temp += scorm_description_other + scorm_description_text + '___ ' + scorm_description_post_text;
                }
                else{
                    scorm_description_temp += scorm_description_other + scorm_description_text;
                }
            }

            //Get question correct answer
            for(var j = 0; j<obj.questions()[i].responses().length; ++j){
                if(obj.type()=="GWR"){
                    scorm_correct_ans_temp = "any response is correct";
                }
                else if(obj.questions()[i].responses()[j].correct()){
                    for(var k = 0; k<obj.questions()[i].responses()[j]._data().length; ++k){
                        if(obj.type()=="SPK"){
                            scorm_correct_ans_temp += obj.questions()[i].responses()[j]._data()[k].content()[0].content.data() + ', ';
                            scorm_correct_ans_temp += obj.questions()[i].responses()[j]._data()[k].content()[1].content.data() + ' | ';
                        }
                        else if(obj.type()=="TAB"){
                            scorm_correct_ans_temp += obj.questions()[0].responses()[j]._data()[k].content() + ' ';
                        }
                        else if(obj.type() == "FLC"){
                            scorm_correct_ans_temp += "student flipped card";
                        }
                        else if(obj.type() == "HNG"){
                            if(obj.questions()[i].responses()[j]._data()[k].type() == "text"){
                                scorm_correct_ans_temp += obj.questions()[i].responses()[j]._data()[k].content();
                            }
                        }
                        else{
                            scorm_correct_ans_temp += obj.questions()[i].responses()[j]._data()[k].content() + ' ';
                        }
                    }
                }
                else if(obj.type()=="MCH"){
                    for(var k = 0; k<obj.questions()[i].responses()[j]._data().length; ++k){
                        if(j==(obj.questions()[i].responses().length-1)){
                            scorm_correct_ans_temp += obj.questions()[i].responses()[j]._data()[k].content();
                        }
                        else{
                            scorm_correct_ans_temp += obj.questions()[i].responses()[j]._data()[k].content()+', ';
                        }
                    }
                }
            }
        }
        else{
            scorm_correct_ans_temp = "student recorded";
            scorm_description_temp = "recording";
            obj.questions()[i].scorm_info.type("performance");
        }

        scorm_correct_ans_temp = scorm_correct_ans_temp.replace(/\s/g, "_");

        obj.questions()[i].scorm_info.description(scorm_description_temp);
        obj.questions()[i].scorm_info.correct_ans(scorm_correct_ans_temp);
        //console.log("Saved SCORM question info includes ex:"+obj.type()+", q:"+i+", type:"+obj.questions()[i].scorm_info.type()+", desc:"+obj.questions()[i].scorm_info.description()+", correct_ans:"+obj.questions()[i].scorm_info.correct_ans());
        for(var d = 0, d_len = obj.questions()[i]._data().length; d<d_len; ++d){
            if(obj.questions()[i]._data()[d].type() == "objective"){
                obj.questions()[i].scorm_info.objective(obj.questions()[i]._data()[d].content());
            }
        }
    }
}

function product_map_scorm_question_ids(){
    for(var l = 0, l_len = viewModel.labs().length; l<l_len; ++l){
        for(var e = 0, e_len = viewModel.labs()[l].exercises().length; e<e_len; ++e){
            for(var q = 0, q_len = viewModel.labs()[l].exercises()[e].questions().length;q<q_len; ++q){
                var id = 'l'+l+'e'+e+'q'+q;
                viewModel.labs()[l].exercises()[e].questions()[q].scorm_info.id(id);
                viewModel.labs()[l].exercises()[e].questions()[q].scorm_info.completed(viewModel.scorm_completion_states.not_attempted);
                viewModel.labs()[l].exercises()[e].questions()[q].scorm_info.satisfied(viewModel.scorm_satisfaction_states.failed);
                viewModel.labs()[l].exercises()[e].questions()[q].state.subscribe(function(value){
                    product_get_scorm_question_info(this, value);
                }, viewModel.labs()[l].exercises()[e].questions()[q]);
                viewModel.labs()[l].exercises()[e].questions()[q].scorm_info.update.subscribe(function(value){
                    if(value){
                        product_update_scorm_objectives(this);
                    }
                    //console.log("SCORM question progress updated for question with id: " + this.id() + ", to have user_ans: " + this.scorm_info.user_ans() + ", result: " + this.scorm_info.result() + ", completion: " + this.scorm_info.completed() + ", and satisfaction: " + this.scorm_info.satisfied());
                    this.scorm_info.update(false);
                }, viewModel.labs()[l].exercises()[e].questions()[q]);
            }
        }
    }
}

function product_get_scorm_question_info(obj, value){
    try{
        var current_ex = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()];
        var k = product_helper_get_question_idx_from_id(current_ex, obj.id());
        if(!current_ex.showing_answer()){ //don't update the progress if they are viewing the answers
            var user_ans = "";
            var result = "";
            var completed = "";
            var satisfied = "";

            var is_rec = product_helper_check_rec_question(obj._data());

            if(value==4){
                result = viewModel.scorm_question_results.correct;
                completed = viewModel.scorm_completion_states.completed;
                satisfied = viewModel.scorm_satisfaction_states.passed;
            }
            else if(value==2 || value==3){
                result = viewModel.scorm_question_results.incorrect;
                completed = viewModel.scorm_completion_states.completed;
                satisfied = viewModel.scorm_satisfaction_states.failed;
            }
            else if(value == 0){
                result = viewModel.scorm_question_results.not_attempted;
                completed = viewModel.scorm_completion_states.not_attempted;
                satisfied = viewModel.scorm_satisfaction_states.failed;
            }
            else{
                result = viewModel.scorm_question_results.in_progress;
                completed = viewModel.scorm_completion_states.incomplete;
                satisfied = viewModel.scorm_satisfaction_states.failed;
            }

            if(is_rec){
                if(value>0){
                    user_ans = "student recorded"
                }
            }
            else{
                if(!product_helper_is_drag_drop_type(current_ex.type())){
                    if(current_ex.type()=="TYP" || current_ex.type() == "GIW"){
                        if(obj.entered_response()){
                            user_ans = obj.entered_response();
                        }
                    }
                    else if(current_ex.type() == "CWD"){
                        user_ans = obj.cwd_entered_response();
                    }
                    else if(current_ex.type()=="TAB"){ //only look for response data from the first question since it's the only one that has any
                        for(var m = 0; m<obj.responses().length; ++m){
                            if(obj.responses()[m].selected()){
                                for(var n = 0; n<current_ex.questions()[0].responses()[m]._data().length; ++n){
                                    user_ans += current_ex.questions()[0].responses()[m]._data()[n].content() + ' ';
                                }
                            }
                        }
                    }
                    else if(current_ex.type()=="FLC"){
                        if(obj.state()>0){
                            user_ans += "student flipped card";
                        }
                    }
                    else if(current_ex.type()=="MCH"){
                        var selected_check = false;
                        for(var m = 0; m<obj.responses().length; ++m){
                            if(obj.responses()[m].selected()){
                                selected_check = true;
                            }
                        }
                        if(selected_check){
                            for(var m = 0; m<obj.responses().length; ++m){
                                for(var n = 0; n<obj.responses()[m]._data().length; ++n){
                                    if(m==(obj.responses().length-1)){
                                        user_ans += obj.responses()[m]._data()[n].content();
                                    }
                                    else{
                                        user_ans += obj.responses()[m]._data()[n].content() + ', ';
                                    }
                                }
                            }
                        }
                    }
                    else if(current_ex.type()=="HNG"){
                        user_ans += obj.word();
                        user_ans = user_ans.replace(/\s/g, '');
                        var progress_check = user_ans.replace(/_/g, '');
                        if(progress_check && !(obj.state()==4 || obj.state() ==2)){
                            result = "in progress";
                        }
                    }
                    else if(current_ex.type()=="TTT"){
                        for(var m = 0; m<obj.responses().length; ++m){
                            if(obj.responses()[m].selected()){
                                for(var n = 0; n<obj.responses()[m]._data().length; ++n){
                                    user_ans += obj.responses()[m]._data()[n].content();
                                }
                            }
                        }
                        if(obj.state()>0 && user_ans == ""){
                            user_ans = "wrong cell selected";
                        }
                    }
                    else{
                        for(var m = 0; m<obj.responses().length; ++m){
                            if(obj.responses()[m].selected()){
                                for(var n = 0; n<obj.responses()[m]._data().length; ++n){
                                    user_ans += obj.responses()[m]._data()[n].content() + ' ';
                                }
                            }
                        }
                    }
                }
                else if(current_ex.type()=="WSB"){
                    user_ans = product_helper_get_WSB_user_ans(current_ex, obj)[0];
                    if(user_ans && !(obj.state()== 4 || obj.state()== 2)){
                        result = "in progress";
                    }
                }
                else if(current_ex.type() == "MT1"){
                    if(obj.state() != 4){
                        user_ans += product_helper_get_MT1_user_ans(current_ex, k);
                    }
                    else if(obj.state() > 0){
                        for(var m = 0; m<obj.responses().length; ++m){
                            if(obj.responses()[m].selected()){
                                for(var n = 0; n<obj.responses()[m]._data().length; ++n){
                                    user_ans += obj.responses()[m]._data()[n].content() + ' ';
                                }
                            }
                        }
                    }
                }
                else if(current_ex.type() == "SPK"){
                    if(obj.state()>0){
                        for(var m = 0; m<obj.responses().length; ++m){
                            for(var n = 0; n<obj.responses()[m]._data().length; ++n){
                                user_ans += obj.responses()[m]._data()[n].content()[0].content.data() + ', ';
                                user_ans += obj.responses()[m]._data()[n].content()[1].content.data() + ' | ';
                            }
                        }
                    }
                }
                else if(current_ex.type() == "DFL" || current_ex.type() == "SFL"){
                    user_ans += product_helper_get_DFL_user_ans(current_ex, k);
                }
                else if(current_ex.type() == "MF1"){
                    user_ans += product_helper_get_MF1_user_ans(current_ex, k);
                }
            }

            user_ans = user_ans.replace(/\s/g, "_");

            //console.log("Question " + k + " updated to have user answer " + user_ans + " and result " + result);
            obj.scorm_info.user_ans(user_ans);
            obj.scorm_info.result(result);
            obj.scorm_info.completed(completed);
            obj.scorm_info.satisfied(satisfied);
            obj.scorm_info.update(true);
        }
    }
    catch(err){
        //console.log("There was an error sending response information to SCORM");
    }
}

var product_map_scorm_lesson_objectives = function(obj)
{
    //don't think this is really needed anymore now that objectives are associated to exercises instead of DR's
    //console.log("Mapping objectives to the global objectives array");
    for(var i=0; i < obj._data().length; ++i){
        if(obj._data()[i].type() == "objectives"){
            for(var j=0;j<obj._data()[i].contents().length;++j){
                obj.global_objectives_array.push({"name": obj._data()[i].contents()[j].type(), "group": "", "exercise_idx" : "", "description":obj._data()[i].contents()[j].content()});
            }
        }
    }

    for(var i=0; i<obj.exercise_group_types().length; ++i){
        for(var j=0; j<obj.exercise_group_types()[i].exercises().length; ++j){
            for(var q=0; q<obj.labs()[obj.selected_lab()].exercises()[obj.exercise_group_types()[i].exercises()[j]].questions().length;++q){
                for(var q_d=0; q_d<obj.labs()[obj.selected_lab()].exercises()[obj.exercise_group_types()[i].exercises()[j]].questions()[q]._data().length;++q_d){
                    if(obj.labs()[obj.selected_lab()].exercises()[obj.exercise_group_types()[i].exercises()[j]].questions()[q]._data()[q_d].type() == "objective"){
                        for(var k=0; k<obj.global_objectives_array().length;++k){
                            if(obj.global_objectives_array()[k].name == obj.labs()[obj.selected_lab()].exercises()[obj.exercise_group_types()[i].exercises()[j]].questions()[q]._data()[q_d].content()){
                                // all questions of an exercise belong to the same objective, there should've just been an exercise objective, but changing requirements got us here
                                obj.global_objectives_array()[k].exercise_idx = obj.exercise_group_types()[i].exercises()[j];
                                obj.global_objectives_array()[k].group = obj.exercise_group_types()[i].group;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}

var product_define_scorm_grading = function(obj){
    //console.log("Set up how SCORM grades questions");
    //match on regex secondary for calculated scores, else just create observables
    //welcome/content/takeaway no longer has objectives
    for(var i = 0; i<obj.global_objectives_array().length; ++i){
        obj.global_objectives_array()[i].score = ko.observable(0);
        obj.global_objectives_array()[i].satisfied = ko.observable('failed');
        obj.global_objectives_array()[i].completed = ko.observable('not attempted');
        obj.global_objectives_array()[i].score_scaled = ko.computed(function(){
            var obj = this;
            return Math.round((obj.score()/100)*100)/100;
        }, obj.global_objectives_array()[i]);
    }
    for(var i = 0; i<obj.global_objectives_array().length; ++i){
        if(obj.global_objectives_array()[i].name == "primary"){
            //Primary Object Evaluation
            if(obj.has_quiz() || obj._data.test() == 'true' || obj._data.test() == "PT"){
                //Returns the score of the quiz if there's a quiz
                obj.global_objectives_array()[i].score = ko.computed(function(){
                    var ret = obj.labs()[obj.selected_lab()].quiz_score();

                    if (obj._data.test() == 'true' || obj._data.test() == "PT"){
                        if(obj.AT_score() == -1){
                            ret = 0;
                        }
                        else{
                            ret = obj.AT_score();
                        }
                    }
                    return ret;
                });
                //Set to passed when submit button for quiz is hit
                obj.global_objectives_array()[i].satisfied = ko.computed(function(){
                    var obj = this;

                    if(obj.score()<viewModel.passing_grade()){
                        return viewModel.scorm_satisfaction_states.failed;
                    }
                    else{
                        return viewModel.scorm_satisfaction_states.passed;
                    }
                },obj.global_objectives_array()[i]);
                //Set to complete when quiz button is hit
                obj.global_objectives_array()[i].completed = ko.observable(viewModel.scorm_completion_states.not_attempted);
            }
            else{
                //This takes the average of the secondary scores, which isn't good because it might overlap questions, but I don't know what they want me to do
                obj.global_objectives_array()[i].score = ko.computed(function(){
                    var score = 0;
                    var score_count = 0;
                    for(var i = 0; i<obj.global_objectives_array().length; ++i){
                        if(obj.global_objectives_array()[i].name != "primary"){
                            score += obj.global_objectives_array()[i].score();
                            score_count += 1;
                        }
                    }
                    return (score+0.0)/(score_count+0.0);
                });
                //If all sec's are passed then passed, otherwise not passed
                obj.global_objectives_array()[i].satisfied = ko.computed(function(){
                    for(var i=0; i<viewModel.global_objectives_array().length; ++i){
                        if(viewModel.global_objectives_array()[i].name != "primary"){
                            if(viewModel.global_objectives_array()[i].satisfied() == viewModel.scorm_satisfaction_states.failed){
                                return viewModel.scorm_satisfaction_states.failed;
                            }
                        }
                    }
                    return viewModel.scorm_satisfaction_states.passed;
                });
                //If all sec's are completed then completed, if all sec's not attempted then not attempted
                obj.global_objectives_array()[i].completed = ko.computed(function(){
                    var obj= this;
                    var total_obj_count = 0;
                    var no_attempt_count= 0;
                    var completed_count = 0;
                    for(var i=0; i<viewModel.global_objectives_array().length; ++i){
                        if(viewModel.global_objectives_array()[i].name != "primary"){
                            if(viewModel.global_objectives_array()[i].completed() == viewModel.scorm_completion_states.not_attempted){
                                no_attempt_count += 1;
                            }
                            else if(viewModel.global_objectives_array()[i].completed() == viewModel.scorm_completion_states.completed){
                                completed_count += 1;
                            }
                            total_obj_count += 1;
                        }
                    }
                    if(no_attempt_count == total_obj_count){
                        return viewModel.scorm_completion_states.not_attempted;
                    }
                    else if(completed_count == total_obj_count){
                        return viewModel.scorm_completion_states.completed;
                    }
                    else{
                        return viewModel.scorm_completion_states.incomplete;
                    }
                }, obj.global_objectives_array()[i]);
            }
            //Scaled score is the same whether it has a quiz or not
            obj.global_objectives_array()[i].score_scaled = ko.computed(function(){
                var obj = this;
                return Math.round((obj.score()/100)*100)/100;
            }, obj.global_objectives_array()[i]);
        }
    }
}

function product_update_scorm_objectives(obj){
    //console.log("Updating the SCORM objective results based on a question changing");
    var objective = obj._data.objective();
    var total_score = 0;
    var completed_count = 0;
    var not_attempted_count = 0;
    var satisfied_count = 0;
    var score = 0;
    var question_count = 0;
    for(var l = 0, l_len = viewModel.labs().length; l<l_len; ++l){
        for(var e = 0, e_len = viewModel.labs()[l].exercises().length; e<e_len; ++e){
            for(var q = 0, q_len = viewModel.labs()[l].exercises()[e].questions().length;q<q_len; ++q){
                if(viewModel.labs()[l].exercises()[e].questions()[q]._data.objective() == objective){
                    question_count += 1;
                    if(viewModel.labs()[l].exercises()[e].questions()[q].scorm_info.completed() == viewModel.scorm_completion_states.completed){
                        completed_count += 1;
                    }
                    if(viewModel.labs()[l].exercises()[e].questions()[q].scorm_info.completed() == viewModel.scorm_completion_states.not_attempted){
                        not_attempted_count += 1;
                    }
                    if(viewModel.labs()[l].exercises()[e].questions()[q].scorm_info.satisfied() == viewModel.scorm_satisfaction_states.passed){
                        satisfied_count += 1;
                    }
                    total_score += viewModel.labs()[l].exercises()[e].questions()[q].score();
                }
            }
        }
    }
    //console.log("Objective " + objective + " has " + question_count + " questions, with " + completed_count + " completed, " + not_attempted_count + " not attempted, and " + satisfied_count + " satisfied");
    for(var i = 0; i<viewModel.global_objectives_array().length; ++i){
        if(viewModel.global_objectives_array()[i].name == objective){
            if(completed_count == question_count){
                //console.log(objective + " is complete!");
                viewModel.global_objectives_array()[i].completed(viewModel.scorm_completion_states.completed);
            }
            else if(not_attempted_count == question_count){
                //console.log(objective + " has not been attempted");
                viewModel.global_objectives_array()[i].completed(viewModel.scorm_completion_states.not_attempted);
            }
            else{
                //console.log(objective + " is incomplete");
                viewModel.global_objectives_array()[i].completed(viewModel.scorm_completion_states.incomplete);
            }
            if(satisfied_count == question_count){
                //console.log(objective + " is passed!");
                viewModel.global_objectives_array()[i].satisfied(viewModel.scorm_satisfaction_states.passed);
            }
            else{
                //console.log(objective + " is failed");
                viewModel.global_objectives_array()[i].satisfied(viewModel.scorm_satisfaction_states.failed);
            }
            score = Math.round(total_score/question_count);
            //console.log(objective + " has score " + score);
            viewModel.global_objectives_array()[i].score(score);
        }
    }
}