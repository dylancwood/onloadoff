document.addEventListener('DOMContentLoaded',
   function () {
      "use strict";
      var i = 0, elements;
      // initialize iframes
      initialize_iframes();
      // initialize reload and stats buttons: 
      //this should be done in a separate function
      elements = document.getElementsByClassName('reload-button');
      for (i = 0; i < elements.length; i++) {
         elements[i].addEventListener('click',
            function (e) {
               var side = e.target.getAttribute('data-side');
               reload_iframe(side);
            }
         );
      }
      elements = document.getElementsByClassName('statistics-button');
      for (i = 0; i < elements.length; i++) {
         elements[i].addEventListener('click',
               toggle_statistics_el
         );
      }
      //hack to get text-input for URLs
      elements = [];
      elements.push(document.getElementById('right_iframe_url'));
      elements.push(document.getElementById('left_iframe_url'));
      //initialize text input
      for (i = 0; i < elements.length; i++){
         elements[i].addEventListener('change',
            function(e){
               var side = e.target.getAttribute('data-side'),
                  new_url = e.target.value;
               update_iframe_url(side, new_url);
            }
         );
         elements[i].addEventListener('keypress',
            function(e){
               var ch = e.keyCode, side, new_url;
               if (!ch) ch = e.which;
               if(ch === 13){
                  side = e.target.getAttribute('data-side');
                  new_url = e.target.value;
                  update_iframe_url(side, new_url);
                  reload_iframe(side);
               }
            }
         );
      }
      //call render_timers: this sets up a requestAnimationFrame callback
      //that re-renders active timers every ~50ms
      render_timers();
   }
);
function get_iframe_el (side) {
   "use strict";
   return document.getElementById(side + '_iframe');
}
function get_iframe_window (side_or_el) {
   "use strict";
   var el;
   if (typeof side_or_el === 'object') {
      if (side_or_el instanceof Window) {
         return side_or_el;
      } else if (side_or_el instanceof HTMLIFrameElement) {
         el = side_or_el;
      } else { 
         throw new Error ('Unknown input object type: expecting iframe element or iframe window');
      }
   } else if (typeof side_or_el === 'string') {
      el = get_iframe_el (side_or_el);
   } else {
      throw new Error ('Unknown input type: expecting object or string');
   }
   return el.contentWindow;
}
function initialize_iframe (side_or_el) {
   "use strict";
   var current_iframe_el;
   if (typeof side_or_el === 'object' &&
      side_or_el instanceof HTMLIFrameElement) {
         current_iframe_el = side_or_el;
   } else if (typeof side_or_el === 'string') {
      current_iframe_el = get_iframe_el(side_or_el);
   } else {
      throw new Error ('Unexpected input type: expecting iframe element or string');
   }
   current_iframe_el.addEventListener('load',
      iframe_load_handler
   );
}
function initialize_iframes () {
   "use strict"
   var i = 0,
      frame_elements = document.querySelectorAll('iframe'),
      num_iframes = frame_elements.length;
   for ( ; i < num_iframes; i++){
      initialize_iframe(frame_elements[i]);
   }
}
function update_iframe_url (side, new_url) {
   "use strict";
   var current_iframe_el = get_iframe_el(side);
   if (current_iframe_el.getAttribute('data-src') !== new_url) {
      current_iframe_el.setAttribute('data-src', new_url);
   }
}
function reload_iframe (side) {
   "use strict";
   var current_iframe_el = get_iframe_el(side),
      current_iframe = get_iframe_window(current_iframe_el),
      data_src = current_iframe_el.getAttribute('data-src');
   reset_timer_el(side);
   set_status_el_value(side, 'Loading');
   if(current_iframe.location !== data_src){
      current_iframe.location.replace(data_src);
   } else{
      current_iframe.location.reload();
   }
}
function get_timer_el (side) {
   "use strict";
   return document.getElementById(side + '_timer');
}
function get_status_el (side) {
   "use strict";
   return document.getElementById(side + '_status');
}
function set_timer_el_value (side_or_el, value) {
   "use strict";
   var el;
   if (typeof side_or_el === 'object') {
      el = side_or_el;     
   } else if (typeof side_or_el === 'string') {
      el = get_timer_el(side_or_el);
   }
   el.innerHTML = value;
   return el;
}
function set_status_el_value (side, value) {
   "use strict";
   var el = get_status_el(side);
   el.innerHTML = value;
   return el;
}
function reset_timer_el (side) {
   "use strict";
   var el = set_timer_el_value(side, '--.--');
   el.setAttribute('data-start-time', (new Date()).getTime());
   el.setAttribute('data-loading', 1);
   return el;
}
function stop_timer_el (side) {
   "use strict";
   var el = get_timer_el(side);
   el.setAttribute('data-loading', 0);
}
function get_iframe_statistics_el (side) {
   "use strict";
   return document.getElementById(side + '_statistics');
}
function log_iframe_load_event (side, end_time) {
   "use strict";
   var delimeter = ',',
      stats_el = get_iframe_statistics_el(side),
      timer_el = get_timer_el(side),
      start_time = timer_el.getAttribute('data-start-time'),
      time_diff = end_time - start_time,
      load_time = time_diff / 1000,
      old_log = stats_el.getAttribute('data-log'),
      new_log;
   if(start_time){
      if (!old_log) {
         new_log = load_time;
      } else {
         new_log = old_log.trim() + delimeter + load_time;
      }
      stats_el.setAttribute('data-log', new_log);
      timer_el.innerHTML = load_time;
   }
   return;
}
function iframe_load_handler (e) {
   "use strict";
   var end_time = (new Date()).getTime(),
      frame = e.target,
      side = frame.getAttribute('data-side');
   stop_timer_el(side);
   log_iframe_load_event(side, end_time);
   set_status_el_value(side, 'Rendered');
}
function render_timers () {
   "use strict";
   var i = 0, timer, start_time, time_diff,
      timers = document.getElementsByClassName('timer'),
      num_timers = timers.length;
   for ( ; i < num_timers; i++){
      timer = timers[i];
      if (timer.getAttribute('data-loading')==="1") {
         start_time = parseInt(timer.getAttribute('data-start-time'));
         time_diff = (Math.round((new Date()).getTime() - start_time)/1000);
         set_timer_el_value(timer, time_diff);
      }
   }
   window.requestAnimationFrame(
      function() {
         render_timers();
      }
   );
}
function round_to_sig_figs (value, sig_figs){
   "use strict";
   var multiplier = Math.pow(10, sig_figs);
   value = Math.round(value * multiplier);
   return value / multiplier;
}
function calculate_mean_of_array (a) {
   "use_strict";
   var sum = 0, l = a.length;
   while (l > 0) {
      l--;
      sum += parseFloat(a[l]);
   }
   return (sum / a.length);
}
function calculate_variance_of_array (a, m) {
   "use_strict";
   var v = 0, i =0, l = a.length, mean;
   if (m === undefined) {
      mean = calculate_mean_of_array(a);
   } else {
      mean = m;
   }
   for ( ; i < l; i++) {
      v += Math.pow((parseFloat(a[i]) - mean),2); 
   }
   v /= l;
   return v;
}
function calculate_standard_deviation (a_or_variance, mean){
   "use_strict";
   var variance;
   if(a_or_variance instanceof Array) {
      if(mean === undefined) {
         variance = calculate_variance_of_array(a_or_variance);
      } else {
         variance = calculate_variance_of_array(a_or_variance, mean);
      }
   } else if (typeof a_or_variance === 'number') {
      variance = a_or_variance;
   }
   return Math.sqrt(variance);
}
function convert_array_nodes_to_numeric (a) {
   "use strict";
   var new_a = [], l = a.length;
   while (l > 0){
      l--;
      if (!isNaN(parseFloat(a[l]))) {
         new_a.unshift(parseFloat(a[l]));
      } else {
         throw new Error('Error converting "' +
         a[l] +'" to float at index = ' + l + '.');
      }
   }
   return new_a;
}
function render_iframe_statistics (side) {
   "use strict";
   var stats_el = get_iframe_statistics_el(side),
      iframe_url = get_iframe_el(side).getAttribute('data-src'),
      stats_data_str =  stats_el.getAttribute('data-log'),
      stats_data, num_tests, stddev_percent,
      i = 0, html, min = 0, mean = 0, max = 0, stddev = 0;
   // test to be sure that we have some statistics gathered
   if (stats_data_str && stats_data_str != '') {
      //parse array of run times from data attribute string
      stats_data = stats_data_str.split(',');
      num_tests = stats_data.length;
      stats_data = convert_array_nodes_to_numeric(stats_data);
      //calculate statistics
      mean = calculate_mean_of_array(stats_data);
      stddev = calculate_standard_deviation(stats_data, mean);
      min = Math.min.apply(Math, stats_data);
      max = Math.max.apply(Math, stats_data);
      stddev_percent = stddev / mean * 100;

      //print overall statistics table
      html = '<div><table>';
      html += '<thead>';
      html += '<tr>';
      html += '<th>Total tests</th>';
      html += '<th>Average load time (s)</th>';
      html += '<th>Standard deviation (s)</th>';
      html += '<th>Standard deviation (% of avg)</th>';
      html += '<th>Minimum load time (s)</th>';
      html += '<th>Maximum load time (s)</th>';
      html += '</tr>';
      html += '</thead>';
      html += '<tbody>';
      html += '<tr>';
      html += '<td>' + num_tests + '</td>';
      html += '<td>' + round_to_sig_figs(mean, 3) + '</td>';
      html += '<td>' + round_to_sig_figs(stddev,3) + '</td>';
      html += '<td>' + round_to_sig_figs(stddev_percent,2) + '</td>';
      html += '<td>' + min + '</td>';
      html += '<td>' + max + '</td>';
      html += '</tr>';
      html += '</tbody>';
      html += '</table>';

      //print chart container
      html += '<div class="side-chart"><svg></svg></div>';

      //print individual test load-times
      html += '<table id="' + side + '_test_log">';
      html += '<thead>';
      html += '<tr>';
      html += '<th>Test #</th>';
      html += '<th>Load Time (s)</th>';
      html += '</tr>';
      html += '</thead>';
      html += '<tbody>';
      for( ; i < num_tests; i++){
         html += '<tr>' +
            '<th>' + (i + 1) + '</th>' +
            '<td>' + stats_data[i] + '</td>' +
            '</tr>';
      }
      html += '<tr>' +
         '<th>Avg</th>' +
         '<th>' + round_to_sig_figs(mean, 3) + '</th>' +
         '</tr>';
      html += '</tbody>';
      html += '</table></div>';

      //insert html into statistic_el
      stats_el.innerHTML = html;

      //render graph
      initialize_statistics_graph(stats_data, stats_el.id);
   } else {
      //no tests have been run, and no statistics to show
      html = '<div><h3>No tests run yet:</h3>';
      html += '<p>Enter a URL above and click <i>Reload</i> to run a test</p>';
      html += '</div>';
      stats_el.innerHTML = html;
   }
   return stats_el;
}
function format_statistics_chart_data (num_array){
   "use strict";
   var l = num_array.length, 
      mean = calculate_mean_of_array(num_array),
      data = [
         {
            values: [],
            key: 'Individual load times',
            color:'#7B4D04'
         },
         {
            values: [],
            key: 'Average load Time',
            color:'#052751'
         }
      ];

   while ( l > 0 ) {
      l--;
      data[0].values.unshift({
         x: (l+1),
         y: num_array[l]
      });
      data[1].values.unshift({
         x: (l+1),
         y: mean
      });
   }
   return data;
}
function initialize_statistics_graph (data, container_id) {
   "use strict";
   var chart
   nv.addGraph(function() {
      chart = nv.models.lineChart()
         .options({
            margin: {left:100},
            showXAxis: true,
            showYAxis: true,
            transitionDuration: 250
         });
      chart.xAxis
         .axisLabel("Test number")
         .tickFormat(d3.format(' d'));

      chart.yAxis
         .axisLabel("Load time (s)")
         .tickFormat(d3.format(',.3f'));

      d3.select('#' + container_id + ' svg')
         .datum(format_statistics_chart_data(data))
         .call(chart);

      //TODO: Figure out a good way to do this automatically
      nv.utils.windowResize(chart.update);
      //nv.utils.windowResize(function() { d3.select('#chart1 svg').call(chart) });

      chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

      return chart;
   });
}



function sinAndCos() {
  var sin = [],
      cos = [];

  for (var i = 0; i < 100; i++) {
    sin.push({x: i, y: Math.sin(i/10)});
    cos.push({x: i, y: .5 * Math.cos(i/10)});
  }

  return [
    {
      values: sin,
      key: "Sine Wave",
      color: "#ff7f0e"
    },
    {
      values: cos,
      key: "Cosine Wave",
      color: "#2ca02c"
    }
  ];
}
function toggle_statistics_el (e) {
   "use strict";
   var button_el = e.target,
      side = button_el.getAttribute('data-side'), 
      stats_el = render_iframe_statistics(side);
   if (toggle(stats_el) === 'shown') {
      button_el.innerHTML = 'Hide Statistics';
   } else {
      button_el.innerHTML = 'Show Statistics';
   }
}
function fade_out (el) {
   el.classList.remove('fade-in');
   el.classList.add('fade-out');
}
function fade_in (el) {
   el.style.opacity = 0;
   el.classList.remove('fade-out');
   el.classList.add('fade-in');
}
function toggle (el) {
   if (el.classList.contains('fade-out')) {
      fade_in(el);
      return ('shown');
   } else {
      fade_out(el);
      return ('hidden');
   }
}

/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2011-06-15
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

if (typeof document !== "undefined" 
   && !("classList" in document.createElement("a"))
) {

   (function (view) {

      "use strict";

      var classListProp = "classList"
         , protoProp = "prototype"
         , elemCtrProto = (view.HTMLElement || view.Element)[protoProp]
         , objCtr = Object
         , strTrim = String[protoProp].trim || function () {
            return this.replace(/^\s+|\s+$/g, "");
         }
         , arrIndexOf = Array[protoProp].indexOf || function (item) {
            var i = 0
               , len = this.length;
            for (; i < len; i++) {
               if (i in this && this[i] === item) {
                  return i;
               }
        }
           return -1;
         }
         // Vendors: please allow content code to instantiate DOMExceptions
         , DOMEx = function (type, message) {
            this.name = type;
            this.code = DOMException[type];
            this.message = message;
         }
         , checkTokenAndGetIndex = function (classList, token) {
            if (token === "") {
               throw new DOMEx(
                  "SYNTAX_ERR"
                  , "An invalid or illegal string was specified"
               );
            }
            if (/\s/.test(token)) {
               throw new DOMEx(
                  "INVALID_CHARACTER_ERR"
                  , "String contains an invalid character"
               );
            }
            return arrIndexOf.call(classList, token);
         }
         , ClassList = function (elem) {
            var trimmedClasses = strTrim.call(elem.className)
               , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
               , i = 0
               , len = classes.length;
            for (; i < len; i++) {
               this.push(classes[i]);
            }
            this._updateClassName = function () {
               elem.className = this.toString();
            };
         }
         , classListProto = ClassList[protoProp] = []
         , classListGetter = function () {
            return new ClassList(this);
         };
         // Most DOMException implementations don't allow calling DOMException's toString()
         // on non-DOMExceptions. Error's toString() is sufficient here.
      DOMEx[protoProp] = Error[protoProp];
      classListProto.item = function (i) {
         return this[i] || null;
      };
      classListProto.contains = function (token) {
         token += "";
         return checkTokenAndGetIndex(this, token) !== -1;
      };
      classListProto.add = function (token) {
         token += "";
         if (checkTokenAndGetIndex(this, token) === -1) {
            this.push(token);
            this._updateClassName();
         }
      };
      classListProto.remove = function (token) {
         token += "";
         var index = checkTokenAndGetIndex(this, token);
         if (index !== -1) {
            this.splice(index, 1);
            this._updateClassName();
         }
      };
      classListProto.toggle = function (token) {
         token += "";
         if (checkTokenAndGetIndex(this, token) === -1) {
            this.add(token);
         } else {
            this.remove(token);
         }
      };
      classListProto.toString = function () {
         return this.join(" ");
      };

      if (objCtr.defineProperty) {
      var classListPropDesc = {
         get: classListGetter
         , enumerable: true
         , configurable: true
      };
      try {
         objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
      } catch (ex) { // IE 8 doesn't support enumerable:true
         if (ex.number === -0x7FF5EC54) {
            classListPropDesc.enumerable = false;
            objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
         }
      }
      } else if (objCtr[protoProp].__defineGetter__) {
         elemCtrProto.__defineGetter__(classListProp, classListGetter);
      }

   }(self));
}
