/*
===========================Sena Dragdrop Models============================
*/

//This is sena_dragdrop.js, it hold the dragdrop model and dragable_item_model for sena, and is what determines all the specific dragdrop functionality for sena

function product_helper_get_drag_drop_container_width(type)
{
    var inner_width = window.innerWidth;

    if(inner_width > 1330)//set in css
    {
        inner_width = 1280;
    }

    return (inner_width - 115);

}

function product_helper_adjust_single_drop_positions()
{
    if ( viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].type() == "SPK" )
    {
        product_helper_calculate_spk_drag_area(viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()])
    }
    if(typeof viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].dragdrop !== 'undefined')
    {
        adjust_drag_item_positions(viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].dragdrop);
    }
}

//Checks to see if the exercise type is part of drag_drop.
//@type = the exercise type
function product_helper_is_drag_drop_type(type)
{
    //Check if type is any of the drag drop types
    if(type == "SFL" || type == "MT1"|| type == "DFL" || type == "SFG" || type == "MF1" || type == "WSB" || type == "SPK")
        return true;

    return false;
}

//Sets the config numbers for the drag drop type.
function product_helper_build_drag_drop_config(type)
{
    var ret = undefined;

    //dragdrop objects
    //@response_container_type: 1 = right side, 2 = fixed bottom, 3 = hidden
    //@starting_position_type: 1 = stacked, 2 = grid, 3 = randomized
    //@drop_type: 1 = standard drop, 2 = prepare for position switch
    //@double_drop_type: 1 = kick dropped item back to response container, 2 = switch item position
    //@drag_item_adjust_type: 1 = single item - single container, 2 = multiple items - single container
    //@state_calc_type: 1 = Uses select_response, 2 = Uses responses.selected
    //@revert_type: 1 = Kick back to response container, 2 = return to drop region
    if (type == "SFL")
    {
        ret = new drag_drop_config(9,9,1,8,11,1,9);
    }
    else if (type == "MT1")
    {
        ret = new drag_drop_config(3,3,2,2,10,1,2);
    }
    else if (type == "DFL")
    {
        ret = new drag_drop_config(9,9,1,3,5,2,9);
    }
    else if (type == "SFG")
    {
        ret = new drag_drop_config(1,1,1,1,1,2,1);
    }
    else if (type == "MF1")
    {
        ret = new drag_drop_config(5,5,1,1,1,5,5);
    }
    else if (type == "SPK")
    {
        ret = new drag_drop_config(6,6,6,6,8,6,8);
    }
    else if (type == "WSB")
    {
        ret = new drag_drop_config(7,3,7,7,2,7,2);
    }
    return ret;
}

//Shuffles the drag drop responses.
//@array = the array of responses
function product_helper_array_shuffle(array)
{
    var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// Functionality of getting dragdrop progress just happens in regular get_progress function in sena_progress.js

// Restore dragdrop progress
function product_helper_restore_drag_drop_progress(progress_obj, obj)
{
    //console.log("Restoring dragdrop progress");
    var dragdrop_progress = progress_obj.split(',');
    var current_exercise = -1;
    var current_lab = -1;
    var exe_progress_strings = new Array();
    var exercise_numbers = new Array();
    var tmp_str = '';

    for (var w = 0; w < dragdrop_progress.length; ++w)
    {
        if(typeof dragdrop_progress[w] === 'undefined' || dragdrop_progress[w] == ''){continue;}
        var progress_data = dragdrop_progress[w].match( /l(\d+)e(\d+)q(\d+)r(\d+)\|q(\d+)/i );
        if (progress_data === null) {continue; }
        //console.log(dragdrop_progress[w]);
        if(w != 0 && current_exercise != -1)
        {
            var tmp_ex_num = parseInt(progress_data[2]);
            var tmp_lab_num = parseInt(progress_data[1]);
            if(!(current_exercise == tmp_ex_num && current_lab == tmp_lab_num))
            {
                obj.select_lab(current_lab);
                obj.labs()[current_lab].select_exercise(current_exercise);
                obj.labs()[current_lab].exercises()[current_exercise].final_special_progress = tmp_str;
                obj.labs()[current_lab].exercises()[current_exercise].dragdrop.restore_progress(tmp_str);
                if(tmp_str != '')
                {
                    tmp_str = '';
                }
            }
        }
        current_exercise = parseInt(progress_data[2]);
        current_lab = parseInt(progress_data[1]);
        tmp_str += dragdrop_progress[w] + ',';
    }

    if(current_lab != -1)
    {
        obj.select_lab(current_lab);
        obj.labs()[current_lab].select_exercise(current_exercise);
        obj.labs()[current_lab].exercises()[current_exercise].final_special_progress = tmp_str;
        obj.labs()[current_lab].exercises()[current_exercise].dragdrop.restore_progress(tmp_str);
    }
}

// The model applied to each draggable item on the screen (pep object)
function dragable_item_model(obj, pep_obj, drop_group)
{
    var self = this;
    self.dropped = ko.observable(false);
    self.drop_region = ko.observable(-1);
    var drop_region_group = '.drop-target';
    if (typeof drop_group !== 'undefined')
        drop_region_group = drop_group;
    self.previous_drop_region = ko.observable(-1);
    self.correct_drop_region = ko.observable();
    self.response_num = ko.observable();
    self.offset_x = ko.observable();
    self.offset_y = ko.observable();
    self.position = ko.observable(0);
    self.pep = ko.observable($(pep_obj).pep({
        callIfNotStarted: ['stop'],
        droppable: drop_region_group,
        overlapFunction: false,
        useCSSTranslation: false,
        shouldEase: false,
        start: function(ev, drag_obj){
            obj.handle_start(self, ev, drag_obj);
        },
        drag: function(ev, drag_obj){
            obj.handle_drag(self, ev, drag_obj);
        },
        stop: function(ev, drag_obj){
            if(obj.drag_drop_config().drop_type() == 6)
            {
                if(typeof drag_obj.activeDropRegions !== 'undefined' && drag_obj.activeDropRegions.length > 1 )
                {
                    //success
                    ////log(product_helper_get_next_question());
                    obj.update_state();
                }
                else
                {
                    //revert
                    handle_revert(obj, self, drag_obj);
                }
            }
            else if(typeof drag_obj.activeDropRegions !== 'undefined' && drag_obj.activeDropRegions.length)
            {
                if(self.dropped())
                {
                    if( drag_obj.activeDropRegions[0][0].id != self.drop_region()[0].id )//unstyle the old region
                    {
                        if (obj.drag_drop_config().double_drop_type() != 7)
                        {
                            if (obj.drag_drop_config().response_container_type() != 9)
                            {
                                self.previous_drop_region(self.drop_region());
                            }
                        }
                        self.drop_region().attr('style','');
                    }
                }

                self.offset_x(drag_obj.$el[0].offsetLeft);
                self.offset_y(drag_obj.$el[0].offsetTop);
                self.drop_region(drag_obj.activeDropRegions[0]);
                self.dropped(true);
                obj.handle_drop(self, drag_obj);
                //attach_drag_item_to_drop_container(self, drag_obj);
                ////console.log('item '+ self.pep_idx +' dropped in ' + self.drop_region()[0].id + ' expecting container ' + self.correct_drop_region() + ' response_num '+ self.response_num() + ' ');
                //handle double drop
                handle_double_drop(obj, self);
                if (obj.drag_drop_config().double_drop_type() != 7)
                {
                    if (obj.drag_drop_config().response_container_type() != 9)
                    {
                        self.previous_drop_region(self.drop_region());
                    }
                }
                //state calc
                obj.update_state();
                obj.adjust_response_container();
                obj.adjust_drag_item_positions();
            }
            else
            {
                handle_revert(obj, self, drag_obj);
                obj.update_state();
                obj.adjust_response_container();
                obj.adjust_drag_item_positions();
            }
        }
    }));
    self.pep_idx = ($.pep.peps.length-1);
}

// Sena's dragdrop model, defines how each dragdrop exercise handles how it initiates draggable items and what properties they should have
function dragdrop_model(obj)  //EXS
{
    //console.log("Building the dragdrop model");
    var self = this;
    self.drag_drop_config = ko.observable(product_helper_build_drag_drop_config(obj.type()));
    self.response_container = ko.observable(new response_container_obj());
    self.progress_restore = ko.observable(false);
    self.pep_objs = ko.observableArray();
    self.initiated = ko.observable(false);
    self.drop_regions = ko.observableArray();
    self.response_container_count = ko.observable(obj.questions().length);

    self.init = function(){
        //console.log("Initiating the dragdrop model");
        if(typeof self.pep_objs() !== 'undefined' && !self.pep_objs().length)
        {
            var current_correct_drop = 0;
            var prev_question_num = 0;
            var response_num = (self.drag_drop_config().state_calc_type() == 5 ? 0 : 1);
            var spk_pair_counter = 0;
            var current_question_id = 0;

            for (var i = 0, len = $('.pep').length; i < len; ++i)
            {
                var pep_obj = $('.pep')[i];
                if(pep_obj.offsetParent !== null)//is visible
                {
                    if(self.drag_drop_config().state_calc_type() == 1)
                    {
                        if (self.drag_drop_config().response_container_type() == 9)
                            self.pep_objs.push(new dragable_item_model(self, pep_obj, '.SFL-drop'));
                        else
                            self.pep_objs.push(new dragable_item_model(self, pep_obj));

                        self.pep_objs()[self.pep_objs().length-1].correct_drop_region(self.pep_objs()[self.pep_objs().length-1].pep()[0].id);
                        self.pep_objs()[self.pep_objs().length-1].response_num(response_num);
                        if(obj.type() == "SFL")
                        {
                            for (var w = 0; w < obj.questions().length; ++w)
                            {
                                if (self.pep_objs()[self.pep_objs().length-1].pep()[0].id == w)
                                {
                                    for (var r = 0; r < obj.questions()[w].responses().length; ++r)
                                    {
                                        if (obj.questions()[w].responses()[r]._data()[0].content() == pep_obj.children[0].innerHTML)
                                        {
                                            self.pep_objs()[self.pep_objs().length-1].response_num(r);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else if (self.drag_drop_config().state_calc_type() == 2)
                    {
                        if (self.drag_drop_config().response_container_type() == 9)
                        {
                            self.pep_objs.push(new dragable_item_model(self, pep_obj, '.DFL-drop'));
                        }
                        else
                        {
                            self.pep_objs.push(new dragable_item_model(self, pep_obj));
                        }

                        self.pep_objs()[self.pep_objs().length-1].correct_drop_region(self.pep_objs()[self.pep_objs().length-1].pep()[0].id);
                        if(current_correct_drop != self.pep_objs()[self.pep_objs().length-1].pep()[0].id)
                        {
                            current_correct_drop = self.pep_objs()[self.pep_objs().length-1].pep()[0].id;
                            response_num = 1;
                        }
                        self.pep_objs()[self.pep_objs().length-1].response_num(response_num);
                        ++response_num;
                    }
                    else if (self.drag_drop_config().state_calc_type() == 3)
                    {

                    }
                    else if (self.drag_drop_config().state_calc_type() == 5)
                    {
                        self.pep_objs.push(new dragable_item_model(self, pep_obj, '.MF1-group-' + pep_obj.id+'_'+obj.id()));

                        if (prev_question_num != parseInt(pep_obj.id))
                        {
                            prev_question_num = pep_obj.id;
                            response_num = 0;
                        }
                        self.pep_objs()[self.pep_objs().length-1].response_num(response_num);

                        if(obj.questions()[pep_obj.id].responses()[response_num].correct())
                        {
                            self.pep_objs()[self.pep_objs().length-1].correct_drop_region(pep_obj.id);
                        }
                        else
                        {
                            self.pep_objs()[self.pep_objs().length-1].correct_drop_region(-1);
                        }

                        ++response_num;
                    }
                    else if (self.drag_drop_config().state_calc_type() == 6)
                    {
                        if(current_question_id != pep_obj.id)
                        {
                            current_question_id = pep_obj.id;
                            spk_pair_counter = 0;
                        }
                        self.pep_objs.push(new dragable_item_model(self, pep_obj , '.SPK-pair-' + pep_obj.id +'-'+ Math.floor(spk_pair_counter/2)));
                        self.pep_objs()[self.pep_objs().length-1].response_num(Math.floor(spk_pair_counter/2));
                        ++spk_pair_counter;
                    }
                    else if(self.drag_drop_config().state_calc_type() == 7)
                    {
                        self.pep_objs.push(new dragable_item_model(self, pep_obj, '.WSB-droper_'+pep_obj.id));
                        self.pep_objs()[self.pep_objs().length-1].correct_drop_region(self.pep_objs().length-1);
                        self.pep_objs()[self.pep_objs().length-1].response_num(response_num);
                        ++response_num;
                    }
                }
            }
            for (var i = 0, len = $('.drop-target').length; i < len; ++i)
            {
                var drop_target = $('.drop-target')[i];
                if(drop_target.offsetParent !== null)//is visible
                {
                    self.drop_regions.push(drop_target);
                }
            }
            //shuffle a few times
            if(self.drag_drop_config().state_calc_type() == 7)
            {
                for(var i = 0, len = 10; i < len; ++i)
                {
                    var temp_array = [];
                    var response_totals = 0;
                    var quest_array = [];

                    for (q = 0, q_len = obj.questions().length; q < q_len; ++q)
                    {
                        quest_array = [];

                        //Skip any rec questions, since we don't want to create any pep objects for it
                        if (product_helper_check_rec_question(obj.questions()[q]._data()) == false)
                        {
                            for (r = 0, r_len = obj.questions()[q].responses().length-1; r < r_len; ++r)
                                quest_array.push(self.pep_objs()[r + response_totals]);

                            response_totals += obj.questions()[q].responses().length-1;
                            product_helper_array_shuffle(quest_array);

                            for (r = 0, r_len = quest_array.length; r < r_len; ++r)
                                temp_array.push(quest_array[r]);
                        }
                    }
                    self.pep_objs(temp_array);
                }
                initiate_response_container(self);
            }
            else
            {
                for(var i = 0, len = 10; i < len; ++i)
                {
                    product_helper_array_shuffle(self.pep_objs());
                }
                initiate_response_container(self);
            }
        }
        self.initiated(true);
        adjust_response_container(self);
        adjust_drag_item_positions(self);
        if(obj.type() == "MT1" && !obj.checked_answer())
        {
            calculate_drag_drop_state(self, obj);
        }
    }
    self.handle_start = function(pep_obj, ev, drag_obj)
    {
        handle_drag_start(self, pep_obj, ev, drag_obj);
    }
    self.handle_drag = function(pep_obj, ev, drag_obj)
    {
        handle_drag_event(self, pep_obj, ev, drag_obj);

        //WSB so that it only highlights the active drop region
        if(obj.type() == "WSB")
        {
            $('.WSB-active-drop').removeClass('WSB-active-drop');
            if(drag_obj.activeDropRegions[0].hasClass('WSB-drop-hover') && drag_obj.activeDropRegions[0].hasClass('pep-dpa'))
            {
                drag_obj.activeDropRegions[0].addClass('WSB-active-drop');
            }
        }
        if(self.drag_drop_config().state_calc_type() == 1)
        {
            $('.MT1-active-drop').removeClass('MT1-active-drop');
            if(drag_obj.activeDropRegions.length)
            {
                if(drag_obj.activeDropRegions[0].hasClass('MT1-drop-hover') && drag_obj.activeDropRegions[0].hasClass('pep-dpa'))
                    $('#MT1'+obj.id()+'_'+drag_obj.activeDropRegions[0].attr('id')).addClass('MT1-active-drop');
            }
        }
        if(obj.type() == "DFL")
        {
            $('.DFL-question-container').removeClass('DFL-question-container-active');
            if(drag_obj.activeDropRegions.length)
            {
                if(drag_obj.activeDropRegions[0].hasClass('pep-dpa'))
                {
                    drag_obj.activeDropRegions[0].parent().addClass('DFL-question-container-active');
                }
            }
        }
        else if(obj.type() == "SFL")
        {
            $('.SFL-active-drop').removeClass('SFL-active-drop');
            if(drag_obj.activeDropRegions.length)
            {
                if(drag_obj.activeDropRegions[0].hasClass('SFL-drop-hover') && drag_obj.activeDropRegions[0].hasClass('pep-dpa'))
                    drag_obj.activeDropRegions[0].addClass('SFL-active-drop');
            }
        }

    }
    self.revert_drag_item = function(pep_idx)
    {
        revert_drag_item(self, pep_idx, obj);
        adjust_response_container(self);
    }
    self.handle_drop = function(pep_obj, drag_obj)
    {
        handle_drop(self, pep_obj, drag_obj);

        if(obj.type() == "DFL")
        {
            $('.DFL-question-container').removeClass('DFL-question-container-active');
        }
    }
    self.adjust_response_container = function()
    {
        adjust_response_container(self);
    }
    self.adjust_drag_item_positions = function()
    {
        adjust_drag_item_positions(self);
    }
    self.update_state = function()
    {
        calculate_drag_drop_state(self, obj);
    }
    self.restore_progress = function(progress_str)
    {
        //split str into array
        var dragdrop_progress = progress_str.split(',');
        //loop array
        self.progress_restore(true);
        for (var p = 0, len = dragdrop_progress.length; p < len; ++p)
        {
            if(typeof dragdrop_progress[p] === 'undefined' || dragdrop_progress[p] == ''){continue;}
            var progress_data = dragdrop_progress[p].match( /l(\d+)e(\d+)q(\d+)r(\d+)\|q(\d+)/i );
            //loop pep objs match data 3 with correct drop region.
            var drop_container = undefined;
            if(parseInt(progress_data[4]) > 0 || obj.type() == "WSB")
            {
                var drop_containers = $('.drop-target');
                if (obj.type() == "MF1")
                    drop_containers = $('.MF1-drop');
                if (obj.type() == "WSB")
                    drop_containers = $('.WSB-drop');

                var tmp_count = 0;
                for(var i = 0, tmp_len = drop_containers.length; i < tmp_len; ++i)
                {
                    if(drop_containers[i].offsetParent !== null)//is visible
                    {
                        if(drop_containers[i].id == progress_data[5])
                        {
                            if(drop_containers[i].className.match(/SFG-group/))
                            {
                                if(!drop_containers[i].children.length)
                                    drop_container = drop_containers[i];
                            }
                            else if(obj.type() == "MF1")
                                drop_container = $('.MF1-group-'+drop_containers[i].id+'_'+progress_data[2]);
                            else if(obj.type() == "WSB")
                            {
                                var quest_num = drop_containers[i].className.match(/.WSB-droper_(\d+)/);
                                if (quest_num[1] == progress_data[3])
                                {
                                    drop_container = drop_containers[i];
                                    ////log("progress_data[5]: " + progress_data[5] + ", drop_containers[i].id: " + drop_containers[i].id + ", quest_num[1]: " + quest_num[1] + ", progress_data[3]: " + progress_data[3] + ", progress_data: " + progress_data);
                                }
                            }
                            else
                                drop_container = drop_containers[i];
                        }
                    }
                }

                for(var i = 0, tmp_len = self.pep_objs().length; i < tmp_len; ++i)
                {
                    if(typeof drop_container != 'undefined'){
                        if (obj.type() == "MF1")
                        {
                            if(self.pep_objs()[i].response_num() == progress_data[4] && self.pep_objs()[i].pep()[0].id == progress_data[5])
                            {
                                restore_pep_object(i, drop_container);
                            }
                        }
                        else if (obj.type() == "WSB")
                        {
                            if(self.pep_objs()[i].response_num() == progress_data[4])
                            {
                                restore_pep_object(i, drop_container);
                            }
                        }
                        else
                        {
                            if(self.pep_objs()[i].response_num() == progress_data[4] && self.pep_objs()[i].correct_drop_region() == progress_data[3])
                            {
                                restore_pep_object(i, drop_container);
                            }
                        }
                    }
                }
            }
            else
            {
                var drop_containers = $('.drop-target');
                if (obj.type() == "MF1")
                    drop_containers = $('.MF1-drop');

                for(var i = 0, tmp_len = drop_containers.length; i < tmp_len; ++i)
                {
                    if(drop_containers[i].offsetParent !== null)//is visible
                    {
                        if(drop_containers[i].id == progress_data[5])
                        {
                            if(obj.type() == "SFG")
                            {
                                if(drop_container[i].className.match(/SFG-group/))
                                {
                                    //Check to see if there is a item already in the drop container
                                    if (!drop_container[i].children.length)
                                    {
                                        drop_container = drop_containers[i];
                                    }
                                }
                            }
                            else
                                drop_container = drop_containers[i];
                        }
                    }
                }

                if(self.drag_drop_config().state_calc_type() == 1)
                {
                    for(var i = 0, tmp_len = self.pep_objs().length; i < tmp_len; ++i)
                    {
                        if(self.pep_objs()[i].correct_drop_region() == progress_data[3])
                        {
                            restore_pep_object(i, drop_container);
                        }
                    }
                }
                else if(self.drag_drop_config().state_calc_type() == 5)
                {
                    for(var i = 0, tmp_len = self.pep_objs().length; i < tmp_len; ++i)
                    {
                        if(self.pep_objs()[i].response_num() == progress_data[4] && self.pep_objs()[i].pep()[0].id == progress_data[5])
                        {
                            restore_pep_object(i, drop_container);
                        }
                    }
                }
            }
        }

        function restore_pep_object(index_num, drop_container)
        {
            self.pep_objs()[index_num].previous_drop_region(self.pep_objs()[index_num].drop_region());
            self.pep_objs()[index_num].drop_region($(drop_container));
            self.pep_objs()[index_num].dropped(true);
            handle_drop(self, self.pep_objs()[index_num]);
            handle_double_drop(self, self.pep_objs()[index_num]);
            adjust_drag_item_positions(self);
        }

        self.progress_restore(false);
        self.update_state();
    }
    self.get_progress_str = function(lab_num, ex_num)
    {
        var ret = '';
        for(var i = 0, len = self.pep_objs().length; i < len; ++i)
        {
            if(self.pep_objs()[i].dropped() || viewModel.labs()[lab_num].exercises()[ex_num].type() == 'MT1') //don't have to drop MTI responses to be answered
            {
                if(self.pep_objs()[i].drop_region()[0].id == self.pep_objs()[i].correct_drop_region() && self.drag_drop_config().state_calc_type() != 7 && self.drag_drop_config().state_calc_type() != 1 )
                {
                    ret += ',l'+lab_num+'e'+ex_num+'q'+self.pep_objs()[i].correct_drop_region()+'r'+self.pep_objs()[i].response_num()+'|q'+self.pep_objs()[i].correct_drop_region();
                    //I don't know what I wrote this line for, next time write what exs it's for (KT)
                    //viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].questions()[self.pep_objs()[i].correct_drop_region()].scorm_info().user_ans(viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].questions()[self.pep_objs()[i].correct_drop_region()].responses()[self.pep_objs()[i].response_num()]._data()[0].content());
                }
                else
                {
                    if(self.drag_drop_config().state_calc_type() == 2)
                    {
                        ret += ',l'+lab_num+'e'+ex_num+'q'+self.pep_objs()[i].correct_drop_region()+'r'+self.pep_objs()[i].response_num()+'|q'+self.pep_objs()[i].drop_region()[0].id;
                    }
                    else if(self.drag_drop_config().state_calc_type() == 5 || self.drag_drop_config().state_calc_type() == 7)
                    {
                        ret += ',l'+lab_num+'e'+ex_num+'q'+self.pep_objs()[i].pep()[0].id+'r'+self.pep_objs()[i].response_num()+'|q'+self.pep_objs()[i].drop_region()[0].id;
                    }
                    else
                    {
                        if(self.drag_drop_config().revert_type() == 9) //SFL
                        {
                            ret += ',l'+lab_num+'e'+ex_num+'q'+self.pep_objs()[i].correct_drop_region()+'r'+self.pep_objs()[i].response_num()+'|q'+self.pep_objs()[i].drop_region()[0].id;
                        }
                        else //MT1 and SPK
                        {
                            ret += ',l'+lab_num+'e'+ex_num+'q'+self.pep_objs()[i].correct_drop_region()+'r0|q'+self.pep_objs()[i].drop_region()[0].id;
                        }
                    }
                }
            }
        }
        return ret;
    }
}

//spark has it's own auto scroll, this is because the normal autoscroll apends the pep to the body, but doing that to sparks peps will complicate the spark code even further
function handleAutoScroll_spk(ev, obj)
{
    var container_height = viewModel.labs()[viewModel.selected_lab()].container_height();
    var window_height = $('#'+viewModel.labs()[viewModel.selected_lab()].type()+'_exercises').height();
    var scroll_pos = $('.'+viewModel.labs()[viewModel.selected_lab()].type()+'_exercises').scrollTop();    
    if(ev.pep.y > (container_height + 100))
    {   
        $('.'+viewModel.labs()[viewModel.selected_lab()].type()+'_exercises').scrollTop(scroll_pos+10);
        obj.moveTo(ev.pep.x-100, ev.pep.y);
    }
    if(ev.pep.y < 80)
    {        
        $('.'+viewModel.labs()[viewModel.selected_lab()].type()+'_exercises').scrollTop(scroll_pos-10);
        obj.moveTo(ev.pep.x-100, ev.pep.y-200);
    } 
}