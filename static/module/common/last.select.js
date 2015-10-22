exports.init = function(){
	var last_select = -1;
	
	try {

	    last_select = localStorage.last_select >> 0; // jshint ignore:line
		
		var $sb = $('#select-business');
		
		last_select > 0 && $sb.find('[value=' + last_select + ']').length && $sb.val(last_select);

		$sb.on('change', function(){
			localStorage.last_select = $sb.val();
		});

	} catch (ex) {}

};