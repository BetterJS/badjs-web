exports.init = function(){
	var not_show_source_page = false;

	try {
	    not_show_source_page = !!localStorage.not_show_source_page;
	} catch (ex) {}

	var update_source = function(show_source_page){
		if (show_source_page) {
			$('#log-table .source_page_link').each(function(){
				var $this = $(this);
				$this.text($this.data('viewlink'));
			});
		} else {
			$('#log-table .source_page_link').each(function(){
				var $this = $(this);
				$this.text($this.data('viewtext'));
			});
		}
	};

	var $ssp = $('#show_source_page');
	$ssp.prop('checked', !not_show_source_page).on('change', function(){
		try {
			var show_source_page = $ssp.prop('checked');
			localStorage.not_show_source_page = show_source_page ? '' : '1';
			update_source(show_source_page);
		} catch (ex) {}
	});
};