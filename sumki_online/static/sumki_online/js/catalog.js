$(function () {
    var choise = {};
    var options = {};
    var category = $("#category_cat").text();
    var sort = {
        'type_sort':'popular',
        'way_sort':'desc'
    };

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

    //сохраняем выбранные опции
    var save_choise = function () {
        var a = [23,24];
        $.cookie('choise', JSON.stringify(choise), {path: '/'});
        $.cookie('age', JSON.stringify(a), {path: '/'});
        /*console.log(a);
        console.log(JSON.stringify(a));*/
    };

    //добавляем выбранную опцию
    var add_choise = function () {
        /*all_parametr();*/
        save_choise();
    };

    var get_choise = function () {
        var json;
        json = $.cookie('choise');
        if(!json)
            json = '{}';
        choise = $.parseJSON(json);
    };

    var all_parametr = function () {
        var choise = {};
        $(".option_items").each(function (index,value) {
            var opt_active = {};
            var name_opt = $(value).attr("id");
            $(value).find(".option_item_value").each(function (index, value) {
                var el = $(value);
                if(el.hasClass("option_active"))
                    opt_active[el.data("optionId")]=el.text();
            });
            choise[name_opt] = opt_active;
        });
        return choise;
    };

    var update_item = function (data) {
        //обновляем панель пагинации
        $(".pagination_el").each(function (index,value) {
            $(value).children(".pagination").remove();
            $(value).prepend(data.paginator);
        });
        //обновляем список товаров
        var items_block = $(".block_items:eq(0)");
        items_block.find(".item").remove();
        items_block.prepend(data.items);

        //обновляем панель фильтрации
        add_choise();

        $.each(options, function (index, value) {
            var name_opt = index;

            $.each(value, function (index, value) {
                var el = $("#"+name_opt).find('#'+name_opt+'_'+index+'_option');
                if((data.options[name_opt][index]['number'] == undefined) || (parseInt(data.options[name_opt][index]['number']) == 0)){
                    el.next('span').text("");
                    el.css("color","#ccc").hover(function () {
                        $(this).css("color", "#999");
                    },function () {
                        $(this).css("color", "#ccc");
                    });
                }
                else{
                    el.next('span').text("("+data.options[name_opt][index]['number']+")");
                    el.css("color","").unbind();
                }
            });
        });
        fon_2.hide();
    };

    //переключаем страницу товаров
    var change_page = function (event) {
        event.preventDefault();
        fon_2.show();
        var obj = JSON.stringify(all_parametr());
        var href  = $(this).attr("href");
        var obj_sort = JSON.stringify(sort);
        $.get(href,{"options":obj,"sort":obj_sort}).done(function (data_json) {
            var data = $.parseJSON(data_json);
            update_item(data);
        });
    };
    //изменяем параметры фильтрации
    var change_parametr = function (event) {
        event.stopPropagation();
        fon_2.show();
        $(this).toggleClass("option_image_out option_image_in");
        $(this).find(".option_item_value").toggleClass("option_not_active option_active");
        var obj = JSON.stringify(all_parametr());
        var obj_sort = JSON.stringify(sort);
        $.get("/catalog/"+category+"/",{"options":obj, "sort":obj_sort}).done(function (data_json) {
            var data = $.parseJSON(data_json);
            update_item(data);
        });
    };

    $("#sorting_switcher").on("click",".inactive", function () {
        fon_2.show();
        var el = $(this);

        sort['type_sort'] = $(this).hasClass("popular_sorting")? "popular" : "price";
        sort['way_sort'] = el.hasClass("desc") ? 'desc' : 'asc';

        var obj_sort = JSON.stringify(sort);
        var obj = JSON.stringify(all_parametr());
        $.get("/catalog/"+category+"/",{"options":obj,"sort":obj_sort}).done(function (data_json) {
            var data = $.parseJSON(data_json);
            update_item(data);
        });

        el.closest("#sorting_switcher").find(".active").removeClass("active").addClass("inactive");
        el.removeClass("inactive").addClass("active");
    });
    $("#sorting_switcher").on("click",".active", function () {
        fon_2.show();
        var el = $(this);

        sort['type_sort'] = $(this).hasClass("popular_sorting")? "popular" : "price";
        if (el.hasClass("desc")){
            sort['way_sort'] = 'asc';
            el.removeClass("desc");
            el.find(".glyphicon-arrow-down").removeClass("glyphicon-arrow-down").addClass("glyphicon-arrow-up");
            el.addClass("asc");
        }
        else {
            sort['way_sort'] = 'desc';
            el.removeClass("asc");
            el.find(".glyphicon-arrow-up").removeClass("glyphicon-arrow-up").addClass("glyphicon-arrow-down");
            el.addClass("desc")
        }
        var obj_sort = JSON.stringify(sort);
        var obj = JSON.stringify(all_parametr());
        $.get("/catalog/"+category+"/",{"options":obj,"sort":obj_sort}).done(function (data_json) {
            var data = $.parseJSON(data_json);
            update_item(data);
        });
    });


    fill_options();
    $(".content_items").on("click",".href_active",change_page);
    $(".left_side_bar").on("click", ".option_item", change_parametr);
});