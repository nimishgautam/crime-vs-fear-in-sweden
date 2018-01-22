
// Initialize variables

var globalVizCategories = [ 'crime', 'fear' ];
var display_data = {};
var display = {};


var customImageProperties = ['height', 'width'];

for (var i in globalVizCategories){
    display[globalVizCategories[i]] = {};
    display_data[globalVizCategories[i]]= {};
}

// Deferred Load visualization data and presentation metadata from directories

var vizLoaders = [];

includedVisualizations.forEach( function(visualization_filename){
    vizLoaders.push(
        $.ajax({
            url: "./js/elements/" + visualization_filename + ".js",
            dataType: "script"
        })
    );
});

// Update data on select change

function updateData(visualizationCategory, dataSource){
    
    $('#rootVizContainer_' + visualizationCategory).empty();
    display_data[visualizationCategory] = {};

    $.ajax({
        url: "./js/data/" + visualizationCategory + "/" + dataSource + ".js",
        dataType: "script",
        success: function(){ updateDisplay(visualizationCategory) }
    });

}

// Need to populate graph on load as well as on click
// moved to a fn
function populateGraph( visualizationCategory, visualizationName, dataSelector ) {

    var graphContainer = $('[data-graph-for="' + visualizationName + "_" + visualizationCategory + '"]');
    var graphDisplayObj =  display[visualizationCategory][visualizationName]["graph"][ dataSelector ];
    var dataArray = display_data[visualizationCategory][visualizationName][ dataSelector ];

    var vizLabel = $('[data-vizlabel="' + visualizationCategory + "_"+ visualizationName + '"]');
    if (typeof vizLabel.attr('data-staticLabel') == 'undefined'){
        vizLabel.text(dataSelector);
    }
    graphContainer.empty();

    var buildSubunitDisplay = function(label_, percentage_){
        // if percentage < 0, don't include
        if (percentage_ < 0) { return true; }

        // subunit display settings/logic here
        var subunit_whole_graph = $("<div></div>", {
            class: 'subunit_whole_graph',
            title: percentage_ + "%"
        });
        var subunit_label = $("<div></div>", {
            class: 'subunit_label',
            text: label_
        });

        var subunit_outer = $("<div></div>", {
            class: 'subunit_outer',
        });

        var subunit_inner = $("<div></div>", {
            class: 'subunit_inner',
            text: percentage_ + "% \xa0" ,
            width: percentage_ + "%"
        });

        subunit_outer.append(subunit_inner);
        subunit_whole_graph.append(subunit_label);
        subunit_whole_graph.append(subunit_outer);
        graphContainer.append(subunit_whole_graph);

    };

    if(graphDisplayObj.hasOwnProperty('subunits')){
        for( var graph_subunit in graphDisplayObj['subunits'] ){
            var unit_label = graph_subunit;
            if( graphDisplayObj['subunits'][graph_subunit].hasOwnProperty('label')){
                unit_label = graphDisplayObj['subunits'][graph_subunit]['label'];
            }
            if( dataArray.hasOwnProperty(graph_subunit) ){
                buildSubunitDisplay(unit_label, dataArray[graph_subunit]);
            }

        }
    } 

    if(display_data[visualizationCategory][visualizationName][ dataSelector ].hasOwnProperty('combined')){
        
        var first_outer = graphContainer.find('.subunit_outer').first();
        var combined_val = display_data[visualizationCategory][visualizationName][ dataSelector ]['combined'];
        var avg_line = $("<div></div>", {
            class: 'avg_line',
            text: '\xa0', // &nbsp; in JS
            height: graphContainer.height(),
            title: combined_val + "%"
        });

        avg_line.css('left',combined_val + "%" );
        avg_line.css('top', 0.0 - first_outer.height() / 2);
        first_outer.prepend(avg_line);

    }
    
}

// create display on change
// nb: this redraws everything, could be done better as a react or angular app later

function updateDisplay(visualization_category){
    
    // for each display...
    for( var visualization_name in display[visualization_category] ){

        // root container of visualization
        var viz_container = $("<div></div>", {
            class:"root_visualization_container",
        }).attr('data-visualization_name', visualization_name);

        var viz_title_container = $("<div></div>", {
            class: "viz_title_container"
        });
        var viz_title = $("<div></div>", {
            class: "viz_title",
            text: visualization_name
        });
        var viz_subtitle = $("<div></div>", {
            class: "viz_subtitle",
            "data-vizlabel": visualization_category + "_" + visualization_name
        });

        if(display[visualization_category][visualization_name]['graph'].hasOwnProperty('staticLabel')){
            viz_subtitle.text(display[visualization_category][visualization_name]['graph']['label']);
            viz_subtitle.attr('data-staticLabel', 'true');
        }

        viz_title_container.append(viz_title);
        viz_title_container.append(viz_subtitle);

        viz_container.append(viz_title_container);
        var viz_selector = display[visualization_category][visualization_name]["selector"];

        // visualization selector
        // displays image and lets you select based on it
        var select_container = $("<div></div>",{
            class:'select_container'
        }).attr('data-state', 'closed');

        var select_outer_container = $("<div></div>").addClass('select_outer_container');

        for( var selector_index in viz_selector ){ 

            var select_image = $('<img>', {
                src: viz_selector[selector_index]['image'],
                title: selector_index
            });

            for( var img_idx in customImageProperties ){
                var img_property = customImageProperties[img_idx];
                if(viz_selector[selector_index].hasOwnProperty(img_property)){
                    select_image.css(img_property, viz_selector[selector_index][img_property]);
                }
            }

            var selection_obj = $("<div></div>", {
                class: 'selection_obj'
            }).attr('data-selector', selector_index);

            selection_obj.append(select_image);
            select_container.append(selection_obj);
        }


        select_outer_container.append(select_container);

        //visualization graphs
        var graphs_outer_container = $("<div></div>", {
            class: 'graphs_outer_container',
            "data-graph-for" : visualization_name + "_" + visualization_category
        });

        var select_graph_container = $("<div></div>", {
            class: 'select_graph_container'
        });

        select_graph_container.append(select_outer_container);
        select_graph_container.append(graphs_outer_container);

        viz_container.append(select_graph_container);

        $("#rootVizContainer_" + visualization_category).append(viz_container);
        
        //Now it's in the DOM, but the images might still be loading
        //The image size will impact the DOM object sizes, calculated later,
        //so that will be deferred

    }

    $("#rootVizContainer_" + visualization_category).imagesLoaded(function(){
        $(".rootVizContainer").find('.root_visualization_container').each(function(){
            
            var select_container = $(this).find('.select_container').first();
            var visualization_category = $(this).closest('.rootContainer').attr('data-visualization_category');
            var visualization_name = $(this).attr('data-visualization_name');

            // checking if it has been initialized or not
            if (typeof select_container.attr('data-maxht') == 'undefined'){
                
                var select_container_max_height = 0;
                var selection_objs = select_container.find('.selection_obj');
                
                // needs to be expandable
                if( selection_objs.length > 1 ){
                    select_container.addClass('expandible-select');

                    selection_objs.each(function(){
                        select_container_max_height += $(this).height();
                    });
                    select_container.attr('data-maxht', select_container_max_height);

                    selection_objs.each(function(){  
                        $(this).click(function(){
                            var selectContainer = $(this).closest('.select_container');
                            var visualizationName = $(this).closest('.root_visualization_container')
                                .attr("data-visualization_name");
                            var visualizationCategory = $(this).closest('.rootContainer').attr('data-visualization_category');

                            if(selectContainer.attr('data-state') == 'closed'){

                                // animate open only
                                selectContainer.animate({
                                    height: selectContainer.attr('data-maxht'),
                                    scrollTop: 0
                                }, 1000, null);
                                selectContainer.attr('data-state', 'open');

                            } else { 

                                //close it, then display data
                                selectContainer.animate({
                                    height: $(this).height(),
                                    scrollTop: $(this).find('img').first().position().top + $(this).position().top
                                }, 1000, null);

                                populateGraph( visualizationCategory, visualizationName, $(this).attr('data-selector'));
                                selectContainer.attr('data-state', 'closed');
                            }

                        });
                    });

                } else {
                    select_container.attr('data-maxht', selection_objs.first().height());
                }

                var first_select_elem = selection_objs.first();

                // set height from first element
                select_container.height( first_select_elem.height() );

                // set graph from first element
                populateGraph( visualization_category, visualization_name, first_select_elem.attr('data-selector'));


            }
        });
    });

}



// on Ready
$(function(){

    // populate option select
    for (var i in globalVizCategories){
        var visualizationCategory = globalVizCategories[i];
        var select_box = $("#data_select_" + visualizationCategory);
        for (var data_src in dataSources[ visualizationCategory]){
            //Title: filename
            var option = $("<option></option>", {
                value: dataSources[visualizationCategory][data_src],
                text: data_src
            });
            select_box.append(option);
        }

        select_box.on('change', function(){
            updateData( $(this).closest('.rootContainer').attr('data-visualization_category') , $(this).val() );
        });
    }

    // load visualizations, then load first options
    $.when.apply($, vizLoaders).done(function(){

        // Load first data
        for (var i in globalVizCategories){
            var visualizationCategory = globalVizCategories[i];
            var select_box = $("#data_select_" + visualizationCategory);
            var option = select_box.find('option').first();
            updateData(visualizationCategory, option.val());
        }

        });

    //the "about" info
    $('#overlay').hide();

    $('#helpspan').click(function(){
        $('#body_inner').addClass('blur_bg');
        $('#overlay').show();
    });

    $('#close_btn').click(function(){
        $('#body_inner').removeClass('blur_bg');
        $('#overlay').hide();
    });
});
