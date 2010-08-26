/* nikarma - script to parse data from the Ni_Karma.lua produced from the 
 * World of Warcraft Ni Karma addon from http://www.knights-who-say-ni.com/NKS
 * http://github.com/Mottie/nikarma
 *
 * Author: Rob G, aka Mottie (mottie.guildportal.com)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * v1.0 8/25/2010 Original version, posted to github
 */

(function($){

 $.fn.nikarma = function(options) {

  // build main options before element iteration
  var opts = $.extend({}, $.fn.nikarma.defaults, options);
  // iterate and reformat each matched element
  return this.each(function(){

   var $this = $(this);
   // build element specific options
   var o = $.meta ? $.extend({}, opts, $this.data()) : opts;

   // variables
   var i, t, tmp, n;

   // Extract data and make a tooltip
   var getInfo = function(m){
    var li = '',
    lastx = m.length-o.tooltipShowsLast-2, // subtract two more (zero based index & last entry has different data)
    // popup has all entries, tooltip has last 5 (or whatever number you set)
    popup = '<table><tr class="header"><th class="date">Date</th><th class="type">Type</th><th class="reason">Reason</th><th class="value">Value</th></tr>',
    // tooltip to show last 5
    tt = '<span class="title">' + m[m.length-1].fullname + '</span> (showing last ' + o.tooltipShowsLast +
     ' entries, click to show all)<br>' + popup;
    for ( i=0; i < m.length-1; i++ ){
     tmp = '<tr><td class="date">' + m[i].DT + '</td><td class="type">' + m[i].type + '</td><td class="reason">';
     popup += tmp;
     tt += (i > lastx) ? tmp : '';
     t = m[i].reason;
     // look for item link: "|cff0070dd|Hitem:14150:0:0:0:0:0:0:1497790976:80|h[Robe of Evocation]|h|r"
     // text color = #0070dd (ignore the cff in front)
     // item id = # after Hitem: = 14150
     if (t.match('Hitem')) {
      t = t.split('|');
      li = '<a style="color:#' + t[1].slice(-6) + '" href="http://www.wowhead.com/item=' + t[2].split(':')[1] +
       '">' + t[3].replace(/h\[|\]/g,'') + '</a>';
      t = li;
     }
     n = (m[i].value < 0) ? ' negative' : ''; // add negative class so text has different color
     tmp = t + '</td><td class="value' + n + '">' + m[i].value + '</td></tr>';
     tt += (i > lastx) ? tmp : ''; 
     popup += tmp;
    }
    popup += '</table>';
    tt += '</table>';
    // m[i] is the last entry, containing lifetime, fullname, points, class and lastadd for that character
    // popup = popup window data, stored in data-popup attribute
    // tt = tooltip showing the last 5 entries
    // li = last item received
    return [ m[i], popup, tt, li ];
   };

   // Build Table
   var buildTable = function(y){
    var a, t = '', n, c, z;
    for ( a in y ){
     if (typeof (y[a][0]) !== 'undefined'){ // won't break if subgroup is found
      z = getInfo(y[a]); // z[0] = lifetime, fullname, points, class & lastadd, z[1] = popup, z[2] = tooltip, z[3] = last item
      // replace "fixlocal" with Unknown class name
      c = (z[0].wowclass == 'fixlocal') ? o.fixClass[z[0].fullname] || 'Unknown' : z[0].wowclass;
      t += '<tr><td class="name">' + z[0].fullname + '</td>';
      t += '<td class="wowclass ' + c.replace(/\s/g,'').toLowerCase() + '">' + c + '</td>';
      t += '<td class="lastitem">' + z[3] + '</td>';
      n = (z[0].lifetime < 0) ? ' negative' : '';
      t += '<td class="total tooltip' + n + '" data-popup="' + z[1].replace(/\"/g,'&quot;') +
       '" title="' + z[2].replace(/\"/g,'&quot;') + '">' + z[0].points + '</td></tr>';
     }
    }
    // Show results
    if (t === '') {
     $this.hide().after('<div align="center">No Data Found!</div>');
    } else {
     $this.find('tbody').append(t); // IE likes appending to tbody
     // add table sorting
     $this.find('table').tablesorter({
      textExtraction: function(node) {
      return $(node).text();
      },
      sortList: [o.sortOrder] // Initial sort
     });
     // Make popup window - include css & wowhead tips
     $this.find('td.total').click(function(){
      var n = $(this).closest('tr').find('.name').html();
      var c = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">' +
       '<html><head><link rel="stylesheet" href="' + $('link').attr('href') + '" type="text/css" ><title>' +
       n + '</title>' + '<scr' + 'ipt type="text/javascript" src="http://www.wowhead.com/widgets/power.js"></scr' +
       'ipt></head><body>' + $(this).attr('data-popup') + '</body></html>';
      var w = window.open('',n, 'width=' + o.popupWidth + ',height=' + o.popupHeight + ',scrollbars=1,resizable=1,toolbar=1,menubar=1,status=1');
      w.document.write(c);
      w.document.close();
     });
    }
   };

   // Get File & process it
   $.ajax({
    url: o.nkFile,
    success: function(data){
     // Reformat LUA to JSON
     var i, d = data
      .replace(/\]\s\=/g,':')               // change equal to colon
      .replace(/[\t\r\n]/g,'')              // remove tabs & returns
      .replace(/,\}/g,'}')                  // remove trailing comma
      .replace(/\},/g,'}],')                // temp change to close subgroup
      .replace(/\],\s--\s\[\w+\]/g,',')     // remove close subgroup and comment
      .replace(/,\[/g,',')                  // remove open square bracket after commas
      .replace(/\{\{\[/g,'[{')              // reverse order of open brackets
      .replace(/\{\[/g,'{')                 // remove extra open square bracket
      .replace(/\}\}\]/g,'}]')              // fix closing set brackets
      .replace(/\{\}\]/g,'{}')              // fix empty sets
      .replace(/"lifetime"/g,'{"lifetime"') // make it a subgroup
      .replace(/class/g,'wowclass')         // replace class (reserved word)
      .replace(/\}\}\}/g,'}]}}}}')          // last line
      .replace(/KarmaList\s\=/,'');         // remove variable definition from beginning
     // remove plugin configuration from the end
     if (d.lastIndexOf('KarmaConfig')) { d = d.substring(0, d.lastIndexOf('KarmaConfig')); }
     var x = $.parseJSON(d);

     // Get target data from database location
     var y = x, b = o.database.split('.');
     for (i = 0; i < b.length; i++){
      y = y[b[i]];
     }

     // build Ni Karma table
     buildTable(y);
    },
    error: function(){
     $this.html('<div align="center">No Data Found!</div>');
    }
   });
  });
 };

 $.fn.nikarma.defaults = {
  nkFile           : 'Ni_Karma.lua',   // Ni Karma file name & location
  database         : 'Test.ICC.ICC25', // Ni Karma Database location
  tooltipShowsLast : 5,                // show the last # entries in the tooltip
  popupWidth       : 500,              // popup window width
  popupHeight      : 450,              // popup window height
  sortOrder        : [0,0],            // Initial sort by column 0 (far left) in ascending order (a-z)
  fixClass         : []                // Replace "Unknown" with class: fix['Toon Name'] = 'Class';
                                       // 'Toon Name' should include all capitals and spaces, exactly like you see it in the table
                                       // 'Class' should be a predefined wow class (captial letters don't matter)
 };

})(jQuery);