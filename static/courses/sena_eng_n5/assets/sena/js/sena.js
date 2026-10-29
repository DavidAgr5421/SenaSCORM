/*
===========================Sena Product Models============================
*/

// This is sena.js. It maps all the product specific functionality to the main models used in the product (lesson, lab, exercise, question, response...).
// Navigation functionality also lives here.

/*****************/
/*IMPORTANT NOTES*/
/*****************/
// Exercises ATA, CAS, EXT, FLC, KAR, MMC, REC, SFG, SLW, SMC and oed are not used in Sena
// The vairable exercise_obj.showing_answer means the show answer button has been pressed for that exercise
// The variable exercise_obj.feedback_showing_answer means the exercises has been completed and feedback for that exercise is being shown (checkmarks and x's)
// exercise_obj.display_show_answer_btn is for knowing whether to display the show answer button when an exercise has been completed (like does it make sense to make it available)

/*******************/
/*Sena Lesson Model*/
/*******************/
function product_lesson_data_model(data)   //HRC
{
    data.lesson_name = ko.observable("");
    data.unit_name = ko.observable("");
    data.position = ko.observable("");
    data.origin = ko.observable("");
    data.test = ko.observable("");
    data.lesson = ko.observable("");
    data.level = ko.observable("");
    data.background_image = ko.observable("");
    data.objectives = ko.observableArray();
    for(var i = 0; i < data().length; ++i)
    {
        if (data()[i].type() == "background_image")
        {
            data.background_image(data()[i].content())
            continue;
        }
        else if (data()[i].type() == "objectives")
        {
            for (var k = 0; k < data()[i].contents().length; ++k)
            {
                if(data()[i].contents()[k].type() != "primary")
                    data.objectives.push(data()[i].contents()[k].type());
            }
            data()[i].contents.subscribe(function(old_value){//keep array up to date with changesa
                if((data.objectives().length+1) > old_value.length)
                {
                    for (var k = 0; k < data.objectives().length; ++k)
                    {
                        var remove = k;
                        for (var w = 0; w < old_value.length; ++w)
                        {
                            if(old_value[w].type() == data.objectives()[k])
                            {
                                remove = -1;
                                break;
                            }
                        }
                        if(remove >= 0)
                        {
                            data.objectives.splice(remove, 1);
                        }
                    }
                }
                else if ((data.objectives().length+1) < old_value.length)
                {

                    for (var k = 0; k < old_value.length; ++k)
                    {
                        var add = true;
                        for (var w = 0; w < data.objectives().length; ++w)
                        {
                            if(old_value[k].type() == data.objectives()[w])
                            {
                                add = false;
                                break;
                            }
                        }
                        if(add && old_value[k].type() != "primary")
                        {
                            data.objectives.push(old_value[k].type());
                        }
                    }
                }
            })
        }
        for (var k = 0; k < data()[i].contents().length; ++k)
        {
            if (data()[i].contents()[k].type() == "lesson_name")
                data.lesson_name(data()[i].contents()[k].content());
            if (data()[i].contents()[k].type() == "unit_name")
                data.unit_name(data()[i].contents()[k].content());
            if (data()[i].contents()[k].type() == "position")
                data.position(data()[i].contents()[k].content());
            if (data()[i].contents()[k].type() == "origin")
                data.origin(data()[i].contents()[k].content());
            if (data()[i].contents()[k].type() == "test")
                data.test(data()[i].contents()[k].content());
            if (data()[i].contents()[k].type() == "lesson")
                data.lesson(data()[i].contents()[k].content());
            if (data()[i].contents()[k].type() == "level")
                data.level(data()[i].contents()[k].content());
        }
    }
}

function product_lesson_model(obj)
{
    obj.started_writing_task = ko.observable(0);
    obj.windowHeight = ko.observable(window.innerHeight);
    obj.windowWidth = ko.observable(window.innerWidth);

    obj.sena_levels = ko.observableArray(["Intro", "Beginner", "A1.1", "A1.2", "A2.1", "A2.2", "B1.1", "B1.2", "B1.3", "B2.1", "B2.2", "B2.3", "Placement Test"]); //HRC
    obj.level_name = ko.observable("");
    obj.sena_lessons = ko.computed( function () {
        ret = [1];
        if(obj._data.level() == 'Intro'){
            for(var i = 2, len = 3; i <= len; ++i){
                ret.push(i);
            }
        }
        else if(obj._data.level() == 'Beginner'){
            for(var i = 2, len = 7; i <= len; ++i){
                ret.push(i);
            }
        }
        else if(obj._data.level() == 'A1.1'){
            for(var i = 2, len = 10; i <= len; ++i){
                ret.push(i);
            }
        }
        else if(obj._data.level() == 'A1.2'){
            for(var i = 2, len = 10; i <= len; ++i){
                ret.push(i);
            }
        }
        else if(obj._data.level() == 'A2.1'){
            for(var i = 2, len = 19; i <= len; ++i){
                ret.push(i);
            }
        }
        else if(obj._data.level() == 'A2.2'){
            for(var i = 2, len = 19; i <= len; ++i){
                ret.push(i);
            }
        }
        else if(obj._data.level() == 'B1.1'){
            for(var i = 2, len = 19; i <= len; ++i){
                ret.push(i);
            }
        }
        else if(obj._data.level() == 'B1.2'){
            for(var i = 2, len = 19; i <= len; ++i){
                ret.push(i);
            }
        }
        else if(obj._data.level() == 'B1.3'){
            for(var i = 2, len = 19; i <= len; ++i){
                ret.push(i);
            }
        }
        else if(obj._data.level() == 'B2.1'){
            for(var i = 2, len = 19; i <= len; ++i){
                ret.push(i);
            }
        }
        else if(obj._data.level() == 'B2.2'){
            for(var i = 2, len = 19; i <= len; ++i){
                ret.push(i);
            }
        }
        else if(obj._data.level() == 'B2.3'){
            for(var i = 2, len = 17; i <= len; ++i){
                ret.push(i);
            }
        }
        return ret;
    });
    obj.lesson_position = ko.observableArray([1,2,3,4,5,6,7,8,9,10,11,12]); //HRC

    obj.lab_types = ko.observableArray(["act", "scholar", "stm", "oed"]);
    obj.exercise_types = ko.observableArray(["ATA","CAS","CHW","CWD", "DFL", "DMC", "DWS", "ELS", "EXT", "FLC", "GIW", "GWR", "HNG", "KAR", "MCH", "MF1", "MFL", "MMC", "MMM", "MRW", "MT1", "oea", "PRP", "REC", "rslt", "RSLT", "RSLT2", "SFG", "SFL", "SLS", "SLW", "SLWG", "SMC", "SPK", "SR1", "STI", "stm", "TAB", "TTT", "TYP", "WDS", "WLC", "WSB"]);
    obj.question_types = ko.observableArray(["audio", "image", "image-lg", "image-md","image-sm", "pdf", "text", "rec"]);
    obj.no_image_question_types = ko.observableArray(["audio","image", "pdf", "text", "rec"]);
    obj.audio_image_text_question_types = ko.observableArray(["audio","image","text"]);
    obj.audio_text_question_types = ko.observableArray(["audio","text"]);
    obj.text_question_types = ko.observableArray(["text"]);
    obj.basic_question_types = ko.observableArray(["audio", "image", "text", "video", "image-lg", "image-md","image-sm", "rec"]);
    obj.basic_question_types_no_rec = ko.observableArray(["audio", "image", "text", "video", "image-lg", "image-md","image-sm"]);
    obj.sfg_question_types = ko.observableArray(["group","text","rec"]);
    obj.kar_question_types = ko.observableArray(["video","text","rec"]);
    obj.sls_question_types = ko.observableArray(["text", "rec"]);
    obj.stimulus_types = ko.observableArray(["audio", "static", "stm", "text", "welcome", "video"]);
    obj.audio_stimulus_types = ko.observableArray(["img", "ol", "p", "picture", "slideshow", "ul"]);
    obj.video_stimulus_types = ko.observableArray(["img", "ol", "p", "picture", "ul", "video"]);
    obj.static_stimulus_types = ko.observableArray(["img", "ol", "p", "ul"]);
    obj.text_stimulus_types = ko.observableArray(["audio", "img", "p", "thumbnail", "title"]);
    obj.instruction_types = ko.observableArray(["audio", "image", "thumbnail", "table", "text", "image-lg", "image-md","image-sm","video"]);
    obj.response_types = ko.observableArray(["audio", "image", "text", "image-lg", "image-md","image-sm"]);
    obj.welcome_types = ko.observableArray(["Learning Outcomes", "Free Header Item"]);
    obj.cell_types = ko.observableArray(["image","text"]);
    obj.achievement_types = ko.observableArray(["instructions"]);
    obj.pre_quiz_type = ko.observableArray(["pre_quiz"]);
    obj.feedback = localize_json.framework_feedback;
    obj.disabled_submit_exes = ko.observableArray(["WLC","RSLT", "RSLT2","DWS", "EXT", "SPK", "STI","ATA","TTT","MCH", "HNG"]);
    obj.group_types_sans_objs = ko.observableArray(["Welcome", "Content", "Take Away"]); //sorry Rob, will reevaluate in code audit! KT
    obj.exercise_group_types = ko.observableArray([{'group':'Welcome', 'limit': 2, 'count': ko.observable(0), "exercises": ko.observableArray([]), "group_selected_exercise_idx": ko.observable(0),"heading":obj.localization.lets_start()}, {'group':'Content', 'limit': 10, 'count': ko.observable(0), "exercises": ko.observableArray([]), "group_selected_exercise_idx": ko.observable(0), "heading": obj.localization.lets_explore()},{'group':'Activity 1', 'limit': 10, 'count': ko.observable(0), "exercises": ko.observableArray([]), "group_selected_exercise_idx": ko.observable(0), "heading": obj.localization.lets_practice()},{'group':'Activity 2', 'limit': 10, 'count': ko.observable(0), "exercises": ko.observableArray([]), "group_selected_exercise_idx": ko.observable(0), "heading": obj.localization.lets_practice()},{'group':'Activity 3', 'limit': 10, 'count': ko.observable(0), "exercises": ko.observableArray([]), "group_selected_exercise_idx": ko.observable(0), "heading": obj.localization.lets_practice()},{'group':'Quiz', 'limit': 100, 'count': ko.observable(0), "exercises": ko.observableArray([]), "group_selected_exercise_idx": ko.observable(0), "heading": obj.localization.check_your_progress()},{'group':'Take Away', 'limit': 1, 'count': ko.observable(0), "exercises": ko.observableArray([]), "group_selected_exercise_idx": ko.observable(0), "heading": obj.localization.takeaway}]);
    obj.disabled_lockout_exes = ko.observableArray(["SPK"]);
    obj.test_options = ko.observableArray(["true", "false", "PT"]);

    obj.is_gen = ko.observable(false); //flag to know if it is actual sena product or some other brand
    obj.loaded = ko.observable(false);
    obj.debug_mode = ko.observable(false); //flag to set lesson into debug mode
    obj.is_frameset = false;

    //check to see if using the old lms, if so use gen settings
    if(!initialized){
        var config_file_name = getURLParameter('launch_config');
        if(config_file_name)
        {
            if(config_file_name.match("^http")){
                obj.is_gen(true);
            }
        }
    }

    if(initialized){
        obj.scorm_question_results = {
            "correct": "correct",
            "incorrect": "incorrect",
            "in_progress": "in progress",
            "not_attempted": "not attempted" 
        };
        obj.scorm_completion_states = {
            "completed": "completed",
            "incomplete": "incomplete",
            "not_attempted": "not attempted"
        };
        obj.scorm_satisfaction_states = {
            "passed": "passed",
            "failed": "failed"
        };
    }

    //Achievement Test only
    if (obj._data.test() == 'true' || obj._data.test() == "PT")
    {
        // auto submit PT after 50 minutes
        // if(obj._data.test() == "PT"){
        //     var PT_timer = setInterval(function(){
        //         obj.flipWelcomePanel();
        //         obj.calc_achievement_test_score();
        //         clearInterval(PT_timer);
        //         alert('sorry time has run out');
        //     }, 3000);
        // }
        //The final score of the test
        obj.AT_score = ko.observable(-1);
        //Whether the test has been completed or not, used to disable the group bar
        obj.finished_test = ko.observable(false);
        //Recreate array without Content, since that group will have graded exercises
        obj.group_types_sans_objs = ko.observableArray(["Welcome", "Results"]);

        obj.min_AT_question = ko.observable(1);
        obj.max_AT_questions = ko.observable(1);

        //Used for slide animation
        obj.slide_dir = ko.observable(0);

        obj.nav_string = ko.observable("");

        //Re-create the group array with different values
        obj.exercise_group_types = ko.observableArray([{'group':'Welcome', 'limit': 10, 'count': ko.observable(0), "exercises": ko.observableArray([]), "group_selected_exercise_idx": ko.observable(0), "heading": obj.localization.start_test()},{'group':'Activity 1', 'limit': 10, 'count': ko.observable(0), "exercises": ko.observableArray([]), "group_selected_exercise_idx": ko.observable(0), "heading": obj.localization.questions()},{'group':'Activity 2', 'limit': 10, 'count': ko.observable(0), "exercises": ko.observableArray([]), "group_selected_exercise_idx": ko.observable(0), "heading": obj.localization.questions()},{'group':'Activity 3', 'limit': 10, 'count': ko.observable(0), "exercises": ko.observableArray([]), "group_selected_exercise_idx": ko.observable(0), "heading": obj.localization.questions()},{'group':'Activity 4', 'limit': 10, 'count': ko.observable(0), "exercises": ko.observableArray([]), "group_selected_exercise_idx": ko.observable(0), "heading": obj.localization.questions()},{'group':'Activity 5', 'limit': 10, 'count': ko.observable(0), "exercises": ko.observableArray([]), "group_selected_exercise_idx": ko.observable(0), "heading": obj.localization.questions()},{'group':'Results', 'limit': 10, 'count': ko.observable(0), "exercises": ko.observableArray([]), "group_selected_exercise_idx": ko.observable(0), "heading": obj.localization.result()}]);

        /*
            Will go through the AT groups exercise and check to see if all the questions have been answered.
            If all questions have been answered it will return true, and false if not. This function is used
            on the AT group bar to change the background image of the item accordingly.
            @group_id = The exercise group ID to check.
        */
        obj.achievement_group_answered = function(group_id)
        {
            var ret = true;

            //Make sure there is a exercise in the group before checking the array
            if (obj.exercise_group_types()[group_id].exercises().length > 0)
            {
                for (var i = 0; i < obj.exercise_group_types()[group_id].exercises().length; ++i)
                {
                    //If all the questions haven't been answered, then don't change the group bar state
                    if (obj.labs()[obj.selected_lab()].exercises()[obj.exercise_group_types()[group_id].exercises()[i]].cur_question() != -1)
                        ret = false;
                }
            }

            if (obj.finished_test())
                ret = false;

            return ret;
        }

        /*
            Returns the final test score for the test. Will go through. each exercise and score them.
            Called when the test is being submitted.
        */
        obj.calc_achievement_test_score = function()
        {
            //Make sure score is 0 before doing any math to it
            obj.AT_score(0);

            //Loop through all the groups and check the answers and calculate the score
            //-2 to skip grading the results and the none group. There will be nothing on these groups to check
            for (var i = 0, i_len = obj.exercise_group_types().length; i < i_len; ++i)
            {
                //Make sure the current group is a group that needs to be scored
                if (obj.exercise_group_types()[i].group != "Welcome" && obj.exercise_group_types()[i].group != "Results")
                {
                    for (var k = 0, k_len = obj.exercise_group_types()[i].exercises().length; k < k_len; ++k)
                    {
                        //Calculate the score for the questions
                        obj.labs()[obj.selected_lab()].exercises()[viewModel.exercise_group_types()[i].exercises()[k]].check_answers();

                        //Go through each question and add the score to an ongoing total
                        for(var q = 0, q_len = obj.labs()[obj.selected_lab()].exercises()[viewModel.exercise_group_types()[i].exercises()[k]].questions().length; q < q_len; ++q){
                            obj.AT_score(obj.AT_score() + obj.labs()[obj.selected_lab()].exercises()[viewModel.exercise_group_types()[i].exercises()[k]].questions()[q].score())
                        }
                    }
                }
            }

            //Scorm stuff, we have completed the test
            for(var i = 0; i < obj.global_objectives_array().length; ++i){
                if(obj.global_objectives_array()[i].name == 'primary')
                    obj.global_objectives_array()[i].completed("completed");
            }

            //Divide the score by the total amount of questions
            obj.AT_score(Math.round(obj.AT_score() / obj.max_AT_questions()));
            //Test has now been finished
            obj.finished_test(true);

            //Make sure score gets set with scorm stuff
            if(!viewModel.is_gen()){
                do_progress_actions();
            }

            //Go to the results page
            viewModel.labs()[viewModel.selected_lab()].change_group(6);
        }

        /*
            Checks to see if all exercises in the test have been fully answered or not.
            Used to see if the submit button should be enabled or disabled.
        */
        obj.show_achievement_test_submit = ko.computed( function()
        {
            var ret = true;

            //Start at 1 to skip the welcome page, Use 2 to skip the results page and the none group at the end
            for (var i = 1; i < obj.exercise_group_types().length - 1; ++i)
            {
                //If the exercise group hasn't been fully completed then then submit button should not be enabled
                if (obj.achievement_group_answered(i) == false)
                {
                    ret = false;
                    break;
                }
            }

            return ret;
        });

        /*
            Moves to the next exercise in the group. If it's at the end of the group, it will move to
            the next group. Gets called on the forward sub navigation button.
        */
        obj.next_exercise = function()
        {
            obj.slide_dir(1);
            //If the current exercise in group is not the last exercise in the group, then switch to the next one
            if (obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].group_selected_exercise_idx() + 1 < obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].count())
            {
                obj.set_group_selected_exercise(obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].group_selected_exercise_idx() + 1);
                product_select_exercise(obj.labs()[obj.selected_lab()], obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].exercises()[obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].group_selected_exercise_idx()]);
            }
            else //Currently at the last exercise in the group, so go to the next group
            {
                //Make sure the first exercise in the group is selected when switching to the group
                // obj.set_group_selected_exercise(0);
                obj.labs()[obj.selected_lab()].change_group(obj.labs()[obj.selected_lab()].selected_group() + 1, 1);

            }
            obj.get_navigation_string();
        }

        /*
            Moves to the previous exercise in group. If at the start of a group, it will move to the
            previous group. Gets called on the backwards sub navigation button.
        */
        obj.previous_exercise = function()
        {
            obj.slide_dir(0);
            //If the current exercise in group is not the last exercise in the group, then switch to the next one
            if (obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].group_selected_exercise_idx() > 0)
            {
                obj.set_group_selected_exercise(obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].group_selected_exercise_idx() - 1);
                product_select_exercise(obj.labs()[obj.selected_lab()], obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].exercises()[obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].group_selected_exercise_idx()]);

            }
            else //Currently at the last exercise in the group, so go to the next group
            {
                obj.labs()[obj.selected_lab()].change_group(obj.labs()[obj.selected_lab()].selected_group() - 1, 1);

            }
            obj.get_navigation_string();
        }

        /*
            Checks to see if the current exercise is the very first exercise in the first group.
            Used to disable the the navigation from looping.
        */
        obj.at_achievement_start = ko.computed(function()
        {
            var ret = false;

            if (obj.labs()[obj.selected_lab()].selected_group() == 1)
            {
                if (obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].group_selected_exercise_idx() > 0)
                    ret = false;
                else
                    ret = true;

                //Check to see if there is only one exercise
                if (obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].count() == 1)
                    ret = true;
            }

            return ret;
        });

        /*
            Checks to see if the current exercise is the last gradeable exercise.
            Used to disabled the navigation from looping and moving forward past the end.
        */
        obj.at_achievement_end = ko.computed(function()
        {
            var ret = false;

            //-3 to ignore the RSLT and None group at the end
            if (obj.labs()[obj.selected_lab()].selected_group() == obj.exercise_group_types().length - 2)
            {
                if (obj.exercise_group_types()[5].exercises().length > 1)
                {
                    if (obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].group_selected_exercise_idx() >= obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].count() - 1)
                        ret = true;
                }
                else
                    ret = true;
            }


            return ret;
        });

        /*
            Returns the string of what exercise # the user is currently on.
        */
        obj.get_navigation_string = function()
        {
            var ret = " "+obj.localization.of()+" ";
            var current_num = 1;

            //Loop through all the groups to get a proper count
            for (var i = 1; i < obj.exercise_group_types().length - 1; ++i)
            {
                //Check to see if we have hit the current group, so we can stop adding
                if (i <= obj.labs()[obj.selected_lab()].selected_group())
                {
                    //If there are multiple exercises in the group, don't add the entire list. Just add to what exercise we are on
                    if (obj.exercise_group_types()[i].count() > 1 && i == obj.labs()[obj.selected_lab()].selected_group())
                        current_num += obj.exercise_group_types()[i].group_selected_exercise_idx();
                    else if (obj.exercise_group_types()[i].count() == 1 && i == obj.labs()[obj.selected_lab()].selected_group())
                        current_num += obj.exercise_group_types()[i].count() - 1;
                    else //Only 1 exercise, so just add the count
                        current_num += obj.exercise_group_types()[i].count();

                    //Make sure counter doesn't increase when going to Results page
                    if (current_num > (obj.labs()[obj.selected_lab()].exercises().length - 2))
                        current_num = (obj.labs()[obj.selected_lab()].exercises().length - 2);
                }
            }
            obj.nav_string(current_num + ret + (obj.labs()[obj.selected_lab()].exercises().length - 2));
            //Return the final string. -2 to remove WLC and RSLT from the count
            return current_num + ret + (obj.labs()[obj.selected_lab()].exercises().length - 2);
        };
        obj.get_navigation_string();
        /*
            Gets the amount of questions on the group in relation to previous groups
            and displays it on the group bar.
            @group = The current group index.
        */
        obj.get_group_questions = function(group)
        {
            var exercise_min = 1;
            var question_max = 0, exercise_max = 0;

            //Loop through all the groups to get a proper count
            for (var i = 1; i < obj.exercise_group_types().length - 1; ++i)
            {
                if (obj.exercise_group_types()[i].exercises().length > 0)
                {
                    //Check to see if we have hit the current group, so we can stop adding
                    if (i < group)
                        exercise_min += obj.exercise_group_types()[i].exercises().length;
                    else if (i == group)
                    {
                        //Set the max before we add the current exercise questions to it
                        exercise_max = exercise_min;
                        exercise_max += obj.exercise_group_types()[i].exercises().length - 1;
                    }

                    for (var l = 0; l < obj.exercise_group_types()[i].exercises().length; ++l)
                    {
                        question_max += obj.labs()[obj.selected_lab()].exercises()[obj.exercise_group_types()[i].exercises()[l]].questions().length;
                    }

                }
            }

            //Set the total amount of questions, to be used in score calculation
            obj.max_AT_questions(question_max);

            //Return the final string with both numbers
            return exercise_min + ' - ' + exercise_max;
        };

        /*
            Gets called when you switch exercises. Will calculate what the minimum question
            number should be in relation to the previous groups and exercises.
            @group = The current selected group.
        */
        obj.get_exercise_start_question = function(group)
        {
            var question_min = 1;

            //Loop through all the groups to get a proper count
            for (var i = 1; i < obj.exercise_group_types().length - 2; ++i)
            {
                if (obj.exercise_group_types()[i].exercises().length > 0)
                {
                    //Check to see if we have hit the current group, so we can stop adding
                    if (i < group)
                        question_min += obj.labs()[obj.selected_lab()].exercises()[obj.exercise_group_types()[i].exercises()[0]].questions().length;
                }
            }

            //Return the final string with both numbers
            obj.min_AT_question(question_min);
        }

        /*
            Gets called when you click on a DR button in the group bar. Will change the current group
            to the one clicked on.
            @group = The group # you want to change to.
        */
        obj.change_AT_group = function(group)
        {
            obj.labs()[obj.selected_lab()].change_group(group);

            //Don't update string if going to the Results page
            if (obj.labs()[obj.selected_lab()].selected_group() != 6)
                obj.get_navigation_string();
        }
    }

    obj.level_name =  ko.computed( function () {
        var name = '';
        if(obj._data.level() == 'Intro'){
            name = obj.localization.title_level_0();
        }
        else if(obj._data.level() == 'Beginner'){
            name = obj.localization.title_level_1();
        }
        else if(obj._data.level() == 'A1.1'){
            name = obj.localization.title_level_2();
        }
        else if(obj._data.level() == 'A1.2'){
            name = obj.localization.title_level_3();
        }
        else if(obj._data.level() == 'A2.1'){
            name = obj.localization.title_level_4();
        }
        else if(obj._data.level() == 'A2.2'){
            name = obj.localization.title_level_5();
        }
        else if(obj._data.level() == 'B1.1'){
            name = obj.localization.title_level_6();
        }
        else if(obj._data.level() == 'B1.2'){
            name = obj.localization.title_level_7();
        }
        else if(obj._data.level() == 'B1.3'){
            name = obj.localization.title_level_8();
        }
        else if(obj._data.level() == 'B2.1'){
            name = obj.localization.title_level_9();
        }
        else if(obj._data.level() == 'B2.2'){
            name = obj.localization.title_level_10();
        }
        else if(obj._data.level() == 'B2.3'){
            name = obj.localization.title_level_11();
        }
        return name;
    });

    obj.get_group_selected_exercise = function(){
        return obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].group_selected_exercise_idx();
    }

    obj.set_group_selected_exercise = function(idx){
        //Update value in the exercise_group_types array for progress
        obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].group_selected_exercise_idx(idx);
        //Update observable on the lab layer for UI
        obj.labs()[obj.selected_lab()].selected_group_current_exercise_idx(idx);
    }

    obj.number_of_sco_groups = ko.computed(function(){
        var group_count = 0;
        for(var i = 0; i < obj.exercise_group_types().length; ++i)
        {
            if(obj.exercise_group_types()[i].count() > 0){
                group_count += 1;
            }
        }
        return group_count;
    });

    obj.passing_grade = ko.observable(70);

    obj.selected_group_name = ko.computed(function(){
        if(isNaN(obj.labs()[obj.selected_lab()].selected_group())) {
            obj.labs()[obj.selected_lab()].selected_group(0);
        }
        var group_name = "";
        group_name = obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].group;
        return group_name;
    });

    obj.is_group_sans_objs = ko.computed(function(){
        for(var g = 0; g<obj.group_types_sans_objs().length; ++g){
            if(obj.selected_group_name() == obj.group_types_sans_objs()[g]){
                return true;
            }
        }
        return false;
    });

    obj.has_quiz = ko.computed(function(){
        for(var g = 0; g<obj.exercise_group_types().length; ++g){
            if(obj.exercise_group_types()[g].group == 'Quiz' && obj.exercise_group_types()[g].count()>0){
                return true;
            }
        }
        return false;
    });

    obj.at_group_start = ko.computed(function(){
        if(obj.labs()[obj.selected_lab()].selected_group_current_exercise_idx() == 0){
            return true;
        }
        return false;
    });

    obj.at_group_end = ko.computed(function(){
        //Different for quiz because it has the result page which you don't want to be included
        if(obj.selected_group_name() == 'Quiz'){
            if(obj.labs()[obj.selected_lab()].selected_group_current_exercise_idx() == (obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].exercises().length-2)){
                return true;
            }
        }
        else{
            if(obj.labs()[obj.selected_lab()].selected_group_current_exercise_idx() == (obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].exercises().length-1)){
                return true;
            }
        }
        return false; //If it doesn't hit a true then it must be false :)
    });

    obj.check_if_group_disabled = function(group)
    {
        if(obj._data.test() == 'true' || obj._data.test() == 'PT'){
            if(obj.finished_test()){
                return true;
            }
        }

        if(obj.exercise_group_types()[obj.labs()[obj.selected_lab()].selected_group()].group == group)
            return true;
        else
            return false;
    }

    //This is super shit because it all works off the premise that there's only one lab in sena...
    obj.global_objectives_array = ko.observableArray([]);

    //Array of question info that needs to be sent to scorm, this info is in a model on the question layer
    obj.scorm_questions = ko.observableArray([]);

    obj.background_image = ko.observable();
    obj.selected_target_word = ko.observable("");
    obj.use_slide_transition = ko.observable(false);
    obj.sfx_on = ko.observable(true);

    obj.flash_fallback = ko.observable(false);
    obj.is_in_animation = ko.observable(false);

    obj.flipWelcomePanel = function (wlc_to) { // called when going to/from wlc
        var flipper = $('.flipper');
        var back = $('.flip-back');
        var front = $('.flip-front');
        if(detectIE()) { // IE will not flip. Fade instead.
            if (wlc_to) { // wlc to other
                back.css('opacity', '0');
                front.fadeTo(400, 0, function () {
                    back.addClass('ie-wlc-transit');
                    back.fadeTo(400, 1);
                });
            } else { // back to wlc
                back.fadeTo(400, 0, function () {
                    back.removeClass('ie-wlc-transit');
                    front.fadeTo(400, 1);
                });
            }
        } else {
            if (!obj.is_in_animation()) {
                obj.is_in_animation(true);
                if (wlc_to) { // wlc to other{
                    flipper.addClass('flip');
                }
                else{
                    flipper.removeClass('flip');
                }
            }
            flipper.one('transitionend', function () {
                // viewModel.use_slide_transition(false);
                // if(typeof progress_restore !== 'undefined' && progress_restore == true)
                // {
                //     obj.labs()[obj.selected_lab()].change_group(obj.labs()[obj.selected_lab()].selected_group());
                // }
                // viewModel.use_slide_transition(true);
                obj.is_in_animation(false);
                product_helper_fire_resize_events();
                // //console.log("Setting race_condition_ended to true")
                // race_condition_ended = true;
            });
        }

        viewModel.init_tool_tip(viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()]._data(), false);
        if (viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].stimuli_ids().length > 0){
            viewModel.init_tool_tip(viewModel.labs()[viewModel.selected_lab()].stimuli()[viewModel.labs()[viewModel.selected_lab()].selected_stimuli()]._data(), true);
        }
    }

    //edit decoupled here
    if(is_editable)
    {
        product_edit_lesson_model(obj);
        edit_lesson_model(obj);
    }

    obj.planner_completed = ko.computed( function () {//PS
        var ret = true;
        var completed_planner = '';
        if(obj.labs().length > 1 && obj.labs()[2].type() == "oed")//we know were on writing
        {
            for (var i = 0; i < obj.labs()[2].exercises()[0].questions().length; ++i)
            {
                if(obj.labs()[2].exercises()[0].questions()[i].responses()[0].text() == '')
                {
                    ret = false;
                    break;
                }
                completed_planner += obj.labs()[2].exercises()[0].questions()[i].responses()[0].text();
            }
            if(ret)
            {
                obj.labs()[3].exercises()[0].questions()[1].responses()[0].text(completed_planner);
                obj.labs()[3].disabled(false);
            }
            else
            {
                obj.labs()[3].disabled(true);
            }
        }
        return ret;
    });

    //Returns whether or not to show the exercise controls at the bottom
    obj.show_nav = function()
    {
        var ret = true;

        //Return false if it's an achievement test and on the welcome page
        if ((obj._data.test() == 'true' || obj._data.test() == "PT") && obj.labs()[obj.selected_lab()].selected_exercise() == 0)
            ret = false;

        return ret;
    }

    //Check for achievement test
    if(obj._data.test() == 'true' || obj._data.test() == "PT")
        //Make sure the results page doesn't show up in the exercise counter
        obj.labs()[0].max_exercises(obj.labs()[0].exercises().length - 2);

    obj.show_grading_chart = function(id){
        $('#grading_chart_'+id).modal();
    };

    obj.hide_grading_chart = function(id){
        $('#grading_chart_'+id).modal('hide');
    };

    obj.has_rec = ko.observable(false);
    for(var l = 0, len = obj.labs().length; l < len; ++l){
        for(var e = 0, een = obj.labs()[l].exercises().length; e < een; ++e){
            for (var k = 0; k < obj.labs()[l].exercises()[e]._data().length; ++k)
            {
                if (obj.labs()[l].exercises()[e]._data()[k].type() == "speech_record" && obj.labs()[l].exercises()[e]._data()[k].content() == true || obj.labs()[l].exercises()[e].get_rec_question() != -1)
                {
                    obj.has_rec(true);
                    break;
                }
            }
        }
    }

    if(obj.has_rec() && !detectMobileiOS()){
        if(rec_request_mic_connection()){
            obj.flash_fallback(false);
            // //log("chrome/firefox");
            // //log(obj.flash_fallback());
        }
        else{
            obj.flash_initialized = ko.observable(false);
            obj.flash_has_mic = ko.observable(true);
            obj.flash_fallback(true);
            // //log("IE/safari");
            // //log(obj.flash_fallback());
        }
    }

    obj.has_background_image = ko.computed(function(){
        var ret = 0;
        for( var i = 0, i_len = obj._data().length; i < i_len; ++i )
        {
            if(obj._data()[i].type() == "background_image")
            {
                if(obj._data()[i].content() != "")
                {
                    ret = 1;
                }
                else if(obj._data()[i].content() == "")
                {
                    ret = -1;
                }
            }
        }
        return ret;
    });

    obj.recording_allowed = ko.computed(function(){
        if(typeof recorder() === 'undefined'){
            return false;
        } else {
            return true;
        }
    });

    //List of the different tss types
    obj.tss_types = ko.observableArray(['tssL', 'tssM', 'tssR']);
    //obj.tss_types = ko.observableArray(['Article', 'Lecture', 'Conversation']);
    obj.load_tss = function() {
        //Loop through the exercises to get the tss stimuli
        for(var l = 0, len = obj.labs().length; l < len; ++l)
        {
            //Make sure the tss array is empty
            obj.labs()[l].tss_stimuli = ko.observableArray([]);

            for(var e = 0, t_len = obj.labs()[l].exercises().length; e < t_len; ++e)
            {
                if (obj.labs()[l].exercises()[e].stimuli_ids().length > 1)
                {
                    for (var s = 0; s < obj.labs()[l].exercises()[e].stimuli_ids().length; ++s)
                    {
                        for(var x = 0, x_len = obj.labs()[l].stimuli().length; x<x_len;++x){
                            if(obj.labs()[l].stimuli()[x].id() == obj.labs()[l].exercises()[e].stimuli_ids()[s]){
                                obj.labs()[l].stimuli()[x].local_type(helper_get_local_string('tssI'+ obj.labs()[l].stimuli()[x].title()+'stm'));
                                obj.labs()[l].tss_stimuli.push(obj.labs()[l].stimuli()[x]);
                            }
                        }
                    }
                    break;
                }
            }
        }

        //Check to see if user is in edit mode
        if (obj.labs()[0].selected_exercise() > 0)
        {
            //Get the current exercise number
            var t = obj.labs()[0].selected_exercise();
            //Quickly switch to another lab and then return. Required to properly display
            //the tss selectors without having to manually switch labs
            obj.labs()[0].select_exercise(0);
            obj.labs()[0].select_exercise(t);
        }
    }

    /************/
    /*Fullscreen*/
    /************/
    obj.is_fullscreen = ko.observable(false);
    obj.video_fullscreen = ko.observable(false);

    obj.video_fullscreen_btn_pressed = ko.observable(false);
    obj.make_fullscreen_btn_pressed = ko.observable(false);

    obj.set_frameset_flag = function(){
        if(initialized && $(document).find("#ScormContent")){
            try{
                parent.document.getElementById("ScormContent").setAttribute("allowfullscreen", "true");
            }
            catch(err){
                //console.log("Nsetted1");
            }
            try{
                parent.parent.document.getElementById("ScormContent").setAttribute("allowfullscreen", "true");
            }
            catch(err){
                //console.log("Nsetted2");
            }
            obj.is_frameset = true;
        }
    }

    obj.make_fullscreen = function(){
        obj.make_fullscreen_btn_pressed(true);
        if(!obj.is_fullscreen()){
            obj.is_fullscreen(true);
            if(obj.is_frameset){
                obj.launch_into_fullscreen(parent.document.documentElement);
            }
            else{
                obj.launch_into_fullscreen(document.documentElement);
            }
        }
        else{
            obj.is_fullscreen(false);
            if(obj.is_frameset){
                obj.exit_fullscreen(parent.document);
            }
            else{
                obj.exit_fullscreen(document);
            }
        }
    }

    obj.launch_into_fullscreen = function(element){
        if(element.requestFullscreen) {
            element.requestFullscreen();
        } else if(element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if(element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if(element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    obj.exit_fullscreen = function (element) {
        if(element.exitFullscreen) {
            element.exitFullscreen();
        } else if(element.mozCancelFullScreen) {
            element.mozCancelFullScreen();
        } else if(element.webkitExitFullscreen) {
            element.webkitExitFullscreen();
        } else if (element.msExitFullscreen) {
            element.msExitFullscreen();
        }
    }

    function exitHandler(event)
    {
        if(!obj.make_fullscreen_btn_pressed() && !obj.video_fullscreen_btn_pressed()){
            obj.is_fullscreen(false);
            obj.video_fullscreen(false);
        }

        if(obj.video_fullscreen()){
            if(!detectMobileiOS()){
                $('#framework_header').css({ "visibility": "hidden"});
                $('#main').css({ "padding": "0"});
                $('#exercise-container-inner').css('overflow', 'visible');
            }
        }
        else{
            obj.exit_video_fullscreen();
            $('#framework_header').css({ "visibility": "visible"});
            $('#main').css({ "padding": "1rem"});
            $('#exercise-container-inner').css('overflow', 'hidden');
        }
        // $('.flipper').toggleClass('no_transition');
        obj.video_fullscreen_btn_pressed(false);
        obj.make_fullscreen_btn_pressed(false);
        product_helper_fire_resize_events();
    }

    function escKeyHandler(event){
        //console.log(event);
        if(event.keyCode == 27){
            //console.log('esc pressed');
            if(obj.video_fullscreen()){
                exitHandler();
            }
        }
    }

    if(initialized && $(document).find("#ScormContent")){
        if (parent.document.addEventListener)
        {
            document.addEventListener('keydown', escKeyHandler, false);

            parent.document.addEventListener('webkitfullscreenchange', exitHandler, false);
            parent.document.addEventListener('mozfullscreenchange', exitHandler, false);
            parent.document.addEventListener('fullscreenchange', exitHandler, false);
            parent.document.addEventListener('MSFullscreenChange', exitHandler, false);            
        }
    }
    else{
        if (document.addEventListener)
        {
            // document.addEventListener('keydown', escKeyHandler, false);

            document.addEventListener('webkitfullscreenchange', exitHandler, false);
            document.addEventListener('mozfullscreenchange', exitHandler, false);
            document.addEventListener('fullscreenchange', exitHandler, false);
            document.addEventListener('MSFullscreenChange', exitHandler, false);
        }
    }

    obj.video_fullscreen.subscribe(function(value){
        //console.log('vid fullscreen is: ' + value);
    });

    obj.is_fullscreen.subscribe(function(value){
        //console.log('lesson fullscreen is: ' + value);
        var fullscreen_btn = $('.mejs-fullscreen-button');
        for (var l = 0; l < fullscreen_btn.length; ++l)
        {
            if(value && !obj.video_fullscreen()){
                $(fullscreen_btn[l]).hide();
            }
            else{
                $(fullscreen_btn[l]).show();
            }
        }
    });

    obj.video_fullscreen_handler = function(element){
        if(!$(element).hasClass("sena-icon")){
            $(element).addClass("sena-icon sena-icon-fullscreen fullscreen-video-button link-cursor");
            $($(element).children()[0]).css({ "visibility": "hidden"});
            //fullscreen_btn.children()[0].remove();
            $(element).click(function(ev)
            {
                //console.log("vid fullscreen clicked");

                obj.video_fullscreen_btn_pressed(true);
                obj.video_fullscreen(!obj.video_fullscreen());

                if(initialized && $(document).find("#ScormContent"))
                {
                    exitHandler();
                }
            });

            if(obj.is_fullscreen() && !obj.video_fullscreen()){
                $(element).hide();
            }
            else{
                $(element).show();
            }
        }
    }

    obj.exit_video_fullscreen = function(){
        var videos = $('.video_instruction');
        for (var l = 0; l < videos.length; ++l)
        {
            if(videos[l].offsetParent !== null && typeof $('#'+videos[l].id)[0].stop === 'undefined' && ('#'+videos[l].id).indexOf('mep') == -1)
            {
                $('#'+videos[l].id)[0].player.exitFullscreen();
            }
        }
    }

    // obj.enter_video_fullscreen = function(){
    //     var videos = $('.video_instruction');
    //     for (var l = 0; l < videos.length; ++l)
    //     {
    //         if(videos[l].offsetParent !== null && typeof $('#'+videos[l].id)[0].stop === 'undefined' && ('#'+videos[l].id).indexOf('mep') == -1)
    //         {
    //             $('#'+videos[l].id)[0].player.enterFullscreen();
    //         }
    //     }
    // }

    /**********/
    /*Tooltips*/
    /**********/
    //Initializes all the tool tips. Called when a new tool tip is being added, and when changing exercises.
    //@_data = The _data array the tool tips are stored in. Either exercise or stimuli _data array.
    //@is_stim = Whether or not the _data array comes from the stimulus or not.
    obj.init_tool_tip = function(_data, is_stim)
    {
        var stimuli_id = obj.labs()[obj.selected_lab()].selected_stimuli();

        obj.load_tips(_data, is_stim, stimuli_id);
        ////console.log("i call init tool tip with "+_data+" and i am stim: "+ is_stim +" and selected stimuli: "+ obj.labs()[obj.selected_lab()].selected_stimuli());
        for(var k = 0; k < _data.length; ++k)
        {
            if (_data[k].type() == "tips")
            {
                for (var i = 0; i < _data[k].content().length; ++i)
                {
                    //Find all elements with the tip id that are visible and initialize the popover.
                    //Switched to use a jQuery selector becaues the ID of the exercise in a separate DR is always 0, which messes
                    //up the id pairs. Changed in bug_071_tooltip_single_dr.

                    //Can't use the below because then stim tips and exercise tips conflict
                    if(is_stim){
                        $('#stimtip_'+stimuli_id+"_"+_data[k].content()[i].tip_id()).popover({container: 'body', html: true, trigger: 'hover', placement: 'top', content: _data[k].content()[i].content(),
                        template: '<div class="popover tip-popover"><div class="arrow tip-arrow"></div><div class="popover-content tip-content"></div></div>'});
                    }
                    else{
                        $('*[id*=tip_]:visible').each(function(){
                            if ($(this).attr('id').split('_')[0] == 'tip' && $(this).attr('id').split('_')[2] == _data[k].content()[i].tip_id())
                            {
                                $(this).popover({container: 'body', html: true, trigger: 'hover', placement: 'bottom', content: _data[k].content()[i].content(),
                                    template: '<div class="popover tip-popover"><div class="arrow tip-arrow"></div><div class="popover-content tip-content"></div></div>'});
                            }
                        });
                    }
                }
                break;
            }
        }
    }

    //Called on start up when editing is enabled to find out the highest tool tip ID, so any IDs added after don't over lap.
    //@_data = The _data array the tool tips are stored in. Either from exercise or stimuli.
    obj.load_tips = function(_data, is_stim, stimuli_id)
    {
        //Set to to lower than 0, so we can find any number higher
        var highest_id = -1;

        for(var k = 0; k < _data.length; ++k)
        {
            if (_data[k].type() == "tips")
            {
                for(var i = 0; i < _data[k].content().length; ++i)
                {
                    //If the tip_id is higher than our current highest, update the number
                    if (highest_id < _data[k].content()[i].tip_id())
                        highest_id = _data[k].content()[i].tip_id();
                }
            }
        }

        if (!is_stim)
            obj.labs()[obj.selected_lab()].exercises()[obj.labs()[obj.selected_lab()].selected_exercise()].tip_count(highest_id + 1);
        else if (typeof stimuli_id !== 'undefined')
            obj.labs()[obj.selected_lab()].stimuli()[stimuli_id].tip_count(highest_id + 1);
    }
    obj.load_tss();

    obj.dr6_complete = ko.computed(function()
    {
        for (var i = 0, len = obj.labs()[0].exercises().length; i < len; ++i)
        {
            for(var k = 0, k_len = obj.labs()[0].exercises()[i]._data().length; k < k_len; ++k)
            {
                if( obj.labs()[0].exercises()[i]._data()[k].type() == "group" )
                {
                    for(var w = 0, w_len = obj.labs()[0].exercises()[i]._data()[k].contents().length; w < w_len; ++w)
                    {
                        if(obj.labs()[0].exercises()[i]._data()[k].contents()[w].type() == "group_name" && obj.labs()[0].exercises()[i]._data()[k].contents()[w].content() == "Quiz")
                        {
                            if(obj.labs()[0].exercises()[i].cur_question() != -1)
                                return false;
                        }
                    }
                }
            }
        }
        return true;
    });

    //Checks to see if the learning point has an example or not. This function is
    //used to check whether or not the learning point needs to display the Example
    //header in the modal or not.
    //@contents = The content array for the specific learning point.
    obj.check_learning_point_example = function(contents)
    {
        var ret = false;

        //Loop through all of the content in the learning point
        for (var i = 0; i < contents().length; ++i)
        {
            //If an example is found set the return to true and leave the loop
            if (contents()[i].type() == "example")
            {
                ret = true;
                break;
            }
        }

        return ret;
    }

    obj.show_submit_button = ko.computed(function(){
        var ret = true;

        if(obj.disabled_submit_exes().indexOf(obj.labs()[obj.selected_lab()].exercises()[obj.labs()[obj.selected_lab()].selected_exercise()].type()) != -1){
            ret = false;
        }

        return ret;
    });

    obj.hide_placment_test_result = function()
    {
        ret = true;
        if ("show_pt_result" in self.lms_config)
        {
            if (self.lms_config.show_pt_result == 0){
                ret = false;
            }
        }
        return ret;
    }
}

function product_lab_data_model(data)   //HRC
{
    data.has_nav = ko.observable(false);
    data.has_exercise_controls = ko.observable(false);
    for(var i = 0; i < data().length; ++i)
    {
        if (data()[i].type() == "lab_options")
        {
            for (var k = 0; k < data()[i].contents().length; ++k)
            {
                if (data()[i].contents()[k].type() == "has_nav")
                    data.has_nav(data()[i].contents()[k].content());
                if (data()[i].contents()[k].type() == "has_exercise_controls")
                    data.has_exercise_controls(data()[i].contents()[k].content());
            }
        }
    }
}

//ViewModel level product functions
function product_select_lab(obj, value) //HRC
{
    obj.selected_lab(value);
}

/**************************/
/*Sena Lab Model/Functions*/
/**************************/

function product_lab_model(obj)
{
    //Number of displayed exercises in the nav bar
    // obj.max_exercises = ko.observable(obj.exercises().length - 1);
    obj.max_exercises = ko.observable(obj.exercises().length);
    //Whether or not enough correct questions have been answered to pass the test
    obj.passed = ko.observable(false);
    obj.restore_exercise_num = ko.observable(0);
    obj.exercises_to_delete = ko.observableArray([]);
    //List of tss stimuli
    obj.tss_stimuli = ko.observableArray([]);
    obj.selected_group = ko.observable(0);
    obj.selected_group_current_exercise_idx = ko.observable(0);
    obj.previous_group = ko.observable(0);
    obj.show_group_nav = ko.observable(false);

    obj.container_height = ko.observable(0);
    obj.quiz_score = ko.observable(-1);
    obj.group_bar_initilized = ko.observable(false);
    obj.is_sliding = ko.observable(false);

    obj.pause_audio = function(lab_id,stimuli_ids)
    {
        //Loop through all the stimuli
        for(var i = 0; i < obj.stimuli().length; ++i)
        {
            //Make sure the stimuli is audio and that the stimuli has changed
            if(obj.stimuli()[i].type() == "audio" && stimuli_ids.indexOf(i) == -1 || obj.stimuli()[i].type() == "video" && stimuli_ids.indexOf(i) == -1)
            {
                if ($('#audio_slideshow_0_'+obj.stimuli()[i].id()).length > 0)
                {
                    //Check to see if the audio is still playing or not
                    if (!$('#audio_slideshow_0_'+obj.stimuli()[i].id())[0].paused)
                    {
                        //pause the audio
                        $('#audio_slideshow_0_'+obj.stimuli()[i].id())[0].player.pause();
                    }
                }
                if ($('#video_scrolltext_0_'+obj.stimuli()[i].id()).length > 0)
                {
                    //Check to see if the audio is still playing or not
                    if (!$('#video_scrolltext_0_'+obj.stimuli()[i].id())[0].paused)
                    {
                        //pause the audio
                        $('#video_scrolltext_0_'+obj.stimuli()[i].id())[0].player.pause();
                    }
                }
            }
        }
    };
    

    //Sets up the audio container
    obj.adjust_audio_container = function()
    {
        //Loop through all the stimuli on the exercise
        for(var i = 0; i < obj.stimuli().length; ++i)
        {
            //console.log(obj.stimuli());
            //Check to make sure that the stimuli contains an audio source
            //THIS NEEDS TO BE SORTED OUT IN TO THE RIGHT STIMULI OBJECT!!!!!!!!!!!!!!!!!!!!1!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            var stimuli_obj = obj.stimuli()[i];
            
            if (stimuli_obj.type() == "audio") {
                stimuli_obj.delayed_show_progress("#audio_slideshow_0_"+stimuli_obj.id(), 'audio', 0);
            } else if(stimuli_obj.type() == "video") {
                stimuli_obj.delayed_show_progress("#video_scrolltext_0_"+stimuli_obj.id(), 'video', 0);
            }
        }
    };

    obj.adjust_video_container = function() {
        obj.delayed_adjust_video_container('.video_instruction', 'video', 0);
    }

    obj.delayed_adjust_video_container = function(player, player_type, count) {
        if(count<15){
            setTimeout(function() {
                if(product_helper_check_media_players_visible(player)){
                    obj.adjust_video_container_helper();
                }
                else{
                    count = count + 1;
                    obj.delayed_adjust_video_container(player, player_type, count);
                }
            }, 100);
         }
     }

    obj.adjust_video_container_helper = function()
    {
        var videos = $('.video_instruction');
        for (var l = 0; l < videos.length; ++l){
            if(videos[l].offsetParent !== null && typeof $('#'+videos[l].id)[0].stop === 'undefined' && ('#'+videos[l].id).indexOf('mep') == -1){
                //console.log("Inside of adjust_video_container...")
                //alert(typeof $('#'+videos[l].id).player);
                if(videos[l].id.indexOf('video')>-1){
                    // //log('init player in sadjust_video_container');
                    $('#'+videos[l].id).mediaelementplayer({
                        audioWidth: '100%',
                        audioHeight: '100%',
                        loop: false,
                        startVolume: 0.8,
                        preLoad: true,
                        features: ['playpause', 'current', 'progress', 'volume', 'fullscreen'],
                        alwaysShowControls: true,
                        alwaysShowHours: false,
                        showTimecodeFrameCount: false,
                        pauseOtherPlayers: true,
                        pluginPath: '/static/framework/media-elements/',
                        flashName: 'flashmediaelement.swf',
                        enableKeyboard: false
                    });
                }
            }

            else{
                if(videos[l].id.indexOf('video')>-1){
                    if (!$('#'+videos[l].id)[0].paused)
                    {
                        stop_all_audio();
                        if(!detectMobileiOS()){
                            $('#'+videos[l].id)[0].player.pause();
                        }
                        else{
                            $('#'+videos[l].id)[0].pause();
                        }
                    }
                }
            }
        }
        var fullscreen_btn = $('.mejs-fullscreen-button');

        for (var l = 0; l < fullscreen_btn.length; ++l){
            if(fullscreen_btn[l].offsetParent !== null){
                viewModel.video_fullscreen_handler(fullscreen_btn[l]);
            }
        }
    }

    //REEVALUATE Sena doesn't use this at all, not sure if other products do (KT)
    //Gets the current exercise number to display in the nav bar.
    obj.display_current_selected_exercise = function()
    {
        //Get the current selected exercise num
        var ret = obj.selected_exercise()+1;

        //If it's 0 that means it's on a welcome page which shouldn't be displayed
        // if (obj.selected_exercise() == 0)
        //     ret = 1;

        //If it's past the max then it's on a results page
        if (obj.selected_exercise() > obj.max_exercises())
            ret = obj.max_exercises();

        return ret.toString();
    }

    //Gets the first exercise of the group that is being selected.
    // Doesn't get the first. dont lie.
    //group_name = The name of the group that is being selected.
    obj.get_group_exercise = function(group_name) //REEVALUATE now that exercises is in the exercise group types global observable array
    {
        var group_ex = viewModel.get_group_selected_exercise();
        viewModel.set_group_selected_exercise(group_ex);
        //console.log("Loading exercise " + group_ex + " for group " + group_name);
        product_select_exercise(obj, viewModel.exercise_group_types()[obj.selected_group()].exercises()[group_ex]);
        //Call resize events so the windows doesn't get messed up (nav gets wacky without)
        product_helper_fire_resize_events();
    };

    //Gets the number of exercises in each group and adds the correct exercise numbers accordingly.
    //Gets called in product_core_start_lesson() when the product starts.
    obj.get_group_count = function()
    {
        //console.log("Building the exercise_group_types array");
        var objectives_duplicate_check = false;
        for (var i = 0, len = obj.exercises().length; i < len; ++i)
        {
            for (var k = 0, k_len = obj.exercises()[i]._data().length; k < k_len; ++k)
            {
                if (obj.exercises()[i]._data()[k].type() == "group")
                {
                    //Loop through all the group types to see if the current group matches any of them
                    for (var l = 0; l < viewModel.exercise_group_types().length; ++l)
                    {
                        if (viewModel.exercise_group_types()[l].group == obj.exercises()[i]._data()[k].contents()[0].content())
                        {
                            obj.show_group_nav(true);
                            //Increase the counter for the current group
                            viewModel.exercise_group_types()[l].count(viewModel.exercise_group_types()[l].count() + 1);
                            //Add the exercise number to the group
                            viewModel.exercise_group_types()[l].exercises.push(i);
                            break;
                        }
                    }
                }
            }
        }
    };

    //Sets the correct radio button for group exercises in the edit header on start
    //Called when a radio button is clicked on and sets the correct group to an exercise (used by edit html). Will
    //increase/decrease counters and exercise numbers accordingly.
    obj.set_current_group = function(_data, new_group,exer_id)
    {
        for (var i = 0, i_len = _data().length; i < i_len; ++i)
        {
            if (_data()[i].type() == "group")
            {
                if (typeof new_group === 'undefined')
                    return _data()[i].contents()[0].content();
                else if (new_group != _data()[i].contents()[0].content()) //Make sure we aren't adding the same exercise number to the same group
                {
                    for (var k = 0, k_len = viewModel.exercise_group_types().length; k < k_len; ++k )
                    {
                        //Find the current group before replacing it
                        if (viewModel.exercise_group_types()[k].group == _data()[i].contents()[0].content())
                        {
                            //Decrease the counter since an exercise is being removed
                            viewModel.exercise_group_types()[k].count(viewModel.exercise_group_types()[k].count() - 1);
                            //Remove the exercise number from the old group
                            viewModel.exercise_group_types()[k].exercises.remove(exer_id);
                            break;
                        }
                    }

                    //Use a second loop to make sure that content() has not been overridden before using it to get the old group
                    for (var k = 0, k_len = viewModel.exercise_group_types().length; k < k_len; ++k )
                    {
                        if (new_group == viewModel.exercise_group_types()[k].group)
                        {
                            //Set the current selected group on the lab
                            viewModel.labs()[viewModel.selected_lab()].selected_group(k);
                            //Set the new group name
                            _data()[i].contents()[0].content(new_group);
                            //Increase the counter for the group, to make sure we don't go over the limit
                            viewModel.exercise_group_types()[k].count(viewModel.exercise_group_types()[k].count() + 1);
                            //Add the new exercise number to the list in the group
                            viewModel.exercise_group_types()[k].exercises.push(exer_id);
                            //Sort the array to make sure the exercise numbers are in order when displayed
                            viewModel.exercise_group_types()[k].exercises.sort();

                            break;
                        }
                    }
                }
            }
        }

        //Select the first exercise in the group to make sure an available exercise is selected
        obj.selected_exercise(viewModel.exercise_group_types()[obj.selected_group()].exercises()[0]);

        product_helper_fire_resize_events();

        return "";
    };

    //Changes the currently selected exercise group.
    //Gets called when an exercise group is clicked on from the group bar at the bottom.
    obj.change_group = function(group_index, from_arrow, AT_init)
    {
        if(group_index !== obj.selected_group() || !viewModel.loaded()){ // do this if restoring progress (viewModel.loaded flag) even if the group index is the same as the selected group
            //console.log('Changing group to: ' + group_index);
            obj._stop_play_and_record();
            //Only change the selected exercise group if there are exercises in it
            if (viewModel.exercise_group_types()[group_index].count() > 0)
            {
                var current_group = viewModel.labs()[viewModel.selected_lab()].previous_group();
                // record previous group for transition
                viewModel.labs()[viewModel.selected_lab()].previous_group(current_group);
                // update the lab's selected group to the new group
                viewModel.labs()[viewModel.selected_lab()].selected_group(group_index);

                if (viewModel._data.test() == 'true' || viewModel._data.test() == "PT") { // fix for AT transitions
                    var previous_group = viewModel.labs()[viewModel.selected_lab()].selected_group();
                    var go_to_ex;
                    if (previous_group < current_group) {
                        // //console.log('go right')
                        go_to_ex = viewModel.exercise_group_types()[obj.selected_group()].exercises().length - 1;
                        viewModel.slide_dir(0);
                    } else {
                        // //console.log('go left')
                        go_to_ex = 0;
                        viewModel.slide_dir(1);
                    }
                    //Find and selects the first exercise in the selected group
                    if (arguments.length === 2) { // change group from arrows
                        product_select_exercise(obj, viewModel.exercise_group_types()[obj.selected_group()].exercises()[go_to_ex]);
                        viewModel.set_group_selected_exercise(go_to_ex);
                    }
                    else {
                        if (!AT_init){
                            obj.get_group_exercise(viewModel.exercise_group_types()[group_index].group);
                        }
                    }
                } else { // regular sena
                    obj.get_group_exercise(viewModel.exercise_group_types()[group_index].group);
                }

                // unset the prev group so transition doesn't get confused
                viewModel.labs()[viewModel.selected_lab()].previous_group(group_index);

                sfx_player('navigate-main');
            }
        }
        if (AT_init === 1) {
            product_select_exercise(obj, viewModel.exercise_group_types()[obj.selected_group()].exercises()[viewModel.get_group_selected_exercise()]);
            viewModel.get_navigation_string();
        }  else if (AT_init === 2) { // rslt
            product_select_exercise(obj, viewModel.exercise_group_types()[obj.selected_group()].exercises()[viewModel.get_group_selected_exercise()]);
            viewModel.get_navigation_string();
        }
    }
    
    obj._stop_play_and_record = function() {
        try {
            //console.log("Going to stop audios recording and playing");
            stop_all_audio();
            obj.exercises()[obj.selected_exercise()].stop_current_recording();
            obj.exercises()[obj.selected_exercise()].stop_current_playing();
        } catch (err) {
            //console.log("Did not stop recording/playing");
        }
    }

    //Navigation within the group where idx is the index of the desired exercise within the exercises array of the selected group in exercise_group_types array
    obj.change_group_exercise = function(idx)
    {
        viewModel.set_group_selected_exercise(idx);
        product_select_exercise(obj, viewModel.exercise_group_types()[obj.selected_group()].exercises()[viewModel.get_group_selected_exercise()]);
        product_helper_update_container_height();
    }

    //Checks all the exercises in the quiz group to see if they have all been answered. This is
    //used to enable / disable the submit button. Submit button will only be enabled in a quiz if
    //all the exercises have been answered.
    obj.show_group_quiz_submit = function()
    {
        ret = true;

        if (viewModel.exercise_group_types()[obj.selected_group()].group == "Quiz")
        {
            for (var i = 0; i < viewModel.exercise_group_types()[obj.selected_group()].exercises().length; ++i)
            {
                if(!(obj.exercises()[viewModel.exercise_group_types()[obj.selected_group()].exercises()[i]].type() == "RSLT" || obj.exercises()[viewModel.exercise_group_types()[obj.selected_group()].exercises()[i]].type() == "RSLT2")){
                    if (!obj.exercises()[viewModel.exercise_group_types()[obj.selected_group()].exercises()[i]].check_answer_enabled())
                        ret = false;
                }
            }
        }
        return ret;
    }

    //Used to enable/disable the submit button on an exercise.
    obj.enable_submit_button = function()
    {
        var ret = true;

        //If not checking answers, disable
        if (obj.exercises()[obj.selected_exercise()].check_answer_enabled() != true)
            ret = false;
        //If currently in a quiz and not finished, disable
        if (!obj.show_group_quiz_submit())
            ret = false;

        //Check to see if current exercise is GWR.
        //If on the final writing planner stage, enable
        if (obj.exercises()[obj.selected_exercise()].type() == "GWR")
        {
            if (typeof obj.exercises()[obj.selected_exercise()].finished_writing_planner !== 'undefined' && obj.exercises()[obj.selected_exercise()].finished_writing_planner() == 1 && obj.exercises()[obj.selected_exercise()].check_empty_content())
                ret = true;

            //If the planner has been completed, make sure to disable it
            if (obj.exercises()[obj.selected_exercise()].state() == 4)
                ret = false;
        }

        //If it's an achievement test, do it's on enable logic
        if (viewModel._data.test() == 'true' && viewModel.show_achievement_test_submit() == false)
            ret = false;
        else if (viewModel._data.test() == "PT")
            ret = true;

/*         if (obj.exercises()[obj.selected_exercise()].type() == "HNG")
                ret = true; */

        return ret;
    }

    //Calculates all the exercises part of the quiz group.
    obj.calc_group_quiz = function()
    {
        for (var i = 0; i < viewModel.exercise_group_types()[obj.selected_group()].exercises().length; ++i){
           obj.exercises()[viewModel.exercise_group_types()[obj.selected_group()].exercises()[i]].check_answers();
        }
        obj.quiz_score(Math.round(product_core_grade_LO('Quiz')));
    }

    //Called when the exercise submit button is pressed.
    obj.submit_button = function()
    {
        if(obj.exercises()[obj.selected_exercise()].type() == 'CWD'){
            obj.exercises()[obj.selected_exercise()].input_blur(); //remove typing styling on submit
        }
        
        if (viewModel._data.test() == 'false')
        {
            //Check to see if the current exercise group is part of a quiz
            if (viewModel.exercise_group_types()[obj.selected_group()].group != "Quiz")
            {
                //Check the answer of the current exercise
                obj.exercises()[obj.selected_exercise()].check_answers();
                if(!viewModel.is_gen()){
                    do_progress_actions();
                }
                //Show the feedback modal
                $('#feedback-modal').modal('show');
            }
            else
            {
                //If currently in a quiz, it will check all the correct exercises
                obj.calc_group_quiz();
                obj.change_group_exercise(viewModel.exercise_group_types()[obj.selected_group()].exercises().length-1);
                product_set_completion_for_test_lessons("completed");
                if(!viewModel.is_gen()){
                    do_progress_actions();
                }
            }
        }
        else
        {
            obj.change_group(6);
        }
    }

    obj.show_answers_button = function(){
        obj.exercises()[obj.selected_exercise()].final_generic_progress = get_specific_exercise_progress(0, obj.selected_exercise());
        obj.exercises()[obj.selected_exercise()].final_special_progress = get_specific_special_exercise_progress(0, obj.selected_exercise());
        //console.log(obj.exercises()[obj.selected_exercise()].final_generic_progress);
        //console.log(obj.exercises()[obj.selected_exercise()].final_special_progress);
        obj.exercises()[obj.selected_exercise()].showing_answer(true);
        obj.exercises()[obj.selected_exercise()].show_answers(0);
    }

    obj.nav_bar_showing = ko.computed( function(){
        var ret = true;

        if (obj.show_group_nav() == true && viewModel.exercise_group_types()[viewModel.labs()[viewModel.selected_lab()].selected_group()].count() < 2)
        {
            ret = false;
        }
        if (typeof viewModel !== 'undefined' && (viewModel._data.test() == 'true' || viewModel._data.test() == "PT"))
            ret = true;

        return ret;
    });

    obj.grading_chart_total = ko.computed( function(){
        var total = 0;
        if(obj.type() == "oed" && obj.id() == 3)
        {
            ko.utils.arrayForEach(obj.grading_chart.body.rows(), function (item) {
                if(item.selected_cell())
                {
                    total += parseInt(item.cells()[item.selected_cell()].points());
                }
            });
        }
        return total;
    });

    obj.reset_grading_chart = function(){//PS
        ko.utils.arrayForEach(obj.grading_chart.body.rows(), function (item) {
            if(item.selected_cell())
            {
                item.selected_cell(0);
            }
        });
    };

    //Check to see if the lab is a writing planner or writing task
    if(obj.type() == "oed")
        obj.local_type(helper_get_local_string(obj.type()+obj.id())); //Append the lab number to the local type
    else
        obj.local_type(ko.observable(helper_get_local_string(obj.type())));

    obj.maintain_exercises_data = ko.computed(function(){
        // //console.log('here');
        if(obj.exercises !== undefined){
            for (var i = 0, len = obj.exercises().length; i < len; ++i){
                obj.exercises()[i].id(i);
            }
        }
    });

    obj.stimuli_nav_showing = ko.computed(function(){
        if(obj.exercises()[obj.selected_exercise()].type() != 'WLC' && obj.exercises()[obj.selected_exercise()].stimuli_ids().length > 1){
            return true;
        }
        return false;
    });

    obj.has_stimuli = ko.computed(function(){
        if(obj.exercises()[obj.selected_exercise()].stimuli_ids().length){
            return true;
        }
        return false;
    });

    obj.get_stimuli_id_from_idx = function(idx){
        return obj.stimuli()[idx].id();
    }

    obj.get_stimuli_idx_from_id = function(id){
        for(var i = 0, i_len = obj.stimuli().length; i<i_len;++i){
            if(id == obj.stimuli()[i].id()){
                return i;
            }
        }
    }

    obj.select_stimuli = function(id){
        obj.selected_stimuli(obj.get_stimuli_idx_from_id(id));
    }

    obj.stimuli_col_size = ko.computed(function(){
        if(obj.exercises()[obj.selected_exercise()].type() == 'STI'){
            return 'col-xs-12';
        }
        else{
            return 'col-xs-4';
        }
    });

    obj.ex_col_size = ko.computed(function(){
        if(obj.exercises()[obj.selected_exercise()].type() == 'STI' && obj.has_stimuli() && !is_editable){
            return 'hide';
        }
        else if(obj.exercises()[obj.selected_exercise()].type() != 'STI' && obj.has_stimuli()){
            return 'col-xs-8';
        }
        else{
            return 'col-xs-12';
        }
    });

    obj.stimuli_checker = function(part)
    {
        var ret = 0;
        if (part == 1)
        {   //check to see if there is a single stimuli and make sure it is not stimuli 0 or that we are on the welcome page
            if (obj.exercises()[obj.selected_exercise()].type() != 'WLC' && obj.exercises()[obj.selected_exercise()].stimuli_ids().length == 1 && obj.exercises()[obj.selected_exercise()].stimuli_ids()[0] != 0)
            {
                ret = 1;
            }
        }
        else if (part == 2)
        {   // make sure we are not on the welcome page, check to see that we have more than one stimuli
            if (obj.exercises()[obj.selected_exercise()].type() != 'WLC' && obj.exercises()[obj.selected_exercise()].stimuli_ids().length > 1)
            {
                ret = 1;
            }
        }
        else if (part == 3)
        {
            if (obj.exercises()[obj.selected_exercise()].stimuli_ids().length == 1 && obj.exercises()[obj.selected_exercise()].stimuli_ids()[0] != 0 || obj.exercises()[obj.selected_exercise()].stimuli_ids().length > 1)
            {
                ret = 1;
            }
        }
        else if (part == 4)
        {
            if (obj.exercises()[obj.selected_exercise()].stimuli_ids().length == 1 && obj.exercises()[obj.selected_exercise()].stimuli_ids()[0] == 0 || obj.exercises()[obj.selected_exercise()].stimuli_ids().length == 0)
            {
                ret =  1;
            }
        }
        return ret;
    }


    if(is_editable)
    {
        edit_lab_model(obj);
        product_edit_lab_model(obj);
    }

    //Returns what learning skills are available in the current lab.
    //Will go through each exercise and group together the learning skills, will not show repeats.
    obj.get_learning_skills = function()
    {
        var ret = [];

        //Loop through each exercise in the lab
        for(var i = 0; i < obj.exercises().length; ++i)
        {
            //Loop through each learning skill that is on the exercise
            for (var k = 0; k < obj.exercises()[i]._data.learning_skills().length; ++k)
            {
                //If the current learning skill is not already in the array, then add it
                if (ret.indexOf(obj.exercises()[i]._data.learning_skills()[k]) == -1)
                    ret.push(obj.exercises()[i]._data.learning_skills()[k]);
            }
            //If the array already has all the possible learning skills, then leave the loop
            if (ret.length > 3)
                break;
        }

        //Return the final array of available learning skills
        return ret;
    }

    obj.selected_stimuli.subscribe(function() {
        viewModel.init_tool_tip(obj.stimuli()[obj.selected_stimuli()]._data(), true);
    });

    obj.pre_screen_close = function(value)
    {
        if( typeof obj.exercises()[value].dragdrop !== 'undefined' && !obj.exercises()[value].dragdrop.initiated()) //EXS
        {
            obj.exercises()[value].dragdrop.init();
            adjust_drag_item_positions(obj.exercises()[value].dragdrop);
        }

        if(product_helper_is_drag_drop_type(obj.exercises()[value].type())){ //EXS
            //console.log('adjusting dragdrop');
            product_helper_update_container_height();
            if(obj.exercises()[value].type() == "MF1"){
                product_helper_adjust_MF1_response_container(obj.exercises()[value]); // fix for mf1 response container width on progress restore
            }
            product_helper_adjust_single_drop_positions();
            if(obj.exercises()[value].type() == "WSB"){
                product_helper_adjust_WSB(obj, value);
            }
        }
        obj.adjust_audio_container();
    }
}

//Navigation functions
function product_select_exercise(obj, value)
{
    obj.hiding_pre_screen(1);
    if(!obj.is_sliding()){
        //console.log("Selecting the new exercise and beginning slide animation");
        if(initialized && viewModel.loaded() && !viewModel.is_gen()){
            do_scorm_progress_actions();
        }
        obj.is_sliding(true);
        if(obj.exercises()[value].type() != "WLC") //EXS
        {
            //show pre-screen if available
            for(var i = 0; i < obj.exercises()[value]._data().length; ++i)
            {
                if (obj.exercises()[value]._data()[i].type() == "pre_screen")
                {
                    if(!obj.exercises()[value].shown_pre_screen())
                        obj.hiding_pre_screen(0);
                }
            }
        }

        if(obj.exercises()[obj.selected_exercise()].type() == "WLC"){
            if(value != 0){
                viewModel.flipWelcomePanel(true);
            }
        }
        else if(obj.exercises()[value].type() == "WLC"){
            viewModel.flipWelcomePanel(false);
        }

        if(viewModel.use_slide_transition() && obj.selected_group() !== 0) { // is a user switch, show sliding; also disable if going/from wlc
            sena_slide_switch(obj, value);
        } else { // none user switch, fallback to original
            $('#'+obj.type()+'_exercises').stop();
            $('#'+obj.type()+'_exercises').hide();
            if(value >= obj.exercises().length) { value = (obj.exercises().length - 1); }
            else if(value < 0) { value = 0; }
            $('#'+obj.type()+'_exercises').fadeIn(400);
            product_post_ex_switch(obj, value);
        }
    }
}

function product_post_ex_switch (obj, value) {
    if(obj.exercises()[obj.selected_exercise()].type() == "SPK" && obj.exercises()[obj.selected_exercise()].started() && !obj.exercises()[obj.selected_exercise()].progress_restored())
    {
        obj.exercises()[obj.selected_exercise()].paused_timer(((Date.now() - obj.exercises()[obj.selected_exercise()].timer())/1000)+obj.exercises()[obj.selected_exercise()].paused_timer());
    }
    // This stuff needs to happen only after switching exercise (and it is showing)
    obj.selected_exercise(value);

    stop_all_audio();

    //Used for tss stimuli
    if (obj.exercises()[obj.selected_exercise()].stimuli_ids().length){
        obj.selected_stimuli(obj.get_stimuli_idx_from_id(obj.exercises()[obj.selected_exercise()].stimuli_ids()[0]));
    }

    if(obj.exercises()[value].type() == "SPK")
    {
        product_select_exercise_spk(obj.exercises()[obj.selected_exercise()], obj.container_height());
    }

    if(obj.hiding_pre_screen()){
        if( typeof obj.exercises()[value].dragdrop !== 'undefined' && !obj.exercises()[value].dragdrop.initiated()) //EXS
        {
            obj.exercises()[value].dragdrop.init();
            adjust_drag_item_positions(obj.exercises()[value].dragdrop);
        }

        if(product_helper_is_drag_drop_type(obj.exercises()[value].type())){ //EXS
            //console.log('adjusting dragdrop');
            product_helper_update_container_height();
            if(obj.exercises()[value].type() == "MF1"){
                product_helper_adjust_MF1_response_container(obj.exercises()[value]); // fix for mf1 response container width on progress restore
            }
            product_helper_adjust_single_drop_positions();
            if(obj.exercises()[value].type() == "WSB"){
                product_helper_adjust_WSB(obj, value);
            }
        }
    }

    obj.adjust_video_container();

    obj.adjust_audio_container();

    viewModel.init_tool_tip(obj.exercises()[obj.selected_exercise()]._data(), false);
    if(viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].type() != "WLC"){
        if (viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].stimuli_ids().length > 0){
            viewModel.init_tool_tip(obj.stimuli()[obj.selected_stimuli()]._data(), true);
        }
    }

    //will hide pre_screen if an exe doesent have one
    // var flag_if_has_pre_screen = 0;
    // for(var i = 0; i < obj.exercises()[value]._data().length; ++i)
    // {
    //     if (obj.exercises()[value]._data()[i].type() == "pre_screen")
    //     {
    //         flag_if_has_pre_screen = 1;
    //     }
    // }
    // if(!flag_if_has_pre_screen)
    // {
    //     obj.hiding_pre_screen(1);
    // }
    if(!obj.group_bar_initilized() && obj.exercises()[value].type() != "WLC")
    {
        //Only enable the tooltips if the current device is not a touch device
        if ('ontouchstart' in document.documentElement == false) {
            $('[data-toggle="tooltip"]').tooltip();
        }
        obj.group_bar_initilized(true);
    }
    
    if ('ontouchstart' in document.documentElement == false) {
        $('[data-toggle="tooltip"]').tooltip();
    }

    if(viewModel._data.test() == 'true' || viewModel._data.test() == "PT")
    {
        viewModel.get_exercise_start_question(obj.selected_group());
    }
    $(window).trigger('resize'); // to fix video size
    if(viewModel.loaded() && !viewModel.is_gen()){
        viewModel.get_progress();
    }
    obj.is_sliding(false);
}

function sena_slide_switch (obj, value) {
    obj.adjust_video_container();

    var cur_grp, tar_grp, from, to;
    cur_grp = obj.previous_group();
    tar_grp = obj.selected_group();
    // direction needs to check current group first,
    // if going to the same group, then compare ex number

    if (cur_grp === tar_grp) {
        // we are in the same grp, check ex index instead
        from = obj.selected_exercise();
        to = value;
    } else {
        // we are changing grps, check the grp indices
        from = cur_grp;
        to = tar_grp;
    }

    var viewport_width = $(window).width();
    var wrapper = $('.stim_ex_wrapper');
    var direction = from - to > 0 ? viewport_width : viewport_width * -1;

    if (viewModel._data.test() == 'true' || viewModel._data.test() == "PT")
        direction = viewModel.slide_dir() == 0 ? viewport_width : viewport_width * -1;

    var opp = direction * -1;
    wrapper.one('transitionend', function () { // bind first
        wrapper.css('visibility', 'hidden');
        wrapper.addClass('no_transition');
        // none transition move. callback to init ex once done moving and visible
        wrapper.animate({left: opp}, 100, function () { // this should match the speed in css transition.
            wrapper.css('visibility', 'visible');
            wrapper.removeClass('no_transition');
            wrapper.animate({left: '0px'}, 100, function () {
                product_post_ex_switch(obj, value);
                $('.response_container').css({ // temp fix to get dd response container to show up
                    'left' : '40px',
                    'bottom' : '150px'
                });
            });
        })
    });
    wrapper.css('left', direction); // once done moving out, will trigger the above event
}

/********************************/
/*Sena Exercise Models/Functions*/
/********************************/

function product_exercise_data_model(data)
{
    data.learning_skills = ko.observableArray([]);

    for(var i = 0; i < data().length; ++i)
    {
        if (data()[i].type() == "learning_skills")
        {
            for (var k = 0; k < data()[i].contents().length; ++k)
            {
                if (data()[i].contents()[k].type() == "skill")
                    data.learning_skills.push(data()[i].contents()[k].content());
            }
        }
    }
}

function product_exercise_model(obj)
{
    obj.drag_drop_container_height = ko.observable();//PS
    obj.drag_drop_container_width = ko.observable();//PS
    obj.drag_drop_MT1_started = ko.observable(false);
    obj.slider_toggle = ko.observable(false);//PS //used for OED 3 more less instructions
    obj.drag_drop_responses_randomized = ko.observable(false);//PS
    obj.playing_recording = ko.observable(false);
    obj.is_recording = ko.observable(false);
    obj.historical_progress = ko.observable('');
    obj.playing_audio = ko.observable(false);
    obj.question_playing_flash = ko.observable(0);
    obj.feedback_showing_answer = ko.observable(false);
    obj.has_background_image = ko.observable(false);
    obj.current_recording_player = [];
    obj.current_playing_player = [];

    obj.final_generic_progress;
    obj.final_special_progress;

    obj.display_show_answers_btn = ko.observable(false);
    
    //If scorm is being used, set the question scorm info used for scorm interactions
    if(initialized){
        product_helper_set_question_scorm_info(obj);
    }

    //The following was implemented to handle the new requirement that each exercise only has one objective associated with it
    if(!(obj.type() == 'WLC' || obj.type() == 'STI' || obj.type() == 'RSLT' || obj.type() == 'RSLT2' || obj.type() == 'DWS')){
        //Observable that keeps track of what objective is selected for the exercise
        obj.exercise_objective = ko.observable("");
        //A subscribe that watches the exercise objective and whenever it changes it updates all the questions objectives to the new objective
        obj.exercise_objective.subscribe(function(value){
            //Since the select box values on the header edit update exercise_objective, if nothing is selected this makes sure we don't set the question objectives to undefined
            if(typeof value == 'undefined'){
                value = "";
            }
            for(var i = 0, i_len = obj.questions().length; i<i_len;++i){
                for(var d = 0, d_len = obj.questions()[i]._data().length; d<d_len;++d){
                    if(obj.questions()[i]._data()[d].type()=='objective'){
                        obj.questions()[i]._data()[d].content(value);
                    }
                }
            }
        });
        //On load, since the objectives are saved on the question layer, check the first question (if there is a question) and set the exercise objective to be whatever objective the first question has
        if(obj.questions().length){
            for(var d = 0, d_len = obj.questions()[0]._data().length; d<d_len;++d){
                if(obj.questions()[0]._data()[d].type()=='objective'){
                    obj.exercise_objective(obj.questions()[0]._data()[d].content());
                }
            }
        }
    }

    obj.CWD_WDS_maintain_edit_grid = function()
    {
        //Loop through each question and add a flag for editing. Do it here instead of on the question model
        //so that it doesn't have to do the check on every single question in the lesson. Flag is used so the editing
        //tool doesn't load all the question grids on start up, which is slow.
        for (var i = 0; i < obj.questions().length; ++i)
        {
            if (obj.type() == "WDS")
                obj.questions()[i].edit_wds_grid = ko.observable(false);
            else
                obj.questions()[i].edit_cwd_grid = ko.observable(false);
        }
    }
    if (obj.type() == "WLC") {
        product_helper_wlc(obj);
    }

    if (obj.type() == "CWD") //EXS
    {
        product_helper_exercise_cwd(obj);
        obj.CWD_WDS_maintain_edit_grid();
    }
    if (obj.type() == "WDS") //EXS
    {
        product_helper_exercise_wds(obj);
        obj.CWD_WDS_maintain_edit_grid();
    }
    if (obj.type() == "FLC")
    {
        product_helper_exercise_flc(obj);
    }
    if (obj.type() == "HNG") //EXS
    {
        product_helper_exercise_hng(obj);
    }
    if (obj.type() == "STI") //EXS
    {
        obj.disable_solution_button(true);
        obj.disable_clear_button(true);
        obj.questions()[0].responses()[1].selected(1);
        product_check_answers(obj);
    }
    if (obj.type() == "WSB")
    {
        product_helper_exercise_wsb(obj);
    }
    if (obj.type() == "SPK")
    {
        product_helper_exercise_spk(obj);
    }
    if (obj.type() == "CAS")
    {
        product_helper_exercise_cas(obj);
    }
    if (obj.type() == "ATA")
    {
        product_helper_exercise_ata(obj);
    }
    if (obj.type() == "TTT") //EXS
    {
        product_helper_exercise_ttt(obj);
    }
    if (obj.type() == "GIW")
    {
       product_helper_exercise_giw(obj);
    }
    if (obj.type() == "GWR")
    {
        product_helper_exercise_gwr(obj);
    }
    if (obj.type() == "MCH") //EXS
    {
        product_helper_exercise_mch(obj);
    }
    if (obj.type() == "KAR") //EXS
    {
        product_helper_exercise_kar(obj);
    }
    if (obj.type() == "DFL")
    {
        obj.has_background_image(false); // DFL can have bckgrnd img
    }

    //custom feedback options
    if(lesson_config_json.feedback_type != 'gen')
    {
        obj.user_action = ko.observable(0);
        obj.state = ko.computed(function(){//kinda bad logic : Update. On closer inspection this function is generic and well written
            var state = 0//0 state for nothing started on question
            var item_states = new Array();
            var state_total = 0;
            if(obj.check_answer() != 0)
            {
                ko.utils.arrayForEach(obj.questions(), function (item) {
                    if(ko.utils.unwrapObservable(item.state)){
                        item.check_answer(1);
                    };
                });
            }else
            {
                obj.checked_answer(false);
            }
            obj.check_answer(0);
            ko.utils.arrayForEach(obj.questions(), function (item) {
                if(ko.utils.unwrapObservable(item.state)){
                    item_states.push(ko.utils.unwrapObservable(item.state));
                };
            });
            //check all states
            for (var i = 0; i < item_states.length; ++i)
            {
                if(item_states[i] == 1 || item_states[i] == 3)
                {
                    state = 1;// at least 1 in progress if any error return 2
                }
                else if(item_states[i] == 2)
                {
                    return 2;//change me
                }
                state_total += item_states[i];
            }
            if (item_states.length && item_states.length != obj.questions().length)
            {
                return 1; //some but not all answered
            }
            else if (!item_states.length)
            {
                return 0;//none selected
            }
            else if(item_states.length == obj.questions().length)
            {
                if (state_total/item_states.length == 4)//perfect response
                {
                    return 4;
                }
            }
            //console.log('ex state change to: '+state);
            return state;
        });

        obj.check_answer_enabled = ko.computed(function(){//RG
            if(obj.state() && !obj.showing_answer() && !obj.checked_answer() && !obj.disable_check_answer() && obj.cur_question() == -1)
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        obj.show_answer_enabled = ko.observable(false);
        obj.clear_button_enabled = ko.computed(function(){//RG
            if(obj.state() && !obj.disable_clear_button())
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        obj.show_feedback = ko.computed(function() {//RG
            if(obj.checked_answer())
            {
                return true;
            }
            return false
        });
    }
    obj.historical_state = ko.computed( function () {
        if(obj.historical_progress() != '')
        {
            if(obj.historical_progress().status == 'passed')
            {
                return 4;
            }
            else if(obj.historical_progress().status == 'failed')
            {
                return 2;
            }
            else
            {
                return 0;
            }
        }
    });
    //Flag to show whether or not there is a rec question in the exercise
    obj.speech_question = ko.observable(false);
    if(typeof obj._data !== 'undefined')
    {
        //Loop through each question and it's _data to check for a rec question
        for (var i = 0; i < obj.questions().length; ++i)
        {
            for (var k = 0; k < obj.questions()[i]._data().length; ++k)
            {
                //Check to see if it's a question type, to avoid anything else. Check to make sure there is data inside of contents before checking for rec
                if (obj.questions()[i]._data()[k].type() == "question" && obj.questions()[i]._data()[k].contents().length > 0 && obj.questions()[i]._data()[k].contents()[0].type() == "rec")
                {
                    obj.speech_question(true); //Show that there is a rec question
                }
            }
        }
    }

    //Only create a new dragdrop if the current exercise is a drag drop type
    if(product_helper_is_drag_drop_type(obj.type())) //EXS
    {
        obj.dragdrop = new dragdrop_model(obj);
    }

    //Initializes the popover functionality for TYP answers.
    //Loops through each question on the exercise and finds the
    //popover objects to initialize.
    obj.init_popover = function()
    {
        for (var i = 0, len = obj.questions().length; i < len; ++i)
        {
            $('#popover_'+obj.id()+'_'+obj.questions()[i].id()).popover({container: 'body', html: true});
        }
    }

    obj.select_ELS_response = function(labID, responseID) //EXS
    {
        if ( $('#ELS_'+labID+'_'+responseID).hasClass('selected'))
            $('#ELS_'+labID+'_'+responseID).removeClass('selected');
        else
            $('#ELS_'+labID+'_'+responseID).addClass('selected');
    }

    obj.create_player_id_obj = function(id, player_id){
        return {id:id, player_id:player_id};
    }

    obj.record_speech = function(id, player_id){
        // var check1 = sendToFlash('flash_player').checkHasMic();
        // //console.log(check1);
        // var check2 = sendToFlash('flash_player').checkMicSecurity();
        //console.log("In record_speech: " + obj.current_recording_player);
        viewModel.labs()[viewModel.selected_lab()]._stop_play_and_record();
        
        obj.questions()[id].recording(true);
        
        obj.is_recording(true);

        if(!viewModel.flash_fallback()){
            rec_start_recording(player_id);
            player_id_obj = obj.create_player_id_obj(id, player_id);
            obj.current_recording_player.push(player_id_obj);
        }
        else{
            try{
                sendToFlash('flash_player').startRecording();
            }
            catch(err){
                console.log(err);
            }
        }
    }

    obj.stop_recording = function(id, player_id, and_save){
        obj.questions()[id].recording(false);
        obj.is_recording(false);
        if(!viewModel.flash_fallback()){ 
            rec_stop_recording(player_id);
            obj.questions()[id].has_recorded(true);
            obj.current_recording_player.pop();
            if(and_save){
                obj.questions()[id].check_rec_response();
            }
        }
        else{
            var wav = sendToFlash('flash_player').stopRecording();
            if(and_save){
                obj.questions()[id].flash_fallback_data(wav);
                //console.log(wav);
                obj.questions()[id].check_rec_response();
            }
        }
    }
    
    obj.stop_current_recording = function() {
        //console.log("Stopping recording...");
        if(!viewModel.flash_fallback()){
            for(var i = 0; i<obj.current_recording_player.length; i++) {
                current_recording_object = obj.current_recording_player[i];
                //Calling record_speech on anything recording should stop the recording
                obj.stop_recording(current_recording_object.id, current_recording_object.player_id, false);
            }
            //This line is required to make sure 2nd recording works
            //But now it lives in the new stop_recording function
            // obj.is_recording(false);
        }
        else{
            var wav = sendToFlash('flash_player').stopRecording();
            obj.is_recording(false);
            for(var i = 0; i<obj.questions().length;i++){
                obj.questions()[i].recording(false); //clear all the flags for UI
            }
        }
    }

    obj.can_play_flash_recording= true;

    obj.play_recording = function(id, player_id){
        //console.log(obj.current_playing_player);
        viewModel.labs()[viewModel.selected_lab()]._stop_play_and_record();
        
        if(!viewModel.flash_fallback()){
            //Check to see if the audio is already playing
            if (!obj.questions()[id].playing_recording())
            {
                //console.log("Playing recording in play_recording...")

                //Check to see if there is actual audio to be played
                if($('#'+ player_id)[0].currentSrc != "")
                {
                    // obj.stop_current_playing();
                    //Make sure the visual icon changes
                    obj.questions()[id].playing_recording(true);
                    //Play the audio if there is any
                    setTimeout(function() { 
						document.getElementById(player_id).play();
					}, 750);
                    
                    
                    //Set an event to reset the icon once the audio has finished playing
                    $('#'+ player_id).bind('ended', function() {
                        obj.questions()[id].playing_recording(false);
                        obj.current_playing_player.pop();
                    });
                    
                    player_id_obj = obj.create_player_id_obj(id, player_id);
                    obj.current_playing_player.push(player_id_obj);
                }
                else{
                    obj.clear_recording(id);
                }
            }
            else //Stop the audio
            {
                obj.stop_playing_recording(id, player_id);
            }
        }
        else{
            //console.log(obj.questions()[id].flash_fallback_data());
            //console.log(id);
            if(obj.can_play_flash_recording){
                obj.can_play_flash_recording = false;
                setTimeout(function(){obj.can_play_flash_recording = true;}, 500);
                if(obj.questions()[id].flash_fallback_data()){
                    obj.question_playing_flash(id);
                    //Make sure the visual icon changes
                    obj.questions()[id].playing_recording(true);
                    sendToFlash('flash_player').setSoundToPlay(obj.questions()[id].flash_fallback_data());
                    var ready_to_play_flash = sendToFlash('flash_player').checkSoundReady();
                    obj.play_flash_delay = setInterval(function(){
                            ready_to_play_flash = sendToFlash('flash_player').checkSoundReady();
                            if(ready_to_play_flash)
                            {
                                sendToFlash('flash_player').playSound();
                                obj.clear_flash_interval();
                            }
                    }, 100); //check to see when the appropriate audio is loaded and play it when it's ready
                }
                else{
                    obj.clear_recording(id);
                }
            }
        }
    }

    obj.stop_playing_recording = function(id, player_id){
        if(!viewModel.flash_fallback()){
            //console.log("Stopping recording in play_recording...")
            document.getElementById(player_id).pause();
            obj.questions()[id].playing_recording(false);
            obj.current_playing_player.pop();
        }
    }
    
    obj.stop_current_playing = function() {
        if(!viewModel.flash_fallback()){
            for(var i = 0; i< obj.current_playing_player.length; i++) {
                current_playing_object = obj.current_playing_player[i];
                //console.log('Try to stop current playing object: '+ current_playing_object);
                obj.stop_playing_recording(current_playing_object.id, current_playing_object.player_id);
            }
        }
        else{
            sendToFlash('flash_player').stopSound();
            for(var i = 0; i<obj.questions().length;i++){
                obj.questions()[i].playing_recording(false); //clear all the flags
            }
        }
    }

    obj.clear_flash_interval = function(){
        clearInterval(obj.play_flash_delay);
    }

    obj.clear_recording = function(id){
        if(obj.questions()[id].playing_recording()){
            obj.stop_current_playing();
        }
        obj.questions()[id].clear();
        obj.questions()[id].playing_recording(false);
    }

    obj.get_rec_question = function()
    {
        //Loop through each question and it's _data to check for a rec question
        for (var i = 0; i < obj.questions().length; ++i)
        {
            if (product_helper_check_rec_question(obj.questions()[i]._data()) || obj.type() == "REC"){
                return i;
            }
        }
        return -1;
    };

    obj.maintain_instructions = function(i){
        if(i.type() == 'table'){
            i.content(new table_model({"rows":0,"columns":0,"cells":[],"styles":""}));
        }
    }

    obj.speech_question.subscribe(function()
    {
        if (obj.speech_question() == true)
        {
            obj.add_speech_rec();
        }
        else
        {
            obj.remove_speech_rec();
        }
    });

    //Will add a speech question to the exercise.
    obj.add_speech_rec = function()
    {
        //Add a empty question with a type of REC and some default responses
        var question_obj = {
            "_data": [{
                "type": "question",
                "contents" : [{
                    "type": "rec",
                    "content" : ""
                }]
            }],
            "id": 0,
            "responses": []
        };
        //Add the required responses to the question
        question_obj.responses.push({
            "selected": 0,
            "id": 0,
            "correct": 0,
            "_data": [{
                "type": "text",
                "content" : ""
            }]
        });
        question_obj.responses.push({
            "selected": 0,
            "id": 0,
            "correct": 1,
            "_data": [{
                "type": "text",
                "content" : ""
            }]
        });
        //Set the correct ID
        if(obj.questions().length){
            question_obj.id = obj.questions()[obj.questions().length-1].id()+1;
        }
        //Add the new question to the questions array
        obj.questions().push(new question_model(question_obj));
    }

    //Loops through the questions on the exercise and will remove a speech question
    //if it finds one.
    obj.remove_speech_rec = function()
    {
        //Loop through each question and find the rec question and remove it.
        for(var i = 0; i < obj.questions().length; ++i)
        {
            for (var k = 0; k < obj.questions()[i]._data().length; ++k)
            {
                if (obj.questions()[i]._data()[k].type() == "question")
                {
                    for (var c = 0; c < obj.questions()[i]._data()[k].contents().length; ++c)
                    {
                        if (obj.questions()[i]._data()[k].contents()[c].type() == "rec")
                        {
                            obj.questions().splice(i,1);
                            return;
                        }
                    }
                }
            }
        }
    }

    obj.check_speech_question = function()
    {
        //Loop through each question and it's _data to check for a rec question
        for (var i = 0; i < obj.questions().length; ++i)
        {
            for (var k = 0; k < obj.questions()[i]._data().length; ++k)
            {
                if (obj.questions()[i]._data()[k].type() == "question")
                {
                    for (var c = 0; c < obj.questions()[i]._data()[k].contents().length; ++c)
                    {
                        if (obj.questions()[i]._data()[k].contents()[c].type() == "rec")
                            return true;
                    }
                }
            }
        }

        return false;
    };

    obj.maintain_questions_data = ko.computed(function(){
        if(obj.questions !== undefined){
            for (var i = 0, len = obj.questions().length; i < len; ++i){
                obj.questions()[i].id(i);
            }
        }
    });

    //Set the learning skill for the exercise. Called in the header editor.
    obj.set_learning_skill = function(skill)
    {
        var found = false;

        for (var i = 0; i < obj._data().length; ++i)
        {
            if (obj._data()[i].type() == "learning_skills")
            {
                for (var l = 0; l < obj._data()[i].contents().length; ++l)
                {
                    if (obj._data()[i].contents()[l].content() == skill)
                    {
                        obj._data()[i].contents().splice(l,1);
                        return;
                    }
                }
                found = true;
            }
        }

        //Learning Skills is not in the object, so add the entire thing in
        if (found == false)
        {
            obj._data.push({
                "type": ko.observable("learning_skills"),
                "contents" : ko.observableArray([{
                    "type": "skill",
                    "content": ko.observable(skill)
                }])
            })
        }
        else //Learning skills is already in the object, so we just need to add the specific skill
        {
            //Loop through the _data object until we find learning_skills
            for (var i = 0; i < obj._data().length; ++i)
            {
                if (obj._data()[i].type() == "learning_skills")
                {
                    //Push the skill to the end of learning_skills
                    obj._data()[i].contents.push({
                        "type": "skill",
                        "content": ko.observable(skill)
                    });
                }
            }
        }
    };

    obj.get_instructions_columns_size = function(content_index,data_index) {
        var ret = 'col-md-12 col-sm-12 col-xs-12';
        if (data_index != undefined)
        {
            if (obj._data()[data_index].contents()[content_index].type() == "image-md")
                ret = 'col-md-8 col-sm-8 col-xs-8';
            else if (obj._data()[data_index].contents()[content_index].type() == "image-sm")
                ret = 'col-lg-3 col-md-4 col-sm-4 col-xs-5';
        }
        else
        {
            for (var i = 0; i < obj._data().length; ++i)
            {
                if (obj._data()[i].type() == "instructions")
                {
                    if (obj._data()[i].contents()[content_index].type() == "image-md")
                        ret = 'col-md-8 col-sm-8 col-xs-8';
                    else if (obj._data()[i].contents()[content_index].type() == "image-sm")
                        ret = 'col-lg-3 col-md-4 col-sm-4 col-xs-5';
                }
            }
        }

        return ret;
    }

    obj.add_rec_question = function(question_idx)
    {
        //Check to see if the question is a recording question
        if (product_helper_check_rec_question(obj.questions()[question_idx]._data()))
        {
            //Loop through the _data and check for any post_question.
            for(var l = 0; l < obj.questions()[question_idx]._data().length; ++l)
            {
                if (obj.questions()[question_idx]._data()[l].type() == "post_question")
                {
                    //Remove post_question as it messes up TYP. And it's not needed in a rec question at all.
                    obj.questions()[question_idx]._data().splice(l,1);
                    //Reload the page to initialize the recording components
                    viewModel.edit.save();
                }
            }
        }
        else
        {
            //Check to see if switching from rec in a TYP. post_question needs to be added back.
            if (obj.type() == "TYP")
            {
                var found = false;
                for(var l = 0; l < obj.questions()[question_idx]._data().length; ++l)
                {
                    if (obj.questions()[question_idx]._data()[l].type() == "post_question")
                        found = true;
                }
                if (!found)
                {
                    obj.questions()[question_idx]._data().push({"type":"post_question", "contents": {"type": "", "content": ""}});
                    //Reload the page to initialize the recording components
                    viewModel.edit.save();
                }
            }
        }
    };

    //Number of tool_tips on the exercise
    obj.tip_count = ko.observable(-1);

    //Creates a tool tip for exercise instructions.
    //@content = The string content of the input nox.
    //@idx = The contents index.
    obj.create_instruction_tool_tip = function(content, idx)
    {
        //Get the start of the selected word
        var start = $('#instruction_input_' + viewModel.labs()[viewModel.selected_lab()].selected_exercise() +'_'+idx)[0].selectionStart;
        //Get the end of the selected word
        var end = $('#instruction_input_' + viewModel.labs()[viewModel.selected_lab()].selected_exercise() +'_'+idx)[0].selectionEnd;

        viewModel.create_tip(content, start, end, false);
    }

    if(is_editable)
    {
        product_edit_exercises_model(obj);
        edit_exercise_model(obj);
    }
}

/**********/
/*Feedback*/
/**********/
function product_exercise_feedback_mapping(data, exercise_obj)
{
    var self = this;
    ko.mapping.fromJS(data, {}, self);
    self.attempts = ko.observable(0);
    self.show_feedback = ko.observable(false);
    self.current_feedback = ko.computed(function(){
        //console.log('current feedback triggered');
        var ret = '';
        self.show_feedback(false);
        var trigger = exercise_obj.user_action();
        if(trigger){
            if(exercise_obj.cur_question() == -1 && self.attempts() < 2)
            {
                if(viewModel._data.test() == 'true' || viewModel._data.test() == 'PT'){ // if it is a test, they can only submit answers once, so mark them as complete as soon as their state changes to one of the complete states
                    if(exercise_obj.state() == 4 || exercise_obj.state() == 2){
                        exercise_obj.feedback_showing_answer(true);
                    }
                }
                else{
                    if(exercise_obj.state() == 4)
                    {
                        ret = self.correct_feedback();
                        self.show_feedback(true);
                        exercise_obj.feedback_showing_answer(true);
                        product_disable_exercise(exercise_obj);
                    }
                    else if(exercise_obj.state() == 2 && exercise_obj.checked_answer() || exercise_obj.state() == 1 && exercise_obj.checked_answer())
                    {
                        ret = self.incorrect_feedback()[self.attempts()].content();
                        self.show_feedback(true);
                        if(self.attempts() == 1)
                        {
                            self.attempts(self.attempts()+1); //added this so that attempts gets to two when they've submitted twice (KT)
                            //removed this so only gets showing answer when they click show answer
                            // if (exercise_obj.type() != "MT1")
                            //     exercise_obj.showing_answer(true);

                            // if (typeof exercise_obj.dragdrop !== 'undefined')
                            // {
                            //     //Disable all the pep objects on the current exercise
                            //     for(var k = 0, lenT = exercise_obj.dragdrop.pep_objs().length; k < lenT; ++k)
                            //         $.pep.peps[exercise_obj.dragdrop.pep_objs()[k].pep_idx].toggle(false);
                            // }
                            //exercise_obj.show_answers(0);//sena only has 1 lab HRC
                            exercise_obj.disable_clear_button(true);
                            //flag false
                            exercise_obj.feedback_showing_answer(true); //set this flag when they've gotten it wrong twice
                            product_disable_exercise(exercise_obj);
                            exercise_obj.display_show_answers_btn(true); //along the way, feedback_showing_answer went from meaning to show the show answers button, to being the flag for the exercise being complete
                        }
                        else
                        {
                            self.attempts(self.attempts()+1);

                            //Check for SPK so it doesn't increase the attempt before the user has finished playing.
                            if (exercise_obj.type() == "SPK")
                            {
                                if (exercise_obj.started() == true)
                                {
                                    self.attempts(0); //Reset the counter if SPK hasn't been finished yet
                                }
                            }
                        }
                    }
                }
            }
        }

        exercise_obj.user_action(0);
        return ret;
    });
}

//Called when the feedback is true. Goes through the exercise and makes sure everything is disabled.
//@obj = The exercise object
function product_disable_exercise(obj)
{
    //console.log('disable ex');
    var flag = false;
    if (typeof viewModel !== 'undefined')
    {
        for(var i = 0; i < viewModel.disabled_lockout_exes().length; ++i)
        {
            if (obj.type() == viewModel.disabled_lockout_exes()[i])
            {
                flag = true;
                break;
            }
        }
    }
    if (!flag){
        //Check to make sure that the viewModel has been created (Initial startup).
        //Also check to make sure that the exercise has been fully completed correctly before disabling everything.
        // if (typeof viewModel !== 'undefined' && viewModel.labs()[0].exercises()[viewModel.labs()[0].selected_exercise()].state() == 4)
        // {
            //Added in bug_055_answer_lock, lock all the answers if all the questions are correct

            if (obj.type() == "TYP" || obj.type() == "GIW")
            {
                //Initialize the bootstrap popover functionality
                obj.init_popover();
            }
            if (typeof obj.dragdrop !== 'undefined')
            {
               // //console.log('lock');
                //Disable all the pep objects on the current exercise
                for(var k = 0, lenT = obj.dragdrop.pep_objs().length; k < lenT; ++k){
                    $.pep.peps[obj.dragdrop.pep_objs()[k].pep_idx].toggle(false);
                    //console.log($.pep.peps[obj.dragdrop.pep_objs()[k].pep_idx].el.className);
                    var classnames = $.pep.peps[obj.dragdrop.pep_objs()[k].pep_idx].el.className;
                    var new_classnames = classnames.replace('link-cursor', '');
                    //console.log(new_classnames);
                    $.pep.peps[obj.dragdrop.pep_objs()[k].pep_idx].el.className = new_classnames;
                }
            }
        // }
    }
}


//Exercise level product functions
//obj = exercise
function product_clear_questions(obj, lab_id)
{
    obj.showing_answer(false);
    obj.checked_answer(false);
    obj.check_answer_count(0);

    if(obj.type() == "SPK")
    {
        obj.reset_spk();
    }

    if(product_helper_is_drag_drop_type(obj.type()))
    {
        clear_drag_drop_exercise(obj);
    }

    ko.utils.arrayForEach(obj.questions(), function (item) {
        item.clear();
        item.score(0);
    });

    if(obj.type() == "FLC")
    {
        obj.reset_flc();
    }

    if(obj.type() == "HNG")
    {
        for(var i = 0; i < obj.questions().length; ++i)
        {
            for(var k = 0; k < obj.questions()[i].letter_array().length; ++k)
            {
                obj.questions()[i].letter_array()[k].selected(0);
            }
            obj.questions()[i].hintcounter(3)
            obj.questions()[i].incorrect_count(0)
            obj.build_word(i,obj.questions()[i].word_to_guess(),false);
        }
    }

    if(obj.type() == "CWD")
    {
        obj.create_cwd_grid();
    }

    if(obj.type() == "WDS")
    {
        obj.clear_cell_bindings();
        obj.clicked_cell({"x":0, "y": 0});
        for(var i = 0, len = obj.wds_grid().length; i < len; ++i)
        {
            for(var k = 0, k_len = obj.wds_grid()[i].cols().length; k < k_len; ++k)
            {
                obj.wds_grid()[i].cols()[k].selected(false);
                obj.wds_grid()[i].cols()[k].correct(false);
            }
        }
    }
    if (obj.type() == "TTT")
    {
        for (var i = 0; i < obj.ttt_grid().length; ++i)
        {
            for (var l = 0; l <  obj.ttt_grid()[i].cols().length; ++l)
            {
                if (i == 1 && l == 1)
                    continue;
                obj.ttt_grid()[i].cols()[l].selected(0);
                obj.ttt_grid()[i].cols()[l].correct(0);
            }
        }
        obj.randomize_game();
    }

    if (obj.type() == "MCH")
    {
        for (var i = 0; i < obj.mch_grid().length; ++i)
        {
            for (var l = 0; l <  obj.mch_grid()[i].cols().length; ++l)
            {
                obj.mch_grid()[i].cols()[l].selected(0);
                obj.mch_grid()[i].cols()[l].correct(0);
            }
        }
        obj.randomize_game();
    }
    if(obj.type() == "GIW")
    {
        obj.clear_giw();
    }
    if (obj.type() == "CAS")
    {
        obj.clear_cas_exercise();
    }

    stop_all_audio();

}

//obj = exercise
function product_check_answers(obj)
{
    obj.check_answer(1);
    obj.check_answer_count(obj.check_answer_count()+1)
    obj.checked_answer(true);
    obj.historical_progress('');
    if(typeof obj.user_action !== 'undefined')
    {
        obj.user_action(1);
    }
}

//obj = exercise
function product_show_answers(obj, lab_id)
{
    obj.showing_answer(true);
    // if(obj.type() == 'WSB')
    // {
    //     show_drag_drop_answer(obj);
    // }
    if(product_helper_is_drag_drop_type(obj.type()))
    {
        // obj.dragdrop.final_answer_str = obj.dragdrop.get_progress_str(0, viewModel.labs()[0].selected_exercise());
        // //console.log(obj.dragdrop.final_answer_str);
        show_drag_drop_answer(obj);
    }

    ko.utils.arrayForEach(obj.questions(), function (item) {
       // if(obj.type() != 'WSB' && product_helper_is_drag_drop_type(obj.type()))
       //  {
       //      show_drag_drop_answer(obj);
       //  }
       //  else 
        if (obj.type() == "TYP" || obj.type() == "GIW")
        {
            item.show_answer(obj.type(), obj.id(), 0);
            //Initialize the bootstrap popover functionality
            obj.init_popover();
        }
        else if (obj.type() == "HNG")
        {
            for(var i = 0; i < obj.questions().length; ++i)
            {
                for (var w = 0; w < obj.questions()[i].letter_array().length; w++)
                {
                    if (obj.questions()[i].letter_array()[w].right() == 1)
                    {
                        obj.questions()[i].letter_array()[w].selected(1);
                        obj.build_word(i,obj.questions()[i].word_to_guess(),false);
                    }

                }
            }
        }
        else if (obj.type() == "CWD")
        {
            for(var i = 0; i < obj.questions().length; ++i)
            {
                var word,x,y,dir;
                for(var l = 0; l < obj.questions()[i].responses()[1]._data().length; ++l)
                {
                    if (obj.questions()[i].responses()[1]._data()[l].type() == "text")
                        word = obj.questions()[i].responses()[1]._data()[l].content();
                    if (obj.questions()[i].responses()[1]._data()[l].type() == "direction")
                        dir = obj.questions()[i].responses()[1]._data()[l].content();
                    if (obj.questions()[i].responses()[1]._data()[l].type() == "position_x")
                        x = obj.questions()[i].responses()[1]._data()[l].content();
                    if (obj.questions()[i].responses()[1]._data()[l].type() == "position_y")
                        y = obj.questions()[i].responses()[1]._data()[l].content();
                }

                for (var n = 0; n < word.length; ++ n)
                {
                    if (dir == 0)
                        obj.grid()[y+n].cols()[x].letter(word[n]);
                    else
                        obj.grid()[y].cols()[x+n].letter(word[n]);
                }
            }
            $(".cwd-typing").removeClass("cwd-typing");
        }
        else if (obj.type() == "WDS")
        {
            for (var i = 0; i < obj.grid_y(); ++i)
            {
                for (var l = 0; l <  obj.grid_x(); ++l)
                {
                    //Check to see if there is a question in the cell, and then highlight it
                    if (obj.wds_grid()[i].cols()[l].question().length > 0)
                        obj.wds_grid()[i].cols()[l].correct(true);
                }
            }
        }
        else if (obj.type() == "CAS")
        {
            obj.cas_show_answer();
        }
        else if (obj.type() == "MCH")
        {
            for (var i = 0; i < obj.mch_grid().length; ++i)
            {
                for (var l = 0; l <  obj.mch_grid()[i].cols().length; ++l)
                {
                    obj.mch_grid()[i].cols()[l].selected(true);
                }
            }
        }
        else if (obj.type() == "TTT"){
            obj.ttt_show_answer_clicked(true);
        }
        else
        {
            item.show_answer(obj.type(), obj.id(), 0);
        }
    });
}

function product_stimuli_model(obj)
{
    if(obj.type() == "audio" || obj.type() == "video")
    {
        obj.selected_audio_text = ko.observable(0);
        obj.player_pos = ko.observable();
        obj.player = undefined;
        obj.slideshow_image_position = ko.observable(0);
        obj.offset_top_scroll = ko.observable(0);

        obj.scroll_setter = function()
        {
            var selected_audio_text = $('.audio-text.selected');
            // var stim_section = $('.stimulus');
            var stim_section = $('.video_text_wrapper');
            var stim_section_selector = $('.stimulus-selector');

            for(var i = 0, i_len = selected_audio_text.length; i < i_len; ++i)
            {
                if(selected_audio_text[i].offsetParent != null)
                {
                    if (stim_section_selector[0] == undefined)
                        obj.offset_top_scroll((selected_audio_text[i].offsetTop + selected_audio_text[i].offsetHeight + 35)-stim_section[0].clientHeight);
                    else
                        obj.offset_top_scroll((selected_audio_text[i].offsetTop + selected_audio_text[i].offsetHeight + 35 + stim_section_selector[0].offsetHeight + stim_section_selector[0].offsetTop)-stim_section[0].clientHeight);

                }
            }
        };

        obj.maintain_image_data = ko.computed(function(){
            for (var i = 0, len = obj.contents().length; i < len; ++i) {
                if(obj.contents()[i].type() == 'slideshow' || obj.contents()[i].type() == 'video'){
                    if(!obj.contents()[i].value.images().length){
                        img_obj = {
                            "text": "",
                            "image": "",
                            "id": 0,
                            "time": "0"
                        }
                        obj.contents()[i].value.images.push(ko.mapping.fromJS(img_obj));
                    }
                    for (var j = 0, jen = obj.contents()[i].value.images().length; j < jen; ++j){
                        obj.contents()[i].value.images()[j].id(j)
                    }
                }
            }
        });

        //While polling could be done, it would require a lot of work
        //to ensure memory does not leak
        obj.delayed_show_progress = function(player, player_type, count) {
            //obj.show_progress(player)
            if(count<15){
                setTimeout(function() {
                    if(product_helper_check_media_players_visible(player)){
                        obj.show_progress(player);
                    }
                    else{
                        count = count + 1;
                        obj.delayed_show_progress(player, player_type, count);
                    }
                }, 100);
            }
        }

        obj.show_progress = function(player)
        {
            //console.log("Looking for id: " + player)
            var media = $(player);
            //console.log("Found media: ")
            //console.log(media)
            for (var l = 0; l < media.length; ++l){
                if(media[l].offsetParent !== null && typeof $('#'+media[l].id)[0].stop === 'undefined' && ('#'+media[l].id).indexOf('mep') == -1){
                    //console.log('init '+media[l]);
                    if(media[l].id.indexOf('audio')>-1){
                        //console.log("Making audio to be mediaelementplayer")
                        $('#'+media[l].id).mediaelementplayer({
                            audioWidth: '100%',
                            audioHeight: '100%',
                            loop: false,
                            startVolume: 0.8,
                            preLoad: true,
                            features: ['playpause', 'current', 'progress', 'volume'],
                            alwaysShowControls: true,
                            alwaysShowHours: false,
                            showTimecodeFrameCount: false,
                            pauseOtherPlayers: true,
                            pluginPath: '/static/framework/media-elements/',
                            flashName: 'flashmediaelement.swf',
                            enableKeyboard: false
                        });

                        if (detectMobileiOS()) {
                            document.getElementById(media[l].id).addEventListener('timeupdate', function() {
                                product_helper_av_text_events(obj, this);
                            });
                        }
                        else {
                            $(media[l]).bind('timeupdate', function() {
                                product_helper_av_text_events(obj, this);
                            });
                        }

                        //Called once the slide show has finished playing
                        $(media[l]).bind('ended', function() {
                            //Reset the selected text to the first paragraph
                            obj.selected_audio_text(0);
                            obj.scroll_setter();
                            $('.stimulus').animate({scrollTop: (obj.offset_top_scroll())+"px"});
                            stop_all_audio();
                        });
                    }

                    if(media[l].id.indexOf('video')>-1){
                        //console.log("Making video to be mediaelementplayer")
                        $('#'+media[l].id).mediaelementplayer({
                            audioWidth: '100%',
                            audioHeight: '100%',
                            loop: false,
                            startVolume: 0.8,
                            preLoad: true,
                            features: ['playpause', 'current', 'progress', 'volume', 'fullscreen'],
                            alwaysShowControls: true,
                            alwaysShowHours: false,
                            showTimecodeFrameCount: false,
                            pauseOtherPlayers: true,
                            pluginPath: '/static/framework/media-elements/',
                            flashName: 'flashmediaelement.swf',
                            enableKeyboard: false
                        });

                        //Called when the time is changed on a playing mediaplayer
                        $(media[l]).bind('timeupdate', function() {
                            product_helper_av_text_events(obj, this);
                        });

                        //Called once the slide show has finished playing
                        $(media[l]).bind('ended', function() {
                            //Reset the selected text to the first paragraph
                            obj.selected_audio_text(0);
                            obj.scroll_setter();
                            $('.stimulus').animate({scrollTop: (obj.offset_top_scroll())+"px"});
                            stop_all_audio();
                        });
                    }
                    //Loop through each content object to find the images of the slideshow
                    for (var i = 0; i < obj.contents().length; ++i){
                        //If images is not undefined, then we found them
                        if (typeof obj.contents()[i].value.images !== 'undefined')
                            obj.slideshow_image_position(i); //Set the index position of the images
                    }
                    //Pause any exercise audio when playing stimuli audio
                    $(media[l]).bind('play', function() {
                        stop_all_exercise_audio();
                    });
                }
                else{
                    if(media[l].id.indexOf('video')>-1 || media[l].id.indexOf('audio')>-1){
                        //not sure what this block of code is for
                        if (!$('#'+media[l].id)[0].paused){
                            stop_all_audio();
                            if(!detectMobileiOS()){
                                $('#'+media[l].id)[0].player.pause();
                            }
                            else{
                                $('#'+media[l].id)[0].pause();
                            }
                        }
                    }
                }
            }
            var fullscreen_btn = $('.mejs-fullscreen-button');

            for (var l = 0; l < fullscreen_btn.length; ++l){
                if(fullscreen_btn[l].offsetParent !== null){
                    viewModel.video_fullscreen_handler(fullscreen_btn[l]);
                }
            }
        };

        //Called when the user has clicked on text in the audio stimuli.
        obj.set_selected_audio_text = function(text_id,time,exercise_num) {
            //log(text_id);
            //Set the current text paragraph that is selected
            if(!detectMobileiOS()){
                obj.selected_audio_text(text_id);
                if ($('#audio_slideshow_0_'+exercise_num).length > 0){
                    //Set the time matched with the text and then start playing the audio
                    set_and_play('#audio_slideshow_0_'+exercise_num, time);
                }
                if ($('#video_scrolltext_0_'+exercise_num).length > 0){
                    //Set the time matched with the text and then start playing the audio
                    set_and_play('#video_scrolltext_0_'+exercise_num, time);
                }
            } else {
                alert("Text selection feature is unavailable for iPads or iPhones.")
            }
        };

        obj.current_image = ko.computed(function(){
            var id = 0;

            for ( var i = 0; i < obj.contents().length; ++i)
            {
                if(obj.contents()[i].type() == "slideshow")
                {
                    for ( var w = 1; w < obj.contents()[i].value.images().length; ++w)
                    {
                        if(obj.contents()[i].value.images()[w].time() < obj.player_pos())
                        {
                            id++;
                        }
                        else
                        {
                            break;
                        }
                    }
                }
            }
            return id;
        });
    }

    //Number of tool_tips on the stimuli
    obj.tip_count = ko.observable(-1);

    //Creates a tool tip for stimuli types that allow text functionality.
    //@content = The string content of the input box.
    //@exercise_id = The exercise ID.
    //@contents_id = The contents ID.
    //@value_id = The value ID. Only used for ol and ul types.
    obj.create_stimuli_tool_tip = function(content, exercise_id,contents_id,value_id)
    {
        ////console.log("i try to make a tool tip with stim id: " + exercise_id + " and contents id: " + contents_id+ " and value id: "+ value_id);
        //Get the starting index. If value_idx is undefined, don't add it to the name
        var start = $('#stimuli_input_' + exercise_id +'_'+contents_id+(value_id == -1 ? '' : "_"+value_id))[0].selectionStart;
        //Get the end of the selected word. If value_idx is undefined, don't add it to the name
        var end = $('#stimuli_input_' + exercise_id +'_'+contents_id+(value_id == -1 ? '' : "_"+value_id))[0].selectionEnd;

        viewModel.create_tip(content, start, end, true);
    }

    if(is_editable)
    {
        product_edit_stimuli_model(obj);
        edit_stimuli_model(obj);
    }
}

function product_stimuli_contents_model(obj)
{
    obj.type.subscribe(function(){
        if(obj.type() == 'slideshow' || obj.type() == 'picture'){
            obj.value = ko.mapping.fromJS({"audiosrc": "", "images": [], "coverimg": ""});
        }
        else if(obj.type() == 'video'){
            obj.value = ko.mapping.fromJS({"video_src": "", "images": []});
        }
        else if(obj.type() == 'ol' || obj.type() == 'ul'){
            obj.value = ko.observableArray([new value_model("")]);
        }
    });

    if(is_editable)
    {
        edit_stimuli_contents_model(obj);
    }
}

/*******************************/
/*Sena Question Models/Funtions*/
/*******************************/

function product_question_data_model(data){
    data.objective = ko.observable("");
    for(var d = 0, d_len = data().length; d<d_len; ++d){
        if(data()[d].type() == 'objective'){
            data.objective(data()[d].content());
        }
    }
}

function product_question_model(obj)
{
    product_question_data_model(obj._data)
    obj.selectbox_response = ko.observable();
    obj.playing_audio = ko.observable(false);
    obj.has_recorded = ko.observable(false);
    obj.recording = ko.observable(false);
    obj.playing_recording = ko.observable(false);
    obj.flash_fallback_data = ko.observable("");
    if(initialized){
        obj.scorm_info = {"id": ko.observable(""), "type": ko.observable(""), "objective": ko.observable(""), "description": ko.observable(""), "correct_ans": ko.observable(""), "user_ans": ko.observable(""), "result": ko.observable(""), "completed": ko.observable(""), "satisfied": ko.observable(""), "update" : ko.observable(false)};
    }

    /*
        Gets all of the TYP responses and formats them on to a single
        string. Will add a '/' to separate each response. Used when
        showing answer is called.
    */
    obj.TYP_get_answer = function()
    {
        var ret = "";

        //Loop through all the responses
        for(var i = 0, len = obj.responses().length; i < len; ++i)
        {
            for(var k = 0, lenK = obj.responses()[i]._data().length; k < lenK; ++k)
            {
                //If it's not empty (first word), then add a slash to separate the next word
                if (ret != "")
                    ret += " / \n";

                //Add on the response
                ret += obj.responses()[i]._data()[k].content();
            }
        }

        //Return the final string
        return ret;
    }

    obj.selectbox_response.subscribe(function(newValue){//RS : reevaluate
        if(typeof newValue === 'object'){ //passes an object when being interacted with during the exercise
            if(newValue.id() !== 0){
                obj.selected_response(newValue.id());;
            }
            //If the default option has no text, make sure to clear response when selected
            if (newValue._data()[0].content() == "" || newValue._data()[0].content() == "Select..."){
                obj.select_response(ko.observable(-1));
            }
        }
        else if (parseInt(newValue) > 0){ //used for progress restoring, only passes a string number (not an object)
            obj.selectbox_response(obj.responses()[parseInt(newValue)]);
        }
    });

    obj.maintain_responses_data = ko.computed(function(){
        if(obj.responses !== undefined){
            for (var i = 0, len = obj.responses().length; i < len; ++i){
                obj.responses()[i].id(i);
            }
        }
    });

    obj.get_template_columns = function(content_index) {
        var ret = 'col-md-12 col-sm-12 col-xs-12';
        if (typeof content_index === 'undefined')
            content_index = 0;
        if(obj._data()[0].contents()[content_index].type() == "image-md")
        {
            ret = 'col-md-8 col-sm-8 col-xs-8';
        }
        else if(obj._data()[0].contents()[content_index].type() == "image-sm")
        {
            ret = 'col-lg-3 col-md-4 col-sm-4 col-xs-5';
        }

        return ret;
    }
    obj.get_response_columns = function() {
        var col_width = 12/obj.responses().length;
        if (col_width < 3 && col_width > 2)
        {
            col_width = 3;
        }
        else if (col_width < 2)
        {
            col_width = 2;
        }
        var ret = 'col-md-'+col_width+' col-sm-'+col_width+' col-xs-'+col_width;
        return ret;
    }

    obj.get_question_columns = function(element) {
        var col_width = 12/element.questions().length;
        var ret = 'col-md-'+col_width+' col-sm-'+col_width+' col-xs-'+col_width;
        return ret;
    }

    if(is_editable)
    {
        product_edit_question_model(obj);
        edit_question_model(obj);
    }

    //specific for TYP: hence the identifier variable
    obj.check_entered_response = function(identifier){//RS : reevaluate
        var loop_counter = 0;//because there is not one in ko.utils.foreach...
        var correct = false;
        ko.utils.arrayForEach(obj.responses(), function (item) {
            if(typeof obj.entered_response() !== 'undefined' && obj.entered_response() != '')
            {
                entered_resp = obj.entered_response().replace(/\s*$/,"");

                if (typeof item._data !== 'undefined')
                {
                    resp = ko.utils.unwrapObservable(item._data()[0].content()).replace(/\s*$/,"");
                }
                else
                {
                    resp = ko.utils.unwrapObservable(item.text).replace(/\s*$/,"");
                }
                if(entered_resp.trim() == resp.trim())
                {
                    correct = true;
                    obj.selected_response(loop_counter);
                }
                else
                {
                    if(correct)
                    {
                        obj.responses()[0].selected(0);
                    }
                    else
                    {
                        if(loop_counter)
                        {
                            obj.responses()[loop_counter].selected(0);
                        }
                        obj.selected_response(-1);
                        obj.selected_response(0);
                    }
                }
                ++loop_counter;
            }
            else
            {
                obj.select_response(ko.observable(-1));
            }
        });
    };

    obj.entered_response.subscribe(function(value){
        var ex_type = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].type();
        if((ex_type == "TYP" || ex_type == "GIW") && value == ''){
            obj.select_response(ko.observable(-1));
        }
    })

    obj.check_rec_response = function()
    {
        obj.select_response((obj.responses().length > 1 ? ko.observable(1) : ko.observable(0)));

        var type = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].type();

        if (type == "GWR")
        {
            viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].enable_writing_button();
        }
    }
}

//Question level product functions
function product_show_answer(obj, type, ex_id, lab_id)
{
    if(type == "MFL")
    {
        ko.utils.arrayForEach(obj.responses(), function (item) {
            if(item.correct()){
                obj.selectbox_response(item);
            }
        });
    }
    else if (type == "MMM")
    {
        ko.utils.arrayForEach(obj.responses(), function (item) {
            if(item.correct()){
                item.selected(1);
            }
            else
            {
                item.selected(0);
            }
        });
    }
    else if (type == "TAB" || type == "ELS")
    {
        ko.utils.arrayForEach(obj.responses(), function (item) {
            if(item.correct()){
                item.selected(1);
            }
            else
            {
                item.selected(0);
            }
        });
    }
    else if (type == "TYP")
    {
        ko.utils.arrayForEach(obj.responses(), function (item) {
            if(item.correct()){
                if(typeof item._data() !== 'undefined')
                {
                    obj.entered_response(item._data()[0].content());
                }
                else
                    obj.entered_response(item.text());

                obj.check_entered_response('TYP');
            }
            else
            {
                item.selected(0);
            }
        });
    }
    else if (product_helper_is_drag_drop_type(type))
    {
        ko.utils.arrayForEach(obj.responses(), function (item) {
            if(item.correct()){
                obj.select_response(item.id); //this probably doesn't work?
                //show_drag_answer(ex_id,obj.id(),lab_id,type);
            }
            else
            {
                item.selected(0);
            }
        });
    }
    else
    {
        ko.utils.arrayForEach(obj.responses(), function (item) {
            if(item.correct()){
                obj.select_response(ko.observable(""+item.id()));
            }
        });
    }
}

function product_clear_question(obj)
{
    obj.selected_response(-1);
    ko.utils.arrayForEach(obj.responses(), function (item) {
        item.selected(0);
    });
    obj.selectbox_response(obj.responses()[0]);
    obj.entered_response("");
    obj.check_answer(0);
}

/*******************************/
/*Sena Response Models/Funtions*/
/*******************************/
function product_response_model(obj){
    obj.playing_audio = ko.observable(false);

    if(is_editable)
    {
        edit_response_model(obj);
    }

    obj.has_data = ko.computed(function () {
        var ret = false;

        if (obj._data)
        {
            ret = true;
        }

        return ret;
    });

    obj.get_template_columns = function(content_index) {
        var ret = 'col-md-12 col-sm-12 col-xs-12';

        if(obj._data()[content_index].type() == "image-md")
            ret = 'col-md-8 col-sm-8 col-xs-8';
        else if(obj._data()[content_index].type() == "image-sm")
            ret = 'col-lg-3 col-md-4 col-sm-4 col-xs-5';

        return ret
    }
}

/*******************************/
/*Sena Value Models/Funtions*/
/*******************************/
function product_value_model(obj){
    obj.set_value = ko.computed(function(){
        if((obj.content() || obj.content()== '') && obj.type()){
            var str = '{"type": "'+obj.type()+'", "content": "'+obj.content()+'"}';
            obj.value(str);
        }
    });

    if(is_editable)
    {
        edit_value_model(obj);
    }
}

/*******************************/
/*Sena Table Models/Funtions*/
/*******************************/
function product_table_model(obj){

    if(obj.cells().length == 0){
        cell = new value_model('');
        cell.type('text');
        cell.content('');
        obj.cells.push(cell);
    }
    if(obj.rows() == 0){
        obj.rows(1);
    }
    if(obj.columns() == 0){
        obj.columns(1);
    }

    obj.cols_array = ko.computed( function () {
        cols_array = [];
        for (var l = 0, len = obj.columns(); l < len; ++l){
            cols_array.push(l);
        }
        return cols_array;
    });


    obj.remove_row = function(i){
        for (var l = 0, len = obj.cols_array().length; l < len; ++l){
            obj.cells.remove(obj.cells()[i]);
        }
    }

    obj.add_row = function(){
        if(obj.rows() < 14){
            var rows = obj.rows();
            rows++;
            obj.rows(rows);

            for (var l = 0, len = obj.columns(); l < len; ++l){
                cell = new value_model('');
                cell.type('text');
                cell.content('');
                obj.cells.push(cell);
            }
        }
    }

    obj.remove_column = function(i){
        if(obj.columns() > 1){
            for (var l = 0, len = obj.cells().length; l <= len;){
                for (var c = 0, clen = obj.cols_array().length; c < clen; ++c){
                    if (c == i) {
                        obj.cells.remove(obj.cells()[l]);
                    }
                    else{
                        l++;
                    }
                }
            }
            var columns = obj.columns();
            columns--;
            obj.columns(columns);
        }

    }

    obj.add_column = function(){
        if(obj.columns() < 7){
            var adjust = 0;
            for (var l = 0, len = obj.cells().length; l <= len; ++l){
                if(l!=0 && l % obj.columns() == 0){
                    cell = new value_model('');
                    cell.type('text');
                    cell.content('');
                    obj.cells.splice(l+adjust, 0, cell);
                    adjust++;
                }
            }
            var columns = obj.columns();
            columns++;
            obj.columns(columns);
        }
    }

    obj.move_row_up = function(i){
        var cut = obj.cells.splice(i, obj.cols_array().length);
        for (var l = 0, len = obj.cols_array().length; l < len; ++l){
            obj.cells.splice(i - obj.cols_array().length + l, 0, cut[l]);
        }
    }

    obj.move_row_down = function(i){
        var cut = obj.cells.splice(i, obj.cols_array().length);
        for (var l = 0, len = obj.cols_array().length; l < len; ++l){
            obj.cells.splice(i + obj.cols_array().length + l, 0, cut[l]);
        }
    }
}
