var korzina ={
    'products':[]
};
var window_inf;
var fon_2;
var add_or_next_window;
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
    if(korzina['products'].length==0) show_result_korzina(false);
}
//изменение изображения в окне товара
function change_image(){
    var index = $(this).data("indexIm");
    $("#main_image_el").css("left", "-"+index*440);
    $("#other_image_item_window").css("transform", "translate3d("+index*134+"px, 0px, 0px)");
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


    //елемент в мини корзине
    var item = function (korzina_elem) {
        var dop_field = '';
        if(korzina_elem['size'])
            dop_field = "<br><span style='color: #aaa; font-size: 12px'>"+korzina_elem['size']+" размер</span>";
        return "<li id='item_in_korzina_"+korzina_elem['id']+"' class='item_in_mini_korz'>" +
                     "<a class='item_in_korzina'>" +
                         "<div class='img_item'>" +
                            "<img width='64' height='64' src='"+korzina_elem['image']+"'>" +
                         "</div>" +
                         "<div style='margin-left: 70px'>" +
                            "<div style='overflow: hidden'>" +
                                "<div class='name_item_in_korz'>"+korzina_elem['name']+dop_field+"</div>" +
                                "<div class='number_in_korz'>"+korzina_elem['number']+" шт</div>" +
                            "</div>" +
                            "<div style='text-align: right'>"+format_price(korzina_elem['price'])+" руб.</div>" +
                         "</div>" +
                     "</a>" +
                     "<div class='delete_item' data-delete-item='"+korzina_elem['id']+"' title='удалить'>x</div>" +
                  "</li>";
    };
    //функция заполнения корзины товарами из куки
    var fill_korzina = function () {
        var korzina_el;

        json = $.cookie('korzina');
        if(!json) return false;
        /*if(!json)
            json = '[]';
        korzina = $.parseJSON(json);
        if(korzina.length==0){
            return false;
        }*/
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
        $("#korzina_block").css("border", "1px solid #CC6A3B");
        $("#korzina_block").children("#korzina_content").slideDown();
    };
    //функция скрытия корзины
    var hide_korzina = function (event) {
        if(event){
            event.stopPropagation();
        }
        time_id = setTimeout(function () {
            $("#korzina_block").find(".korzina_active").toggleClass("korzina_inactive korzina_active");
            $("#korzina_block").children("#korzina_content").slideUp(400, function () {
                $("#korzina_block").css("border", "1px solid transparent");
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
        var par,id,name,price,image,element,number;
        //меняем значки
        var id_elem;
        var korzina_elem = {};
        var size;
        var new_tovar = true;

        //показываем корзину
        show_result_korzina(true);

        id_elem = $(this).closest("#more_information_window").data("itemElement");
        par = $("#"+id_elem);
        korzina_elem['id'] = par.attr("id");
        korzina_elem['name'] = par.find(".name_item").eq(0).data("itemName");
        korzina_elem['price'] = par.find(".price_item").eq(0).data("itemPrice");
        var s1 = par.find(".image_item").eq(0).attr("src");
        s1 = s1.replace("200_on_200", "64_on_64");
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
        window_inf.css("display", "None");

        if(!add_or_next_window) add_or_next_window = $("#add_or_next_window");
        add_or_next_window.fadeIn();
        animate_icon_in_korzina(korzina_elem['id']);
        /*setTimeout(hide_korzina, 5000);*/
        remove_attr_in_more_info();
        add_number_views(id_elem);
    };
    //показываем окно больше информации о товаре
    var show_more_info = function () {
        if (!window_inf) window_inf = $("#more_information_window");
        //показываем серый фон
        $("#fon_wait").show();

        //добавляем всю информацию о товаре в мини окно товара
        var item = $(this).closest(".item");
        var src = item.find("img").attr("src");
        src = src.replace("200_on_200", "main");
        var way_bas = src.replace(".jpg", "");
        var price = item.find(".price_item").text();
        var name = item.find(".name_item").text();
        var id = item.attr("id");
        var sizes = item.find(".size_item");
        if(sizes.length>0){
            var size_option = "";
            var window_sizes = window_inf.find("#more_information_sizes");
            var options = window_sizes.find("option");
            window_sizes.show();
            sizes.each(function (index, elem) {
                size_option += "<option>"+$(elem).text()+"</option>";
            });
            if(options.length>0) options.remove();
            window_sizes.find("select").append(size_option);
        }
        else window_inf.find("#more_information_sizes").hide();

        var i = 1;
        var img_n = [];
        var img_n2 = [];
        var new_way, new_li_small, new_li_big,number_iter=3, index = 0;
        $("#main_image_el").append("<li data-index-ib='"+index+"'><img src='"+src+"' width='440px' height='440px'></li>");
        $("#other_image").append("<li data-index-im='"+index+"' class='active_other_image other_image_item'><img src='"+src+"' width='120' height='120'></li>");
        while(i<=number_iter){
            new_way = way_bas+"v"+i+".jpg";
            img_n[i] = new Image();
            img_n2[i] = new Image();
            img_n[i].width = 120;
            img_n[i].height = 120;
            img_n2[i].width = 440;
            img_n2[i].height = 440;
            img_n[i].onload = function (x) {
                return function(){
                    index++;
                    new_li_small = "<li data-index-im='"+index+"' class='other_image_item'></li>";
                    $("#other_image").append($(new_li_small).append(img_n[x]));
                };
            }(i);
            img_n2[i].onload = function (x) {
                return function(){
                    new_li_big = "<li data-index-ib='"+index+"'></li>";
                    $("#main_image_el").append($(new_li_big).append(img_n2[x]));
                    /*set_width_ul();*/
                };
            }(i);
            img_n[i].src = new_way;
            img_n2[i].src = new_way;
            i++;
        }
        $.get("/getOptionsAjax/"+id+"/").done(function (data) {
            $("#description_item_full").append(data);
        });
        window_inf.find("#more_information_price").text(price);
        window_inf.find("#more_information_name").text(name);
        window_inf.data("itemElement", id);

        //показываем мини окно товара
        window_inf.fadeIn();
    };
    //скрываем окно больше информации о товаре
    var hide_more_info = function () {
        window_inf.css("display", "None");
        $("#fon_wait").hide();
        remove_attr_in_more_info();
    };
    var remove_attr_in_more_info = function () {
        $("#other_image>li.other_image_item, #main_image_el>li").remove();
        $("#description_item_full div").remove();
        $("#main_image_el").css("left", "0");
        $("#other_image_item_window").css("transform", "translate3d(0px, 0px, 0px)");
    };
    //действии при продолжении покупки по добавления в корзину
    var next_buy = function () {
        $("#fon_wait").hide();
        $("#add_or_next_window").fadeOut();
    };

    //main
    fill_korzina();
    $(window).on("beforeunload", function () {
        $("#fon_wait_2").show();
    });
    $("#korzina_block").on("mouseover", show_korzina);
    $("#korzina_block").on("mouseout", hide_korzina);
    $(".block_items").on("click", ".add_in_korzina", add_in_korzina);
    $("#korzina_content").on("click", ".delete_item", delete_from_korzina);

    $(".main_content .content_items").on("mouseover",".item",function (event) {
        event.stopPropagation();
        $(this).css({"box-shadow": "0 10px 50px 0 rgba(30, 30, 30, 0.2)","border":"1px solid #d4dbe0","z-index":"10"});
        $(this).find(".hide_element").css("visibility","visible");
    });
    $(".main_content .content_items").on("mouseout",".item",function (event) {
        event.stopPropagation();
        $(this).css({"box-shadow": "none","border":"","z-index":"1"});
        $(this).find(".hide_element").css("visibility","hidden");
    });
    $(".block_items").on("click", ".more_information", show_more_info);
    $(".block_items").on("click", "#more_information_close", hide_more_info);
    $(".block_items").on("click", "#next_buy", next_buy);
    $(".block_items").on("click", "#next_order", function () {
       document.location.href="/order";
    });
    $(".block_items #other_image").on("click", ".other_image_item", change_image);
});