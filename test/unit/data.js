module("data");

test("expando", function(){
	expect(5);
	
	equals("expando" in jQuery, true, "jQuery is exposing the expando");
	
	var obj = {};
	jQuery.data(obj);
	equals( jQuery.expando in obj, false, "jQuery.data did not add an expando to the object" );

	obj = {};	
	jQuery.data(obj, 'test');
	equals( jQuery.expando in obj, false, "jQuery.data(obj,key) did not add an expando to the object" );

	obj = {};
	jQuery.data(obj, "foo", "bar");
	equals( jQuery.expando in obj, false, "jQuery.data(obj,key,value) did not add an expando to the object" );
	equals( obj.foo, "bar", "jQuery.data(obj,key,value) sets fields directly on the object." );
});

test("jQuery.data", function() {
	expect(12);
	var div = document.createElement("div");

	ok( jQuery.data(div, "test") === undefined, "Check for no data exists" );
	
	jQuery.data(div, "test", "success");
	equals( jQuery.data(div, "test"), "success", "Check for added data" );

	ok( jQuery.data(div, "notexist") === undefined, "Check for no data exists" );
	
	var data = jQuery.data(div);
	same( data, { "test": "success" }, "Return complete data set" );
	
	jQuery.data(div, "test", "overwritten");
	equals( jQuery.data(div, "test"), "overwritten", "Check for overwritten data" );
	
	jQuery.data(div, "test", undefined);
	equals( jQuery.data(div, "test"), "overwritten", "Check that data wasn't removed");
	
	jQuery.data(div, "test", null);
	ok( jQuery.data(div, "test") === null, "Check for null data");

	jQuery.data(div, { "test": "in", "test2": "in2" });
	equals( jQuery.data(div, "test"), "in", "Verify setting an object in data" );
	equals( jQuery.data(div, "test2"), "in2", "Verify setting an object in data" );

	var obj = {};
	jQuery.data( obj, "prop", true );

	ok( !obj[ jQuery.expando ], "Cache is not being stored on the object" );
	ok( obj.prop, "Data is being stored directly on the object" );
	equals( jQuery.data( obj, "prop" ), true, "Make sure the right value is retrieved" );
});

test(".data()", function() {
	expect(1);

	var div = jQuery("#foo");
	div.data("test", "success");
	same( div.data(), {test: "success"}, "data() get the entire data object" )
})

test(".data(String) and .data(String, Object)", function() {
	expect(29);
	var div = jQuery("<div/>");

	ok( div.data("test") === undefined, "Check for no data exists" );

	div.data("test", "success");
	equals( div.data("test"), "success", "Check for added data" );

	div.data("test", "overwritten");
	equals( div.data("test"), "overwritten", "Check for overwritten data" );

	div.data("test", undefined);
	equals( div.data("test"), "overwritten", "Check that data wasn't removed");

	div.data("test", null);
	ok( div.data("test") === null, "Check for null data");

	ok( div.data("notexist") === undefined, "Check for no data exists" );

	div.data("test", "overwritten");
	var hits = {test:0}, gets = {test:0}, changes = {test:0, value:null};


	function logChangeData(e,key,value) {
		var dataKey = key;
		if ( e.namespace ) {
			dataKey = dataKey + "." + e.namespace;
		}
		changes[key] += value;
		changes.value = jQuery.data(e.target, dataKey);
	}

	div
		.bind("setData",function(e,key,value){ hits[key] += value; })
		.bind("setData.foo",function(e,key,value){ hits[key] += value; })
		.bind("changeData",logChangeData)
		.bind("changeData.foo",logChangeData)
		.bind("getData",function(e,key){ gets[key] += 1; })
		.bind("getData.foo",function(e,key){ gets[key] += 3; });

	div.data("test.foo", 2);
	equals( div.data("test"), "overwritten", "Check for original data" );
	equals( div.data("test.foo"), 2, "Check for namespaced data" );
	equals( div.data("test.bar"), "overwritten", "Check for unmatched namespace" );
	equals( hits.test, 2, "Check triggered setter functions" );
	equals( gets.test, 5, "Check triggered getter functions" );
	equals( changes.test, 2, "Check sets raise changeData");
	equals( changes.value, 2, "Check changeData after data has been set" );

	hits.test = 0;
	gets.test = 0;
	changes.test = 0;
	changes.value = null;

	div.data("test", 1);
	equals( div.data("test"), 1, "Check for original data" );
	equals( div.data("test.foo"), 2, "Check for namespaced data" );
	equals( div.data("test.bar"), 1, "Check for unmatched namespace" );
	equals( hits.test, 1, "Check triggered setter functions" );
	equals( gets.test, 5, "Check triggered getter functions" );
	equals( changes.test, 1, "Check sets raise changeData" );
	equals( changes.value, 1, "Check changeData after data has been set" );

	div
		.bind("getData",function(e,key){ return key + "root"; })
		.bind("getData.foo",function(e,key){ return key + "foo"; });

	equals( div.data("test"), "testroot", "Check for original data" );
	equals( div.data("test.foo"), "testfoo", "Check for namespaced data" );
	equals( div.data("test.bar"), "testroot", "Check for unmatched namespace" );
	
	// #3748
	var $elem = jQuery({exists:true});
	equals( $elem.data('nothing'), undefined, "Non-existent data returns undefined" );
	equals( $elem.data('null',null).data('null'), null, "null's are preserved" );
	equals( $elem.data('emptyString','').data('emptyString'), '', "Empty strings are preserved" );
	equals( $elem.data('false',false).data('false'), false, "false's are preserved" );
	
	equals( $elem.data('exists'), true, "Existing data is returned" );

	// Clean up
	$elem.removeData();
	ok( jQuery.isEmptyObject( $elem[0] ), "removeData clears the object" );
});

test(".data(Object)", function() {
	expect(4);

	var div = jQuery("<div/>");

	div.data({ "test": "in", "test2": "in2" });
	equals( div.data("test"), "in", "Verify setting an object in data" );
	equals( div.data("test2"), "in2", "Verify setting an object in data" );

	var obj = {test:"unset"},
		jqobj = jQuery(obj);
	jqobj.data({ "test": "in", "test2": "in2" });
	equals( obj.test, "in", "Verify setting an object on an object extends the object" );
	equals( obj.test2, "in2", "Verify setting an object on an object extends the object" );
});

test("jQuery.removeData", function() {
	expect(4);
	var div = jQuery("#foo")[0];
	jQuery.data(div, "test", "testing");
	jQuery.removeData(div, "test");
	equals( jQuery.data(div, "test"), undefined, "Check removal of data" );
	
	var obj = {};
	jQuery.data(obj, "test", "testing");
	equals( obj.test, "testing", "verify data on plain object");
	jQuery.removeData(obj, "test");
	equals( jQuery.data(obj, "test"), undefined, "Check removal of data on plain object" );
	equals( obj.test, undefined, "Check removal of data directly from plain object" );
});

test(".removeData()", function() {
	expect(6);
	var div = jQuery("#foo");
	div.data("test", "testing");
	div.removeData("test");
	equals( div.data("test"), undefined, "Check removal of data" );

	div.data("test", "testing");
	div.data("test.foo", "testing2");
	div.removeData("test.bar");
	equals( div.data("test.foo"), "testing2", "Make sure data is intact" );
	equals( div.data("test"), "testing", "Make sure data is intact" );

	div.removeData("test");
	equals( div.data("test.foo"), "testing2", "Make sure data is intact" );
	equals( div.data("test"), undefined, "Make sure data is intact" );

	div.removeData("test.foo");
	equals( div.data("test.foo"), undefined, "Make sure data is intact" );
});
