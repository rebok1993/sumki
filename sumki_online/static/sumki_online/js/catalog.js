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
            var opt_active = [];
            var name_opt = $(value).attr("id");
            $(value).find(".checkbox input").each(function (index, value) {
                opt_active.push($(value).val());
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
            var opt_active = [];
            var name_opt = $(value).attr("id");
            $(value).find(".checkbox input").each(function (index, value) {
                var el = $(value);
                if(el.prop("checked"))
                    opt_active.push(el.val());
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
                if(value in data.options[name_opt]){
                    $("#"+name_opt).find('input[value="'+value+'"] ~ span').text("("+data.options[name_opt][value]+")");
                }
                else{
                    $("#"+name_opt).find('input[value="'+value+'"] ~ span').text("");
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
        })
    };
    //изменяем параметры фильтрации
    var change_parametr = function (event) {
        console.log("тУТ");
        event.stopPropagation();
        fon_2.show();
        $(this).closest(".checkbox").toggleClass("active_el");
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
        fon_2.hide();
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
        fon_2.hide();
    });


    fill_options();
    $(".content_items").on("click",".href_active",change_page);
    $(".left_side_bar").on("change", "input", change_parametr);
});