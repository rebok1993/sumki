function sameOrigin(url) {
    // test that a given url is a same-origin URL
    // url could be relative or scheme relative or absolute
    var host = document.location.host; // host + port
    var protocol = document.location.protocol;
    var sr_origin = '//' + host;
    var origin = protocol + sr_origin;
    // Allow absolute or scheme relative URLs to same origin
    return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
        (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
        // or any other URL that isn't scheme relative or absolute i.e relative.
        !(/^(\/\/|http:|https:).*/.test(url));
}

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function delete_order_item_el(el) {
    el.remove();
}

function set_k_oplate(summa) {
    $("#summa_k_oplate").text(format_price(summa)+" руб.");
}

$(function () {
    var order = {
        'name':'',
        'surname':'',
        'fon_number':'',
        'delivery':false,
        'delivery_type':'Самовывоз',
        'city':'Нижний Новгород',
        'adress':'Самовывоз',
        'amount':0,
        'items':[]
    };
    var delivery_export = $("#delivery_export");//элемент способ доставки - доставка
    var delivery_order = $("#delivery_order");//вкладка выбора способа доставки
    var payment_method = $("#payment_method");//вкладка оплаты
    var delivery_price = 0;
    var delivery_price_default = 300;
    var price_order_discount = 5000;

    //третий шаг (проверка введённых покупателем данных)
    var next_step_payment = function (event) {
        order.delivery = false;
        var name = $("#id_name");
        var surname = $("#id_surname");
        var phone = $("#id_fon_number");
        if((name.val().length < 2) || (surname.val().length < 2) || (phone.val().length != 17)){
            if(name.val().length < 2) $("#id_name").parent(".form-group").addClass("has-error");
            if(surname.val().length < 2) $("#id_surname").parent(".form-group").addClass("has-error");
            if(phone.val().length != 17) $("#id_fon_number").parent(".form-group").addClass("has-error");
            return;
        }
        if(korzina["delivery"]){
            var city = $("#id_city");
            order.city = $("#id_city option:selected").text();
            var type_delivery = $('.active_delivery_way');
            if(city.val()=='first_val'){
                    city.parent(".form-group").addClass("has-error");
                    return;
            }
            //тип доставки
            if(type_delivery.data('typeWay') == 'courier'){
                var adress = $("#id_adress");
                if(adress.val().length < 2){
                    adress.parent(".form-group").addClass("has-error");
                    return;
                }
                order.adress = order.city+', '+adress.val();
                order.delivery_type = 'Курьер';
            }
            else if(type_delivery.data('typeWay') == 'pvz'){
                order.adress = type_delivery.text();
                order.delivery_type = 'Пункт самовывоза'
            }
            else{
                type_delivery.parent(".form-group").addClass("has-error");
                return;
            }
            order.delivery = true;
        }
        order.name =name.val();
        order.surname = surname.val();
        order.fon_number = phone.val();
        order.fon_number = order.fon_number.replace(/[-() ]+/g,'');
        order.amount = korzina.summa;
        if(order.delivery && order.amount < price_order_discount) order.amount += delivery_price;

        //формируем итоговый лист заказа
        $("#order_final_items p").remove();
        $.each(korzina.products, function (index, value) {
            $("#order_final_items").append("<span>"+value.name+" "+value.number+" шт.</span><br>");
        });

        $("#order_final_summ span").text(order.amount+" руб.");
        $("#order_final_fio span").text(order.surname+" "+order.name);

        if(!order.delivery){
            $("#order_final_dil span").text("Самовывоз");
        }else{
            $("#order_final_dil span").text(order.adress+' ('+order.delivery_type+')');
        }

        $("#order_final_fon span").text(phone.val());


        var items = [];
        if(order.delivery){
            items.push({
                 "quantity": 1,
                 "price": {
                    "amount": delivery_price
                 },
                 "tax": 1,
                 "text": 'Доставка товара по адресу: '+order.adress
             });
        }
        $.each(korzina.products, function (index, value) {
             items.push({
                 "quantity": value.number,
                 "price": {
                    "amount": value.price
                 },
                 "tax": 1,
                 "text": value.name
             });
        });
        var ym_merchant_receipt = {
                                "customerContact": order.fon_number,
                                "taxSystem": 2,
                                "items": items
                            };

        //отправляем данные формы
        fon_2.show();
        var csrftoken = $.cookie('csrftoken');
        order.items = korzina['products'];
        var data_json = JSON.stringify(order);
        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
                    // Send the token to same-origin, relative URLs only.
                    // Send the token only if the method warrants CSRF protection
                    // Using the CSRFToken value acquired earlier
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });

        $.post("/order/ready/",{"order":data_json}).done(function (data_json) {
                var data_responce= $.parseJSON(data_json);
                payment_method.append(data_responce['payform']);
                $("#ym_merchant_receipt").val(JSON.stringify(ym_merchant_receipt));
                $("#summa_k_oplate_right").hide();
                fon_2.hide();
        });

        event.preventDefault();
        delivery_order.hide();
        payment_method.fadeIn();
        $("#delivery_order_btn").removeClass("active_step");
        $("#payment_method_btn").addClass("active_step");
    };

    //измение способа доставки
    var change_method_delivery = function (event) {
        event.stopPropagation();
        korzina["delivery"] = ($(this).val()=="delivery_export")?true:false;
        save_korzina();

        //если выбран самовывоз
        if(!korzina["delivery"]){
            $("#independent_export_el").fadeIn();
            $("#delivery_export_el, #delivery_order .hide_field").hide();
            $("#price_for_delivery, #summa_k_oplate_with_delivery, #summa_k_oplate2").hide();
            $("#summa_k_oplate").fadeIn();
        }
        //если выбрана доставка
        if(korzina["delivery"]){
            if (korzina.summa < price_order_discount) delivery_price = delivery_price_default;
            $("#delivery_export_el,#delivery_order .hide_field").fadeIn();
            $("#independent_export_el").hide();
            $("#price_for_delivery span").text(delivery_price);
            $("#price_for_delivery, #summa_k_oplate_with_delivery, #summa_k_oplate2").fadeIn();
            $("#summa_k_oplate").hide();
            $("#summa_k_oplate2").text(format_price(korzina['summa'])+" руб.  (покупка)");
            $("#summa_k_oplate_with_delivery span").text(format_price((korzina['summa']+delivery_price))+" руб.");
        }
    };

    //появление второй вкладки
    var checkout = function () {
        if(typeof korzina["delivery"] != 'undefined'){
            if(korzina["delivery"]){
                if (korzina.summa < price_order_discount) delivery_price = delivery_price_default;
                $("#delivery_export_el,#delivery_order .hide_field").fadeIn();
                $("#independent_export_el").hide();
                delivery_export.attr("checked", true);
                $("#price_for_delivery, #summa_k_oplate_with_delivery, #summa_k_oplate2").fadeIn();
                $("#price_for_delivery span").text(delivery_price);
                $("#summa_k_oplate").hide();
                $("#summa_k_oplate2").text(format_price(korzina['summa'])+" руб. (покупка)");
                $("#summa_k_oplate_with_delivery span").text(format_price((korzina['summa']+delivery_price))+" руб.");
            }
            else{
                $("#summa_k_oplate").fadeIn();
                $("#price_for_delivery, #summa_k_oplate_with_delivery, #summa_k_oplate2").hide();
            }
        }
        $(this).hide();
        $("#build_order").hide();
        delivery_order.fadeIn();
        $("#order_elements").removeClass("active_step");
        $("#delivery_order_btn").addClass("active_step");
    };

    //изменить количество  товара
    var change_number = function () {
        var summa;
        var el = $(this).closest("li");
        var id = el.attr("id");
        var number = el.find(".number_item select").val();

        change_number_in_mini_korz(id, number);
        $.each(korzina['products'], function(index, value) {
            if(value['id']==parseInt(id)){
                el.find(".order_item_summa").text(format_price(value['price']*number)+" руб.");
                value['number'] = number;
            }
        });
        summa = count_summa();
        set_summa_korzina(summa);
        set_k_oplate(summa);
        save_korzina();
    };
    //заполняем страницу корзины
    var fill_korzina_full = function () {
        if(korzina['products'].length==0) return;
        $("#checkout").show();
        $("#korzina_blank").hide();
        $.each(korzina['products'], function (index, value) {
            var select = '';
            for(var i=1;i<=10;i++){
                if(i==value['number'])
                    select+="<option selected>"+i+"</option>";
                else select+="<option>"+i+"</option>";
            }
            var image_val = value['image'].replace("64_on_64", "100_on_100");
            var dop_field = "";
            if(value['size']) dop_field = "<br><span style='color: #aaa; font-size: 12px'>"+value['size']+" размер</span>";
            var el = "<li id='"+value['id']+"' data-item-category='"+value['category']+"' data-item-id='"+value['id']+"'>" +
                "<div class='row item_in_order'>" +
                    "<div class='col-md-6 block_name_item'>" +
                        "<div class='img_item item_in_mini_korz' data-item-category='"+value['category']+"' data-item-id='"+value['id']+"'>" +
                        "<img src='"+image_val+"' width='100px' height='100px'>" +
                        "</div>" +
                        "<div class='name_item'>"+value['name']+dop_field+"</div>" +
                    "</div>" +
                    "<div class='col-md-2' style='font-weight: bold'><span>"+format_price(value['price'])+" руб.</span></div>" +
                    "<div class='col-md-1 block_number_item'>" +
                    "<form class='number_item'>" +
                        "<select class='form-control' style='width: auto !important;'>"+select+"</select>" +
                    "</form>" +
                    "</div>" +
                    "<div class='col-md-2'><span class='order_item_summa'  style='font-weight: bold'>"+format_price(value['price']*value['number'])+" руб.</span></div>" +
                    "<div class='col-md-1'><span class='order_delete_item'>x</span></div>" +
                "</div>" +
                "</li>";
            $("#order_korzina").prepend(el);
            $("#summa_k_oplate").text(format_price(count_summa())+" руб.");
        });
    };
    //отправляем заказ
    var order_ready = function (event) {
        console.log('1');
        clear_korzina();
        $("form[name='ShopForm']").submit();
        event.stopPropagation();
        console.log('2');
    };


    var delete_order_item = function () {
        var el = $(this).closest("li");
        var id = el.attr("id");
        delete_order_item_el(el);
        delete_from_korzina(undefined,id);
        set_k_oplate(count_summa());
    };
    //main

    //изменили тип доставки
    var delivery_way = function () {
        $('.delivery_way.active_delivery_way').removeClass('active_delivery_way');
        $(this).addClass('active_delivery_way');
        if($(this).attr('id')=='delivery_way_courier')
            $('.hide_field2').show();
        else $('.hide_field2').hide();
    };

    var change_adress = function () {
        $("#delivery_way_block").show();
        $('.hide_field2').hide();
        var option_sel = $("#id_city option:selected");
        var hr_line = $('#delivery_way_block_inner hr');
        var courier = option_sel.data('courierDelivery');
        var pickup_point = option_sel.data('pickupPoint');
        var delivery_way_pvz = $("#delivery_way_pvz");
        var delivery_way_courier = $('#delivery_way_courier');
        $('.delivery_way.active_delivery_way').removeClass('active_delivery_way');

        courier && pickup_point ? hr_line.show() : hr_line.hide();
        courier ? delivery_way_courier.show() : delivery_way_courier.hide();

        if(pickup_point){
            $("#delivery_way_pvz .delivery_way_other").remove();
            var option_val = option_sel.val();
            $.get("/getpoint/"+option_val).done(function (data_json) {
                var data = $.parseJSON(data_json);
                delivery_way_pvz.show();
                delivery_way_pvz.find('.delivery_way').text(data[0]['Address']);
                if(data.length > 1){
                    var clone_el = delivery_way_pvz.find('.delivery_way').clone();
                    clone_el.addClass('delivery_way_other');
                    $.each(data, function (index, value) {
                        delivery_way_pvz.append(clone_el.text(value['Address']));
                    });
                }
            })
        }
        else delivery_way_pvz.hide();
    };

    fill_korzina_full();
    $("#id_city").on("change", change_adress);
    $(".next_step_payment").on("click", next_step_payment);
    delivery_order.on("click",".delivery_method",change_method_delivery);
    $("#checkout").on("click", checkout);
    $(".order_delete_item").on("click", delete_order_item);
    $(".number_item").on("change", change_number);
    $("#order_ready").on("click", order_ready);
    $("#delivery_way_block").on('click', '.delivery_way', delivery_way);
});