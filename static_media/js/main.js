var korzina =[];
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
    $.each(korzina, function(index, value) {
            summa = summa+parseInt(value['price'])*parseInt(value['number']);
        });
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
    $.each(korzina, function (index, value) {
        if(value['id'] == id_item) {
            korzina.splice(index, 1);
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
    if(korzina.length==0) show_result_korzina(false);
}

$(function () {
    var time_id = 0;
    var json;

    //елемент в мини корзине
    var item = function (href,korzina_elem) {
        var dop_field = '';
        if(korzina_elem['size'])
            dop_field = "<br><span style='color: #aaa; font-size: 12px'>"+korzina_elem['size']+" размер</span>";
        return "<li id='item_in_korzina_"+korzina_elem['id']+"' class='item_in_mini_korz'>" +
                     "<a href='"+href+"' class='item_in_korzina'>" +
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
        if(!json)
            json = '[]';
        korzina = $.parseJSON(json);
        if(korzina.length==0){
            return false;
        }
        //показываем корзину
        show_result_korzina(true);

        korzina_el = $("#korzina_content ul");
        $.each(korzina, function (index, value) {
            var elem = $("#"+value['id']);
            var a = elem.find("a").eq(0).attr("href");

            var tovar = item(a,value);
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
        $("#korzina_block").css("background", "#b44444");
        $("#korzina_block").children("#korzina_content").slideDown();
    };
    //функция скрытия корзины
    var hide_korzina = function (event) {
        if(event){
            event.stopPropagation();
        }
        time_id = setTimeout(function () {
            $("#korzina_block").css("background", "transparent");
            $("#korzina_block").find(".korzina_active").toggleClass("korzina_inactive korzina_active");
            $("#korzina_block").children("#korzina_content").slideUp();
        },500);
    };
    //функция добавления нового товара в корзину
    var add_in_korzina = function () {
        var par,id,name,price,image,element,number;
        //меняем значки
        var id_elem;
        var korzina_elem = {};
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

        var size = $("#more_information_sizes select").val();
        if(size){
            korzina_elem['size'] = size;
        }
        var a = par.find("a").eq(0).attr("href");
        var new_tovar = true;

        $.each(korzina, function (index, elem) {
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
            korzina.push(korzina_elem);
            element = item(a,korzina_elem);
            $("#korzina_content ul").prepend(element);
        }
        save_korzina();
        set_summa_korzina(count_summa());
        $("#more_information_window").hide();
        $("#add_or_next_window").fadeIn();

        var pos = $("#"+korzina_elem['id']+" .image_item").offset();
        var right = window.innerWidth - 150;
        $("#"+korzina_elem['id']+" .image_item")
            .clone()
            .css({'position':'absolute', 'top':pos.top, 'left':pos.left, 'z-index':'100'})
            .appendTo(".main_fon")
            .animate({
                opacity:0.3,
                top:50,
                left:right,
                width:20,
                height:20}, 700, function () {
                    $(this).remove();
                    show_korzina();
            });
        window.scrollTo(0,0);
        setTimeout(hide_korzina, 5000);
    };
    //показываем окно больше информации о товаре
    var show_more_info = function () {
        //показываем мини окно товара
        $("#more_information_window").fadeIn();
        //показываем серый фон
        $("#fon_wait").show();

        //добавляем всю информацию о товаре в мини окно товара
        var item = $(this).closest(".item");
        var src = item.find("img").attr("src");
        src = src.replace("200_on_200", "main");
        var price = item.find(".price_item").text();
        var name = item.find(".name_item").text();
        var window_inf = $("#more_information_window");
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
        window_inf.find("#more_information_image img").attr("src", src);
        window_inf.find("#more_information_price").text(price);
        window_inf.find("#more_information_name").text(name);
        window_inf.data("itemElement", id);
    };
    //скрываем окно больше информации о товаре
    var hide_more_info = function () {
        $("#more_information_window").fadeOut();
        $("#fon_wait").hide();
    };
    //действии при продолжении покупки по добавления в корзину
    var next_buy = function () {
        $("#fon_wait").hide();
        $("#add_or_next_window").fadeOut();
    };

    //main
    fill_korzina();
    $("#korzina_block").on("mouseover", show_korzina);
    $("#korzina_block").on("mouseout", hide_korzina);
    $(".block_items").on("click", ".add_in_korzina", add_in_korzina);
    $("#korzina_content").on("click", ".delete_item", delete_from_korzina);

    $(".main_content .content_items").on("mouseover",".item",function (event) {
        event.stopPropagation();
        $(this).find(".hide_element").css("visibility","visible");
    });
    $(".main_content .content_items").on("mouseout",".item",function (event) {
        event.stopPropagation();
        $(this).find(".hide_element").css("visibility","hidden");
    });
    $(".block_items").on("click", ".more_information", show_more_info);
    $(".block_items").on("click", "#more_information_close", hide_more_info);
    $(".block_items").on("click", "#next_buy", next_buy);
    $(".block_items").on("click", "#next_order", function () {
       document.location.href="/order";
    });
});