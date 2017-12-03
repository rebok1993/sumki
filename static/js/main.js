var korzina ={
    'products':[]
};
var window_inf;
var fon_2;
//сохранение корзины в куки
function save_korzina() {
    $.cookie('korzina', JSON.stringify(korzina), {path: '/'});
}
//показываем результирующий блок корзины
function show_result_korzina(choise) {
    if(choise){
        $("#item_absent").hide();
        $("#result_block").show();
    }
    else{
        $("#item_absent").show();
        $("#result_block").hide();
    }
}
//очищаем корзину
function clear_korzina() {
    $.cookie('korzina', '', {path: '/'});
    $(".item_in_mini_korz").remove();
    show_result_korzina(false);
}
//считает сумму по товарам в корзине
function count_summa() {
    var summa = 0;
    $.each(korzina['products'], function(index, value) {
            summa = summa+parseInt(value['price'])*parseInt(value['number']);
    });
    korzina['summa'] = summa;
    return summa;
}
//устанавливаем сумму в мини корзине
function  set_summa_korzina(summa) {
    $("#result").text(format_price(summa)+" руб.");
}
//форматирования цен
function format_price(numeric) {
    return new Intl.NumberFormat('ru').format(numeric);
}
//меняем количество товара в мини корзине
function change_number_in_mini_korz(id, number) {
    $("#item_in_korzina_"+id+" .number_in_korz").text(number+" шт");
}
//удаление из мини корзины
function delete_from_korzina(event, id_item) {
    var summa = 0;

    //если не передан ID
    if(id_item === undefined){
        id_item = $(this).data("deleteItem");
    }
    if(event != undefined){
        event.stopPropagation();
    }
    //удаляем элемент из корзины
    $.each(korzina['products'], function (index, value) {
        if(value['id'] == id_item) {
            korzina['products'].splice(index, 1);
            summa = count_summa();
            $("#result").text(summa+" руб.");
            return false;
        }
    });
    //удаляем элемент на станице корзины

    var id_order_item = $("#order_korzina #"+id_item);
    if(id_order_item.length){
        delete_order_item_el(id_order_item);
        set_k_oplate(summa);
    }

    $("#item_in_korzina_"+id_item).remove();
    save_korzina();
    if(korzina['products'].length==0) clear_korzina();
}
//изменение изображения в окне товара
function change_image(){
    var index = $(this).data("indexIm");
    $("#main_image_el .small").removeClass('small');
    $("#main_image_el li[data-index-ib = '"+index+"'] img").addClass('small');
    $("#main_image_el").css("left", "-"+index*440);
    $("#other_image_item_window").css("transform", "translate3d("+index*134+"px, 0px, 0px)");
    new_image = true;
    /*$(".active_other_image").removeClass("active_other_image");
    $(this).addClass("active_other_image");*/
}
//учитываем количество просмотров товара в базе
function add_number_views(id_elem) {
    $.get("/addNumberViews/"+id_elem+"/").done(function (data) {}).fail(function (data) {});
}


$(function () {
    fon_2 = $("#fon_wait_2");
    fon_2.hide();
    var time_id = 0;
    var json;
    window_inf = $("#more_information_window");


    //елемент в мини корзине
    var item = function (korzina_elem) {
        var dop_field = '';
        var copy_li = $('#copy_elem_mini_korz').clone();
        if(korzina_elem['size'])
            dop_field = "<br><span style='color: #aaa; font-size: 12px'>"+korzina_elem['size']+" размер</span>";
        copy_li.data('itemId', korzina_elem['id']);
        copy_li.data('itemCategory', korzina_elem['category']);
        copy_li.data('itemCategory', korzina_elem['category']);
        copy_li.attr('id', 'item_in_korzina_'+korzina_elem['id']);
        copy_li.find('img').attr('src', korzina_elem['image']);
        copy_li.find('.name_item_in_korz').html(korzina_elem['name']+dop_field);
        copy_li.find('.number_in_korz').text(korzina_elem['number']+' шт');
        copy_li.find('.price_in_mini_korz').text(format_price(korzina_elem['price'])+' руб.');
        copy_li.find('.delete_item').data('deleteItem',korzina_elem['id']);
        copy_li.show();
        return copy_li;
    };
    //функция заполнения корзины товарами из куки
    var fill_korzina = function () {
        var korzina_el;

        json = $.cookie('korzina');
        if(!json) return false;
        korzina = $.parseJSON(json);
        //показываем корзину
        show_result_korzina(true);

        korzina_el = $("#korzina_content ul");
        $.each(korzina['products'], function (index, value) {
            var tovar = item(value);
            korzina_el.prepend(tovar);
        });
        set_summa_korzina(count_summa());
    };
    //функция показа корзины
    var show_korzina = function (event) {
        if (event){
            clearTimeout(time_id);
            event.stopPropagation();
        }
        $("#korzina_block").children(".korzina_inactive").toggleClass("korzina_inactive korzina_active");
        $("#korzina_block").css({
            "background-color":"#fff"
        });
        $("#korzina_block").children("#korzina_content").slideDown();
    };
    //функция скрытия корзины
    var hide_korzina = function (event) {
        if(event){
            event.stopPropagation();
        }
        time_id = setTimeout(function () {
            $("#korzina_block").children("#korzina_content").slideUp(400, function () {
                $("#korzina_block").css({
                    "border":"1px solid transparent",
                    "background-color":"transparent"
                });
                $("#korzina_block").find(".korzina_active").toggleClass("korzina_inactive korzina_active");
            });
        },500);
    };

    //анимация перемещения картинки в корзину
    var animate_icon_in_korzina = function (id) {
        var pos = $("#"+id+" .image_item").offset();
        var right = window.innerWidth - 150;
        $("#"+id+" .image_item")
            .clone()
            .css({'position':'absolute', 'top':pos.top, 'left':pos.left, 'z-index':'100', 'border-radius': '10px'})
            .appendTo(".main_fon")
            .animate({
                opacity:0.3,
                top:50,
                left:right,
                width:20,
                height:20}, 700, function () {
                    $(this).remove();
                    $("#korzina_block").css({"border": "1px solid #CC6A3B", "border-radius":"10px"});
                    setTimeout(function () {
                        $("#korzina_block").css({"border": "", "border-radius":""});
                    }, 2000);
                    /*show_korzina();*/
            });
        window.scrollTo(0,0);
    };
    //функция добавления нового товара в корзину
    var add_in_korzina = function () {
        var id,name,price,image,element,number;
        //меняем значки
        var id_elem;
        var korzina_elem = {};
        var size;
        var new_tovar = true;

        //показываем корзину
        show_result_korzina(true);

        var more_window = $(this).closest("#more_information_window");
        id_elem = more_window.data("itemElement");
        korzina_elem['id'] = id_elem;
        korzina_elem['name'] = more_window.data("itemName");
        korzina_elem['price'] = more_window.data("itemPrice");
        korzina_elem['category'] = more_window.data("itemCategory");
        var s1 = more_window.data("itemImage");
        s1 = s1.replace("400_on_400", "64_on_64");
        korzina_elem['image'] = s1;
        korzina_elem['number'] = 1;

        size = $("#more_information_sizes select").val();
        if(size){
            korzina_elem['size'] = size;
        }
        $.each(korzina['products'], function (index, elem) {
            if(korzina_elem['size']){
                if((elem.id == korzina_elem['id']) && (elem.size == korzina_elem['size'])){
                    new_tovar = false;
                    elem.number+= korzina_elem['number'];
                    change_number_in_mini_korz(elem.id, elem.number);
                    return true;
                }
            }
            else if(elem.id == korzina_elem['id']){
                    new_tovar = false;
                    elem.number+= korzina_elem['number'];
                    change_number_in_mini_korz(elem.id, elem.number);
                    return true;
            }
        });
        if(new_tovar){
            korzina['products'].push(korzina_elem);
            element = item(korzina_elem);
            $("#korzina_content ul").prepend(element);
        }
        save_korzina();
        //устанавливаем сумму в мини корзине
        set_summa_korzina(count_summa());
        hide_more_info(undefined,true);
        $("#add_or_next_window").fadeIn();
        animate_icon_in_korzina(korzina_elem['id']);
        /*setTimeout(hide_korzina, 5000);*/
        add_number_views(id_elem);
    };
    //показываем окно больше информации о товаре
    var show_more_info = function (event, item_mini) {
        var item, id, category;
        //показываем серый фон
        $('body').addClass('stop-scrolling');
        $("#fon_wait").show();

        if(item_mini === undefined){
            item = $(this).closest(".item");
            id = item.attr("id");
            category = item.data("itemCategory");
        }
        else{
            id = item_mini.data("itemId");
            category = item_mini.data("itemCategory");
        }

        var obj = {};
        if(typeof all_parametr == 'function'){
            obj = all_parametr();
        }
        obj.item = id;
        $.get("/catalog/"+category+"/", obj).done(function (data_json) {
            var data = $.parseJSON(data_json);
            more_info_get(data);
        });

        //показываем мини окно товара
        /*window_inf.fadeIn();*/
    };

    //события после загрузки изображений
    var img_loaded = function () {
        console.log('Загрузилось');
        $('.wait_load_image').hide();
        $(this).parent().addClass('loaded');
        flag1=true;
    };

    var more_info_get = function (data) {
        flag1 = false;
        $('.wait_load_image').show();
        $('body').addClass('stop-scrolling');
        $("#fon_wait").show();
        if((window.location.pathname+window.location.search) != data['url_path']){
            window.history.pushState(null, '', data['url_path']);
        }
        $("#fon_wait").append(data['more_info_win']);
        $("#fon_wait").find('img').on('load', img_loaded);
        update_el();
    };
    //скрываем окно больше информации о товаре
    var hide_more_info = function (event, added_item, back_step) {
        $("#more_information_window").remove();
        if(added_item === undefined){
            $("#fon_wait").hide();
            $('body').removeClass('stop-scrolling');
        }
        if(back_step === undefined){
            var str = window.location.href;
            var res = str.replace(/&item=\d+/g,'');
            res = res.replace(/\?item=\d+/g,'');
            window.history.pushState(null, '', res);
        }
    };
    //действии при продолжении покупки по добавления в корзину
    var next_buy = function () {
        $('body').removeClass('stop-scrolling');
        $("#fon_wait").hide();
        $("#add_or_next_window").fadeOut();
    };

    var step_back_or_forward = function () {
        if(window.location.search==''){
            hide_more_info(undefined, undefined, true);
            return;
        }
        $.ajax({
            url:window.location.pathname+window.location.search,
            success:function (data_json) {
                var data = $.parseJSON(data_json);
                if(typeof update_item == 'function' && data['options'] !== undefined){
                    hide_more_info(undefined, undefined, true);
                    update_item(data);
                }
                if(data['sort'] !== undefined){
                    sort_el_get(data);
                }
                if(data['more_info_win'] !== undefined){
                    $("#add_or_next_window").fadeOut();
                    more_info_get(data);
                }
            }
        });
    };

    //main
    fill_korzina();
    $(window).on("beforeunload", function () {
        $("#fon_wait_2").show();
    });
    $("#korzina_block").on("mouseover", show_korzina);
    $("#korzina_block").on("mouseout", hide_korzina);
    $("body").on("click", ".add_in_korzina", add_in_korzina);
    $("#korzina_content").on("click", ".delete_item", delete_from_korzina);
    $("body").on('click', '.item_in_mini_korz', function (event) {
        var item_mini = $(this);
        show_more_info(event, item_mini);
    });

    $(".main_content .content_items").on("mouseover",".item",function (event) {
        event.stopPropagation();
        $(this).css({"border":"1px solid #d4dbe0","z-index":"10"});
        $(this).find(".hide_element").css("visibility","visible");
    });
    $(".main_content .content_items").on("mouseout",".item",function (event) {
        event.stopPropagation();
        $(this).css({"box-shadow": "none","border":"","z-index":"1"});
        $(this).find(".hide_element").css("visibility","hidden");
    });
    $(".block_items").on("click", ".more_information", show_more_info);
    $("body").on("click", "#more_information_close", hide_more_info);
    $("body").on("click", "#next_buy", next_buy);
    $("body").on("click", "#next_order", function () {
       document.location.href="/order";
    });
    //смена фотографии в доп. окне
    $("body").on("click", ".other_image_item", change_image);
    //для активации кнопок вперёд и назад
    $(window).on('popstate', step_back_or_forward);
    $('#main_image_el img').on('load', img_loaded);
});