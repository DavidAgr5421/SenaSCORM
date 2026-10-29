//dragdrop objects
//@response_container_type: 1 = right side, 2 = fixed bottom, 3 = hidden
//@starting_position_type: 1 = stacked, 2 = grid, 3 = randomized
//@drop_type: 1 = standard drop, 2 = prepare for position switch
//@double_drop_type: 1 = kick dropped item back to response container, 2 = switch item position
//@drag_item_adjust_type: 1 = single item - single container, 2 = multiple items - single container
//@state_calc_type: 1 = Uses select_response, 2 = Uses responses.selected
//@revert_type: 1 = Kick back to response container, 2 = return to drop region
var drag_drop_config = function (response_container_type, starting_positions_type, drop_type, double_drop_type, drag_item_adjust_type, state_calc_type, revert_type)
{
    var self = this;
    self.response_container_type = ko.observable(response_container_type);
    self.starting_position_type = ko.observable(starting_positions_type);
    self.drop_type = ko.observable(drop_type);
    self.double_drop_type = ko.observable(double_drop_type);
    self.drag_item_adjust_type = ko.observable(drag_item_adjust_type);
    self.state_calc_type = ko.observable(state_calc_type);
    self.revert_type = ko.observable(revert_type);
}

var response_container_obj = function ()
{
    var self = this;
    self.width = ko.observable();
    self.height = ko.observable();
}

function initiate_response_container(obj)
{
    if(obj.drag_drop_config().response_container_type() == 1)
    {   
        var widest_item = 0;
        var item_height = 0;
        var current_height_offset = 20;
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(widest_item < obj.pep_objs()[i].pep()[0].clientWidth)
            {
                widest_item = obj.pep_objs()[i].pep()[0].clientWidth;
                item_height = obj.pep_objs()[i].pep()[0].clientHeight + 10;
            }
            //$.pep.peps[obj.pep_objs()[i].pep_idx].options.shouldEase = true;
            $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(35,current_height_offset);   
            current_height_offset += obj.pep_objs()[i].pep()[0].clientHeight+10;
        }
        obj.response_container().height(current_height_offset+20);
        obj.response_container().width(widest_item+40);        
    }
    else if(obj.drag_drop_config().response_container_type() == 2)
    {
        //get width of exercises
        var response_container = undefined;
        for (var i = 0, len = $('.exercises').length; i < len; ++i)
        {   
            var tmp_response_container = $('.exercises')[i];
            if(tmp_response_container.offsetParent !== null)//is visible
            {                    
                response_container = tmp_response_container;
            }
        }
        var widest_item = 0;
        var heightOffsets = [20];
        var widthOffset = 20;
        var item_row_count = 0;
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(widthOffset,heightOffsets[item_row_count]);
            if(widest_item < obj.pep_objs()[i].pep()[0].clientWidth)
            {
                widest_item = obj.pep_objs()[i].pep()[0].clientWidth;
            }
            if((widthOffset + widest_item) + obj.pep_objs()[i].pep()[0].clientWidth < response_container.clientWidth - 100)
            {
                widthOffset += obj.pep_objs()[i].pep()[0].clientWidth+10;
                heightOffsets[item_row_count] += obj.pep_objs()[i].pep()[0].clientHeight+10;
                ++item_row_count;
                if( typeof heightOffsets[item_row_count] === 'undefined' )
                {
                    heightOffsets[item_row_count] = 20;
                }
            }
            else
            {
                widthOffset = 20;
                heightOffsets[item_row_count] += obj.pep_objs()[i].pep()[0].clientHeight+10;
                item_row_count = 0;                        
            }
        }
        obj.response_container().height((response_container.clientHeight * 0.25));
        obj.response_container().width(response_container.clientWidth-40);        
    }
    else if(obj.drag_drop_config().response_container_type() == 3 || obj.drag_drop_config().response_container_type() == 7)
    {
        var $drop_container = $('.drop-target');
        var tmp_count = 0;
        for(var i = 0, len = $drop_container.length; i < len; ++i)
        {           
            //$.pep.peps[obj.pep_objs()[i].pep_idx].options.shouldEase = true;
            if($drop_container[i].offsetParent !== null)//is visible
            {                
                var tmp_item = $.pep.peps[obj.pep_objs()[tmp_count].pep_idx].$el.detach();
                $($drop_container[i]).append(tmp_item);
                obj.pep_objs()[tmp_count].drop_region($($drop_container[i]));
                //obj.pep_objs()[tmp_count].dropped(true);
                obj.pep_objs()[tmp_count].previous_drop_region($($drop_container[i]));
                if (obj.drag_drop_config().response_container_type() == 3)
                {
                    $.pep.peps[obj.pep_objs()[tmp_count].pep_idx].moveTo(obj.pep_objs()[tmp_count].drop_region()[0].offsetLeft,obj.pep_objs()[tmp_count].drop_region()[0].offsetTop);
                } 
                else if (obj.drag_drop_config().response_container_type() == 7)
                {
                    $.pep.peps[obj.pep_objs()[tmp_count].pep_idx].moveTo(obj.pep_objs()[tmp_count].drop_region()[0].offsetLeft ,0);
                    obj.pep_objs()[tmp_count].drop_region().attr('style', 'width:'+(tmp_item[0].clientWidth)+'px;height:'+(tmp_item[0].clientHeight+2)+'px;');  
                }
                $.pep.peps[obj.pep_objs()[tmp_count].pep_idx].activeDropRegions = $($drop_container[i]);
                ++tmp_count;
                
            }
        }
        obj.response_container().height((obj.pep_objs().length*item_height)+30);
        obj.response_container().width(widest_item+40);        
        adjust_drag_item_positions(obj);
    }
    else if(obj.drag_drop_config().response_container_type() == 4)
    {
        var current_height_offset = 20;
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(widest_item < obj.pep_objs()[i].pep()[0].clientWidth)
            {
                widest_item = obj.pep_objs()[i].pep()[0].clientWidth;
                item_height = obj.pep_objs()[i].pep()[0].clientHeight + 10;
            }
            //$.pep.peps[obj.pep_objs()[i].pep_idx].options.shouldEase = true;
            $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo($.pep.peps[obj.pep_objs()[i].pep_idx].$el[0].offsetLeft,current_height_offset);   
            current_height_offset += obj.pep_objs()[i].pep()[0].clientHeight+10;
        }
    }    
    else if(obj.drag_drop_config().response_container_type() == 5)
    {
        var current_question = 0;
        var widest_item = 0;
        var item_height = 0;
        var current_height_offset = 10;
        var total_response_width = 20;
        var tallest_container = 0;
        var width_buffer = 40;
        var response_container_array = new Array(obj.response_container_count());

        //console.log("sena match gets " +lms_config.product_type.match(/sena|me_english/gi))
        if(lms_config.product_type.match(/sena|me_english/gi)){
            if(typeof viewModel.loaded != 'undefined' && !viewModel.loaded()){
                width_buffer = 80;
            }
        }
        
        for (var i = 0; i < response_container_array.length; ++i)
        {
            response_container_array[i] = ({"widest_item": 0, "current_height_offset": 10});
        }
        
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            current_question = parseInt(obj.pep_objs()[i].pep()[0].id);
            
            if (tallest_container < response_container_array[parseInt(obj.pep_objs()[i].pep()[0].id)].current_height_offset + 20)
            {
                tallest_container = response_container_array[parseInt(obj.pep_objs()[i].pep()[0].id)].current_height_offset + 20;
            }
      
            $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(15, response_container_array[parseInt(obj.pep_objs()[i].pep()[0].id)].current_height_offset);
            response_container_array[parseInt(obj.pep_objs()[i].pep()[0].id)].current_height_offset += obj.pep_objs()[i].pep()[0].clientHeight+10;
            
            if(response_container_array[parseInt(obj.pep_objs()[i].pep()[0].id)].widest_item < obj.pep_objs()[i].pep()[0].offsetWidth)
            {
                response_container_array[parseInt(obj.pep_objs()[i].pep()[0].id)].widest_item = obj.pep_objs()[i].pep()[0].offsetWidth;
                item_height = obj.pep_objs()[i].pep()[0].clientHeight + 10;
            }
        }
        
        var $response_container = $('.MF1-response-group');
        var tmp_count = 0;
        var current_width_offset = 20;
        
        for(var i = 0, len = $response_container.length; i < len; ++i)
        {           
            if($response_container[i].offsetParent !== null)//is visible
            {       
                //console.log(response_container_array[tmp_count].widest_item);
                var style_string = "width:" + (response_container_array[tmp_count].widest_item + width_buffer) + "px;" 
                    + "top:" + 20 + "px;" + "height:" + response_container_array[tmp_count].current_height_offset +"px; margin-bottom: " + 20 +"px;";
                    
                $($response_container[i]).attr('style', style_string);
                
                current_width_offset += response_container_array[tmp_count].widest_item + width_buffer;
                $response_container[i].clientHeight = response_container_array[tmp_count].current_height_offset + 20;
                $response_container[i].clientWidth = response_container_array[tmp_count].widest_item + 20;

                 ++tmp_count;
            }
        }
        
        obj.response_container().height(tallest_container + 60);
        obj.response_container().width(response_container_array[response_container_array.length - 1].widest_item + (current_width_offset + 40));      
    }
    else if(obj.drag_drop_config().response_container_type() == 6)
    {
        var current_height_offset = 20;
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            
        }
    }
    else if(obj.drag_drop_config().response_container_type() == 9)
    {
        var $temp_drop_container = $('#main');
        var $drop_container = $('.starting-drop-target');
        var tmp_count = 0;

        var widest_item = 250;
        var heightOffsets = [20];
        var widthOffset = 20;
        var item_row_count = 0;
        var highest_item = 0;
        
        for(var i = 0, len = $drop_container.length; i < len; ++i)
        {           
            if($drop_container[i].offsetParent !== null)//is visible
            {
                var pep_class = $.pep.peps[obj.pep_objs()[tmp_count].pep_idx].$el[0].className;

                var right_match = pep_class.match(/DFL-drag.*/);

				var cur_width = $('#' + right_match).width();
				if (cur_width === 0)
					$('#'+right_match).html('div.'+right_match+'{height:'+($.pep.peps[obj.pep_objs()[tmp_count].pep_idx].$el[0].clientHeight+2)+'px;width:'+($.pep.peps[obj.pep_objs()[tmp_count].pep_idx].$el[0].clientWidth+10)+'px;}');
								
                var tmp_item = $.pep.peps[obj.pep_objs()[tmp_count].pep_idx].$el.detach();

                $($drop_container[i]).append(tmp_item[0]);
                
                obj.pep_objs()[tmp_count].drop_region($($drop_container[i]));
                obj.pep_objs()[tmp_count].previous_drop_region($($drop_container[i]));
                $.pep.peps[obj.pep_objs()[tmp_count].pep_idx].moveTo(-2 ,-2); 

                if($.pep.peps[obj.pep_objs()[tmp_count].pep_idx].$el.hasClass("DFL-img-response"))
                {
                    obj.pep_objs()[tmp_count].drop_region().attr('style', 'width:'+(tmp_item[0].clientWidth+18)+'px;height:'+(tmp_item[0].clientHeight+18)+'px;');  
                }
                else if($.pep.peps[obj.pep_objs()[tmp_count].pep_idx].$el.hasClass("DFL-text-response"))
                {
                    obj.pep_objs()[tmp_count].drop_region().attr('style', 'width:'+(tmp_item[0].clientWidth-1)+'px;height:'+(tmp_item[0].clientHeight+1)+'px;');  
                }
                else //Size the drop target to the size of the pep object
                {
                    //Get the width of the response container
                    var response_container;
                        response_container = $('.SFL-container-row')[0].clientWidth;
                    obj.pep_objs()[tmp_count].drop_region().attr('style','height:'+(tmp_item[0].clientHeight)+'px;');  

                    obj.pep_objs()[tmp_count].drop_region().attr('style','top:'+heightOffsets[item_row_count]+'px;height:'+(tmp_item[0].clientHeight)+'px;');  
                    $.pep.peps[obj.pep_objs()[tmp_count].pep_idx].moveTo(widthOffset ,heightOffsets[item_row_count]); 
                    
                    if((widthOffset + widest_item + obj.pep_objs()[tmp_count].drop_region()[0].clientWidth) < response_container - 50)
                    {
                        heightOffsets[item_row_count] += obj.pep_objs()[tmp_count].drop_region()[0].clientHeight + 10;
                        if (heightOffsets[item_row_count] > highest_item)
                            highest_item = heightOffsets[item_row_count];
                        widthOffset += obj.pep_objs()[tmp_count].pep()[0].clientWidth+20;
                        ++item_row_count;
                        if(typeof heightOffsets[item_row_count] === 'undefined')
                            heightOffsets[item_row_count] = 20;
                    }
                    else
                    {
                        widthOffset = 20;
                        heightOffsets[item_row_count] += obj.pep_objs()[tmp_count].drop_region()[0].clientHeight + 10;
                                                        
                        if (heightOffsets[item_row_count] > highest_item)
                            highest_item = heightOffsets[item_row_count];
                        item_row_count = 0;                        
                    }
                        $('.SFL-container-row').attr('style','height:'+(highest_item + 10)+'px;');
                }
                $.pep.peps[obj.pep_objs()[tmp_count].pep_idx].activeDropRegions = $($drop_container[i]);
                ++tmp_count;
                
            }
        }      
        //adjust_drag_item_positions(obj);
    }
}

function handle_drag_start(obj, pep_obj, ev, drag_obj)
{
    if(obj.drag_drop_config().starting_position_type() == 1)
    {
        
    }
    else if(obj.drag_drop_config().starting_position_type() == 2)
    {
        var drop = drag_obj.$el.detach();           
        $('body').append(drop);
        drag_obj.moveTo(ev.pep.x-10, ev.pep.y-10);
    }
    else if(obj.drag_drop_config().starting_position_type() == 3)
    {
        
    }
    else if(obj.drag_drop_config().starting_position_type() == 5)
    {
        var drop = drag_obj.$el.detach();           
        $('body').append(drop);
        drag_obj.moveTo(ev.pep.x-10, ev.pep.y-10);
    }
    else if(obj.drag_drop_config().starting_position_type() == 9)
    {
        pep_obj.pep().removeClass('dropped');
        var drop = drag_obj.$el.detach();           
        $('body').append(drop);
        drag_obj.moveTo(ev.pep.x-10, ev.pep.y-10);
    }
}

function handle_drag_event(obj, pep_obj, ev, drag_obj)
{
    if(obj.drag_drop_config().starting_position_type() == 1)
    {
        handleAutoScroll(ev, drag_obj);
    }
    else if(obj.drag_drop_config().starting_position_type() == 2)
    {
            if(drag_obj.$el[0].parentElement.nodeName != 'BODY')
            {
                var drop = drag_obj.$el.detach();           
                $('body').append(drop);            
                drag_obj.moveTo(ev.pep.x-1, ev.pep.y-1);
                alert('this is bad');
            }
            handleAutoScroll(ev, drag_obj);
    }
    else if(obj.drag_drop_config().starting_position_type() == 3)
    {
        handleAutoScroll(ev, drag_obj);
    }
    else if(obj.drag_drop_config().starting_position_type() == 4)
    {
        
    }
    else if(obj.drag_drop_config().starting_position_type() == 5)
    {
        handleAutoScroll(ev, drag_obj);
    }
    else if(obj.drag_drop_config().starting_position_type() == 9)
    {
        handleAutoScroll(ev, drag_obj);
    }   
}

function revert_drag_item(obj, pep_idx, exe_obj)
{
    //$.pep.peps[pep_idx].revert();
    adjust_response_container(obj)
}

function adjust_response_container(obj)
{
    if(obj.drag_drop_config().response_container_type() == 1)
    {   
        var tmp_count = 0;
        var current_height_offset = 20;
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(!obj.pep_objs()[i].dropped())
            {                
                $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(35,current_height_offset);
                current_height_offset += obj.pep_objs()[i].pep()[0].clientHeight+10
                ++tmp_count;
            }
        }
    }
    else if(obj.drag_drop_config().response_container_type() == 2)
    {
        var response_container = undefined;
        for (var i = 0, len = $('.exercises').length; i < len; ++i)
        {   
            var tmp_response_container = $('.exercises')[i];
            if(tmp_response_container.offsetParent !== null)//is visible
            {                    
                response_container = tmp_response_container;
            }
        }
        var widest_item = 0;
        var heightOffsets = [20];
        var widthOffset = 20;
        var item_row_count = 0;
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(!obj.pep_objs()[i].dropped())
            {
                $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(widthOffset,heightOffsets[item_row_count]);
                if(widest_item < obj.pep_objs()[i].pep()[0].clientWidth)
                {
                    widest_item = obj.pep_objs()[i].pep()[0].clientWidth;
                }
                if((widthOffset + widest_item) + obj.pep_objs()[i].pep()[0].clientWidth < response_container.clientWidth - 100)
                {
                    widthOffset += obj.pep_objs()[i].pep()[0].clientWidth+10;
                    heightOffsets[item_row_count] += obj.pep_objs()[i].pep()[0].clientHeight+10;
                    ++item_row_count;
                    if( typeof heightOffsets[item_row_count] === 'undefined' )
                    {
                        heightOffsets[item_row_count] = 20;
                    }
                }
                else
                {
                    widthOffset = 20;
                    heightOffsets[item_row_count] += obj.pep_objs()[i].pep()[0].clientHeight+10;                      
                    item_row_count = 0;                        
                }
            }
        }
        
    }
    else if(obj.drag_drop_config().response_container_type() == 3)
    {
        
    } 
    else if(obj.drag_drop_config().response_container_type() == 4)
    {
        var tmp_count = 0;
        var current_height_offset = 20;
        var response_container_class = '.response_container';
    
        var response_container = undefined;
        for (var i = 0, len = $(''+response_container_class).length; i < len; ++i)
        {   
            response_container = $(''+response_container_class)[i];        
            if(response_container.offsetLeft > 0)//is visible
            {                    
                break;                
            }
        }
        
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(!obj.pep_objs()[i].dropped())
            {                
                $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(response_container.offsetLeft+15,current_height_offset);  
                current_height_offset += obj.pep_objs()[i].pep()[0].clientHeight+10
                ++tmp_count;
            }
        }        
    }
    else if(obj.drag_drop_config().response_container_type() == 5)
    {
        // type 5 is only for MF1
        var current_question = 0;
        var widest_item = 0;
        var item_height = 0;
        var current_height_offset = 10;
        var total_response_width = 20;
        var tallest_container = 0;
        var width_buffer = 40;
        var response_container_array = new Array(obj.response_container_count());

        if(lms_config.product_type.match(/sena|me_english/gi)){
            if(typeof viewModel.loaded != 'undefined' && !viewModel.loaded()){
                width_buffer = 80;
            }
        }

        for (var i = 0; i < response_container_array.length; ++i)
        {
            response_container_array[i] = ({"widest_item": 0, "current_height_offset": 10});
        }

        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if (!obj.pep_objs()[i].dropped())
            {
                current_question = parseInt(obj.pep_objs()[i].pep()[0].id);

                if (tallest_container < response_container_array[parseInt(obj.pep_objs()[i].pep()[0].id)].current_height_offset + 20)
                {
                    tallest_container = response_container_array[parseInt(obj.pep_objs()[i].pep()[0].id)].current_height_offset + 20;
                }
          
                $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(15, response_container_array[parseInt(obj.pep_objs()[i].pep()[0].id)].current_height_offset);
                response_container_array[parseInt(obj.pep_objs()[i].pep()[0].id)].current_height_offset += obj.pep_objs()[i].pep()[0].clientHeight+10;
                
                if(response_container_array[parseInt(obj.pep_objs()[i].pep()[0].id)].widest_item < obj.pep_objs()[i].pep()[0].offsetWidth)
                {
                    //console.log(obj.pep_objs()[i].pep()[0].offsetWidth);
                    response_container_array[parseInt(obj.pep_objs()[i].pep()[0].id)].widest_item = obj.pep_objs()[i].pep()[0].offsetWidth;
                    item_height = obj.pep_objs()[i].pep()[0].clientHeight + 10;
                }
            }
            
        }
  
        var $response_container = $('.MF1-response-group');
        var tmp_count = 0;
        var current_width_offset = 20;
        
        for(var i = 0, len = $response_container.length; i < len; ++i)
        {           
            if($response_container[i].offsetParent !== null)//is visible
            {       
                //console.log(response_container_array[tmp_count].widest_item);
                var style_string = "width:" + (response_container_array[tmp_count].widest_item + width_buffer) + "px;" 
                    + "top:" + 20 + "px;" + "height:" + response_container_array[tmp_count].current_height_offset +"px; margin-bottom: " + 20 +"px;";
                    
                $($response_container[i]).attr('style', style_string);
                
                current_width_offset += response_container_array[tmp_count].widest_item + width_buffer;
                $response_container[i].clientHeight = response_container_array[tmp_count].current_height_offset + 20;
                $response_container[i].clientWidth = response_container_array[tmp_count].widest_item + 20;

                 ++tmp_count;
            }
        }
        
        obj.response_container().height(tallest_container + 60);
        obj.response_container().width(response_container_array[response_container_array.length - 1].widest_item + (current_width_offset + 40)+50);
    }
}

function handle_drop(obj, pep_obj)
{
    if(obj.drag_drop_config().drop_type() == 1)
    {
        pep_obj.pep().addClass('dropped');
        attach_drag_item_to_drop_container(pep_obj);
        product_helper_adjust_single_drop_positions();
    }
    else if(obj.drag_drop_config().drop_type() == 2)
    {
        pep_obj.pep().addClass('dropped');
        attach_drag_item_to_drop_container(pep_obj);
    }
    else if(obj.drag_drop_config().drop_type() == 3)
    {
        
    }
    else if(obj.drag_drop_config().drop_type() == 4)
    {
        pep_obj.pep().addClass('dropped');
        pep_obj.pep().removeClass('scalable');
        attach_drag_item_to_drop_container(pep_obj);
        // var test = pep_obj.drop_region()[0];
        // var question_id = pep_obj.drop_region()[0].id;
        // var sec_pos = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].questions()[question_id].question()[0].content.section_pos;
        // var img_pos = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].questions()[0].question()[0].content.img_pos;
        // var drop_dimensions = { "x" : pep_obj.drop_region()[0].parentElement.parentElement.clientWidth, "y" : pep_obj.drop_region()[0].parentElement.parentElement.clientHeight};
        // var container_width = viewModel.labs()[viewModel.selected_lab()].container_width();
        // var container_height = viewModel.labs()[viewModel.selected_lab()].container_height();
        // var drop_to_ex_width_ratio = drop_dimensions.x / container_width;
        // var new_sec_pos_x_percent = ((drop_to_ex_width_ratio * sec_pos.x()) + img_pos.x())/100;
        // var new_sec_pos_x = new_sec_pos_x_percent * container_width;
        // var drop_to_ex_height_ratio = drop_dimensions.y / container_height;
        // var new_sec_pos_y_percent = ((drop_to_ex_height_ratio * sec_pos.y()) + img_pos.y())/100;
        // var new_sec_pos_y = new_sec_pos_y_percent * container_height;
        // var section_offsets = { "x" : 0, "y" : 0};
        // var drop_offsets = { "x" : 0, "y" : 0};        
        //$.pep.peps[pep_obj.pep_idx].moveTo(new_sec_pos_x,new_sec_pos_y);
    }
    else if(obj.drag_drop_config().drop_type() == 6)
    {
        
    }    
    else if(obj.drag_drop_config().drop_type() == 7)
    {
        pep_obj.pep().addClass('dropped');
        attach_drag_item_to_drop_container(pep_obj);
        ////console.log($(".dropped").parents());
        $('.pep-dpa').removeClass('pep-dpa');
    }
}

function handle_revert(obj, pep_obj)
{   
    if(obj.drag_drop_config().revert_type() == 1)
    {
        if(pep_obj.dropped())
        {
            pep_obj.pep().removeClass('dropped');
            pep_obj.drop_region().attr('style','');
            pep_obj.dropped(false);
            pep_obj.drop_region(-1);            
        }
        for (var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {            
            if(pep_obj.pep_idx == obj.pep_objs()[i].pep_idx)
            {
                //detach_drag_item_from_drop_container(pep_obj, $.pep.peps[obj.pep_objs()[i].pep_idx]);
                return_item_to_response_container(obj.drag_drop_config().response_container_type(),obj.pep_objs()[i]);
            }            
        }
    }
    else if(obj.drag_drop_config().revert_type() == 2)
    {
        attach_drag_item_to_drop_container(pep_obj);        
    }
    else if(obj.drag_drop_config().revert_type() == 3)
    {
        for (var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(obj.pep_objs()[i].dropped())
            {
                if(pep_obj.pep_idx == obj.pep_objs()[i].pep_idx)
                {
                    //detach_drag_item_from_drop_container(pep_obj, $.pep.peps[obj.pep_objs()[i].pep_idx]);
                    return_item_to_response_container(obj.drag_drop_config().response_container_type(),obj.pep_objs()[i]);
                }
            }
        }
    }
    else if(obj.drag_drop_config().revert_type() == 4)
    {
        pep_obj.pep().removeClass('dropped');
        pep_obj.pep().addClass('scalable');
        pep_obj.dropped(false);
        return_item_to_response_container(obj.drag_drop_config().response_container_type(),pep_obj);
    }
    else if(obj.drag_drop_config().revert_type() == 5)
    {
        pep_obj.pep().removeClass('dropped');        
        pep_obj.dropped(false);
        return_item_to_response_container(obj.drag_drop_config().response_container_type(),pep_obj);
    }
    else if(obj.drag_drop_config().revert_type() == 6)
    {       
        var width = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].drag_area_x();
        var height = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].drag_area_y();
        var q_id = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].current_question();
        var used_positions = [];
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {            
            used_positions.push(obj.pep_objs()[i].position());
            // $.pep.peps[obj.pep_objs()[i].pep_idx].options.shouldEase = false;            
        }
        var new_position = false;
        var position = 0;
        while (!new_position)
        {
            new_position = true;
            position = product_helper_get_random_percent_range(1,25);                                                    
            for(var w = 0, w_len = used_positions.length; w < w_len; ++w)
            {
                if(position == used_positions[w])
                {
                    new_position = false;
                    ////console.log("this is nuts");
                }
            }
        }
        var x_px = (((position%5)*20)/100) * width;
        var y_px = ((Math.floor(position/5.0)*20)/100) * height;
        $.pep.peps[pep_obj.pep_idx].moveTo(x_px,y_px);
        pep_obj.position(position);
        // var width = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].drag_area_x();
        // var height = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].drag_area_y();        
        // for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        // {            
            // // $.pep.peps[obj.pep_objs()[i].pep_idx].options.shouldEase = false;                
            // $.pep.peps[pep_obj.pep_idx].moveTo(product_helper_get_random_percent(width-20),product_helper_get_random_percent(height-20));
        // }
    }
    else if(obj.drag_drop_config().revert_type() == 8)
    {       
        var width = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].drag_area_x();
        var height = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].drag_area_y();
        var q_id = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].current_question();
        var used_positions = [6,7];

        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {            
            used_positions.push(obj.pep_objs()[i].position());
            // $.pep.peps[obj.pep_objs()[i].pep_idx].options.shouldEase = false;            
        }
        ////console.log(used_positions);
        var new_position = false;
        var position = 0;
        while (!new_position)
        {
            new_position = true;
            position = product_helper_get_random_percent_range(1,40);                                                    
            for(var w = 0, w_len = used_positions.length; w < w_len; ++w)
            {
                if(position == used_positions[w])
                {
                    new_position = false;
                    ////console.log("this is nuts");
                }
            }
        }
        var x_px = (((position%8)*12.5)/100) * width;
        var y_px = ((Math.floor(position/8.0)*20)/100) * height;
        $.pep.peps[pep_obj.pep_idx].moveTo(x_px,y_px);
        pep_obj.position(position);
        // var width = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].drag_area_x();
        // var height = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].drag_area_y();        
        // for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        // {            
            // // $.pep.peps[obj.pep_objs()[i].pep_idx].options.shouldEase = false;                
            // $.pep.peps[pep_obj.pep_idx].moveTo(product_helper_get_random_percent(width-20),product_helper_get_random_percent(height-20));
        // }
    }
    else if(obj.drag_drop_config().revert_type() == 9)
    {
        pep_obj.pep().removeClass('dropped');
        pep_obj.dropped(false);
        pep_obj.drop_region(pep_obj.previous_drop_region());
        
        var tmp_item = $.pep.peps[pep_obj.pep_idx].$el.detach();
        pep_obj.drop_region().append(tmp_item);
        
        $.pep.peps[pep_obj.pep_idx].moveTo(-2,-2);          
    }

}

function attach_drag_item_to_drop_container(pep_obj)
{
    var tmp_item = $.pep.peps[pep_obj.pep_idx].$el.detach();
    pep_obj.drop_region().append(tmp_item);
    //pep_obj.drop_region().attr('style', 'width:'+(tmp_item[0].clientWidth+2)+'px;height:'+(tmp_item[0].clientHeight+2)+'px;');    
    $.pep.peps[pep_obj.pep_idx].velocityQueue = [];
    $.pep.peps[pep_obj.pep_idx].moveTo(pep_obj.drop_region()[0].offsetLeft,pep_obj.drop_region()[0].offsetTop); 

}

function detach_drag_item_from_drop_container(obj, pep_obj)
{
    pep_obj.drop_region().attr('style','');
    for (var i = 0, len = obj.pep_objs().length; i < len; ++i)
    {
        if(obj.pep_objs()[i].dropped())
        {
            if(pep_obj.pep_idx == obj.pep_objs()[i].pep_idx)
            {
                //detach_drag_item_from_drop_container(pep_obj, $.pep.peps[obj.pep_objs()[i].pep_idx]);
                return_item_to_response_container(obj.drag_drop_config().response_container_type(),obj.pep_objs()[i]);
            }
        }
    }
    //return_item_to_response_container(obj.pep_objs()[pep_obj.pep_idx]);
    // pep_obj.dropped(false);
    // for (var i = 0, len = $('#response_container').length; i < len; ++i)
    // {   
        // var response_container = $('#response_container')[i];
        // if(response_container.offsetParent !== null)//is visible
        // {                    
            // $(response_container).append(tmp_item);            
            // drag_obj.moveTo(pep_obj.offset_x(),pep_obj.offset_y());
        // }
    // }
    
}

function handle_double_drop(obj, pep_obj)
{
    if(obj.drag_drop_config().double_drop_type() == 1)
    {
        for (var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(obj.pep_objs()[i].dropped())
            {
                if(pep_obj.drop_region()[0].id == obj.pep_objs()[i].drop_region()[0].id && pep_obj.pep_idx != obj.pep_objs()[i].pep_idx
                    && obj.pep_objs()[i].drop_region()[0].children.length >= 2)
                {
                    
                    //detach_drag_item_from_drop_container(pep_obj, $.pep.peps[obj.pep_objs()[i].pep_idx]);
                    return_item_to_response_container(obj.drag_drop_config().response_container_type(), obj.pep_objs()[i]);
                }
            }
        }
    }
    else if(obj.drag_drop_config().double_drop_type() == 2)
    {
        for (var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {            
            ////console.log('previous ' + obj.pep_objs()[i].previous_drop_region()[0].id + 'obj ped idx ' + obj.pep_objs()[i].pep_idx + ' dragged ' +pep_obj.previous_drop_region()[0].id);
            if(pep_obj.drop_region()[0].id == obj.pep_objs()[i].drop_region()[0].id && obj.pep_objs()[i].previous_drop_region()[0].id == obj.pep_objs()[i].drop_region()[0].id)
            {                
                ////console.log(pep_obj.previous_drop_region()[0].id);
                var tmp_item = $.pep.peps[obj.pep_objs()[i].pep_idx].$el.detach();
                if(obj.progress_restore() === false)
                {
                    obj.pep_objs()[i].dropped(true);
                    obj.pep_objs()[i].pep().addClass('dropped');
                }                
                obj.pep_objs()[i].drop_region(pep_obj.previous_drop_region());
                obj.pep_objs()[i].previous_drop_region(pep_obj.previous_drop_region());
                $(pep_obj.previous_drop_region()).append(tmp_item); 
                pep_obj.previous_drop_region(pep_obj.drop_region());
                ////console.log(obj.pep_objs()[i].previous_drop_region()[0].id);
                
            }            
        }
    }
    else if(obj.drag_drop_config().double_drop_type() == 3)
    {
        
    }
    else if(obj.drag_drop_config().double_drop_type() == 4)
    {
        
    }
    else if(obj.drag_drop_config().double_drop_type() == 7)
    {
        for (var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {            
            if(pep_obj.drop_region()[0].id == obj.pep_objs()[i].drop_region()[0].id && pep_obj.pep()[0].id == obj.pep_objs()[i].pep().context.id)
            {
                ////console.log(pep_obj.drop_region()[0].id + " " + obj.pep_objs()[i].drop_region()[0].id+ " " +obj.pep_objs()[i].previous_drop_region()[0].id+ " " +pep_obj.previous_drop_region()[0].id);

                if(obj.pep_objs()[i].previous_drop_region()[0].id == pep_obj.previous_drop_region()[0].id)
                {
                    ////console.log('you just moved me');
                    if(pep_obj.drop_region().hasClass("drop-target"))
                    {
                        var tmp_item = $.pep.peps[obj.pep_objs()[i].pep_idx].$el.detach();
                       // //console.log(tmp_item);
                        obj.pep_objs()[i].dropped(false);
                        obj.pep_objs()[i].pep().removeClass('dropped');


                        obj.pep_objs()[i].drop_region(obj.pep_objs()[i].previous_drop_region());
                        $(obj.pep_objs()[i].previous_drop_region()).append(tmp_item);
                    }
                }
                else
                {
                    ////console.log('im the one that needs to be sent back');
                    var tmp_item = $.pep.peps[obj.pep_objs()[i].pep_idx].$el.detach();
                    obj.pep_objs()[i].dropped(false);
                    obj.pep_objs()[i].pep().removeClass('dropped'); 

                    obj.pep_objs()[i].drop_region(obj.pep_objs()[i].previous_drop_region());
                    $(obj.pep_objs()[i].previous_drop_region()).append(tmp_item);
                }
            }
        }
    }
    else if(obj.drag_drop_config().double_drop_type() == 8)
    {
        for (var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(obj.pep_objs()[i].dropped())
            {
                if(pep_obj.drop_region()[0].id == obj.pep_objs()[i].drop_region()[0].id && pep_obj.pep_idx != obj.pep_objs()[i].pep_idx
                    && obj.pep_objs()[i].drop_region()[0].children.length >= 2)
                {
                    obj.pep_objs()[i].pep().removeClass('dropped');
                    obj.pep_objs()[i].dropped(false);
                    obj.pep_objs()[i].drop_region(obj.pep_objs()[i].previous_drop_region());
                    
                    var tmp_item = $.pep.peps[obj.pep_objs()[i].pep_idx].$el.detach();
                    obj.pep_objs()[i].drop_region().append(tmp_item);
                    $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(-2,-2);     
                }
            }
        }
    }
}

//accepts a pep obj from viewmodel
function return_item_to_response_container(response_container_type, pep_obj)
{
    // $.pep.peps[pep_obj.pep_idx].options.shouldEase = true;
    var tmp_item = $.pep.peps[pep_obj.pep_idx].$el.detach();
    var response_container_class = '.response_container';
    
    if (response_container_type == 5)
        response_container_class = '.MF1-response-group-'+ pep_obj.pep()[0].id;
   
    for (var i = 0, len = $(''+response_container_class).length; i < len; ++i)
    {   
        var response_container = $(''+response_container_class)[i];        
        if(response_container.offsetLeft > 0)//is visible
        {                    
            $(response_container).append(tmp_item);             
            $.pep.peps[pep_obj.pep_idx].moveTo(pep_obj.offset_x(),pep_obj.offset_y());
        }
    }
    if(pep_obj.dropped())
    {
        pep_obj.drop_region().attr('style','');
    }
    pep_obj.dropped(false);
    pep_obj.pep().removeClass('dropped');
    pep_obj.drop_region(-1);
    
}

function calculate_drag_drop_state(obj, exercise_obj)
{
    if(obj.drag_drop_config().state_calc_type() == 1)
    {   //set all questions to -1 state to clear them
        for (var i = 0, len = exercise_obj.questions().length; i < len; ++i)
        {
            if (lms_config.product_type.match(/sena|me_english|new_scholar/i))
            {
                if ( i < exercise_obj.questions().length - 1 || exercise_obj.questions()[i]._data()[0].contents()[0].type() != "rec")
                    exercise_obj.questions()[i].select_response(ko.observable(-1));
            }
            else
                exercise_obj.questions()[i].select_response(ko.observable(-1));
        }//update state for dropped objects
        for (var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(obj.pep_objs()[i].dropped() || obj.drag_drop_config().drag_item_adjust_type() == 2 || obj.drag_drop_config().drag_item_adjust_type() == 10)
            {
                var question_num = obj.pep_objs()[i].drop_region()[0].id
                
                if(obj.pep_objs()[i].drop_region()[0].id == obj.pep_objs()[i].correct_drop_region() && obj.pep_objs()[i].response_num() <= 1)
                {                    
                    exercise_obj.questions()[question_num].select_response(ko.observable(1));
                }
                else
                {
                    exercise_obj.questions()[question_num].select_response(ko.observable(0));
                }
            }            
        }
    }
    else if(obj.drag_drop_config().state_calc_type() == 2)
    {
        for (var i = 0, len = exercise_obj.questions().length; i < len; ++i)
        {
            for (var w = 0, tmp_len = exercise_obj.questions()[i].responses().length; w < tmp_len; ++w)
            {
                exercise_obj.questions()[i].responses()[w].selected(0);
            }
            
            //Added for DFL incase of any questions that don't have any responses. The first empty response
            //Will be used to set the question as correct.
            if (exercise_obj.questions()[i].responses().length == 1)
                exercise_obj.questions()[i].select_response(ko.observable(0));
            
        }
        for (var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(obj.pep_objs()[i].dropped())
            {
                var question_num = obj.pep_objs()[i].drop_region()[0].id
                if (question_num == ''){continue;}
                if(obj.pep_objs()[i].drop_region()[0].id == obj.pep_objs()[i].correct_drop_region())
                {                    
                    exercise_obj.questions()[question_num].responses()[obj.pep_objs()[i].response_num()].selected(1);
                }
                else
                {
                    exercise_obj.questions()[question_num].responses()[0].selected(1);
                }
            }            
        }
    }
    else if(obj.drag_drop_config().state_calc_type() == 4)
    {
        
    }
    else if(obj.drag_drop_config().state_calc_type() == 5)
    {
        for (var i = 0, len = exercise_obj.questions().length; i < len; ++i)
        {
            for (var w = 0, tmp_len = exercise_obj.questions()[i].responses().length; w < tmp_len; ++w)
            {
                exercise_obj.questions()[i].responses()[w].selected(0);
            }
            //exercise_obj.questions()[i].select_response(ko.observable(-1));
        }
        for (var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(obj.pep_objs()[i].dropped())
            {
                var question_num = obj.pep_objs()[i].drop_region()[0].id

                exercise_obj.questions()[question_num].responses()[obj.pep_objs()[i].response_num()].selected(1);
            }
        }
    }
    else if(obj.drag_drop_config().state_calc_type() == 6)
    {        
        for (var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(typeof $.pep.peps[obj.pep_objs()[i].pep_idx].activeDropRegions !== 'undefined' && $.pep.peps[obj.pep_objs()[i].pep_idx].activeDropRegions.length > 1)
            {                
                var question_num = $.pep.peps[obj.pep_objs()[i].pep_idx].activeDropRegions[0][0].id;
                exercise_obj.questions()[question_num].responses()[obj.pep_objs()[i].response_num()].selected(1);
            }
        }
    }
    if(obj.drag_drop_config().state_calc_type() == 7)
    {   
        var total_responses = 0;

        for (var r = 0, len = exercise_obj.questions().length; r < len; ++r)
        {
            //Make sure that any rec questions are ignored, because we don't want them reset everytime an item is dragged
            if(exercise_obj.questions()[r]._data()[0].contents()[0].type() != "rec")
                exercise_obj.questions()[r].select_response(ko.observable(-1));
        }

        for (var quest_num = 0, quest_num_len = exercise_obj.questions().length; quest_num < quest_num_len; ++quest_num)
        {
            if(exercise_obj.questions()[quest_num]._data()[0].contents()[0].type() == "rec")
            {
                continue;
            }

            //correct_letter keeps trak of how many letters are in their correct places
            var correct_letters = 0;

            //this storm of arrays and dictionarys is what I use to determin the order of the placed letters
            //which i then check against the responses
            var word_dict = [];
            var number_array = []
            //for the length of responses - 1 (= the number of pep in that question) make a dictionary of the words and their assosiated places
            //console.log('Checking WSB question : ' + quest_num);
            for (var i = 0, i_len = exercise_obj.questions()[quest_num].responses().length-1; i < i_len; ++i)
            {
                if(exercise_obj.questions()[quest_num].responses().length <= obj.pep_objs()[i + total_responses].drop_region()[0].id){
                    number_array.push(obj.pep_objs()[i + total_responses].drop_region()[0].id);
                    word_dict.push({"word" : exercise_obj.questions()[quest_num].responses()[obj.pep_objs()[i + total_responses].correct_drop_region()+1 - total_responses]._data()[0].content() , "number" : obj.pep_objs()[i + total_responses].drop_region()[0].id});
                }
            }
            number_array.sort(function(a, b){return a-b});
            //console.log('The dropped pep_obs have the following ids: ' + number_array);
            //console.log('The words/letters associated with these dropped pep_objs are : ' + word_dict);
            if(number_array.length == exercise_obj.questions()[quest_num].responses().length - 1){ //-1 because of first wrong response that doesn't count
                //console.log('WSB question ' + quest_num + ' is fully answered');
                var temp_array = [];
                for (var i = 0, i_len = number_array.length; i < i_len; ++i)
                {
                    for (var j = 0, j_len = word_dict.length; j< j_len; ++j)
                    {
                        if(word_dict[j].number == number_array[i])
                        {
                            temp_array.push(word_dict[j].word);
                        }
                    }
                }
                for (var i = 0, i_len = temp_array.length; i < i_len; ++i)
                {
                    //console.log('WSB is looking for '+ exercise_obj.questions()[quest_num].responses()[i+1]._data()[0].content() + ' and got '+ temp_array[i])
                    if (temp_array[i] == exercise_obj.questions()[quest_num].responses()[i+1]._data()[0].content()){
                        exercise_obj.questions()[quest_num].responses()[i+1].selected(1);
                        correct_letters++;
                    }
                    else{
                        exercise_obj.questions()[quest_num].responses()[i+1].selected(0);
                    }

                    if (correct_letters == exercise_obj.questions()[quest_num].responses().length-1)
                    {
                        exercise_obj.questions()[quest_num].responses()[0].selected(0)
                    }
                    else
                    {
                        exercise_obj.questions()[quest_num].responses()[0].selected(1);
                    }
                }
            }
            else{
                for(var r = 0, r_len = exercise_obj.questions()[quest_num].responses().length; r<r_len; ++r){
                    exercise_obj.questions()[quest_num].responses()[r].selected(0);
                }
            }
    
            total_responses += exercise_obj.questions()[quest_num].responses().length-1;
        }
    }
}

function adjust_drag_item_positions(obj, previous_width, previous_height)
{
    if(obj.drag_drop_config().drag_item_adjust_type() == 1)
    {   
        var tmp_count = 0;
        //double pass first loop sizes all containers second positions items
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(obj.pep_objs()[i].dropped())
            {
                // $.pep.peps[obj.pep_objs()[i].pep_idx].options.shouldEase = false;
                obj.pep_objs()[i].drop_region().attr('style', 'width:'+($.pep.peps[obj.pep_objs()[i].pep_idx].$el[0].clientWidth+2)+'px;height:'+($.pep.peps[obj.pep_objs()[i].pep_idx].$el[0].clientHeight+2)+'px;');                
                ++tmp_count;
            }
        }
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(obj.pep_objs()[i].dropped())
            {
                // $.pep.peps[obj.pep_objs()[i].pep_idx].options.shouldEase = false;                
                $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(obj.pep_objs()[i].drop_region()[0].offsetLeft,obj.pep_objs()[i].drop_region()[0].offsetTop);
                ++tmp_count;
            }
        }
    }
    else if(obj.drag_drop_config().drag_item_adjust_type() == 2)
    {
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(obj.drag_drop_config().state_calc_type() == 7)
            {
                obj.pep_objs()[i].drop_region().attr('style', 'width:'+($.pep.peps[obj.pep_objs()[i].pep_idx].$el[0].clientWidth)+'px;height:'+($.pep.peps[obj.pep_objs()[i].pep_idx].$el[0].clientHeight+2)+'px;');
                //$('.MT1-question_'+ex_num+'_'+obj.activeDropRegions[0][0].id+'_'+lab_num).attr('style', 'height:'+(drop[0].clientHeight+2)+'px;');
            }
            else
            {
                //obj.pep_objs()[i].drop_region().attr('style', 'width:'+($.pep.peps[obj.pep_objs()[i].pep_idx].$el[0].clientWidth+2)+'px;height:'+($.pep.peps[obj.pep_objs()[i].pep_idx].$el[0].clientHeight+2)+'px;');
                //$('.MT1-question_'+ex_num+'_'+obj.activeDropRegions[0][0].id+'_'+lab_num).attr('style', 'height:'+(drop[0].clientHeight+2)+'px;');
            }
            
        }
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(obj.pep_objs()[i].dropped() || obj.drag_drop_config().state_calc_type() == 7)
            {
                $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(obj.pep_objs()[i].drop_region()[0].offsetLeft,obj.pep_objs()[i].drop_region()[0].offsetTop);
            }
        }
        
    }
	
    else if(obj.drag_drop_config().drag_item_adjust_type() == 3)
    {
        var drop_region_heights = [];
        var dropped_item_positions = [];
        var changed_regions = [];
        
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(obj.pep_objs()[i].dropped())
            {
                //Check to see if the array element exists or not
                if (typeof drop_region_heights[obj.pep_objs()[i].drop_region()[0].id] == 'undefined')
                {
                    //Create the array element
                    drop_region_heights[obj.pep_objs()[i].drop_region()[0].id] = obj.pep_objs()[i].pep()[0].clientHeight+10;
                }
                else //Append to the array 
                    drop_region_heights[obj.pep_objs()[i].drop_region()[0].id] += obj.pep_objs()[i].pep()[0].clientHeight+10;

                //$('.MT1-question_'+ex_num+'_'+obj.activeDropRegions[0][0].id+'_'+lab_num).attr('style', 'height:'+(drop[0].clientHeight+2)+'px;');
            }
        }
        
        for(var w = 0, len = drop_region_heights.length; w < len; ++w)
        {
            var heightOffset = [];
            var current_drop_region_id = -1;
            
            for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
            {
                if(obj.pep_objs()[i].dropped())
                {
                    //Set the current drop region
                    current_drop_region_id = obj.pep_objs()[i].drop_region()[0].id;
                    
                    if (typeof heightOffset[current_drop_region_id] == 'undefined')
                    {
                        heightOffset[current_drop_region_id] = 0;
                    }
                    
                    //Make sure that each container doesn't go smaller then the default.
                    //Will only resize when the container needs to get bigger.
                    if (drop_region_heights[current_drop_region_id] <= 100)
                        drop_region_heights[current_drop_region_id] = 100;
                    
                    //Set the drop region width and height
                    if(obj.drag_drop_config().response_container_type() != 9 )
                        obj.pep_objs()[i].drop_region().attr('style', 'width:'+($.pep.peps[obj.pep_objs()[i].pep_idx].$el[0].clientWidth+4)+'px;height:'+(drop_region_heights[current_drop_region_id])+'px;');
                    //Move the response to the container
                    $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(0,heightOffset[current_drop_region_id]);
                    //Add the height offset so the next response is positioned properly
                    heightOffset[current_drop_region_id] += $.pep.peps[obj.pep_objs()[i].pep_idx].$el[0].clientHeight+10;               
                }
            }     
        }
    }
    else if(obj.drag_drop_config().drag_item_adjust_type() == 4)
    {  
        //must move to px value of percentage
        // var container_width = viewModel.main_container_width();
        // var container_height = viewModel.main_container_height();
        // for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        // {
            // var offset_left = $.pep.peps[obj.pep_objs()[i].pep_idx].$el[0].offsetLeft;
            // var position_ratio = (offset_left/previous_width);
            // var offset_top = $.pep.peps[obj.pep_objs()[i].pep_idx].$el[0].offsetTop;
            // var top_position_ratio = 1.0*(offset_top/previous_height);
            // //console.log(top_position_ratio);
            // var top_px_position = container_height * top_position_ratio;
            // //console.log(top_px_position);
            // var px_position = container_width * position_ratio;
            // $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(px_position,top_px_position); 
            // var test = $.pep.peps[obj.pep_objs()[i].pep_idx].initialPosition;
            // ////console.log(test);
        // }
        // for(var i = 0, len = obj.scalables().length; i < len; ++i)
        // {
            // var ratio = obj.scalables()[i].el.clientHeight / container_height;
            // var test = obj.scalables()[i].el;
            // var new_width = obj.scalables()[i].el.clientWidth * ratio;
            // var style_str = 'height:'+obj.scalables()[i].el.clientHeight+'px;width:'+new_width+'px;'
            // //console.log(style_str);
            // ////console.log(obj.scalables()[i].clientHeight+' container height ' + container_height);
        // }
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(obj.pep_objs()[i].dropped())
            {
                // $.pep.peps[obj.pep_objs()[i].pep_idx].options.shouldEase = false;                
                $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(obj.pep_objs()[i].drop_region()[0].offsetLeft,obj.pep_objs()[i].drop_region()[0].offsetTop);
                ++tmp_count;
            }
        }
    }
	
	// for DFL only, adjusts pep obj and starting drop area dimensions based on its content
	else if (obj.drag_drop_config().drag_item_adjust_type() == 5) {
		var pep_objs, content_height, content_width, pep_obj, starting_drop_area, pep_content, extra_height;
		pep_objs = obj.pep_objs();
		for (var i = 0; i < pep_objs.length; i++) {
			pep_obj = pep_objs[i].pep()[0]; // the current pep (draggable div)
			pep_content = $(pep_obj).find('.DFL-content')[0]; // get content
			////console.log(pep_content, pep_content.clientWidth, pep_content.clientHeight);
			
			extra_height = $(pep_content).hasClass('DFL-image') ? 20 : 2; // account for padding, etc.

			if (pep_content.clientWidth > 400) { // its too long and should break line, make it so
				$(pep_content).css('white-space', 'normal');
			}
			
			// get the pep content dimensions
			content_height = pep_content.clientHeight;
			content_width = pep_content.clientWidth;
			starting_drop_area = pep_objs[i].previous_drop_region();
			
			// update pep dimensions if its contents have dimensions
			if (content_height && content_width) {
				$(pep_obj).width(content_width);
				$(starting_drop_area).width(content_width + 16);
				$(pep_obj).height(content_height); 
				$(starting_drop_area).height(content_height + extra_height); 
			} 
		}
	}	
	
	
    else if(obj.drag_drop_config().drag_item_adjust_type() == 6)
    {          
        var width = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].drag_area_x();
        var height = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].drag_area_y();
        var q_id = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].current_question();
        var used_positions = [];
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {            
            // $.pep.peps[obj.pep_objs()[i].pep_idx].options.shouldEase = false;
            if(obj.pep_objs()[i].pep()[0].id == q_id || q_id == -1)
            {
                var position = 0;
                var new_position = false;
                while (!new_position)
                {
                    new_position = true;
                    position = product_helper_get_random_percent_range(1,25);                                                    
                    for(var w = 0, w_len = used_positions.length; w < w_len; ++w)
                    {
                        if(position == used_positions[w])
                        {
                            new_position = false;                            
                        }
                    }
                }
                used_positions.push(position);
                var x_px = (((position%5)*20)/100) * width;
                var y_px = ((Math.floor(position/5.0)*20)/100) * height;               
                $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(x_px,y_px);
                obj.pep_objs()[i].position(position);
                ++tmp_count;
            }
        }
    } 
    else if(obj.drag_drop_config().drag_item_adjust_type() == 8)
    {          
        var width = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].drag_area_x();
        var height = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].drag_area_y();
        var q_id = viewModel.labs()[viewModel.selected_lab()].exercises()[viewModel.labs()[viewModel.selected_lab()].selected_exercise()].current_question();
        var used_positions = [6,7];
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {            
            // $.pep.peps[obj.pep_objs()[i].pep_idx].options.shouldEase = false;
            if(obj.pep_objs()[i].pep()[0].id == q_id || q_id == -1)
            {
                var position = 0;
                var new_position = false;
                while (!new_position)
                {
                    new_position = true;
                    position = product_helper_get_random_percent_range(1,40);                                                    
                    for(var w = 0, w_len = used_positions.length; w < w_len; ++w)
                    {
                        if(position == used_positions[w])
                        {
                            new_position = false;                            
                        }
                    }
                }
                used_positions.push(position);
                var x_px = (((position%8)*12.5)/100) * width;
                var y_px = ((Math.floor(position/8.0)*20)/100) * height;               
                $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(x_px,y_px);
                obj.pep_objs()[i].position(position);
                ++tmp_count;
            }
        }
    } 
    else if(obj.drag_drop_config().drag_item_adjust_type() == 10)
    {
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            //Resize the drop container to be the size of the pep object
            obj.pep_objs()[i].drop_region().attr('style', 'width:'+($.pep.peps[obj.pep_objs()[i].pep_idx].$el[0].clientWidth+2)+'px;height:'+($.pep.peps[obj.pep_objs()[i].pep_idx].$el[0].clientHeight+2)+'px;');
        }
        
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            //Attempt to center the pep object on the MT1 question div
            //Get the height of the MT1 question container div
            var element_height = $.pep.peps[obj.pep_objs()[i].pep_idx].el.parentElement.parentElement.parentElement.parentElement.clientHeight / 2
            //Subtract the height of the pep object 
            element_height -= $.pep.peps[obj.pep_objs()[i].pep_idx].el.clientHeight / 2;
            
            //Subtract another 2 to take into account the 2px border on the top
            element_height -= 2;
            
            //Move the pep object to the new area
            $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(obj.pep_objs()[i].drop_region()[0].offsetLeft,obj.pep_objs()[i].drop_region()[0].offsetTop + element_height);
        }
    }
    else if(obj.drag_drop_config().drag_item_adjust_type() == 11)
    {
        //RESIZE THE SFL RESPONSE CONTAINER -- Same as Init
        var tmp_count = 0;
        var $drop_container = $('.starting-drop-target');
        
        //Get the width of the response container
        for(var k = 0, k_len = $('.SFL-container-row').length; k < k_len; ++k)
        {
            if($('.SFL-container-row')[k].offsetParent !== null)//is visible
            { 
                var response_container = $('.SFL-container-row')[k].clientWidth;
            }
        }
        var widest_item = 250;
        var heightOffsets = [20];
        var widthOffset = 20;
        var item_row_count = 0;
        var highest_item = 0;
        
		if (obj.pep_objs().length) { // only resize if pep objs are already existing, else will break on ex add
			for(var i = 0, len = $drop_container.length; i < len; ++i)
			{           
				if($drop_container[i].offsetParent !== null)//is visible
				{              
					var tmp_item = $.pep.peps[obj.pep_objs()[tmp_count].pep_idx].$el;

					obj.pep_objs()[tmp_count].drop_region().attr('style','top:'+heightOffsets[item_row_count]+'px;height:'+(tmp_item[0].clientHeight)+'px;');  
					$.pep.peps[obj.pep_objs()[tmp_count].pep_idx].moveTo(widthOffset ,heightOffsets[item_row_count]); 
					
					// //console.log($('.SFL-container-row'));
					if((widthOffset + widest_item + obj.pep_objs()[tmp_count].drop_region()[0].clientWidth) < response_container - 50)
					{
						heightOffsets[item_row_count] += obj.pep_objs()[tmp_count].drop_region()[0].clientHeight + 10;
						if (heightOffsets[item_row_count] > highest_item)
							highest_item = heightOffsets[item_row_count];
						widthOffset += obj.pep_objs()[tmp_count].pep()[0].clientWidth+20;
						++item_row_count;
						if(typeof heightOffsets[item_row_count] === 'undefined')
							heightOffsets[item_row_count] = 20;
					}
					else
					{
						widthOffset = 20;
						heightOffsets[item_row_count] += obj.pep_objs()[tmp_count].drop_region()[0].clientHeight + 10;
														
						if (heightOffsets[item_row_count] > highest_item)
							highest_item = heightOffsets[item_row_count];
						item_row_count = 0;                        
					}
					$('.SFL-container-row').attr('style','height:'+(highest_item + 10)+'px;');  

					++tmp_count;
				}
			}
		}
        //END OF RESIZE
        
        //double pass first loop sizes all containers second positions items
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(obj.pep_objs()[i].dropped())
            {
                obj.pep_objs()[i].drop_region().attr('style', 'height:'+($.pep.peps[obj.pep_objs()[i].pep_idx].$el[0].clientHeight+10)+'px;');                
                ++tmp_count;
            }
        }
        for(var i = 0, len = obj.pep_objs().length; i < len; ++i)
        {
            if(obj.pep_objs()[i].dropped())
            {         
                obj.pep_objs()[i].drop_region().attr('style', 'height:'+($.pep.peps[obj.pep_objs()[i].pep_idx].$el[0].clientHeight+10)+'px;');          
                $.pep.peps[obj.pep_objs()[i].pep_idx].moveTo(0,0);
                ++tmp_count;
            }
            
            
        }
   
    }
}

function clear_drag_drop_exercise(obj)
{
    for(var i = 0, len = obj.dragdrop.pep_objs().length; i < len; ++i)
    {
		$.pep.peps[obj.dragdrop.pep_objs()[i].pep_idx].toggle(true); // to unlock distractors that were returned to the container during show solution for older products.
        if(obj.dragdrop.pep_objs()[i].dropped())
        {
            return_item_to_response_container(obj.dragdrop.drag_drop_config().response_container_type(), obj.dragdrop.pep_objs()[i]);
        }
    }
    initiate_response_container(obj.dragdrop);    
}

function show_drag_drop_answer(obj)
{
    //Clear all the current answers
    clear_drag_drop_exercise(obj);

    if (obj.dragdrop.drag_drop_config().state_calc_type() == 7)
    {
        for (var k = 0, k_len = obj.questions().length; k < k_len; ++k)
        {

            var drop_containers = [];
            for(var w = 0, tmp_len = ($('.WSB-droper_'+k).length); w < tmp_len; ++w)
            {
                if($('.WSB-droper_'+k)[w].offsetParent !== null)
                {
                    drop_containers.push($('.WSB-droper_'+k)[w])
                }
                
            }
            var quest_num = 0;
            var total_responses = 0;
            
            for (var i = 0, i_len = obj.dragdrop.pep_objs().length; i < i_len; ++i)
            {
                //Check to see if the current question is a rec question and then skip it
                if (obj.questions()[quest_num]._data()[0].contents()[0].type() == "rec")
                    quest_num++;
                
                if (i == obj.questions()[quest_num].responses().length -1 + total_responses)
                {
                    quest_num++;
                    total_responses += obj.questions()[quest_num-1].responses().length-1; 
                }

                for(var w = 0, tmp_len = (obj.questions()[quest_num].responses().length -1); w < tmp_len; ++w)
                {
                    if (drop_containers[w] == undefined)
                        continue;

                    if((obj.dragdrop.pep_objs()[i].correct_drop_region()+1 - total_responses) == drop_containers[w].id && k == quest_num)
                    {
                        obj.dragdrop.pep_objs()[i].drop_region($(drop_containers[w+ obj.questions()[quest_num].responses().length -1]));
                        obj.dragdrop.pep_objs()[i].dropped(true);
                        handle_drop(obj.dragdrop, obj.dragdrop.pep_objs()[i]);
                        adjust_drag_item_positions(obj.dragdrop);
                        $.pep.peps[obj.dragdrop.pep_objs()[i].pep_idx].toggle(false);
                    }
                }
            }
        }
    }
    else
    {
        for(var i = 0, len = obj.dragdrop.pep_objs().length; i < len; ++i)
        {
            var $drop_container = $('.drop-target');
            var tmp_count = 0;
            for(var w = 0, tmp_len = $drop_container.length; w < tmp_len; ++w)
            {
                //Check to see if the drop container is on the current exercise
                if($drop_container[w].offsetParent !== null)
                {
                    var test = $drop_container[w];
                    if($drop_container[w].id == obj.dragdrop.pep_objs()[i].correct_drop_region())
                    {
                        //Check for SFG groups which contain multiple responses on a question
                        if($drop_container[w].className.match(/SFG-group/))
                        {
                            //Check to see if there is a item already in the drop container
                            if (!$drop_container[w].children.length)
                            {
                                obj.dragdrop.pep_objs()[i].drop_region($($drop_container[w]));
                                obj.dragdrop.pep_objs()[i].dropped(true);
                                handle_drop(obj.dragdrop, obj.dragdrop.pep_objs()[i]);
                                adjust_drag_item_positions(obj.dragdrop);
                            }
                        }
                        else if(obj.dragdrop.drag_drop_config().state_calc_type() == 1 && (obj.dragdrop.drag_drop_config().drag_item_adjust_type() == 11 || obj.dragdrop.drag_drop_config().drag_item_adjust_type() == 1)) //unfortunatly spesific for SFL
                        {
                            if(obj.dragdrop.pep_objs()[i].response_num() ==1)
                            {
                                obj.dragdrop.pep_objs()[i].drop_region($($drop_container[w]));
                                obj.dragdrop.pep_objs()[i].dropped(true);
                                handle_drop(obj.dragdrop, obj.dragdrop.pep_objs()[i]);
                                adjust_drag_item_positions(obj.dragdrop);
                            }
                        }
                        else
                        {
                            obj.dragdrop.pep_objs()[i].drop_region($($drop_container[w]));
                            obj.dragdrop.pep_objs()[i].dropped(true);
                            handle_drop(obj.dragdrop, obj.dragdrop.pep_objs()[i]);
                            adjust_drag_item_positions(obj.dragdrop);
                        }
                    }
                }
            } 
            $.pep.peps[obj.dragdrop.pep_objs()[i].pep_idx].toggle(false);       
        }
    }
    adjust_response_container(obj.dragdrop);
    adjust_drag_item_positions(obj.dragdrop);
    if (obj.dragdrop.drag_drop_config().drag_item_adjust_type() != 10)
        calculate_drag_drop_state(obj.dragdrop, obj);
}

function handleAutoScroll(ev, obj)
{
    var container_height = viewModel.labs()[viewModel.selected_lab()].container_height();
    var window_height = $('#'+viewModel.labs()[viewModel.selected_lab()].type()+'_exercises').height();
    var scroll_pos = $('.'+viewModel.labs()[viewModel.selected_lab()].type()+'_exercises').scrollTop();    
    //if(ev.pep.y > (scroll_pos+window_height) - 100)
    if(ev.pep.y > (container_height + 100))
    {   
        //alert($('.'+viewModel.labs()[lab_id].type()+'_exercises').scrollTop());
        $('.'+viewModel.labs()[viewModel.selected_lab()].type()+'_exercises').scrollTop(scroll_pos+10);
        var drop = obj.$el.detach();           
        $('body').append(drop);
        obj.moveTo(ev.pep.x, ev.pep.y);
    }
    if(ev.pep.y < 200)
    {        
        $('.'+viewModel.labs()[viewModel.selected_lab()].type()+'_exercises').scrollTop(scroll_pos-10);
        var drop = obj.$el.detach();           
        $('body').append(drop);
        obj.moveTo(ev.pep.x, ev.pep.y);
    } 
}

// function restore_drag_drop_progress(progress_array)
// {
    // var dragdrop_progress = progress_array.split(',');
    // for (var p = 0; p < dragdrop_progress.length; ++p)
    // {   
        // if(typeof dragdrop_progress[p] === 'undefined' || dragdrop_progress[p] == ''){continue;}
        // var progress_data = dragdrop_progress[p].match( /l(\d+)e(\d+)q(\d+)r(\d+)\|q(\d+)/i );
        // viewModel.select_lab(parseInt(progress_data[1]));
        // viewModel.labs()[viewModel.selected_lab()].select_exercise(parseInt(progress_data[2]));//ex must be showing               
        // var type = viewModel.labs()[progress_data[1]].exercises()[progress_data[2]].type();