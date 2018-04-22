var sort = {
        'type_sort':'popular_sorting',
        'way_sort':'desc'
    };
var options = {};

function all_parametr() {
    var choise = {};
    $(".option_items").each(function (index,value) {
        var options = $(value).find(".option_active");
        if(options.length){
            if(typeof choise.options == 'undefined'){
                choise.options = 1;
            }
            var opt_active = '';
            var name_opt = $(value).attr("id");
            options.each(function (index, value) {
                if(index>0) opt_active+=',';
                opt_active+=$(value).data("optionId");
            });
            choise[name_opt] = opt_active;
        }
    });
    choise.type_sort = sort.type_sort;
    choise.way_sort = sort.way_sort;
    console.log(choise);
    return choise;
}
function update_item(data) {
    //обновляем панель пагинации
    $(".pagination_el").each(function (index,value) {
        $(value).children(".pagination").remove();
        $(value).append(data.paginator);
    });
    //обновляем список товаров
    var items_block = $(".block_items:eq(0)");
    items_block.find(".item").remove();
    items_block.prepend(data.items);

    //обновляем хлебные крошки
    var five_row = $('.header_five_row');
    five_row.find('.breadcrumb_block').remove();
    five_row.append(data['breadcrumbs']);


    //обновляем высота блоков товаров
    set_height_item();
    //обновляем панель фильтрации
    $.each(options, function (index, value) {
        var name_opt = index;

        $.each(value, function (index, value) {
            var el = $("#"+name_opt).find('#'+name_opt+'_'+index+'_option');
            if((data.options[name_opt][index]['number'] == undefined) || (parseInt(data.options[name_opt][index]['number']) == 0)){
                /*el.next('span').text("");*/
                /*el.addClass('null_number');*/
            }
            else{
                /*el.removeClass('null_number');*/
                /*el.next('span').text("("+data.options[name_opt][index]['number']+")");*/
                el.css("color","").unbind();
            }
            var parent_el = el.parent('.option_item');
            if(typeof(data.options[name_opt][index]['selected']) != 'undefined' && data.options[name_opt][index]['selected'] !== null){
                if(!parent_el.hasClass('option_image_in'))
                    parent_el.toggleClass("option_image_out option_image_in");
                if(!el.hasClass('option_active'))
                    el.toggleClass("option_not_active option_active");
            }
            else{
                if(!parent_el.hasClass('option_image_out'))
                    parent_el.toggleClass("option_image_out option_image_in");
                if(!el.hasClass('option_not_active'))
                    el.toggleClass("option_not_active option_active");
            }
        });
    });
    fon_2.hide();
}

function sort_el_get(data) {
    $("."+data['sort']).prop('selected', true);
}

$(function () {
    var category = $("#category_cat").text();

    //заполняем список опций
    var fill_options = function () {
        $(".option_items").each(function (index,value) {
            var opt_active = {};
            var name_opt = $(value).attr("id");
            $(value).find(".option_item_value").each(function (index, value) {
                opt_active[$(value).data("optionId")]=$(value).text();
            });
            options[name_opt] = opt_active;
        });
    };

    //переключаем страницу товаров
    var change_page = function (event) {
        event.preventDefault();
        fon_2.show();
        window.scrollTo(0,160);
        var obj = all_parametr();
        var href  = $(this).attr("href");
        $.get(href,obj).done(function (data_json) {
            var data = $.parseJSON(data_json);
            update_item(data);
        });
    };
    //изменяем параметры фильтрации
    var change_parametr = function (event) {
        event.stopPropagation();
        fon_2.show();
        var parent_el = $(this).parents('.option_items').eq(0);

        if(parent_el.attr('id') == 'type_sumki'){
            parent_el.find('.option_active').toggleClass("option_not_active option_active");
            parent_el.find('.option_image_in').toggleClass("option_image_out option_image_in");
        }
        $(this).toggleClass("option_image_out option_image_in");
        $(this).find(".option_item_value").toggleClass("option_not_active option_active");


        var obj = all_parametr();
        $.get("/catalog/"+category+"/",obj).done(function (data_json) {
            var data = $.parseJSON(data_json);
            if((window.location.pathname+window.location.search) != data['url_path']){
                window.history.pushState(null, '', data['url_path']);
            }
            update_item(data);
        });
        return false;
    };

    var sort_el = function () {
        fon_2.show();
        var el = $(this);
        var opt = el.find("option:selected");
        el.val();
        sort['type_sort'] = el.val();
        sort['way_sort'] = opt.hasClass("desc") ? 'desc' : 'asc';
        var obj = all_parametr();
        $.get("/catalog/"+category+"/",obj).done(function (data_json) {
            var data = $.parseJSON(data_json);
            if((window.location.pathname+window.location.search) != data['url_path']){
                window.history.pushState(null, '', data['url_path']);
            }
            update_item(data);
        });
    };

    fill_options();
    var first_el_item = $('.item').eq(0);

    $(".content_items").on("click",".href_active",change_page);
    $(".left_side_bar").on("click", ".option_item", change_parametr);
    $("#sorting").on("change","#select_sort_type", sort_el);
    $(".left_side_bar .name_header").on('click', function () {
        var body_opt_el = $(this).siblings('.body_option');
        if(body_opt_el.hasClass('body_option_active')){
            body_opt_el.hide();
            $(this).find('.glyphicon-name-header').addClass('glyphicon-name-header-inactive');
        }
        else{
            $(this).find('.glyphicon-name-header').removeClass('glyphicon-name-header-inactive');
            body_opt_el.show();
        }

        body_opt_el.toggleClass('body_option_active body_option_inactive');
    });
    $('#filter_mobile_button').on('click', function () {
        if($('.option_items').hasClass('hidden-sm') || $('.option_items').hasClass('hidden-xs')){
            var body_opt = $('.body_option');
            body_opt.each(function (index, value) {
                if($(value).hasClass('body_option_active')){
                    $(value).hide();
                    $(value).siblings('.name_header').find('.glyphicon-name-header').addClass('glyphicon-name-header-inactive');
                }
                $(value).toggleClass('body_option_active body_option_inactive');
            });
            $('.option_items').removeClass('hidden-sm hidden-xs');
            $(this).find('.glyphicon-name-header').toggleClass('glyphicon-name-header-inactive glyphicon-name-header-active');
        }
        else{
            $('.option_items').toggleClass('option_items_active_el option_items_inactive_el');
            $(this).find('.glyphicon-name-header').toggleClass('glyphicon-name-header-inactive glyphicon-name-header-active');
        }
    });
});