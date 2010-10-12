**Features** ([demo][1])

* Parse Ni_Karma.lua file created by the World of Warcraft Ni Karma
* addon (http://www.knights-who-say-ni.com/NKS) using javascript/jQuery only.
* Display results as a sortable table with char, class, last item received & total karma.
* A tooltip display, seen when hovering over the total karma column, shows the last 5 (by default)
  reasons for Karma changes.
* Clicking on the Total Karma column will open a window with all available loot history for that character.
* Loot links to wowhead show item quality color and tooltips.
* Choose from either a dark or light stylesheet, or make your own.

**Usage & Options (defaults)**

Script:

    $('#nikarma').nikarma({
     nkFile           : 'Ni_Karma.lua',   // Ni Karma file name & location
     database         : 'Test.ICC.ICC25', // Ni Karma Database location
     tooltipShowsLast : 5,                // show the last # entries in the tooltip
     popupWidth       : 500,              // popup window width
     popupHeight      : 450,              // popup window height
     sortOrder        : [0,0],            // Initial sort by column 0 (far left) in ascending order (a-z)
     fixClass         : []                // Replace "Unknown" with class: fix['Toon Name'] = 'Class';
                                          // 'Toon Name' should include all capitals and spaces, exactly like you see it in the table
                                          // 'Class' should be a predefined wow class (captial letters don't matter)
    });

HTML:

    <div id="nikarma">
     <table>
      <thead>
       <tr class="title">
        <th class="name">Name</th>
        <th class="wowclass">Class</th>
        <th class="lastitem">Last Item</th>
        <th class="total">Total Karma</th>
       </tr>
      </thead>
      <tbody>
      </tbody>
     </table>
    </div>

**Changelog**

Version 1.0 (8/25/2010)

* Ni Karma script posted on github.

 [1]: http://mottie.github.com/nikarma/