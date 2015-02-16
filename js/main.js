$(document).ready(function(){

	// -- scope globals
	var  
		$inputfield = $('#search'),
		$acList     = $('#ac'),
		acListTpl   = Handlebars.compile($("#tpl-ac-list").html()),
		listItemTpl = Handlebars.compile($("#tpl-list-item").html()),
		infoBoxTpl  = Handlebars.compile($("#tpl-infobox").html())
	;

	function startLoading () {
		$('body').addClass('loading');
	}

	function stopLoading () {
		$('body').removeClass('loading');	
	}

	// -- Navigational behavior on a list. 
	// -- 
	function attachKeyNav ($list)
	{		
		// -- listen for arrowUp, arrowDown and ESC
		var 
			liSelected,
			selectedClass = "is-active",
			$listItemSelector = $list.find('li')
		;

		$(window).keyup(function(e){
			// arrowDown
			if(e.which === 40){
				if(liSelected){
					liSelected.removeClass(selectedClass);
					next = liSelected.next();
					if(next.length > 0){
						liSelected = next.addClass(selectedClass);
					}else{
						liSelected = $listItemSelector.eq(0).addClass(selectedClass);
					}
				}else{
					liSelected = $listItemSelector.eq(0).addClass(selectedClass);
				}
				setSearchString(liSelected);
			// arrowUp
			}else if(e.which === 38){
				if(liSelected){
					liSelected.removeClass(selectedClass);
					next = liSelected.prev();
					if(next.length > 0){
						liSelected = next.addClass(selectedClass);
					}else{
						liSelected = $listItemSelector.last().addClass(selectedClass);
					}
				}else{
					liSelected = $listItemSelector.last().addClass(selectedClass);
				}
				setSearchString(liSelected);
			// esc. close the ac-list
			}else if(e.which === 27){
				clearAC();
			}
		});
	}

	// -- delay input callback and filter inputs
	function inputDelayCallback ($input, callback, delay) {
		
		var timer = null;
		
		$input.keyup( function (e) {
			if (timer)
				clearTimeout(timer);
			if (e.which != 40 && e.which != 38 && e.which !=27) {
				timer = setTimeout( function () {
					timer = null;					
						callback($input);
					}, delay );	
			}else{
				// reset the cursor
				var $charfix = $input.val();
				$input.val($charfix);
			}
			
		});
	}
	inputDelayCallback( $inputfield, getAPIAutoCompleteListFromInput, 200 );

	// -- get the autocomplete list from apikatalogen.. 
	function getAPIAutoCompleteListFromInput ($input) {
		var 
			keyword = $input.val()
		;

		$.getJSON('http://api.apikatalogen.se/v1/autocomplete?name='+keyword, buildACListFromObj);		
	};

	// -- Build the autocomplete-list from data
	// -- we only want to list sources so we'll filter out apps and other stuff
	// -- 
	function buildACListFromObj (data) {
		var hasSourceItems = false;

		// -- make sure we only have one list
		if (!$acList.length) {
			$acList = $(acListTpl());
		}
		$acList.empty();

		// -- filter data and add to the list
		$.each(data, function(i, obj) {
			if (obj.type == 'source' ) {
				hasSourceItems = true;
				var $el = $(listItemTpl({data:obj.name}));
				$el.data('uid', obj.uuid);
				$acList.append($el);	
			}
			
		});

		// -- add to the DOM att attach navigation-behavior (if we have any source-items)
		// -- else, cleanup
		if (hasSourceItems) {
			$('fieldset.modular').after($acList);
			attachKeyNav($acList);
		} else {
			clearAC();
		}
			
	}

	// -- Build the resultboxes from data
	// -- the desc. is sometimes formatted to we need to strip that. 
	function addInfoBoxFromObj (data) {
		var
			s_name = data.name
			s_desc = data.description
		;

		s_desc = $.parseHTML(s_desc);
		s_desc = $(s_desc).text();

		box = $(infoBoxTpl({
				name: s_name,
				info: s_desc,
				meta_date: getFormattedTimestamp(new Date())
			}));	

		// set the box-link and add the box on top. 
		box.find('.link').attr('href', data.documentation_url);				
		box.prependTo('#results');
	}
	
	// -- Format the timestamp as design..
	function getFormattedTimestamp (dateObj) {
		var
			dy = dateObj.getFullYear().toString(10).substring(2, 4),
			dm = padZero(dateObj.getMonth()),
			dd = padZero(dateObj.getDate()),

			dhour = padZero(dateObj.getHours()),
			dmin  = padZero(dateObj.getMinutes())
		;

		return(dy+'-'+dm+'-'+dd+' '+dhour+':'+dmin);
	}

	// -- pad 0 to a single integer
	function padZero (i) {
		return(i < 10)? '0' + i : i;
	}

	// -- Clear the inputfield and data 
	// -- also clears the Autocomplete list.
	function clearInput () {
		$inputfield.val("");
		$inputfield.data('uid',null);
		clearAC();
	}

	// -- remve the autocomplete list. 
	function clearAC () {
		$acList.remove();
	}

	// -- set the searchstring and move focus to the input.
	// -- the UID (that we use for the search is stored as a data-attr )
	function setSearchString($item) {
		$inputfield.val($item.text());
		$inputfield.data('uid', $item.data('uid'));
		$inputfield.focus();

	}

	$(document)
		.ajaxStart( startLoading )
		.ajaxComplete( stopLoading )
	;
	
	// -- Do the search when the user clicks an item in the autocompletelist. 
	$(document).on('click','#ac .item' ,function(){
		setSearchString($(this));
		$('form[role="search"]').submit();
	});

	// -- Get data about the selected API and send it to an infobox. 
	$('form[role="search"]').submit( function(e){		
		e.preventDefault();

		$.getJSON('http://api.apikatalogen.se/v1/sources/'+$inputfield.data('uid'), function(data){

			addInfoBoxFromObj(data.source);
			clearInput();
		});
				
	});
});