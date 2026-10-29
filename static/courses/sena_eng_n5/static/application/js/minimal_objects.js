//Config Objects
var lms_config_obj = function (product_type, ask_question_url, set_progress_url, get_progress_url, lang, student_id, student_name, course_name, course_id, level_name, unit_name, exit_url) {
    var self = this;
    self.product_type = product_type;
    self.ask_question_url = ask_question_url;
    self.set_progress_url = set_progress_url;
    self.get_progress_url = get_progress_url;
    self.lang = lang;
    self.student_id = student_id;
    self.student_name = student_name;
    self.course_name = course_name;
    self.course_id = course_id;
    self.level_name = level_name;
    self.unit_name = unit_name;
    self.exit_url = exit_url;
}

//Template objects
var template = function (type, content) {
    var self = this;
    self.type = type;
    self.content = content;
}

var exercise_template = function (template) {
    var self = this;
    self.template = template;    
}

var stimuli_template = function (template) {
    var self = this;
    self.template = template;    
}

var lab_template = function (template, ex_templates, nav_template, stimuli_templates) {
    var self = this;
    self.template = template;
    self.exercise_templates = ex_templates;
    self.stimuli_templates = stimuli_templates;
    self.nav_template = nav_template;
}
