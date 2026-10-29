/*
===========================Sena Exercise Helper Fucntions============================
*/

//This is sena_exercise_helper.js, it holds all the functions used to do specific actions for specific exercises
//It maps these functions to the appropriate exercise model
//obj is the exercise object

function product_helper_exercise_ttt(obj) //EXS
{
    obj.disable_solution_button(true);
    obj.disable_check_answer(true);
    //holds the current question being answered
    obj.current_question = ko.observable(0);
    //this is the grid, each cell contains the question number and cell cords
    obj.ttt_grid = ko.observableArray();
    obj.got_it_right = ko.observable(false);

    obj.ttt_show_answer_clicked = ko.observable(false);

    obj.set_up_grid = function()
    {
        //make the grid
        for (var i = 0, len = 3; i < len; ++i)
        {
            obj.ttt_grid.push({"cols": ko.observableArray()});
            for (var l = 0, l_len = 3; l < l_len; ++l)
            {
                if (i == 1 && l == 1)
                    obj.ttt_grid()[i].cols().push({"content" : ko.observable(" "), "type" : ko.observable("text") ,"question": ko.observable(9), "selected" : ko.observable(1), "correct": ko.observable(1),"x_cord": ko.observable(l),"y_cord": ko.observable(i)});
                else
                    obj.ttt_grid()[i].cols().push({"content" : ko.observable(), "type" : ko.observable() ,"question": ko.observable(), "selected" : ko.observable(0), "correct": ko.observable(0),"x_cord": ko.observable(l),"y_cord": ko.observable(i)});
            }
        }
    }
    //part of the randomizer, ensures that each cell is filled with a unique response/distractor
    obj.used_question_responses = ko.observableArray();

    obj.randomize_game = function()
    {
        obj.used_question_responses([]);
        for (var i = 0, len = obj.ttt_grid().length; i < len; ++i)
        {
            for (var l = 0, l_len = obj.ttt_grid()[i].cols().length; l < l_len; ++l)
            {
                if (i != 1 || l != 1)
                {
                    var randint;
                    while(true)
                    {
                        randint = Math.floor(Math.random()*(8));

                        if (obj.used_question_responses().indexOf(randint) == -1)
                        {
                            obj.used_question_responses.push(randint);
                            break;
                        }
                    }
                    if(randint <= obj.questions().length-1)
                    {
                        obj.ttt_grid()[i].cols()[l].question(randint);
                        obj.ttt_grid()[i].cols()[l].content(obj.questions()[randint].responses()[1]._data()[0].content());
                        obj.ttt_grid()[i].cols()[l].type(obj.questions()[randint].responses()[1]._data()[0].type());
                    }
                    else
                    {
                        for (var w = 0; w < obj._data().length; ++w)
                        {
                            if(obj._data()[w].type() == "options")
                            {
                                obj.ttt_grid()[i].cols()[l].question(randint);
                                obj.ttt_grid()[i].cols()[l].content(obj._data()[w].contents()[randint-(obj.questions().length)].content());
                                obj.ttt_grid()[i].cols()[l].type(obj._data()[w].contents()[randint-(obj.questions().length)].type());
                            }
                        }
                    }
                }
            }
        }
    }
    obj.TTT_restore = function()
    {
        for (var j = 0, len = 3; j < len; ++j)
        {
            for (var k = 0, k_len = 3; k < k_len; ++k)
            {
                if(obj.ttt_grid()[j].cols()[k].correct())
                {
                    var cell = obj.ttt_grid()[j].cols()[k];
                    //check columns
                    for(var i = 0; i < 3; i++)
                    {
                        if(obj.ttt_grid()[i].cols()[cell.x_cord()].correct()==0)
                        {
                            break;
                        }
                        if(i == 2)
                        {
                            obj.complete_exercise(true);
                        }
                    }
                    //check rows
                    for(var i = 0; i < 3; i++)
                    {
                        if(obj.ttt_grid()[cell.y_cord()].cols()[i].correct()==0)
                        {
                            break;
                        }
                        if(i == 2)
                        {
                            obj.complete_exercise(true);
                        }
                    }
                    //check diag
                    for(var i = 0; i < 3; i++)
                    {
                        if(obj.ttt_grid()[i].cols()[i].correct()==0)
                        {
                            break;
                        }
                        if(i == 2)
                        {
                            obj.complete_exercise(true);
                        }
                    }
                    //check anti diag
                    for(var i = 0; i < 3; i++)
                    {
                        if(obj.ttt_grid()[i].cols()[2-i].correct()==0)
                        {
                            break;
                        }
                        if(i == 2)
                        {
                            obj.complete_exercise(true);
                        }
                    }
                }
            }
        }
        if(!obj.got_it_right() && obj.cur_question() == -1)
        {
            for (var i = 0; i < obj.questions().length; ++i)
            {
                for (var k = 0, k_len = obj.questions()[i].responses().length; k<k_len; ++k)
                {
                    if(!obj.questions()[i].responses()[k].correct())
                    {
                        obj.questions()[i].responses()[k].selected(1);
                    }
                    else
                    {
                        obj.questions()[i].responses()[k].selected(0);
                    }
                }
            }
            product_check_answers(obj);
        }
        //viewModel.labs()[viewModel.selected_lab()].submit_button();
    }
    obj.check_click_match = function(cell)
    {
        //dont do anything if you click on a consumed cell or answer a consumed question
        if(obj.questions()[obj.current_question()].responses()[0].selected() || obj.questions()[obj.current_question()].responses()[1].selected() || cell.selected())
        {
            return
        }

        //logic for when they answer a question right
        if(cell.question() == obj.current_question())
        {
            cell.selected(1);
            cell.correct(1);
            for (var k = 0, k_len = obj.questions()[obj.current_question()].responses().length; k<k_len; ++k)
            {
                if(obj.questions()[obj.current_question()].responses()[k].correct())
                {
                    obj.questions()[obj.current_question()].responses()[k].selected(1);
                }
                else
                {
                    obj.questions()[obj.current_question()].responses()[k].selected(0);
                }
            }
            //check for win
            //check colums
            for(var i = 0; i < 3; i++)
            {
                if(obj.ttt_grid()[i].cols()[cell.x_cord()].correct()==0)
                {
                    break;
                }
                if(i == 2)
                {
                    obj.complete_exercise();
                }
            }
            //check rows
            for(var i = 0; i < 3; i++)
            {
                if(obj.ttt_grid()[cell.y_cord()].cols()[i].correct()==0)
                {
                    break;
                }
                if(i == 2)
                {
                    obj.complete_exercise();
                }
            }
            //check diag
            for(var i = 0; i < 3; i++)
            {
                if(obj.ttt_grid()[i].cols()[i].correct()==0)
                {
                    break;
                }
                if(i == 2)
                {
                    obj.complete_exercise();
                }
            }
            //check anti diag
            for(var i = 0; i < 3; i++)
            {
                if(obj.ttt_grid()[i].cols()[2-i].correct()==0)
                {
                    break;
                }
                if(i == 2)
                {
                    obj.complete_exercise();
                }
            }
            obj.change_question(1)
        }
        //logic for when answering a wrong question
        else if(cell.question() != obj.current_question())
        {
            cell.selected(1);
            for (var k = 0, k_len = obj.questions()[obj.current_question()].responses().length; k<k_len; ++k)
            {
                if(!obj.questions()[obj.current_question()].responses()[k].correct())
                {
                    obj.questions()[obj.current_question()].responses()[k].selected(1);
                }
                else
                {
                    obj.questions()[obj.current_question()].responses()[k].selected(0);
                }
            }
            obj.change_question(1)
        }
        if(obj.cur_question() == -1)
        {
            viewModel.labs()[viewModel.selected_lab()].submit_button();
        }
    }
    obj.complete_exercise = function(TTT_restoring_progress)
    {
        for (var i = 0; i < obj.questions().length; ++i)
        {
            for (var k = 0, k_len = obj.questions()[i].responses().length; k<k_len; ++k)
            {
                if(obj.questions()[i].responses()[k].correct())
                {
                    obj.questions()[i].responses()[k].selected(1);
                }
                else
                {
                    obj.questions()[i].responses()[k].selected(0);
                }
            }
        }
        obj.got_it_right(true);

        if(typeof TTT_restoring_progress !== 'undefined' && TTT_restoring_progress == true)
        {
            product_check_answers(obj);
        }
        else
        {
            viewModel.labs()[viewModel.selected_lab()].submit_button();
        }
    }

    //change the question they are currently answering
    obj.change_question = function(value)
    {
        if (value == 1)
        {
            if (obj.current_question() == (obj.questions().length-1))
                obj.current_question(0);
            else
                obj.current_question(obj.current_question()+1)
        }
        else
        {
            if (obj.current_question() == 0)
                obj.current_question(obj.questions().length-1);
            else
                obj.current_question(obj.current_question()-1)
        }
        viewModel.labs()[viewModel.selected_lab()].adjust_video_container();
    }

    //resets the game to let them try again
    obj.reset_ttt = function () {
        if(!obj.feedback_showing_answer())
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
            for (var i = 0; i < obj.questions().length; ++i)
            {
                obj.questions()[i].responses()[0].selected(0);
                obj.questions()[i].responses()[1].selected(0);
            }
            obj.randomize_game();
            obj.got_it_right(false);
        }
    }

    obj.set_up_grid();
    obj.randomize_game();

    //edditing functions from here on down
    obj.question_adder_remover = function(value,question_data)
    {
        //we will add a question and remove a distracter
        if (value == 1)
        {
            obj.add_question();
            for (var i = 0; i < obj._data().length; ++i)
            {
                if(obj._data()[i].type() == "options")
                {
                    obj._data()[i].contents.splice(obj._data()[i].contents().length-1,1);
                }
            }
        }
        //remove question, add distract
        if(value == 0)
        {
            obj.remove_question(question_data);
            for (var i = 0; i < obj._data().length; ++i)
            {
                if(obj._data()[i].type() == "options")
                {
                    obj._data()[i].contents.push({"type": ko.observable("text"), "content": ko.observable("")});
                }
            }
        }
    }

    //This function was created to make sure all the objectives are the same across an exercise but this happens in a subscribe now, so it isn't really needed
    obj.change_objectives = function(new_content)
    {
        for (var i = 0; i < obj.questions().length; ++i)
        {
            for (var k = 0, k_len = obj.questions()[i]._data().length; k<k_len; ++k)
            {
                if(obj.questions()[i]._data()[k].type() == "objective")
                {
                    obj.questions()[i]._data()[k].content(new_content)
                }
            }
        }
    }
}

function product_helper_exercise_kar(obj)
{
    for (var i = 0; i < obj.questions().length; ++i)
    {
        for (var k = 0, k_len = obj.questions()[i]._data().length; k<k_len; ++k)
        {
            //Check to make sure contents exists in the data array before trying to loop on it
            if (typeof obj.questions()[i]._data()[k].contents !== 'undefined')
            {
                for (var j = 0, j_len = obj.questions()[i]._data()[k].contents().length; j<j_len; ++j)
                {
                    if(obj.questions()[i]._data()[k].contents()[j].type() == "video" || obj.questions()[i]._data()[k].contents()[j].type() == "rec")
                    {
                        for (var r = 0, r_len = obj.questions()[i].responses().length; r<r_len; ++r)
                        {
                            if(obj.questions()[i].responses()[r].correct())
                            {
                                obj.questions()[i].responses()[r].selected(1);
                            }
                        }
                    }
                }
            }
        }
    }

    obj.complete_question = function(i)
    {
        // //log(i);
        for (var k = 0, k_len = obj.questions()[i].responses().length; k<k_len; ++k)
        {
            if(obj.questions()[i].responses()[k].correct())
            {
                obj.questions()[i].responses()[k].selected(1);
            }
            else
            {
                obj.questions()[i].responses()[k].selected(0);
            }
        }
    }
}

function product_helper_exercise_mch(obj) //EXS
{
    obj.mch_table_aspect = ko.observable();
    obj.used_question_responses = ko.observableArray();
    obj.click = ko.observable(0);
    obj.first_cell = ko.observable();
    obj.mch_grid = ko.observableArray();
    obj.grid_change = ko.observable(0);
    obj.cell_heights = ko.observable(0);
    obj.cell_width = ko.observable(0);
    obj.question_pairs = ko.observable(0);
    obj.mch_attempts = ko.observable(0);

    for (var w = 0, len = obj._data().length; w < len; ++w)
    {
        if(obj._data()[w].type() == "options")
        {
            var calc_height,calc_width;
            for (var g = 0, len = obj._data()[w].contents().length; g < len; ++g)
            {
                if(obj._data()[w].contents()[g].type() == "pairs")
                {
                    obj.question_pairs(obj._data()[w].contents()[g].content());
                }
                if(obj._data()[w].contents()[g].type() == "height")
                {
                    calc_height = obj._data()[w].contents()[g].content();
                }
                if(obj._data()[w].contents()[g].type() == "width")
                {
                    calc_width = obj._data()[w].contents()[g].content();
                }
            }
            obj.mch_table_aspect(calc_height/calc_width);
        }
    }

    obj.resize_cells = function()
    {
        var mch_cell;

        if($('#mch-cell-'+obj.id())[0].offsetParent !== null)
        {
            mch_cell = $('#mch-cell-'+obj.id())[0];
        }

        if (obj.mch_table_aspect() < 1)
        {
            obj.cell_heights((obj.mch_table_aspect()*mch_cell.clientWidth)+15);
        }
        else
        {
            obj.cell_heights((obj.mch_table_aspect()*mch_cell.clientWidth)-20);
        }
    }

    obj.cell_sizing = function(pairs)
    {
        if (obj.mch_table_aspect() < 1)
        {
            if(pairs == 2)
            {
                obj.cell_width(350);
            }
            else if(pairs == 3 || pairs == 6)
            {
                obj.cell_width(300);
            }
            else if(pairs == 8)
            {
                obj.cell_width(200);
            }
            obj.cell_heights((obj.mch_table_aspect()*obj.cell_width())+15);
        }
        else
        {
            if(pairs == 3 || pairs == 2)
            {
                obj.cell_width(200);
            }
            else if(pairs == 6)
            {
                obj.cell_width(150);
            }
            else if(pairs == 8)
            {
                obj.cell_width(100);
            }
            obj.cell_heights((obj.mch_table_aspect()*obj.cell_width())-20);
        }
    }


    obj.set_up_grid = function()
    {
        var grid_x,grid_y;

        if(obj.question_pairs() == 2)
        {
            grid_x = 2
            grid_y = 2
            obj.cell_sizing(obj.question_pairs())

        }
        else if(obj.question_pairs() == 3)
        {
            if (obj.mch_table_aspect() < 1)
            {
                grid_x = 2
                grid_y = 3
            }
            else
            {
                grid_x = 3
                grid_y = 2
            }

            obj.cell_sizing(obj.question_pairs())
        }
        else if(obj.question_pairs() == 6)
        {
            grid_x = 4
            grid_y = 3
            obj.cell_sizing(obj.question_pairs())
        }
        else if(obj.question_pairs() == 8)
        {
            grid_x = 4
            grid_y = 4
            obj.cell_sizing(obj.question_pairs())
        }

        for (var i = 0, len = grid_y; i < len; ++i)
        {
            obj.mch_grid.push({"cols": ko.observableArray()});
            for (var l = 0, l_len = grid_x; l < l_len; ++l)
            {
                obj.mch_grid()[i].cols().push({"content" : ko.observable(), "type" : ko.observable() ,"question": ko.observable(), "response": ko.observable(), "selected" : ko.observable(0), "correct": ko.observable(0)});
            }
        }
    }

    obj.randomize_game = function()
    {
        obj.used_question_responses([]);
        for (var i = 0, len = obj.mch_grid().length; i < len; ++i)
        {
            for (var l = 0, l_len = obj.mch_grid()[i].cols().length; l < l_len; ++l)
            {
                var quest_num,resp_num;
                while(true)
                {
                    var randint = Math.floor(Math.random()*(obj.question_pairs()*2));

                    if (obj.used_question_responses().indexOf(randint/2) == -1)
                    {
                        obj.used_question_responses.push(randint/2);
                        quest_num = Math.floor(randint/2);
                        resp_num = randint%2;
                        break;
                    }
                }
                obj.mch_grid()[i].cols()[l].question(quest_num);
                obj.mch_grid()[i].cols()[l].response(resp_num);
                obj.mch_grid()[i].cols()[l].content(obj.questions()[quest_num].responses()[resp_num]._data()[0].content());
                obj.mch_grid()[i].cols()[l].type(obj.questions()[quest_num].responses()[resp_num]._data()[0].type());
            }
        }
    }

    //on click this function will check if it was the first click or second,
    //then it will show that cell and check if you got a question right
    obj.check_click_match = function(cell)
    {
        if(cell.correct() == 1 || (cell.selected() && obj.click() == 1))
        {
            return;
        }

        if (obj.click() == 0 )
        {
            for (var i = 0, len = obj.mch_grid().length; i < len; ++i)
            {
                for (var l = 0, l_len = obj.mch_grid()[i].cols().length; l < l_len; ++l)
                {
                    if(obj.mch_grid()[i].cols()[l].correct() == 0)
                    {
                        obj.mch_grid()[i].cols()[l].selected(0);
                    }
                }
            }
            obj.first_cell(cell);
        }

        cell.selected(1);

        if (obj.click() == 1)
        {
            //if they got a much show it and mark it
            if(obj.first_cell().question() == cell.question())
            {
                obj.first_cell().correct(1);
                cell.correct(1);
                obj.questions()[cell.question()].responses()[1].selected(1);
            }

            //check to see if they won
            var breaker = 0;
            for (var i = 0, len = obj.mch_grid().length; i < len; ++i)
            {
                for (var l = 0, l_len = obj.mch_grid()[i].cols().length; l < l_len; ++l)
                {
                    if(obj.mch_grid()[i].cols()[l].correct() == 0)
                    {
                        breaker = 1;
                        break;
                    }
                }
                if(breaker == 1)
                {
                    break;
                }
            }
            if (breaker == 0)
            {
                viewModel.labs()[viewModel.selected_lab()].submit_button();
            }
        }


        if (obj.click() == 0)
            obj.click(1)
        else
            obj.click(0)
    }

    //adds or removes questions depending on the amount of pairs selected
    obj.change_questions = function(amount)
    {
        if (amount == obj.questions().length)
        {
            return;
        }
        else if (amount > obj.questions().length)
        {
            while (amount > obj.questions().length)
                obj.add_question();
            obj.grid_change(1);
        }
        else if(amount < obj.questions().length)
        {
            while (amount < obj.questions().length)
                obj.remove_question(obj.questions()[obj.questions().length-1]);
            obj.grid_change(1);
        }
    }

    obj.reset_mch = function()
    {
        if(obj.mch_attempts() <1)
        {
            obj.mch_attempts(1);
            for (var i = 0; i < obj.mch_grid().length; ++i)
            {
                for (var l = 0; l <  obj.mch_grid()[i].cols().length; ++l)
                {
                    obj.mch_grid()[i].cols()[l].selected(0);
                    obj.mch_grid()[i].cols()[l].correct(0);
                }
            }
            for (var i = 0; i < obj.questions().length; ++i)
            {
                obj.questions()[i].responses()[0].selected(0);
                obj.questions()[i].responses()[1].selected(0);
            }
            obj.randomize_game();
        }
    }

    obj.set_up_grid();
    obj.randomize_game();
}

function product_helper_exercise_gwr(obj) //EXS
{
    obj.disable_solution_button(1);
    obj.finished_writing_planner = ko.observable(0);

    obj.enable_writing_button = ko.computed( function(){
        for (var i = 1; i < obj.questions().length; ++i)
        {
            //Only check the response content if the question in not for recording
            if (product_helper_check_rec_question(obj.questions()[i]._data()) == false)
            {
                if(obj.questions()[i].responses()[1]._data()[0].content() == "" || obj.questions()[i].responses()[1]._data()[0].content() == " ")
                    return 0;
            }
            //Check to see if the current question is for recording
            if (product_helper_check_rec_question(obj.questions()[i]._data()))
            {
                //If the user has not used the recording, then don't enable the button
                if (obj.questions()[i].selected_response() == -1)
                    return 0;
            }
        }
        return 1;
    });

    obj.check_empty_content = ko.computed( function(){
        var empty_string = obj.questions()[0].responses()[1]._data()[0].content().replace(/\s/g,'');
        if (empty_string == " " || empty_string == ""){
            obj.questions()[0].responses()[1].selected(0);
            return false;
        }
        else{
            obj.questions()[0].responses()[1].selected(1);
            return true;
        }
    });

    obj.set_up_progress = function()
    {
        obj.finished_writing_planner(1);
        obj.set_string();
    }

    obj.set_up_final_writing = function()
    {
        obj.finished_writing_planner(1);
        //Clear the string before using it
        obj.questions()[0].responses()[1]._data()[0].content("");
        obj.set_string();
    }

    obj.set_string = function()
    {
        //Build the final string
        for (var i = 1; i < obj.questions().length; ++i)
        {
            if (obj.questions()[i].responses()[1]._data()[0].content() != "")
            {
                obj.questions()[0].responses()[1]._data()[0].content(obj.questions()[0].responses()[1]._data()[0].content()+ obj.questions()[i].responses()[1]._data()[0].content());
                if (i!=obj.questions().length-1){
                    obj.questions()[0].responses()[1]._data()[0].content(obj.questions()[0].responses()[1]._data()[0].content()+ '\n\n');
                }
            }
        }

        //Go through all the questions and set the correct response. Makes sure that the exercise is always set to correct.
        for (var i = 0; i < obj.questions().length; ++i)
        {
            for (var k = 0, k_len = obj.questions()[i].responses().length; k<k_len; ++k)
            {
                if(obj.questions()[i].responses()[k].correct())
                    obj.questions()[i].responses()[k].selected(1);
            }
        }
    }
}

function product_helper_exercise_ata(obj) //EXS
{
    obj.disable_solution_button(true);
    obj.disable_clear_button(true);

    for (var i = 0; i < obj.questions().length; ++i)
    {
        for (var k = 0, k_len = obj.questions()[i].responses().length; k<k_len; ++k)
        {
            if(obj.questions()[i].responses()[k].correct() && obj.questions()[i].responses()[k].selected())
            {
                obj.questions()[i].para_selector = ko.observable(1);
            }
            else
            {
                obj.questions()[i].para_selector = ko.observable(0);
            }
        }
    }

    obj.change_anotation = function(quest)
    {
        if (obj.questions()[quest].para_selector() == 0)
            obj.questions()[quest].para_selector(1);
        else
            obj.questions()[quest].para_selector(0);

        for (var k = 0, k_len = obj.questions()[quest].responses().length; k<k_len; ++k)
        {
            if(obj.questions()[quest].responses()[k].correct())
            {
                obj.questions()[quest].responses()[k].selected(1);
            }
        }
        var counter = 0;

        for (var i = 0; i < obj.questions().length; ++i)
        {
            for (var k = 0, k_len = obj.questions()[i].responses().length; k<k_len; ++k)
            {
                if(obj.questions()[i].responses()[k].correct() && obj.questions()[i].responses()[k].selected())
                {
                    counter++;
                    if (counter == obj.questions().length)
                    {
                        product_check_answers(obj);
                    }
                }
            }
        }
    }
}

function product_helper_exercise_wds(obj) //EXS
{
    //colors for disinguishing questions
    obj.colors = ["#F03C62","#147AFF","#63C709","#A832FA","#FA9121","#FEA8CF",];
    obj.board_colors = ["#CC002B","#0A4DA6","#50A107","#7900CC","#DA751D","#FE7EB7",];
    //a function that will return which colour to use
    obj.color_number = function(number)
    {
        // //log(number);
        while (number > 5){
            number = number - 6;
        }
        // //log(number);
        return number;
    }

    //this array keeps trak of what questions have been answered and in what order
    obj.answerd_questions = ko.observableArray();

    obj.cell_state_check = function(questions,cell)
    {
        var ret = 0;
        for (var i = 0, len = questions.length; i < len; ++i)
        {
            for (var w = 0, w_len = obj.questions().length; w < w_len; ++w)
            {
                if (obj.questions()[w].id() == questions[i].id())
                {
                    if (obj.questions()[w].state() >= 1)
                    {
                        ret = 1;
                    }
                }
            }
        }
        return ret;
    }

    //this function overlaps cells that have two or more questions on it with the most recently answerd question
    obj.questiond_id_finder = function(question)
    {
        // //log(question);
        var ret = null;
        var cell_question_ids = [];
        for (var l = 0, l_len = question.length; l < l_len; ++l)
        {
            //determines which questions are contained in a cell
            cell_question_ids.push(question[l].id());
        }
        for (var l = 0, l_len = question.length; l < l_len; ++l)
        {
            if(question[l].state() >= 1)
            {
                ret = question[l].id();

                //this if statment adds questions to the question tracking array
                if(obj.answerd_questions().indexOf(question[l].id())<0)
                {
                    obj.answerd_questions.push(question[l].id());
                }
                //this cluster of ifs and fors is what allows the grid to apply the colour of the most recently answerd question to a cell
                if (question.length>1 && cell_question_ids.indexOf(question[l].id())>-1)
                {
                    for (var k = 1, k_len = obj.answerd_questions().length+1; k < k_len; ++k)
                    {
                        //find the most recent answerd question for a cell
                        if (cell_question_ids.indexOf(obj.answerd_questions()[obj.answerd_questions().length-k])>-1)
                        {
                            ret = obj.answerd_questions()[obj.answerd_questions().length-k];
                            break;
                        }
                    }
                }
            }
            if(obj.showing_answer()){
                ret = question[l].id();
            }
        }
        cell_question_ids = [];
        return ret;
    }
    //Character array used to generate the word search grid
    var alphaArray = "abcdefghijklmnopqrstuvwxyz".split("");
    //The grid containing all the information needed for the word search
    obj.wds_grid = ko.observableArray();
    //Flag used to alert the user editing that they need to save to see the grid changes
    obj.grid_changed = ko.observable(false);

    //Creates and generates a new word search grid.
    //Will generate a new grid with all new values on first run and if being called another
    //time it will just generate only the values needed. It gets called again in the editing tool.
    obj.create_wds_grid = function()
    {
        for (var i = 0, len = obj._data().length; i < len; ++i)
        {
            //Get all the options that define the grid
            if (obj._data()[i].type() == "options")
            {
                for (var l = 0, l_len = obj._data()[i].contents().length; l < l_len; ++l)
                {
                    //Get the grid sizing
                    if (obj._data()[i].contents()[l].type() == "grid_x")
                        obj.grid_x = ko.observable(obj._data()[i].contents()[l].content());
                    if (obj._data()[i].contents()[l].type() == "grid_y")
                        obj.grid_y = ko.observable(obj._data()[i].contents()[l].content());
                }
            }
        }

        //Create an empty grid if it's the first time creating it.
        //Used so when the user is using the editing tool it doesn't create an empty grid every time.
        if (obj.wds_grid().length == 0)
        {
            for (var i = 0, len = obj.grid_y(); i < len; ++i)
            {
                obj.wds_grid.push({"cols": ko.observableArray()});
                for (var l = 0, l_len = obj.grid_x(); l < l_len; ++l)
                    obj.wds_grid()[i].cols().push({"letter": ko.observable(alphaArray[Math.floor(Math.random()*alphaArray.length)].toUpperCase()), "question": ko.observableArray(), "selected" : ko.observable(false), "correct": ko.observable(false)});
            }
        }
        else //The grid is being re-created through the editing tool. So it doesn't need all new values.
        {
            for (var i = 0, len = obj.wds_grid().length; i < len; ++i)
            {
                for (var l = 0, l_len = obj.wds_grid()[i].cols().length; l < l_len; ++l)
                {
                    //Reset all the questions and letter incase anything moved
                    obj.wds_grid()[i].cols()[l].question.removeAll();
                    obj.wds_grid()[i].cols()[l].letter(alphaArray[Math.floor(Math.random()*alphaArray.length)].toUpperCase());
                }
            }
        }

        //Find the responses and check where the words need to be
        for (var i = 0, i_len = obj.questions().length; i < i_len; ++i)
        {
            for (var l = 1, t_len = obj.questions()[i].responses().length; l < t_len; ++l)
            {
                if ( get_response_data(obj.questions()[i].responses()[l]._data(), "position_y") != -1)
                {
                    //Get all the current response information needed to put the word on the grid
                    var word = get_response_data(obj.questions()[i].responses()[l]._data(), "text").toUpperCase();
                    var dir = get_response_data(obj.questions()[i].responses()[l]._data(), "direction");
                    var reverse = get_response_data(obj.questions()[i].responses()[l]._data(), "reverse");

                    //Loop through each character in the word
                    for (var k = 0, l_len = word.length; k < l_len; ++k)
                    {
                        //The word is being displayed vertically
                        if (dir == 0)
                        {
                            //Error check to make sure the index is not out of bounds. Will go out of bounds in the editing tool if the word extends past the grid bounds
                            if (get_response_data(obj.questions()[i].responses()[l]._data(), "position_y") + k < obj.wds_grid().length)
                            {
                                //Put the question in grid cell so we know what question the cell is on
                                obj.wds_grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y") + k].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")].question.push(obj.questions()[i]);
                                if (get_response_data(obj.questions()[i].responses()[l]._data(), "position_y") + (reverse ? word.length - k : k) < obj.wds_grid().length)
                                {
                                    //Set the letter to the current word character
                                    obj.wds_grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y") + (reverse ? word.length - k - 1: k)].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")].letter(word[k]);
                                    //Make sure the last letter gets placed. (Was a problem with the letter not showing the in the last row)
                                    if (get_response_data(obj.questions()[i].responses()[l]._data(), "position_y") + (word.length - k) >= obj.wds_grid().length - 1)
                                    {
                                        if (typeof word[k - 1] !== "undefined")
                                            obj.wds_grid()[obj.wds_grid().length - 1].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")].letter(word[k - 1]);
                                    }
                                }
                            }
                        }
                        else //The word is being displayed horizontally
                        {
                            //Error check to make sure the index is not out of bounds. Will go out of bounds in the editing tool if the word extends past the grid bounds
                            if (get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")+k < obj.wds_grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y")].cols().length)
                            {
                                obj.wds_grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y")].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")+k].question.push(obj.questions()[i]);

                                if(get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")+(reverse ? (word.length - k - 1) : k) < obj.wds_grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y")].cols().length)
                                    obj.wds_grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y")].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")+(reverse ? (word.length - k - 1) : k)].letter(word[k]);
                            }
                        }
                    }
                }
            }
        }
    } //End of create_wds_grid

    //Holds the values of the cell that's been clicked on to compare to the next click
    obj.clicked_cell = ko.observable({"x":-1, "y": -1});

    //Clears all the mouse bindings.
    obj.clear_cell_bindings = function()
    {
        var table = $("#wds-table-"+obj.id()+" tbody");
        for (var i = 0; i < table[0].children.length; ++i)
        {
            for (var w = 0; w < table[0].children[i].children.length; ++w)
            {
                $(table[0].children[i].children[w]).unbind("mouseover");
                obj.wds_grid()[i].cols()[w].selected(false);
            }
        }
    }

    //Clears the mouse hover on either the rows or columns.
    //0 = rows
    //1 = columns
    obj.clear_selected = function(dir)
    {
        if (dir == 0)
        {
            for (var k = 0; k < obj.wds_grid()[obj.clicked_cell().y].cols().length; ++k)
                obj.wds_grid()[obj.clicked_cell().y].cols()[k].selected(false);
        }
        else
        {
            for (var k = 0; k < obj.wds_grid().length; ++k)
                obj.wds_grid()[k].cols()[obj.clicked_cell().x].selected(false);
        }
    }

    //Checks to see where the user has clicked on.
    //Will check to see if a correct word has been entirely selected.
    obj.click_cell = function(x,y)
    {
        if (obj.showing_answer()){return;}
        var found = true;
        var counter = 0;
        var table = $("#wds-table-"+obj.id()+" tbody");

        //Check for first click, set the first positions. Added because if the starting position was 0,00
        //it would select a word if it was placed at 0,0.
        // -- bug_006_WDS_vertical_words
        if (obj.clicked_cell().x == -1)
        {
            //Set the values to the clicked cell
            obj.clicked_cell().y = y;
            obj.clicked_cell().x = x;
        }

        //Function that binds the mouesover event to the proper cells according to a mouse click.
        //Binds the event to the proper row and column making sure that only those cells will get
        //the selected class applied to it on mouse over.
        function bind_cells()
        {
            //Loop through each row on the table
            for (var i = 0; i < table[0].children.length; ++i)
            {
                //Loop through each column on the row
                for (var w = 0; w < table[0].children[i].children.length; ++w)
                {
                    //Set a mouse over binding on each <td> on the current row
                    $(table[0].children[y].children[w]).bind("mouseover", function(e)
                    {
                        obj.clear_selected(1);
                        //Mouse moving right of the selected cell
                        for (var q = obj.clicked_cell().x; q < obj.grid_x(); ++q)
                        {
                            if (q <= $(this).index())
                                obj.wds_grid()[obj.clicked_cell().y].cols()[q].selected(true);
                            else
                                obj.wds_grid()[obj.clicked_cell().y].cols()[q].selected(false);
                        }
                        //Mouse moving left of the selected cell
                        for (var q = 0; q <= obj.clicked_cell().x; ++q)
                        {
                            if (q >= $(this).index())
                                obj.wds_grid()[obj.clicked_cell().y].cols()[q].selected(true);
                            else
                                obj.wds_grid()[obj.clicked_cell().y].cols()[q].selected(false);
                        }
                        //Make sure the initial cell doesn't lose it's selected class
                        obj.wds_grid()[obj.clicked_cell().y].cols()[obj.clicked_cell().x].selected(true);
                    });
                    //Set a mouse over binding on each <td> on the current column
                    $(table[0].children[i].children[x]).bind("mouseover", function(e)
                    {
                        obj.clear_selected(0);
                        //Mouse moving down from the selected cell
                        for (var q = obj.clicked_cell().y ; q < obj.grid_y(); ++q)
                        {
                            if (q <= $(this).parent().index())
                                obj.wds_grid()[q].cols()[obj.clicked_cell().x].selected(true);
                            else
                                obj.wds_grid()[q].cols()[obj.clicked_cell().x].selected(false);
                        }
                        //Mouse moving up from the selected cell
                        for (var q = 0; q <= obj.clicked_cell().y; ++q)
                        {
                            if (q >= $(this).parent().index())
                                obj.wds_grid()[q].cols()[obj.clicked_cell().x].selected(true);
                            else
                                obj.wds_grid()[q].cols()[obj.clicked_cell().x].selected(false);
                        }
                        //Make sure the initial cell doesn't lose it's selected class
                        obj.wds_grid()[obj.clicked_cell().y].cols()[obj.clicked_cell().x].selected(true);
                    });
                }
            }
        }

        //A new click
        if (obj.clicked_cell().x != x && obj.clicked_cell().y != y)
        {
            //Clear all previous bindings
            obj.clear_cell_bindings();
            //Un-select the last cell that was clicked on
            obj.wds_grid()[ obj.clicked_cell().y].cols()[ obj.clicked_cell().x].selected(false);
            //Select the current cell that was clicked on
            obj.wds_grid()[y].cols()[x].selected(true);
            obj.clicked_cell().x = x;
            obj.clicked_cell().y = y;

            bind_cells();
        }
        else
        {
            bind_cells();
            //Horizontal line check
            if(obj.clicked_cell().y == y)
            {
                //Check the direction the user clicked in
                if (x > obj.clicked_cell().x)
                {
                    for(var i = obj.clicked_cell().x; i <= x; ++i)
                    {
                        obj.wds_grid()[y].cols()[i].selected(true);
                        counter +=1;
                    }
                }
                else
                {
                    for(var i = x; i <= obj.clicked_cell().x; ++i)
                    {
                        obj.wds_grid()[y].cols()[i].selected(true);
                        counter +=1;
                    }
                }
            }
            //Vertical line check
            else if(obj.clicked_cell().x == x)
            {
                if (y > obj.clicked_cell().y)
                {
                    //Check the direction the user clicked in
                    for(var i = obj.clicked_cell().y; i <= y; ++i)
                    {
                        obj.wds_grid()[i].cols()[x].selected(true);
                        counter += 1;
                    }
                }
                else
                {
                    //Check the direction the user clicked in
                    for(var i = y; i <= obj.clicked_cell().y; ++i)
                    {
                        obj.wds_grid()[i].cols()[x].selected(true);
                        counter += 1;
                    }
                }
            }

            for (var i = 0; i < obj.questions().length; ++i)
            {
                for (var l = 1; l < obj.questions()[i].responses().length; ++l)
                {
                    found = true;

                    var word = get_response_data(obj.questions()[i].responses()[l]._data(), "text");
                    var dir = get_response_data(obj.questions()[i].responses()[l]._data(), "direction");

                    for (var k = 0, l_len = word.length; k < l_len; ++k)
                    {
                        //0 = vertical, 1 = horizontal
                        if (dir == 0)
                        {
                            if (!obj.wds_grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y") + k].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")].selected())
                                found = false;
                        }
                        else
                        {
                            if (!obj.wds_grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y")].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x") + k].selected())
                                found = false;
                        }
                    }

                    if (found && counter == word.length)
                    {
                        for (var k = 0, l_len = word.length; k < l_len; ++k)
                        {
                            //0 = vertical, 1 = horizontal
                            if (dir == 0)
                                obj.wds_grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y") + k].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")].correct(true);
                            else
                                obj.wds_grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y")].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")+k].correct(true);

                        }
                        obj.questions()[i].select_response(ko.observable(1));
                        obj.clear_cell_bindings();
                    }
                }
            }

            for (var q = 0, len = obj.wds_grid().length; q < len; ++q)
            {
                for (var w = 0, l_len = obj.wds_grid()[q].cols().length; w < l_len; ++w)
                    obj.wds_grid()[q].cols()[w].selected(false);
            }
            obj.wds_grid()[y].cols()[x].selected(true);
            obj.clicked_cell().x = x;
            obj.clicked_cell().y = y;
        }
    }

    obj.set_word_position = function(_data, attrib_name, new_value, x_val) //EXS
    {
        var word;
        var error = false;
        var dir;

        for (var q = 0, q_len = _data.length; q < q_len; ++q)
        {
            //Get the word, so we know the length
            if (_data[q].type() == "text")
                word = _data[q].content();
            //Get the direction the word is placed in
            if (_data[q].type() == "direction")
                dir = _data[q].content();
        }

        if (attrib_name == "position_y")
        {
            //Check the direction of the word and then check to make sure it isn't going out of bounds
            if (dir == 0)
            {
                if (new_value + word.length > obj.wds_grid().length)
                    error = true;
            }
            else
            {
                if (x_val + word.length > obj.wds_grid()[0].cols().length)
                    error = true;
            }
        }

        //If the word is not out of bounds, then set the new location
        if (error == false)
        {
            for (var q = 0, q_len = _data.length; q < q_len; ++q)
            {
                if (_data[q].type() == attrib_name)
                    _data[q].content(new_value);
                if (_data[q].type() == "position_x")
                    _data[q].content(x_val);
            }
            //Recreate the grid with the new positions
            obj.create_wds_grid();
        }
    };

    obj.create_wds_grid();
}

function product_helper_exercise_wsb(obj)
{
    obj.set_up_game = function()
    {
        for (var quest = 0, q_len = obj.questions().length; quest < q_len; ++quest)
        {
            var response_string = "";
            var is_a_sentance = 0;
            obj.questions()[quest].is_a_sentance = ko.observable(false);
            //check to see if any of the resopnses have a length greater than 1
            //this means that the response is a word and therefor the question is a sentance
            for (var k = 1, k_len = obj.questions()[quest].responses().length; k<k_len; ++k)
            {
                if (obj.questions()[quest].responses()[k]._data()[0].content().length > 1)
                {
                    is_a_sentance = 1;
                    obj.questions()[quest].is_a_sentance(true);
                }
            }

            //build a string from the responses that will be seen in the editer
            if (is_a_sentance)
            {
                for (var k = 1, k_len = obj.questions()[quest].responses().length; k<k_len; ++k)
                {
                    response_string += obj.questions()[quest].responses()[k]._data()[0].content();
                    response_string += ' ';
                }
            }
            else if (!is_a_sentance)
            {
                for (var k = 1, k_len = obj.questions()[quest].responses().length; k<k_len; ++k)
                {
                    response_string += obj.questions()[quest].responses()[k]._data()[0].content();
                }
            }
            obj.questions()[quest].responses()[0]._data()[0].content(response_string.replace(/^\s+|\s+$/gm,'')); //word
        }
    }

    obj.reset_response_wsb = function(quest)
    {
        var ans, is_a_sentance;
        var flag = 0;

        //is there a space in the response txt box?
        //if yes then that means its a sentance, therefor we will flag it and make an array out of the whole words splitting on spaces
        if (obj.questions()[quest].responses()[0]._data()[0].content().indexOf(" ") > -1) //word
        {
            is_a_sentance = 1;
            ans = obj.questions()[quest].responses()[0]._data()[0].content().split(" "); //word
        }
        //if no then that means its a word, therefor we will not flag it and make an array out of the word splitting the letters
        else
        {
            is_a_sentance = 0;
            ans = obj.questions()[quest].responses()[0]._data()[0].content().split(""); //word
        }

        //now, we need to clear all the responses out of the question and add the new letters/words as the new responses
        obj.questions()[quest].responses().splice(1,obj.questions()[quest].responses().length);

        var response_obj;

        //now add all the words/letters to the response array
        for (var k = 0, k_len = ans.length; k < k_len; ++k)
        {
            //if for some reson the CE left a space after a word it wont be added to the responses
            if (ans[k] == "")
                continue;
            //Reset the response_obj to the previous response object
            response_obj = JSON.parse(ko.mapping.toJSON(obj.questions()[quest].responses()[obj.questions()[quest].responses().length-1]));

            //Add the word/letter
            response_obj.selected = 0;
            response_obj.id = k+1;
            response_obj.correct = 1;
            response_obj._data = [{
                    "type": "text",
                    "content" : ans[k]
            }];

            //Push the new response to the response array.
            obj.questions()[quest].responses.push(new response_model(response_obj));
        }
    }

    obj.clear_WSB_question = function(quest)
    {
        for (var i = 0; i< obj.dragdrop.pep_objs().length; ++i)
        {
            if(obj.dragdrop.pep_objs()[i].drop_region().hasClass("WSB-droper_"+quest))
            {
                var tmp_item = $.pep.peps[obj.dragdrop.pep_objs()[i].pep_idx].$el.detach();
                ////log(tmp_item);

                obj.dragdrop.pep_objs()[i].dropped(false);
                obj.dragdrop.pep_objs()[i].pep().removeClass('dropped');

                obj.dragdrop.pep_objs()[i].drop_region(obj.dragdrop.pep_objs()[i].previous_drop_region());
                ////log($(obj.dragdrop.pep_objs()[i].previous_drop_region()));
                $(obj.dragdrop.pep_objs()[i].previous_drop_region()).append(tmp_item);
                obj.dragdrop.adjust_drag_item_positions();
            }
        }
        obj.questions()[quest].select_response(ko.observable(-1));
    }
    obj.set_up_game();
}

function product_helper_exercise_hng(obj)
{
    var alphaArray = "abcdefghijklmnopqrstuvwxyz";
    obj.hint_enabled = ko.observable(true); //State of hint button

    obj.set_up_game = function()
    {
        for (var i = 0, q_len = obj.questions().length; i < q_len; ++i)
        {
            obj.questions()[i].error_images = ko.observableArray()
            for (var r = 0, r_len = obj.questions()[i].responses().length; r < r_len; ++r)
            {
                if(obj.questions()[i].responses()[r].correct())
                {
                    for (var d = 0, d_len = obj.questions()[i].responses()[r]._data().length; d < d_len; ++d)
                    {
                        if(obj.questions()[i].responses()[r]._data()[d].type() == "text")
                        {
                            obj.questions()[i].word = ko.observable(obj.questions()[i].responses()[r]._data()[d].content().toLowerCase());
                            obj.questions()[i].word_to_guess = ko.observable(obj.questions()[i].responses()[r]._data()[d].content().toLowerCase());
                            obj.questions()[i].display_word = ko.observable();
                        }
                        else if(obj.questions()[i].responses()[r]._data()[d].type() == "hng_default_settings")
                        {
                            obj.questions()[i].hng_default_settings = ko.observable(obj.questions()[i].responses()[r]._data()[d].content());
                        }
                        else if(obj.questions()[i].responses()[r]._data()[d].type() == "max_hints")
                        {
                            obj.questions()[i].hintcounter = ko.observable(obj.questions()[i].responses()[r]._data()[d].content());
                        }
                        else if(obj.questions()[i].responses()[r]._data()[d].type() == "max_mistakes")
                        {
                            obj.questions()[i].max_mistakes = ko.observable(obj.questions()[i].responses()[r]._data()[d].content());
                        }
                        else if(obj.questions()[i].responses()[r]._data()[d].type() == "error_array")
                        {
                            obj.questions()[i].error_images(obj.questions()[i].responses()[r]._data()[d].content());
                        }
                    }
                }
            }
            obj.questions()[i].letter_array = ko.observableArray();

            // sets the hint counter to hint amount entered, defaulted to 3
            obj.questions()[i].incorrect_count = ko.observable(0);

            for (var k = 0; k < alphaArray.length; k++)
            {
                obj.questions()[i].letter_array.push({"letter": ko.observable(alphaArray[k]), "selected": ko.observable(0), "right": ko.observable(obj.is_the_letter_there(alphaArray[k],i,obj.questions()[i].word_to_guess()))});
            }
            obj.build_word(i,obj.questions()[i].word_to_guess(),false);
        }
    }

    obj.is_the_letter_there = function(let,quest,realWord)
    //checks if a letter from the letter_array is in the word that is being guessed, returns 1 for true.
    //this also counts how many correct letters are in the word
    {
        if(realWord.indexOf(let) != -1)
        {
            return 1;
        } else
        {
            return 0;
        }
    }

    obj.build_word = function(quest,word_to_guess,rebuild)
    //builds the word to show on screen
    {
        word_to_guess = word_to_guess.toLowerCase();
        if (rebuild)
        {
            obj.questions()[quest].word_to_guess(word_to_guess.toLowerCase());
            for (var k = 0; k < alphaArray.length; k++)
            {
                obj.questions()[quest].letter_array()[k].selected(0);
                obj.questions()[quest].letter_array()[k].right(obj.is_the_letter_there(alphaArray[k],quest,word_to_guess))
            }
        }
        var guessed_word = ""
        var displayed_word = ""
        for (var k = 0, word_len = word_to_guess.length; k< word_len; k++)
        {
            if (word_to_guess.charAt(k) == " ")
            {
                displayed_word += '<span class="HNG-letter-space"> </span>';
                continue;
            }
            for (var w = 0, w_len =obj.questions()[quest].letter_array().length; w < w_len; w++)
            {
                // selected and right
                if (obj.questions()[quest].letter_array()[w].letter() == word_to_guess.charAt(k) && obj.questions()[quest].letter_array()[w].selected() == 1 && obj.questions()[quest].letter_array()[w].right() ==1)
                {
                    displayed_word += '<span class="HNG-letter">' + word_to_guess.charAt(k) + '</span>';
                    guessed_word += word_to_guess.charAt(k);
                }

                // not selected and right
                else if (obj.questions()[quest].letter_array()[w].letter() == word_to_guess.charAt(k) && obj.questions()[quest].letter_array()[w].selected() == 0 && obj.questions()[quest].letter_array()[w].right() ==1)
                {
                    displayed_word += '<span class="HNG-letter HNG-letter-blank"></span>'
                }
            }
        }
        obj.questions()[quest].display_word(displayed_word);
        obj.questions()[quest].word(guessed_word);
    }


    //@let: letter index
    //@quest: question id (always 0)
    //@is_progress_restore: true if called from progress restore, else false
    obj.guessing_letter = function(let,quest, is_progress_restore)
    {
        if (obj.questions()[quest].state() != 2 && obj.questions()[quest].state() != 4 && obj.questions()[quest].word() != obj.questions()[quest].word_to_guess())
        {
            obj.questions()[quest].letter_array()[let].selected(1);

            if (obj.questions()[quest].letter_array()[let].right() == 1) // clicked letter is part of actual word
            {
                obj.build_word(quest,obj.questions()[quest].word_to_guess(),false); // updates the displayed letters

                if (obj.questions()[quest].word().replace(/&nbsp+/g, '') == obj.questions()[quest].word_to_guess().toLowerCase().replace(/\s+/g, '')) // checks if the word is done
                {
                    for (var r = 0, r_len = obj.questions()[quest].responses().length; r < r_len; ++r)
                    {
                        if(obj.questions()[quest].responses()[r].correct())
                        {
                            obj.questions()[quest].responses()[r].selected(1); // marks the question correct
                        }
                        else
                        {
                            obj.questions()[quest].responses()[r].selected(0);
                        }
                    }
                    product_check_answers(obj);

                    if (!is_progress_restore){
                        obj.hint_enabled(false);
                        $('#feedback-modal').modal('show');
                    }
                }
            }
            else
            {
                obj.questions()[quest].incorrect_count(obj.questions()[quest].incorrect_count()+1);

                if (obj.questions()[quest].incorrect_count() >= obj.questions()[quest].max_mistakes())
                {
                    for (var r = 0, r_len = obj.questions()[quest].responses().length; r < r_len; ++r)
                    {
                        if(obj.questions()[quest].responses()[r].correct()) // marks the question incorrect
                        {
                            obj.questions()[quest].responses()[r].selected(0);
                        }
                        else
                        {
                            obj.questions()[quest].responses()[r].selected(1);
                        }
                    }
                    product_check_answers(obj);

                    if (!is_progress_restore){
                        obj.hint_enabled(false);
                        $('#feedback-modal').modal('show');
                    }
                }
            }
        }
        else
        {
            obj.hint_enabled(false);
        }
    }

    obj.hintname = function(quest)
    {
        return localize_json.hint + ": " + obj.questions()[quest].hintcounter();
    }

    obj.hint = function(quest)
    {

        if (obj.questions()[quest].word().replace(/&nbsp+/g, '') != obj.questions()[quest].word_to_guess().toLowerCase().replace(/\s+/g, ''))
        {
            obj.questions()[quest].hintcounter(obj.questions()[quest].hintcounter()-1);
            var flag = 0;

            while(true)
            {

                var realWord = obj.questions()[quest].word_to_guess().toLowerCase();
                var randint = Math.floor(Math.random()*(realWord.length));
                var wordchar = realWord.charAt(randint);

                for(var i = 0, i_len = obj.questions()[quest].letter_array().length; i< i_len; i++)
                {

                    if (wordchar == obj.questions()[quest].letter_array()[i].letter())
                    {
                        if (obj.questions()[quest].letter_array()[i].selected()==1)
                        {
                            break;
                        }
                        else
                        {
                            obj.guessing_letter(i,quest, false);
                            flag = 1;
                        }
                    }
                }
                if (flag ==1)
                {
                    break
                }
            }
        }
    }
    obj.set_up_game();
}

function get_response_data(_data, attrib_name) //EXS
{
    for (var q = 0, q_len = _data.length; q < q_len; ++q)
    {
        if (_data[q].type() == attrib_name)
            return _data[q].content();
    }

    return "";
}

function set_word_position(_data, attrib_name, new_value) //EXS
{
    for (var q = 0, q_len = _data.length; q < q_len; ++q)
    {
        if (_data[q].type() == attrib_name)
            _data[q].content(new_value);
    }
}

function product_helper_exercise_cwd(obj) //EXS
{
    //Flag for when to show the input box
    obj.word_attempt = ko.observable(false);
    obj.grid_changed = ko.observable(false);

    obj.grid = ko.observableArray();
    obj.crossword_grid_x = ko.observable(0);
    obj.crossword_grid_y = ko.observable(0);

    obj.edit_cwd_grid = ko.observable(false);

    for(var i=0; i<obj.questions().length; ++i){
        obj.questions()[i].cwd_entered_response = ko.observable(""); //observable to store the current entered response
    }

    obj.create_cwd_grid = function()
    {
        for (var i = 0, len = obj._data().length; i < len; ++i)
        {
            //Find the size of the grid
            if (obj._data()[i].type() == "options")
            {
                for (var l = 0, t_len = obj._data()[i].contents().length; l < t_len; ++l)
                {
                    if (obj._data()[i].contents()[l].type() == "grid_x")
                        (obj._data()[i].contents()[l].content() <= 20) ? obj.crossword_grid_x(obj._data()[i].contents()[l].content()) : obj.crossword_grid_x(20);
                    if (obj._data()[i].contents()[l].type() == "grid_y")
                        (obj._data()[i].contents()[l].content() <= 20) ? obj.crossword_grid_y(obj._data()[i].contents()[l].content()) : obj.crossword_grid_y(20);
                }
            }
        }

        //Create an empty grid if it's the first time creating it.
        //Used so when the user is using the editing tool it doesn't create an empty grid every time.
        if (obj.grid().length == 0)
        {
            for (var i = 0, len = obj.crossword_grid_y(); i < len; ++i)
            {
                obj.grid().push({"cols": ko.observableArray()});
                for (var l = 0, t_len = obj.crossword_grid_x(); l <  t_len; ++l) {
                    obj.grid()[i].cols().push({"letter": ko.observable(""), "question": ko.observableArray(), "typing": ko.observable(false), "position": ko.observable({"first":ko.observable(false), "index":ko.observable(0), "label":ko.observable(false)})
                    });
                }
            }
        }
        else //Grid is being re-created through the editing tool, doesn't need all new empty values
        {
            for (var i = 0; i < obj.grid().length; ++i)
                for (var l = 0; l < obj.grid()[i].cols().length; ++l)
                {
                    obj.grid()[i].cols()[l].question.removeAll();
                    obj.grid()[i].cols()[l].letter("");
                    obj.grid()[i].cols()[l].position().first(false);
                    obj.grid()[i].cols()[l].position().index(0);
                }
        }

        //Find the responses and check where the words need to be
        for (var i = 0, len = obj.questions().length; i < len; ++i)
        {
            for (var l = 1, t_len = obj.questions()[i].responses().length; l < t_len; ++l)
            {
                if (get_response_data(obj.questions()[i].responses()[l]._data(), "position_y") != -1)
                {
                    //Set the grid position to a number that's not -1 to show there is a letter there
                    obj.grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y")].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")].question.push(obj.questions()[i]);

                    var dir = get_response_data(obj.questions()[i].responses()[l]._data(), "direction");
                    var word = get_response_data(obj.questions()[i].responses()[l]._data(), "text");

                    if (dir == 0) {// sets the word numberings on the grid
                        obj.grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y") - 1].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")].letter(i+1);
                        obj.grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y") - 1].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")].position().label(true);
                    } else {
                        obj.grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y")].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x") - 1].letter(i+1);
                        obj.grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y")].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x") - 1].position().label(true);

                    }
                    //Show that this is the first letter in the word
                    obj.grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y")].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")].position({"first": ko.observable(true), "index": ko.observable(obj.grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y")].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")].question().length - 1), "label" : ko.observable(false) });

                    for (var k = 1, l_len = word.length; k < l_len; ++k)
                    {
                        //0 = vertical, 1 = horizontal
                        if (dir == 0)
                        {
                            //Error check to make sure the index exists before trying to put a question into it
                            if (get_response_data(obj.questions()[i].responses()[l]._data(), "position_y") + k < obj.grid().length)
                                obj.grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y") + k].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")].question.push(obj.questions()[i]);
                        }
                        else
                        {
                            if (get_response_data(obj.questions()[i].responses()[l]._data(), "position_x") + k <  obj.grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y")].cols().length)
                                obj.grid()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_y")].cols()[get_response_data(obj.questions()[i].responses()[l]._data(), "position_x")+k].question.push(obj.questions()[i]);
                        }
                    }
                }
            }
        }
    }

    obj.new_attempted_word = ko.observable({"word": ko.observable(""), "question": ko.observable(),"questions": ko.observableArray(), "x": ko.observable(), "y":ko.observable(), "id": ko.observable(-1)  });
    obj.hover_id = ko.observable({"id": ko.observable(-1), "x": ko.observable(-1), "y": ko.observable(-1) });

    var counter = 0;
    var start_location = -1;

    obj.input_blur = function()
    {
        $(".cwd-typing").removeClass("cwd-typing");
    }

    obj.type_letter = function(val)
    {
        if(!obj.showing_answer() && obj.state() != 4)
        {
            //Clicked on a question from the side
            if (val != -1)
            {
                obj.new_attempted_word().question(obj.questions()[val]);
                obj.new_attempted_word().x(get_response_data(obj.questions()[obj.new_attempted_word().question().id()].responses()[1]._data(), "position_x"));
                obj.new_attempted_word().y(get_response_data(obj.questions()[obj.new_attempted_word().question().id()].responses()[1]._data(), "position_y"));
            }
            //Loop through the grid and clean any previous typing cells
            for (var i = 0, len = obj.crossword_grid_y(); i < len; ++i)
                for (var l = 0, t_len = obj.crossword_grid_x(); l <  t_len; ++l)
                    obj.grid()[i].cols()[l].typing(false);

            obj.grid()[obj.new_attempted_word().y()].cols()[obj.new_attempted_word().x()].typing(true);
            start_location = val;
            counter = 0;

            $(".cwd_input").focus();
        }
    }

    obj.cwd_input_response = ko.observable("");

    obj.cwd_input_response.subscribe( function(){
        obj.type_letter_new();
    })

    obj.type_letter_new = function() // gets called everytime you type a letter
    {
        if(!obj.showing_answer() && obj.state() != 4)
        {
            //Get the last letter from the string (Newest letter)
            var new_letter = obj.cwd_input_response()[obj.cwd_input_response().length-1];
            var word = get_response_data(obj.questions()[obj.new_attempted_word().question().id()].responses()[1]._data(), "text");
            var dir = get_response_data(obj.questions()[obj.new_attempted_word().question().id()].responses()[1]._data(), "direction");
            var start = get_response_data(obj.questions()[obj.new_attempted_word().question().id()].responses()[1]._data(), (dir == 0) ? "position_y" : "position_x");

            if (typeof new_letter === 'undefined')
                new_letter = "";

            if(!/^[0-9a-zA-ZÀ-ú\-]+$/.test(new_letter))
                return true;

            var entered_letter = new_letter;

            if (/^[a-zÀ-ú]+$/.test(entered_letter))
                entered_letter = entered_letter.toUpperCase();

            for(var i = 0, len = obj.grid()[obj.new_attempted_word().y()].cols()[obj.new_attempted_word().x()].question().length; i < len; ++i)
            {
                obj.questions()[obj.grid()[obj.new_attempted_word().y()].cols()[obj.new_attempted_word().x()].question()[i].id()].select_response(ko.observable(-1));
            }

            //Set the current grid letter to key press
            if (dir == 0)
            {
                obj.grid()[obj.new_attempted_word().y() + counter].cols()[obj.new_attempted_word().x()].letter(entered_letter);
                obj.grid()[obj.new_attempted_word().y() + counter].cols()[obj.new_attempted_word().x()].typing(false);
            }
            else
            {
                obj.grid()[obj.new_attempted_word().y()].cols()[obj.new_attempted_word().x() + counter].letter(entered_letter);
                obj.grid()[obj.new_attempted_word().y()].cols()[obj.new_attempted_word().x() + counter].typing(false);
            }

            //Increase counter to get the next letter
            if(start_location != -1)
            {
                counter += 1;

                //Counter is at the end of the word
                if ( counter >= word.length)
                {
                    //Take the focus away from the input box so the user can't type anymore
                    $(".cwd_input").blur();
                    obj.cwd_input_response("");
                }

                if (dir == 0)
                {
                    obj.grid()[obj.new_attempted_word().y() + ( counter - 1)].cols()[obj.new_attempted_word().x()].typing(false);
                    if (obj.new_attempted_word().y() +  counter < obj.grid().length)
                        obj.grid()[obj.new_attempted_word().y() +  counter].cols()[obj.new_attempted_word().x()].typing(true);
                }
                else
                {
                    obj.grid()[obj.new_attempted_word().y()].cols()[obj.new_attempted_word().x() + ( counter - 1)].typing(false);
                    if (obj.new_attempted_word().x() +  counter < obj.grid()[obj.new_attempted_word().y()].cols().length)
                        obj.grid()[obj.new_attempted_word().y()].cols()[obj.new_attempted_word().x() +  counter].typing(true);
                }
            }

            obj.check_cwd_answer();

            return true;
        }
    }

    //Checks to see if any correct answers have been put in.
    obj.check_cwd_answer = function()
    {
        for (var i = 0, len = obj.questions().length; i < len; ++i) // 1
        {
            var cur_question = obj.questions()[i];

            if(cur_question.selected_response() !== 1) { // don't loop again on questions (words) that are already complete

                for (var l = 1, t_len = cur_question.responses().length; l < t_len; ++l) // 2
                {
                    var cur_response = cur_question.responses()[l];
                    //Get the direction the word is  in
                    var dir = get_response_data(cur_response._data(), "direction"); // 3
                    //Get the correct word
                    var word = get_response_data(cur_response._data(), "text");
                    //Will hold the letters the user has entered
                    var entered_word = "";
                    //Check to see if the word has been placed in editor yet
                    var pos_y = get_response_data(cur_response._data(), "position_y");
                    var pos_x = get_response_data(cur_response._data(), "position_x");

                    //-1 means the question was just added and doesn't have a position yet. Will error when trying to check a position that doesn't exist
                    if (pos_y != -1)
                    {
                        for (var k = 0, l_len = word.length; k < l_len; ++k) // 4
                        {
                            //0 = vertical, 1 = horizontal
                            //Get the entered letters and append it to the string
                            if (dir == 0)
                                entered_word += obj.grid()[pos_y + k].cols()[pos_x].letter(); // 5
                            else
                                entered_word += obj.grid()[pos_y].cols()[pos_x + k].letter();

                            if(k==l_len-1)
                            {
                                if (dir == 0)
                                {
                                    if(obj.grid()[pos_y + k].cols()[pos_x].letter() != "") //6
                                        if(typeof obj.grid()[pos_y + k + 1] !== 'undefined') {
                                            obj.grid()[pos_y + k + 1].cols()[pos_x].letter("");
                                            break;
                                        }
                                }
                                else{
                                    if(obj.grid()[pos_y].cols()[pos_x + k].letter() != "")
                                        if(typeof obj.grid()[pos_y].cols()[pos_x + k + 1] !== 'undefined') {
                                            obj.grid()[pos_y].cols()[pos_x + k + 1].letter("");

                                            break;
                                        }
                                }
                            }
                        }

                        //Reset the question number labels on the grid, as everything was just cleared
                        if (dir == 0)
                            obj.grid()[pos_y - 1].cols()[pos_x].letter(i + 1);
                        else
                            obj.grid()[pos_y].cols()[pos_x - 1].letter(i + 1);

                    }

                    //Select incorrect response if they have typed a full word but it is not correct
                    if (entered_word.length == word.length)
                    {
                        cur_question.select_response(ko.observable(0));
                    }
                    //See if the entered word and the correct word match up
                    if (entered_word.toLowerCase() == word.toLowerCase()) {
                        cur_question.select_response(ko.observable(1));
                        break;
                    }
                }
            }
        }
    };

    obj.cwd_click_letter = function(x_index, y_index, question){
        if(!obj.feedback_showing_answer() || obj.showing_answer()){
         obj.word_attempt(true);
         obj.new_attempted_word().x(x_index);
         obj.new_attempted_word().y(y_index);
         obj.new_attempted_word().questions(question());
         obj.new_attempted_word().question(question()[0]);
         obj.new_attempted_word().id(question()[0].id());
         obj.type_letter(-1);
        }
    }

    obj.create_cwd_grid();
}


function product_helper_exercise_flc(obj){
    obj.selected_card = ko.observable(-1);
    obj.front_card = ko.observable(true);
    obj.view_list = ko.observable(true);
    obj.double_view = ko.observable(false);
    obj.auto_play = ko.observable(false);
    obj.audio = ko.observable(true);
    obj.showing_answer(false);

    obj.on_click_card = function(id)
    {
        if(id < obj.questions().length && id >= 0)//make sure the card exists, otherwise don't do anything
        {
            obj.clear_flc_timeouts();
            play_audio(); //stop audio of previous card before switching to next card
            obj.selected_card(id);
            obj.check_task_completion();
        }
    }

    obj.toggle_card = function(id)
    {
        var tar = $('.card-'+id);
        $('.flc-front').removeClass('no_transition');
        $('.flc-back').removeClass('no_transition');
        tar.toggleClass('flc-flip');
        $('.flc-click').one('transitionend', function () {
            $('.flc-front').addClass('no_transition');
            $('.flc-back').addClass('no_transition');
        })

        obj.front_card(!obj.front_card());
    }

    obj.check_task_completion = function()
    {
        obj.questions()[obj.selected_card()].select_response(ko.observable(0));
        // obj.check_answers(); //why is this needed?
    }

    obj.clear_flc_timeouts = function()
    {
        clearTimeout(obj.audio_timeout);
        clearTimeout(obj.auto_play_timeout);
    }

    obj.reset_flc = function(){
        obj.clear_flc_timeouts();
        play_audio();
        obj.selected_card(0);
        obj.front_card(true);
        obj.double_view(false);
        obj.auto_play(false);
        // obj.showing_answer(true);
    }
}

function product_select_exercise_spk(obj, lab_height)
{
    obj.drag_area_height_offset($('.SPK-exercise-'+obj.id())[0].offsetTop);
    obj.drag_area_x($('.SPK-exercise-'+obj.id())[0].clientWidth);
    obj.drag_area_y($('.SPK-exercise-'+obj.id())[0].clientHeight - obj.drag_area_height_offset());
    if (obj.started() && obj.current_question() != -3 && !obj.progress_restored())
    {
        obj.timer(Date.now());
        obj.myTimer_update();
    }
}

function product_helper_exercise_spk(obj)
{
    //set some editing values
    obj.drag_pair_types = ko.observableArray(["text", "image"]);
    //get size offset
    obj.started = ko.observable(false);
    obj.timer = ko.observable(0);
    obj.drag_area_height_offset = ko.observable();
    obj.drag_area_x = ko.observable(0);
    obj.drag_area_y = ko.observable(0);
    obj.attempt_times = ko.observableArray();
    obj.paused_timer = ko.observable(0);
    obj.progress_restored = ko.observable(true);
    obj.drag_area_ratio = ko.computed(function(){
        var ret = obj.drag_area_x() / obj.drag_area_y()
        if(isNaN(ret))
        {
            return 0;
        }
        return ret;
    });
    obj.current_question = ko.computed(function(){
        if(typeof obj.dragdrop === 'undefined' || !obj.dragdrop.initiated())
        {
            return -1;//peps need to be visible to init DND
        }
        else if(obj.started() == false)
        {
            //product_helper_adjust_single_drop_positions();
            return -2;//peps must hide after being shown until started
        }
        for( var i = 0, i_len = obj.questions().length; i < i_len; ++i )
        {
            for( var w = 0, w_len = obj.questions()[i].responses().length; w < w_len; ++w )
            {
                if(!obj.questions()[i].responses()[w].selected())
                {
                    return i;
                }
            }
        }
        obj.check_answers();
        obj.showing_answer(true);
        return -3;
    });

    obj.current_question.subscribe( function(value){
        if(value >= 0 && value < obj.questions().length)
        {
            product_helper_adjust_single_drop_positions();
        }
        else if(value == -3)
        {
            obj.feedback().attempts(obj.feedback().attempts() + 1);

            if(!obj.progress_restored())
            {
                obj.timer(((Date.now() - obj.timer())/1000)+obj.paused_timer());
                if(obj.attempt_times().length < 3)
                {
                    obj.attempt_times.push(obj.timer());
                }
                else
                {
                    var score_to_replace = -1;
                    for( var i = 0, len = obj.attempt_times().length; i < len; ++i )
                    {
                        if(obj.attempt_times()[i] > obj.timer())
                        {
                            score_to_replace = i;
                        }
                    }
                    if(score_to_replace != -1)
                    {
                        obj.attempt_times()[score_to_replace] = obj.timer();
                    }
                    //sort scores
                }
            }
            obj.attempt_times.sort(sortNumber);
        }
        product_helper_calculate_spk_drag_area(obj);
    });

    obj.start_spk = function (){
        obj.started(true);
        product_helper_adjust_single_drop_positions();
        obj.timer(Date.now());
        obj.start_spk_timer()
        obj.progress_restored(false);
    }

    obj.reset_spk = function (){
        product_helper_adjust_single_drop_positions();
        for(var i = 0, len = obj.dragdrop.pep_objs().length; i < len; ++i)
        {
            obj.dragdrop.pep_objs()[i].dropped(false);
            obj.dragdrop.pep_objs()[i].pep().removeClass('pep-dpa');
            $.pep.peps[obj.dragdrop.pep_objs()[i].pep_idx].activeDropRegions = [];
        }
        obj.started(false);
        obj.paused_timer(0);
        obj.timer(0);
    }
    //subscribe to type change


    //Time displayed in the page header
    obj.spk_timer = ko.observable('00:00');
    //obj.spk_timer_holder = ko.observable('00:00');
    obj.spk_time = ko.observable(0);

    //Start the timer when doing an achievement test
    obj.start_spk_timer = function()
    {
        //Reset timer
        obj.spk_timer('00:00');

        var newTimer = setInterval(function () {

            obj.myTimer_update();
        }, 1000);

        obj.myTimer_update = function (){

            if (obj.current_question() != -3 && obj.started())
            {
                var time_str = '' + Math.round((((Date.now() - obj.timer())/1000)+obj.paused_timer()));
                obj.spk_timer(time_str);
            }
            else
                clearInterval(newTimer);
        }
    }
}

function product_helper_calculate_spk_drag_area(obj)
{
    if($('.SPK-exercise-'+obj.id()).length)
    {
        obj.drag_area_x($('.SPK-exercise-'+obj.id())[0].clientWidth);
        obj.drag_area_y($('.SPK-exercise-'+obj.id())[0].clientHeight);
        if($('.SPK-instructions')[0].offsetParent !== null){
            obj.drag_area_height_offset($('.SPK-instructions')[0].clientHeight + $('.exercise-bar')[0].clientHeight);
        }
    }
}

function product_helper_exercise_giw(obj)
{
    //The question # that is selected
    obj.selected_question = ko.observable(-1);
    //The index # of the word in the word array
    obj.selected_word = ko.observable(-1);
    //Which part of the sentence the word is contained in. 0 = pre-text, 1 = wrong word, 2 = post_text
    obj.selected_area = ko.observable(-1);

    obj.word_list = ko.observableArray([]);

    //Returns an array of all the words within a string.
    obj.get_word_list_from_string = function(content)
    {
        return content.split(" ");
    }

    obj.select_word = function(word_data){
        //console.log(word_data);
        if(!obj.feedback_showing_answer()){
            obj.selected_question(word_data.question);
            obj.clear_selected();
            word_data.selected(1);
            obj.questions()[word_data.question].entered_response('');
        }
    }

    obj.handle_correct_word_submission = function(word_data, word_index){
        obj.selected_question(word_data.question);
        obj.check_giw_response(word_index);
        obj.questions()[word_data.question].check_entered_response('sena');
    }

    obj.handle_incorrect_word_submission = function(word_data, word_index){
        //console.log(word_data);
        //console.log(word_index);
        obj.selected_question(word_data.question);
        obj.check_giw_response(word_index);
    }

    obj.update_state_for_correct_word_submission = function(){

    }

    //Change state on the question that is being worked on.
    obj.check_giw_response = function(idx) //poorly named function, this function actually just marks the question wrong because they are submitting an answer for a word that is actually correct
    {
        obj.questions()[obj.selected_question()].select_response(ko.observable(-1)); //make sure the state is reset before checking the answer
        
        if (obj.questions()[obj.selected_question()].entered_response() != "")
        {
            obj.questions()[obj.selected_question()].select_response(ko.observable(0)); //select incorrect response to start
            obj.word_list()[idx].answered(1);
        }
        else{
            obj.word_list()[idx].answered(0);
        }
    }

    //Reset the exercise to the default state.
    obj.clear_giw = function()
    {
        obj.selected_question(-1);

        for( var i = 0; i < obj.word_list().length; ++i)
        {
            obj.word_list()[i].selected(0);
            obj.word_list()[i].answered(0);
        }
    }

    //Clear all selections.
    obj.clear_selected = function()
    {
        for(var i = 0; i < obj.word_list().length; ++i)
        {
            if (obj.word_list()[i].question == obj.selected_question())
            {
                obj.word_list()[i].selected(0);
                obj.word_list()[i].answered(0);
            }
        }
        obj.questions()[obj.selected_question()].select_response(ko.observable(-1)); //reset the question when you switch words
    }

    obj.create_words_array = function()
    {
        //Make sure everything is cleared properly
        obj.word_list.removeAll();

        for(var i = 0; i < obj.questions().length; ++i)
        {
            var temp = [];
            var incorrect_word;
            for (var l = 0; l < obj.questions()[i]._data().length; ++l)
            {
                if (obj.questions()[i]._data()[l].type() == "question")
                {
                    if (product_helper_check_rec_question(obj.questions()[i]._data()) == false)
                    {
                        for (var c = 0; c < obj.questions()[i]._data()[l].contents().length; ++c)
                        {
                            temp = []
                            if (obj.questions()[i]._data()[l].contents()[c].type() == "text")
                                temp = obj.questions()[i]._data()[l].contents()[c].content().split(" ");

                            for(var k = 0; k < temp.length; ++k)
                                obj.word_list.push({"word": temp[k], "question": i, "response": 0 , "selected": ko.observable(0), "answered": ko.observable(0), "rec": 0 });
                        }

                    }
                }
                if (obj.questions()[i]._data()[l].type() == "incorrect")
                    incorrect_word = obj.questions()[i]._data()[l].contents()[0].content();
            }
            if (!product_helper_check_rec_question(obj.questions()[i]._data()))
            {
                //Get incorrect word
                obj.word_list.push({"word": incorrect_word, "question": i, "response": 1, "selected": ko.observable(0), "answered": ko.observable(0), "rec": 0  }); //use the response key to determine if it the response that has to be corrected (1), or just some other word (0)

                for (var l = 0; l < obj.questions()[i]._data().length; ++l)
                {
                    if (obj.questions()[i]._data()[l].type() == "post_question")
                    {
                        temp = obj.questions()[i]._data()[l].contents.content().split(" ");
                        for(var k = 0; k < temp.length; ++k)
                            obj.word_list.push({"word": temp[k], "question": i, "response": 0, "selected": ko.observable(0), "answered": ko.observable(0), "rec": 0  });
                    }
                }
            }
        }
    }

    //Gets all the answers for a question and returns them as a string.
    //@idx = The question ID.
    obj.get_answers = function(idx)
    {
        var ret = "";

        //Remove any selected words
        obj.clear_giw();

        //Loop through all the responses and append all the answers to a string
        for (var l = 0; l < obj.questions()[idx].responses().length; ++l)
        {
            for (var k = 0; k < obj.questions()[idx].responses()[l]._data().length; ++k)
            {
                //If it's not empty, then add a slash to separate the next word
                if (ret != "")
                    ret += "/";
                ret += obj.questions()[idx].responses()[l]._data()[k].content();
            }
        }

        //Return the finished string
        return ret;
    }

    //Restores the loaded progress.
    obj.set_giw_progress = function(word_idx)
    {
        obj.word_list()[word_idx].answered(1);
        obj.word_list()[word_idx].selected(1);
    }

    obj.create_words_array();
}

function product_helper_exercise_cas(obj)
{
    obj.selected_questions = ko.observableArray([obj.questions()[0]]);
    obj.selected_responses = ko.observableArray([]);
    obj.question_nums = ko.observableArray([]);
    obj.conclusion_summary = ko.observable("");
    obj.current_index = ko.observable(0);

    //Selects the next question node from the response that was clicked.
    //@question_idx = The current question ID
    //@idx = The current response ID
    obj.select_cas_question = function(question_idx, idx)
    {
        //Flag for whether or not the question is the last in the list
        var last_node = false;
        obj.selected_responses.push(idx);
        obj.questions()[question_idx].select_response(ko.observable(idx));
        for (var i = 0; i < obj.questions()[question_idx].responses()[idx]._data().length; ++i)
        {
            //Find the next question id
            if (obj.questions()[question_idx].responses()[idx]._data()[i].type() == "question_link")
            {
                //If the question id is END, it is the last question in the list and the exercise is over
                if (obj.questions()[question_idx].responses()[idx]._data()[i].content() == "END")
                    last_node = true;
                else //Add the new question to the list to display
                    obj.selected_questions.push(obj.questions()[obj.questions()[question_idx].responses()[idx]._data()[i].content() - 1]);

                //Increase index so we know what question we are and we can disable previous questions
                obj.current_index(obj.current_index() + 1);
            }
        }

        //The last question was found, display the conclusion summary.
        if (last_node)
            obj.cas_show_answer();
    }

    //Clears and resets the exercise. Called when the user clicks on the Clear button.
    obj.clear_cas_exercise = function()
    {
        //Remove all the questions from the selected questions
        obj.selected_questions.removeAll();
        obj.selected_questions.push(obj.questions()[0]);
        //Clear the summary text
        obj.conclusion_summary("");
        //Reset index counter
        obj.current_index(0);
    }

    //Shows the summary at the end of the exercise
    obj.cas_show_answer = function()
    {
        //Summary text is stored on the first questions _data array
        for (var i = 0; i <obj._data().length; ++i)
        {
            //Find the summary text
            if (obj._data()[i].type() == "summary")
            {
                //Set the text to display on the template
                obj.conclusion_summary(obj._data()[i].contents()[0].content());
                break;
            }
        }
        viewModel.labs()[viewModel.selected_lab()].adjust_video_container();
        //Make sure everything is correct when at the end
        for (var i = 0; i < obj.questions().length; ++i)
        {
            if(obj.questions()[i].selected_response() == -1)
                obj.questions()[i].select_response(ko.observable(0));
        }
    }

    //Create the options list for the editor.
    obj.get_question_nums = function()
    {
        //Loop through each question and get the ID number
        for( var i = 0; i < obj.questions().length; ++i)
            obj.question_nums.push(obj.questions()[i].id() + 1);

        //At the END option at the end of the list, to allow the exercise to have a ending question
        obj.question_nums.push('END');
    }

    //Called when questions are added or removed, to keep the question number list in sync.
    obj.questions.subscribe(function() {
        //If a question was added
        if (obj.questions().length > obj.question_nums().length - 1)
            obj.question_nums.push(obj.questions()[obj.questions().length - 1].id() + 1);
        else if (obj.questions().length < obj.question_nums().length - 1) //If a question was removed
            obj.question_nums.splice(obj.question_nums().length - 2,1);

    });

    //Gets the question numbers that the current question can link to.
    //Removes the current index from the list so a question can't link to itself.
    obj.get_available_question_nums = function(idx)
    {
        //Empty array to hold the  modified question number array
        var ret = [];

        //Loop through each question
        for( var i = 0; i < obj.question_nums().length; ++i)
        {
            //If the current question number doesn't equal the index, then add it into the array
            if ( obj.question_nums()[i] != (idx + 1))
                ret.push(obj.question_nums()[i]);
        }

        //Return the finalized array
        return ret;
    }

    obj.linking_to_end = function(idx)
    {
        var ret = false;

        for (var i = 0; i < obj.questions()[idx].responses().length; ++i)
        {
            for (var k = 0; k < obj.questions()[idx].responses()[i]._data().length; ++k)
            {
                //Find the next question id
                if (obj.questions()[idx].responses()[i]._data()[k].type() == "question_link" && obj.questions()[idx].responses()[i]._data()[k].content() == "END")
                    ret = true;
            }
        }

        return ret;
    }

    obj.restore_cas_progress = function()
    {
        for (var i = 0; i < obj.questions().length; ++i)
        {
            if(obj.questions()[i].selected_response() != -1)
                obj.select_cas_question(i, obj.questions()[i].selected_response());
        }
    }

    obj.get_question_nums();
}



// this needs to be called in post_ex_switch to fix MF1 respose container width
function product_helper_adjust_MF1_response_container(ex_obj) {
    //console.log('Doing MF1 special stuff');
    ex_obj.dragdrop.adjust_response_container();
}

function product_helper_adjust_WSB(obj, value){
    for(var i = 0; i < obj.exercises()[value].questions().length; ++i) // for each question (ie. hint)
    {
        var content = "";
        var image_content = "";
        var is_an_iamge = false;
        var is_text = false;
        var is_audio = false;
        for(var k = 0; k < obj.exercises()[value].questions()[i]._data().length; ++k) // for each _data in the question
        {
            if (obj.exercises()[value].questions()[i]._data()[k].type() == "question")
            {
                for(var m = 0; m < obj.exercises()[value].questions()[i]._data()[k].contents().length; ++m)
                { // for each thing in the _data
                    if(obj.exercises()[value].questions()[i]._data()[k].contents()[m].type() == "image")
                    {   //if its image
                        var theImage = new Image();
                        theImage.src = 'assets/'+viewModel.lesson_type+'/scos/'+viewModel.sco_number+'/media/image/' +obj.exercises()[value].questions()[i]._data()[k].contents()[m].content();
                        image_content = '<img class="WSB-popover-image" src='+theImage.src+' />' + "</br>";
                        is_an_iamge = true;
                    } else if (obj.exercises()[value].questions()[i]._data()[k].contents()[m].type() == "text") { // if its text
                        content = content + '<span>'+obj.exercises()[value].questions()[i]._data()[k].contents()[m].content()+'</span>' + "</br>";
                        is_text = true;
                    } else if (obj.exercises()[value].questions()[i]._data()[k].contents()[m].type() == "audio") { // if its audio
                        is_audio = true;
                    }
                }
            }
        }

        if(is_an_iamge)
        {
            content = '<div class="WSB-popover-text">' + content + '</div>';
            $('.WSB-pop-over-'+value+'-'+i).popover({
                html: true,
                placement: 'top',
                template: '<div class="popover WSB-popover"><div class="arrow WSB-popover-arrow"></div><h3 class="popover-title"></h3><div class="popover-content WSB-popover-content"></div></div>',
                content: '<div class="WSB-img-popover-wrapper">'+image_content + content+'</div>',
                container: 'body'
            })
        } else if (is_text){
            $('.WSB-pop-over-'+value+'-'+i).popover({
                html: true,
                placement: 'top',
                template: '<div class="popover WSB-popover"><div class="arrow WSB-popover-arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
                content: content
            })
        } else if (is_audio) {
            // currently handled in html. add popover stuff here if needed in the future

        }
    }
}

function product_helper_get_WSB_user_ans(ex_obj, q_obj){ //WSB's drop id's and response nums are super hectic, so needed this mess to find the user's response
    var user_ans = "";
    var no_response = true;
    var corrected_drop_id = 0;
    var progress = false;
    try{
        for(var j=1;j<q_obj.responses().length;++j){
            for(var k=0; k<ex_obj.dragdrop.pep_objs().length;++k){
                if(ex_obj.dragdrop.pep_objs()[k].dropped()){
                    if(ex_obj.dragdrop.pep_objs()[k].drop_region()[0].id == (j+q_obj.responses().length-1) && ex_obj.dragdrop.pep_objs()[k].pep()[0].id == q_obj.id()){
                        var nodes = ex_obj.dragdrop.pep_objs()[k].pep()[0].childNodes;
                        for(var i = 0; i< nodes.length; i++){
                            if(nodes[i].nodeName.toUpperCase() == "SPAN"){
                                user_ans += nodes[i].innerHTML + ' ';
                            }
                        }
                        no_response = false;
                        progress = true;
                        break;
                    }
                }
            }
            if(no_response){
                user_ans += "___ ";
            }
            no_response = true;
        }
    }
    catch(err){
        //console.log(err);
        user_ans = "There was an issue finding the response.";
    }
    return [user_ans, progress];
}

function product_helper_get_MT1_user_ans(obj, question_num){
    var user_ans = "";
    try{
        for(var k=0; k<obj.dragdrop.pep_objs().length;++k){
            if(obj.dragdrop.pep_objs()[k].drop_region()[0].id == question_num){
                for(var m = 0; m<obj.questions()[obj.dragdrop.pep_objs()[k].pep()[0].id].responses().length; ++m){
                    if(obj.questions()[obj.dragdrop.pep_objs()[k].pep()[0].id].responses()[m].correct()){
                        user_ans += obj.questions()[obj.dragdrop.pep_objs()[k].pep()[0].id].responses()[m]._data()[0].content(); //yucky hard coded 0
                    }
                }
                break;
            }
        }
    }
    catch(err){
        //console.log(err);
        user_ans = "There was an issue finding the response";
    }
    return user_ans;
}

function product_helper_get_DFL_user_ans(obj, question_num){
    var user_ans = "";
    try{
        for(var k=0; k<obj.dragdrop.pep_objs().length;++k){
            if(obj.dragdrop.pep_objs()[k].dropped() && obj.dragdrop.pep_objs()[k].drop_region()[0].id == question_num){
                user_ans += obj.questions()[obj.dragdrop.pep_objs()[k].correct_drop_region()].responses()[obj.dragdrop.pep_objs()[k].response_num()]._data()[0].content() + ' ';
            }
        }
    }
    catch(err){
        //console.log(err);
        user_ans = "There was an issue finding the response";
    }
    return user_ans;
}

function product_helper_get_MF1_user_ans(obj, question_num){
    var user_ans = "";
    try{
        for(var k=0; k<obj.dragdrop.pep_objs().length;++k){
            if(obj.dragdrop.pep_objs()[k].dropped() && obj.dragdrop.pep_objs()[k].drop_region()[0].id == question_num){
                user_ans += obj.questions()[obj.dragdrop.pep_objs()[k].drop_region()[0].id].responses()[obj.dragdrop.pep_objs()[k].response_num()]._data()[0].content() + ' ';
            }
        }
    }
    catch(err){
        //console.log(err);
        user_ans = "There was an issue finding the response";
    }
    return user_ans;
}

function product_helper_wlc (obj) {
    var has_free_header = false;
    var has_free_type_area = false;
    for (var i = 0; i < obj._data().length; ++i) { // find a better way to do this
        if (obj._data()[i].type() == "free_header_text")
            has_free_header = true;
        else if (obj._data()[i].type() == "free_type_text_area")
            has_free_type_area = true;
    }

    if (!has_free_header)
        obj._data().push({"type" : ko.observable("free_header_text"), "content" : ko.observable("Free Header Placeholder")});
    if (!has_free_type_area)
        obj._data().push({"type" : ko.observable("free_type_text_area"), "content" : ko.observable("Free Type Text Area")});
}
