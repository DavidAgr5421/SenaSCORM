var edit_model = function(lesson){
    var self = this;
    self.editable = ko.observable(false);
    if(typeof lms_config.editable !== 'undefined' && lms_config.editable){
        self.editable(true);
    }

    self.editing_exercises = ko.observableArray([]);
    self.edit_exercise = function(i){
        if(self.editing_exercises.indexOf(i) >= 0){
            self.editing_exercises.remove(i);
        }
        else{
            self.editing_exercises.push(i);
        }
    }

    self.editing_stimuli = ko.observableArray([]);
    self.edit_stimulus = function(i){
        if(self.editing_stimuli.indexOf(i) >= 0){
            self.editing_stimuli.remove(i);
        }
        else{
            self.editing_stimuli.push(i);
        }
    }

    self.save = function(save){
        
        save = typeof save !== 'undefined' ? save : false;

        var ret = undefined;

        for (var i = 0, len = lesson.labs().length; i < len; ++i){
            lesson.labs()[i].maintain_exercises_data();
        }
        
        var unmapped_sco_json = product_helper_edit_unmap_lesson(lesson);

        if(save){
            var sco_number = lesson.sco_number;
            $.ajax({
                type: "POST",
                url: "/product_launcher/save_sco/",
                data: { sco_json: unmapped_sco_json, sco_number: sco_number, product_type: lms_config.product_type, lang: lms_config.lang },
                async: false,
                success: function (data, status, xhr) {
                    if( ( typeof data.status === 'undefined' ) || data.status != "success" ){
                        alert('Your save has failed.\r\nIs your network connection stable?\r\nAre you logged into MARS?\r\nPlease reattempt to save.\r\nDo not close your window untill your save is successful or your work will be lost.')
                    }
                },
                error: function(data, status, xhr) {
                    alert('Your save has failed.\r\nIs your network connection stable?\r\nPlease reattempt to save.\r\nDo not close your window untill your save is successful or your work will be lost.\r\nError message: '+data["status"]+' '+xhr)
                }
            });

        }

        sco_json = JSON.parse(unmapped_sco_json);
        core_soft_reload();
        
    }
}

//Knockout viewmodel objects
var lesson_model = function(sco_json, lms_config, sco_number, lesson_config_json)
{
    var self = this;

    var mapping = {
        'labs': {
            create: function (options) {            
                return new lab_model(options.data);           
            }
        },
        '_data' : {
            create: function (options) {
                if(/(^takeaway_|learning_points)/.test(options.data.type))
                {
                    return ko.mapping.fromJS(options.data, {
                        'contents' : {
                            create: function (options) {
                                if(typeof options.data.type !== 'undefined' && typeof options.data.content !== 'undefined'){
                                    if(options.data.type == 'table'){
                                        return new value_model('{"type": "table", "content": "'+options.data.content+'"}');
                                    }
                                    else{
                                        return new value_model('{"type": "'+options.data.type+'", "content": "'+options.data.content+'"}');
                                    }
                                }
                                else
                                {
                                    return new value_model('');
                                }  
                            }
                        }
                    })   
                }
                else
                {
                    return ko.mapping.fromJS(options.data, {})
                } 
            }
        }
    };
    ko.mapping.fromJS(sco_json, mapping, self);
    //call product mapping here
    self.is_editable = ko.observable(false);
    if(is_editable)
        self.is_editable(true);
	
    self.local_type = ko.observable(helper_get_local_string(lms_config.product_type));//RG 

	
    if (typeof product_lesson_data_model == "function")
        product_lesson_data_model(self._data);
    self.lesson_pk = -1;
    self.sco_number = sco_number;//RG
    self.start_time = Date.now();//RG
    if(initialized){
        self.scorm_start_time = Date.now();
    }
    self.exit_time = Date.now(); //initialize an exit time variable to use when leaving the lesson
    self.elapsed_seconds = 0; //initialize elapsed_seconds to 0 on load
    self.on_welcome_page = ko.observable(0);//1 show welcome page 0 to skip RG
    self.welcome_page_height = ko.observable(product_helper_get_welcome_page_height()); //RG : re-evaluate how this works
    self.lms_config = lms_config; //RG
    self.feedback_type = ko.observable('gen');
    self.restoring_progress = ko.observable(false);
    if( typeof lesson_config_json.feedback_type !== 'undefined' )
    {
        self.feedback_type(lesson_config_json.feedback_type);
    }
    self.product_templates = {}; //RG  
    for (var i = 0; i < lesson_config_json.product_templates.length; ++i) //RG
    {
        self.product_templates[""+lesson_config_json.product_templates[i]] = 1;
    }  
    self.selected_lab = ko.observable(0);//RG  
    self.main_container_height = ko.computed(function(){
        return self.labs()[self.selected_lab()].container_height()-52;
    });

	if (use_mono_system) {
		if(typeof self.test !== 'undefined' && self.test() == 'true')
		{
			mono_sidebar_model(self, []);
		}
		else
		{
			mono_sidebar_model(self, lesson_config_json.sidebar_tools);
		}
	}
    self.localization = ko.mapping.fromJS(localize_json);//give lesson access to all keys   //RG
	
    self.select_lab = function(value) //RS
    {
        product_select_lab(self, value);
    };   
    product_lesson_model(self);//product specific mapping
   
	self.total_exercises = ko.computed(function(){//RG : needs rework
		var running_total = 0;
		for (var i = 0; i < self.labs().length; ++i)
		{
			running_total += self.labs()[i].exercises().length;
		}
		return running_total;
	});    
    
    
    self.lesson_type = lms_config.product_type; //RG
    self.progress = ko.observable(); //RG
    self.get_progress = function(){ //RS
        product_get_progress(self);
    };
    
    self.restore_progress = function(){ //RS
        product_restore_progress(self);      
    };
    self.exit = function()
    {        
        if(!lms_config.product_type.match(/sena/gi)){
            self.exit_time = Date.now();
            self.elapsed_seconds = (self.exit_time - self.start_time)/1000;
        }
        self.get_progress();
        window.location = lms_config.exit_url;
    };
    self.edit = new edit_model(self);
};

var lab_model = function(data)
{
    var self = this;
    var mapping = {
        'exercises' : {
            create: function (options) {                
                return new exercises_model(options.data);
            }
        },
        'stimuli' : {
            create: function (options) {             
                return new stimuli_model(options.data);               
            }
        },
        'grading_chart' : {
            create: function (options) {                
                return new grading_chart_model(options.data);               
            }
        }
    };
    ko.mapping.fromJS(data, mapping, self);
    self.disabled = ko.observable(false);
    self.selected_stimuli = ko.observable(0); //needs to be re evaluated
    self.selected_exercise = ko.observable(0);//RG   
    self.hiding_pre_screen = ko.observable(1);//1 show welcome page 0 to skip RG
    self.local_type = ko.observable();//RG
    self.container_height = ko.observable();//RG
    product_lab_model(self);

    self.select_exercise = function(value)//RS
    {       
        product_select_exercise(self, value);
    };

    self.remove_exercise = function(e){
        ko.cleanNode(document.getElementsByTagName('html')[0]);
        self.exercises.remove(e);

    };
    
    if (typeof product_lab_data_model == "function")
        product_lab_data_model(self._data);
};

var stimuli_model = function(data)
{
    var self = this;
    var mapping = {
        'contents': {
            create: function (options) {         
                if(!$.isEmptyObject(options.data)){
                    return new stimuli_contents_model(options.data);
                }
                else{
                    return options.data;
                }
            }
        }
    };
    ko.mapping.fromJS(data, mapping, self);
    self.local_type = ko.observable();//RG
    product_stimuli_model(self);
};

var grading_chart_model = function(data)
{
    var self = this;
    var mapping = {
        'content' : {
            create: function (options) {               
                if(options.data)
                {
                    return new value_model(options.data);
                }
                else
                {
                    return new value_model('');
                }        
            }
        }
    };
    ko.mapping.fromJS(data, mapping, self);

    self.remove_content_value = function(v){
        for (var i = 0, len = self.body.rows().length; i < len; ++i){
            for (var j = 0, jen = self.body.rows()[i].cells().length; j < jen; ++j){
                if(typeof(self.body.rows()[i].cells()[j].content) !== 'object'){
                    self.body.rows()[i].cells()[j].content.remove(v);
                }
            }
        }
    };

    self.remove_row = function(){
        var row = ko.mapping.toJS(self.body.rows()[self.body.rows().length-2]);
        self.body.rows().splice(self.body.rows().length-2,2);
        self.body.rows.push(ko.mapping.fromJS(row));
    };

    self.remove_column = function(){
        for (var i = 0, len = self.header.rows().length; i < len; ++i){
            if(!i){
                self.header.rows()[i].cells()[1].colspan(self.header.rows()[i].cells()[1].colspan()-1)
            }
            else{
                var cell = ko.mapping.toJS(self.header.rows()[i].cells()[self.header.rows()[i].cells().length-2]);
                self.header.rows()[i].cells().splice(self.header.rows()[i].cells().length-2,2);
                self.header.rows()[i].cells.push(ko.mapping.fromJS(cell));
            }
        }
        for (var i = 0, len = self.body.rows().length; i < len; ++i){
            var cell = ko.mapping.toJS(self.body.rows()[i].cells()[self.body.rows()[i].cells().length-2]);
            self.body.rows()[i].cells().splice(self.body.rows()[i].cells().length-2,2);
            self.body.rows()[i].cells.push(ko.mapping.fromJS(cell));
        }
    };
    
    self.add_content_value = function(cell){
        cell.content.push(new value_model(''));
    };

    self.add_column = function(){
        for (var i = 0, len = self.header.rows().length; i < len; ++i){
            if(!i){
                self.header.rows()[i].cells()[1].colspan(self.header.rows()[i].cells()[1].colspan()+1)
            }
            else{
                var cell = ko.mapping.toJS(self.header.rows()[i].cells()[self.header.rows()[i].cells().length-1]);
                cell.content = new value_model(' ');
                self.header.rows()[i].cells.push(ko.mapping.fromJS(cell));
            }
        }
        for (var i = 0, len = self.body.rows().length; i < len; ++i){
            var cell = ko.mapping.toJS(self.body.rows()[i].cells()[self.body.rows()[i].cells().length-1]);
            if(cell.content.value){
                cell.content = new value_model(' ');
            }
            else{
                cell.content = [new value_model(' ')];
            }
            self.body.rows()[i].cells.push(ko.mapping.fromJS(cell));
        }
    };

    self.add_row = function(){
        var row = ko.mapping.toJS(self.body.rows()[self.body.rows().length-1]);
        for (var i = 0, len = row.cells.length; i < len; ++i){
            if(!i){
                row.cells[i].content = new value_model(' ');
            }
            else{
                row.cells[i].content = [new value_model('')];
            }
        }
        self.body.rows.push(ko.mapping.fromJS(row));
    };
}

var stimuli_contents_model = function(data)
{
    var self = this;
    var mapping = {
        'value' : {
            create: function (options) {
                if(typeof data.type !== 'undefined' && (data.type == 'ol' || data.type == 'ul')){
                    return new value_model(options.data);
                }
                else{
                    return ko.mapping.fromJS(options.data);
                }     
            }
        }
    };
    ko.mapping.fromJS(data, mapping, self);
    product_stimuli_contents_model(self);
}

var dictionary_model = function(data)
{
    var self = this;    
    ko.mapping.fromJS(data, {}, self);
}

var grammar_model = function(data)
{
    var self = this;
    ko.mapping.fromJS(data, {}, self);
    self.formatted_name = ko.observable(mono_helper_get_grammar_name(self.item()));
    self.title = ko.observable(mono_helper_get_grammar_title(self.item()));
}

var wordlist_model = function(data)
{
    var self = this;
    ko.mapping.fromJS(data, {}, self);
}

var exercises_model = function(data)
{    
    var self = this;
    var mapping = {
        'questions' : {
            create: function (options) {
                if(options.data.responses)
                {
                    return new question_model(options.data);
                }
                else
                {
                    return [];
                }
            }
        },
        '_data' : {  
            create: function (options) {
                if (options.data.type == 'instructions') {
                    return ko.mapping.fromJS(options.data, {
                        'contents' : {
                            create: function (options) {
                                if(typeof options.data.type !== 'undefined' && typeof options.data.content !== 'undefined'){
                                    if(options.data.type == 'table'){
                                        return new value_model('{"type": "table", "content": "'+options.data.content+'"}');
                                    }
                                    else{
                                        return new value_model('{"type": "'+options.data.type+'", "content": "'+options.data.content+'"}');
                                    }
                                }
                                else
                                {
                                    return new value_model('');
                                }  
                            }
                        }
                    })
                } else {
                    return ko.mapping.fromJS(options.data);
                }
            }
        },
        'instructions' : {
            create: function (options) {
                if(options.data)
                {
                    return new value_model(options.data);
                }
                else
                {
                    return new value_model('');
                }        
            }
        }
    };
    ko.mapping.fromJS(data, mapping, self);
    self.common_instructions = ko.observable();//RG
    for (var i = 0; i < lesson_config_json.exercise_common_instructions.length; ++i)
    {
        if( self.type() == lesson_config_json.exercise_common_instructions[i].type )
        {
            self.common_instructions(lesson_config_json.exercise_common_instructions[i].text);
            break;
        }
    }
    self.shown_pre_screen = ko.observable(0);//once this is set to one that excersises presereen will not show again
    self.selected_stimuli = ko.observable(0);//RG    
    self.showing_answer = ko.observable(false);//RG
    self.check_answer = ko.observable(0);//RG
    self.checked_answer = ko.observable(false);//RG
    self.disable_solution_button = ko.observable(false);
    self.disable_clear_button = ko.observable(false);
    self.disable_check_answer = ko.observable(false);
    self.check_answer_count = ko.observable(0);//RG
    self.has_background_image = ko.observable(false);
    self.background_image = ko.observable("");
    self.score = ko.computed ( function () {
        var score = 0;
        ko.utils.arrayForEach(self.questions(), function (item) {
            if(ko.utils.unwrapObservable(item.score)){
                score += item.score();
            };            
        });
        if(score > 0)
        {
            return (score / self.questions().length);
        }
        else
        {        
            return score;
        }
    });
    if(lesson_config_json.feedback_type == 'gen')
    {
        self.state = ko.computed(function(){//kinda bad logic : Update. On closer inspection this function is generic and well written          
            var state = 0//0 state for nothing started on question
            var item_states = new Array();
            var state_total = 0;
            if(self.check_answer() != 0)
            {
                ko.utils.arrayForEach(self.questions(), function (item) {
                    if(ko.utils.unwrapObservable(item.state)){
                        item.check_answer(1);
                    };
                });
            }else
            {
                self.checked_answer(false);
            }
            self.check_answer(0);
            ko.utils.arrayForEach(self.questions(), function (item) {
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
            if (item_states.length && item_states.length != self.questions().length)
            {
                return 1; //some but not all answered
            }
            else if (!item_states.length)
            {
                return 0;//none selected
            }
            else if(item_states.length == self.questions().length)
            {            
                if (state_total/item_states.length == 4)//perfect response
                {
                    return 4;
                }            
            }        
            return state;
        });
    }
    product_exercise_model(self);// F_056
    
    if (typeof product_exercise_data_model == "function")
        product_exercise_data_model(self._data);
    
    self.nav_state = ko.computed(function(){
        if(typeof self.historical_progress !== 'undefined' && self.historical_progress() != '')
        {
            return self.historical_state();
        }
        else
        {
            return self.state();
        }
    });
    self.state_css = ko.computed(function(){//RG
        return helper_get_state_css(self.state());
    });    
    self.clear_questions = function(lab_id){//RS
        product_clear_questions(self, lab_id);
    };
    self.check_answers = function(){//RS
        product_check_answers(self);
    };    
    self.show_answers = function(lab_id){//RS
        product_show_answers(self, lab_id);
    };
        
    if(lesson_config_json.feedback_type == 'gen')
    {
        self.check_answer_enabled = ko.computed(function(){//RG
            if(self.state() && !self.showing_answer() && !self.checked_answer() && !self.disable_check_answer())
            {
                return true;
            }
            else
            {
                return false;
            }
        });
        self.show_answer_enabled = ko.computed(function(){//RG
            if(self.state() && !self.showing_answer() && self.checked_answer() && !self.disable_solution_button())
            {
                return true;
            }
            else
            {
                return false;
            }
        });   
        self.clear_button_enabled = ko.computed(function(){//RG
            if(self.state() && !self.disable_clear_button())
            {
                return true;
            }
            else
            {
                return false;
            }
        }); 
        self.show_feedback = ko.computed(function() {//RG
            if(self.checked_answer())
            {
                return true;
            }
            return false
        });
    }
    self.adjust_response_correctness = ko.computed(function() {
        if(self.type() == "DFL" || self.type() == "TYP"){
            for (var i = 0, len = self.questions().length; i < len; ++i){
                for (var j = 0, jen = self.questions()[i].responses().length; j < jen; ++j){
                    if(j){
                        self.questions()[i].responses()[j].correct(1);
                    }
                    else{
                        self.questions()[i].responses()[j].correct(0);
                    }
                    
                    //Check for DFL questions that have questions with no answers.
                    //Will set the first response (Which is the empty one) to the correct answer some
                    //the question will be correct without having to put any responses in the container.
                    if (self.type() == "DFL")
                    {
                        if (self.questions()[i].responses().length == 1)
                        {
                            self.questions()[i].responses()[j].correct(1);
                        }
                    }
                }
            }
        }
    });

    
    
    self.remove_welcome_item = function(k, welcome_type) {
        for (var i = 0; i < self._data().length; ++i)
        {
            if (self._data()[i].type() == welcome_type)
                self._data()[i].contents.splice(k,1);
        }

    }
    self.remove_welcome_word = function(i) {
        self._data.splice(i,1);    
    }
    
    self.add_welcome_scenario = function(data)
    {
        product_edit_add_welcome_scenario(self);
    }
    
    self.add_welcome_objective = function(data)
    {
        product_edit_add_welcome_objective(self);
    }

    self.remove_question = function(q){//RS
        self.questions.remove(q);
    }

    self.add_question = function(data){
        product_edit_add_question(self);
    };

    self.remove_tab_response = function(r){
        var index = -1;
        for (var i = 0, len = self.questions().length; i < len; ++i){
            if(self.questions()[i].responses.indexOf(r) >= 0){
                index = self.questions()[i].responses.indexOf(r);
                break;
            }
        }
        for (var i = 0, len = self.questions().length; i < len; ++i){
            self.questions()[i].responses.remove(
                self.questions()[i].responses()[index]
            );
        }
    };

    self.add_tab_response = function(r){
        for (var i = 0, len = self.questions().length; i < len; ++i){
            var id = 0;
            if(self.questions()[i].responses().length){
                id = self.questions()[i].responses()[self.questions()[i].responses().length-1].id()+1;
            }
            self.questions()[i].responses.push(new response_model({
                "text": "",
                "_data": [{
                    "type":"text",
                    "content":""
                }],
                "selected": 0,
                "id": id,
                "correct": 0
            }));
        }
    };

    self.type.subscribe(function(){
        if(self.type()){
            product_edit_add_question(self);
        }
    })
    
    self.cur_question = ko.computed(function(){
        if(self.questions !== 'undefined')
        {
            for( var i = 0, i_len = self.questions().length; i < i_len; ++i )
            {
                if(self.questions()[i].state() == 0){
                    return i
                }
                
            }            
        }
        return -1;
    });
    
    //loop data array for feedback if not gen type
    if(lesson_config_json.feedback_type != 'gen')
    {        
        //map additional state calculating data
        for(var i = 0, len = self._data().length; i < len; ++i)
        {            
            if(self._data()[i].type() == 'feedback')
            {                
                self.feedback = ko.observable(new product_exercise_feedback_mapping(self._data()[i].content, self));
                
                ////console.log(self.feedback());
            }
        }
    }
    
    if (self.has_background_image()) { // this ex can have a background image find and set it if its there

        var src, found;
        found = false;
        for (var i = 0; i < self._data().length; ++i) { // find it
            if (self._data()[i].type() == 'exercise_background_image') {
                src = self._data()[i].content(); 
                self.background_image(src);
                found = true;
            }
        }
        
        if(!found) { // there was no background image set in _data even tho the ex can have one, make an empty one
            self._data().push({"type" : ko.observable("exercise_background_image"), "content" : ko.observable("")});
        }
    }
    
};

var question_model = function(data)//state calc here need to be alot more generic
{
    var self = this;
    var mapping = {
        'responses' : {
            create: function (options) {                
                return new response_model(options.data);        
            }
        }
    };
    ko.mapping.fromJS(data, mapping, self);    
    self.selected_response = ko.observable(-1);//RG    
    self.check_answer = ko.observable(0);   //RG
    self.score = ko.observable(0);//RG
    self.select_response = function(value){//RG        
        if(self.selected_response() != -1)
        {
            self.responses()[self.selected_response()].selected(0);
        }
        self.selected_response(value());
    };
    
    self.select_response_toggle = function(value){//hack for TAB type allow toggle response //RG       
        if(self.responses()[value()].selected())
        {
            self.responses()[value()].selected(0);            
        }
        else
        {
            self.responses()[value()].selected(1);
        }          
    };
    self.show_answer = function(type, ex_id, lab_id){//RS
        product_show_answer(self, type, ex_id, lab_id);            
    };    
    self.entered_response = ko.observable();//RS : reevaluate    
    self.check_entered_response = function(){//RS : reevaluate        
        var loop_counter = 0;//because there is not one in ko.utils.foreach...
        var correct = false;
        ko.utils.arrayForEach(self.responses(), function (item) {            
            if(typeof self.entered_response() !== 'undefined' && self.entered_response() != '')
            {
                
                    entered_resp = self.entered_response().toLowerCase().replace(/\s*$/,"");

                

                if (typeof item._data !== 'undefined')
                {
                    resp = ko.utils.unwrapObservable(item._data()[0].content()).toLowerCase().replace(/\s*$/,"");                    
                }
                else
                {                    
                    resp = ko.utils.unwrapObservable(item.text).toLowerCase().replace(/\s*$/,"");                    
                }

                if(entered_resp.trim() == resp.trim())
                {
                    correct = true;
                    self.selected_response(loop_counter);
                }
                else
                {
                    if(correct)
                    {
                        self.responses()[0].selected(0);                                 
                    }
                    else
                    {
                        if(loop_counter)
                        {                            
                            self.responses()[loop_counter].selected(0);
                        }
                        self.selected_response(-1);
                        self.selected_response(0);
                    }
                }
                ++loop_counter;
            }
            else
            {
                self.select_response(ko.observable(-1));
            }
        });
    };
    //custom mapping here
    self.state = ko.computed(function(){//RG
        var state = 0//0 state for nothing started on question           
        if(self.selected_response() != -1)
        {            
            for(var i = 0; i < self.responses().length; ++i)
            {
                if (i != self.selected_response())
                {
                    self.responses()[i].selected(0);
                }
            }
            
            self.responses()[self.selected_response()].selected(1);           
            if(self.check_answer())
            {
                if(self.responses()[self.selected_response()].correct())
                {
                    state = 4;
                    self.score(100);
                }
                else
                {
                    state = 2;
                    self.score(0);
                }
            }else
            {
                state = 1;
            }
        }
        else
        {
            var has_wrong_response = false;
            var correct_responses = 0;
            var selected_responses = 0;
            ko.utils.arrayForEach(self.responses(), function (item) {
                if(ko.utils.unwrapObservable(item.correct))
                {
                    ++correct_responses;
                }                
                if(ko.utils.unwrapObservable(item.selected))
                {
                    ++selected_responses;
                    if(self.check_answer())
                    {
                        if(ko.utils.unwrapObservable(item.correct))
                        {
                            state = 4;
                            self.score(100);
                        }
                        else
                        {
                            state = 2;
                            has_wrong_response = true;
                        }
                    }else
                    {
                        state = 1;
                    }
                }
            });
            if(has_wrong_response)//stupid if
            {
                state = 2;
                self.score(0);
            }
            else if(selected_responses < correct_responses && selected_responses && self.check_answer())
            {
                self.score(parseInt((selected_responses/correct_responses)*100));
                state = 3;//new state
            }
        }
        self.check_answer(0);//this should always be 0 unless otherwise written
        //console.log(state);
        return state;
    });
    
    self.state_css = ko.computed(function(){//RG
        return helper_get_state_css(self.state());
    });
    
    self.clear = function(){//RS
        product_clear_question(self);
    };

    product_question_model(self);        
};

var response_model = function(data)
{
    var self = this;
    ko.mapping.fromJS(data, {}, self);
    self.state = ko.computed(function()//RG
    {
        if(self.selected() && self.correct())
        {
            return 4;
        }
        else if(self.selected() && !self.correct())
        {
            return 2;
        }
        else if (!self.selected())
        {
            return 1;
        }
    });
    self.state_css = ko.computed(function(){//RG
        return helper_get_state_css(self.state());
    });
    product_response_model(self);
};

var value_model = function(data)
{
    var self = this;
    self.value = ko.observable(data);
    self.type = ko.observable();
    self.content = ko.observable();
    var value = data;
    if (typeof data.match !== "function")
    {
        value = data.value;
    }

    if (test = value.match(/^{"type":\s+"(.+)",\s+"content":\s+"([^]+)"}$/))
    {
        self.type(test[1]);
        if(self.type() == 'table'){
            self.content(new table_model(JSON.parse(test[2])));
        }
        else{
            self.content(test[2]);
        }
    }
    else if(test = value.match(/^{"type":\s+"(.+)",\s+"content":\s+""}$/))
    {
        self.type(test[1]);
        self.content(" ");
    }

    product_value_model(self);
};

var table_model = function(data){
    var self = this;
    var mapping = {
        'cells' : {
            create: function (options) {
               return new value_model(options.data);
            }
        }
    };
    ko.mapping.fromJS(data, mapping, self);
     self.rows.subscribe(function(){
        if(!(/^\+?([0-9]\d*)$/.test(self.rows()))){
            self.rows(1);
        }
        else if(self.rows() > 14){
            self.rows(14);
        }
    });
    self.columns.subscribe(function(){
        if(!(/^\+?([0-9]\d*)$/.test(self.columns()))){
            self.columns(1);
        }
        else if(self.columns() > 7){
            self.columns(7);
        }
    });
    product_table_model(self);
}
