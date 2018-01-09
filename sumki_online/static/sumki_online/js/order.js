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
    var delivery_way_pvz = $("#delivery_way_pvz");
    var delivery_way_courier = $('#delivery_way_courier');
    var delivery_way_block = $("#delivery_way_block");//выбор пути доставки
    var elem_city = $('#id_city');
    var delivery_price = 0;
    var delivery_price_default = 0;
    var price_order_discount = 0;
    var step2_opt1 = $('.step2_opt1');
    var step2_opt2 = $('.step2_opt2');
    var step2_opt3 = $('.step2_opt3');
    var city,city_internal = '';
    elem_city.val('');

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
        //если доставка
        if(korzina["delivery"]){
            order.city = city;
            var type_delivery = $('.active_delivery_way');
            if(!city){
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
            else if(type_delivery.data('typeWay') == 'pochta'){
                var adress = $("#id_adress");
                if(adress.val().length < 2){
                    adress.parent(".form-group").addClass("has-error");
                    return;
                }
                order.adress = order.city+', '+adress.val();
                order.delivery_type = 'Почтой России';
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
        //прибавляем плату за доставку
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
            $("#order_final_dil span").text('доставка по адресу: '+order.adress+' ('+order.delivery_type+')');
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
        korzina["delivery"] = ($(this).data('deliveryMethod')=="delivery_export")?true:false;
        save_korzina();

        //если выбран самовывоз
        if(!korzina["delivery"]){
            step2_opt1.fadeIn();
            step2_opt2.hide();
        }
        //если выбрана доставка
        if(korzina["delivery"]){
            if (korzina.summa < price_order_discount) delivery_price = delivery_price_default;
            step2_opt2.fadeIn();
            step2_opt1.hide();
            /*$("#price_for_delivery span").text(delivery_price);
            */
            $("#summa_k_oplate2").text(format_price(korzina['summa'])+" руб.  (покупка)");

            $("#summa_k_oplate_with_delivery span").text(format_price((korzina['summa']+delivery_price))+" руб.");
        }
    };

    //появление второй вкладки
    var checkout = function () {
        korzina["delivery"] = false;
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
            if(value['size']) dop_field = value['size']+' размер';

            var new_li = $('#copy_element_li').clone();
            new_li
                .attr('id',value['id'])
                .css('display','block');
            new_li.find('.item_in_mini_korz').data({
                    'itemCategory':value['category'],
                    'itemId':value['id']
                });
            new_li.find('img').attr('src',image_val);
            new_li.find('.name_item .name_item_el').html(value['name']);
            new_li.find('.name_item .size_item_el').html(dop_field);
            new_li.find('.price_item_order span').text(format_price(value['price'])+' руб.');
            new_li.find('.number_item select').html(select);
            new_li.find('.order_item_summa').text(format_price(value['price']*value['number'])+' руб.');
            $('#order_korzina').prepend(new_li);
            $("#summa_k_oplate").text(format_price(count_summa())+' руб.');
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

    //удаляем товар из заказа
    var delete_order_item = function () {
        var el = $(this).closest("li");
        var id = el.attr("id");
        delete_order_item_el(el);
        delete_from_korzina(undefined,id);
        set_k_oplate(count_summa());
    };

    //изменили тип доставки
    var delivery_way = function () {
        $('.delivery_way.active_delivery_way').removeClass('active_delivery_way');
        $(this).addClass('active_delivery_way');
        var type_del_way = $(this).data('typeWay');
        if(type_del_way=='courier' || type_del_way=='pochta')
            step2_opt3.show();
        else step2_opt3.hide();
    };

    //при смене в поле адрес
    var change_adress = function (city) {
        step2_opt3.hide();
        var courier = citys_dost[city]['CourierDelivery'];
        var pickup_point = citys_dost[city]['PickupPoint'];
        $('.delivery_way.active_delivery_way').removeClass('active_delivery_way');

        courier ? delivery_way_courier.show() : delivery_way_courier.hide();

        if(pickup_point){
            $("#delivery_way_pvz .delivery_way_other").remove();
            $.get("/getpoint/"+citys_dost[city]['Code']).done(function (data_json) {
                var data = $.parseJSON(data_json);
                delivery_way_pvz.find('.delivery_way').text(data[0]['Address']);
                if(data.length > 1){
                    var clone_el = delivery_way_pvz.find('.delivery_way').clone();
                    clone_el.addClass('delivery_way_other');
                    $.each(data, function (index, value) {
                        delivery_way_pvz.append(clone_el.text(value['Address']));
                    });
                }
                delivery_way_pvz.show();
            })
        }
        else delivery_way_pvz.hide();
        delivery_way_block.show();
    };

    var placesAutocomplete = places({
        container: document.querySelector('#id_city'),
        language: 'ru',
        countries: ['ru'],
        type: 'city',
        aroundLatLngViaIP:false,
        debug:true
      });
    var selected_city = false;
    placesAutocomplete.on('change', function resultSelected(e) {
        selected_city = true;
        city = e.suggestion.name;
        city_internal = city.toLowerCase().replace(/\s/g, '');
        if(city_internal in citys_dost){
            change_adress(city_internal);
        }
        else{
            delivery_way_pvz.hide();
            delivery_way_courier.hide();
            delivery_way_block.show();
        }
    });
    placesAutocomplete.on('suggestions', function resultSelected(e) {
        selected_city = false;
        if(e.suggestions.length!=0){
            city = e.suggestions[0].name;
        }
        else{
            city = '';
            city_internal = '';
        }
    });
    elem_city.on('blur', function () {
        if(!selected_city){
            elem_city.val(city);
            city_internal = city.toLowerCase().replace(/\s/g, '');
            if(city){
                if(city_internal in citys_dost){
                    change_adress(city_internal);
                }
                else{
                    delivery_way_pvz.hide();
                    delivery_way_courier.hide();
                    delivery_way_block.show();
                }
            }
            else{
                delivery_way_block.hide();
            }
        }
    });
    fill_korzina_full();

    //смена способа доставки заказа
    delivery_order.on("click",".delivery_method span",change_method_delivery);

    //1-й этап оформления заказа
    $("#checkout").on("click", checkout);

    //2-й этап оформления заказа
    $(".next_step_payment").on("click", next_step_payment);

    //3-й этап оформления заказа (оплата)
    $("#order_ready").on("click", order_ready);

    //удалить товар из заказа
    $(".order_delete_item").on("click", delete_order_item);

    //изменяем количество товара в заказе
    $(".number_item").on("change", change_number);



    delivery_way_block.on('click', '.delivery_way', delivery_way);

    //смена способа доставки (доставка или самовывоз)
    $('.delivery_method span').on('click', function () {
        var el = $(this);
        if(el.hasClass('delivery_method_out'))
            $('.delivery_method .delivery_method_in').removeClass().addClass('delivery_method_out');
            el.removeClass().addClass('delivery_method_in');
    });
});