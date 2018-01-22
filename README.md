# crime-vs-fear-in-sweden

Visualization of Crime vs Fear in Sweden

# Usage

'main file' is docroot/brott.html. makes ajax requests, so if you're running from 'file://' on a browser, you will need to set permissions to allow localhost ajax requests.

# Code structure

The 'main' file is in docroot/brott.html, with the config information at the top of this file. Basically, this is the part of the file that will let you decide which demographic information visualizers you would like to include.

Both 'crime' and 'fear' visualizations are pulled in from js/data/crime and js/data/fear respectively. They follow a template generated from the data sources; that template can be found in template.js in both the directories. 

Note that right now the JSON files are static, so there's really no reason to make as many resource calls as I do, other than cleaner seperation of code. All the JSON files could be easily loaded into one file and selection done via array index, but where's the fun in that?

I started the JS in jQuery, but the stage of complexity it has reached warrants a more structured framework if further development is to be done.

# Sources/Credits/etc

This is a visualization of the data sources found 
(https://www.bra.se/brott-och-statistik/statistiska-undersokningar.html)[https://www.bra.se/brott-och-statistik/statistiska-undersokningar.html] from 2016.

Using (images loaded)[https://github.com/desandro/imagesloaded] plugin and jQuery. All images are (CC0)[https://creativecommons.org/share-your-work/public-domain/cc0/] from various authors at pixabay.com, or work I've modified and released as CC0.
