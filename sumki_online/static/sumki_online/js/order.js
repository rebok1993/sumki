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
    if(korzina['products'].length==0){
        $("#delivery_order, #build_order").hide();
        $("#korzina_blank").show();
    }
}

function set_k_oplate(summa) {
    $("#total_summ_order").text(format_price(summa)+" руб.");
}

$(function () {
    var order = {
        'name':'',
        'surname':'',
        'fon_number':'',
        'delivery':true,
        'delivery_type':'Доставка',
        'city':'Нижний Новгород',
        'adress':'',
        'amount':0,
        'items':[]
    };
    var delivery_order = $("#delivery_order");//вкладка выбора способа доставки
    var payment_method = $("#payment_method");//вкладка оплаты
    var delivery_way_pvz = $("#delivery_way_pvz");
    var delivery_way_courier = $('#delivery_way_courier');
    var delivery_way_block = $("#delivery_way_block");//выбор пути доставки
    var elem_city = $('#id_city');
    var delivery_price = 0;
    var step2_opt3 = $('.step2_opt3');
    var city,city_internal = '';
    elem_city.val('');

    var check_data = function (name, surname, phone, city, adress) {
        var has_error = false;
        if(name.length<2){
            $("#id_name").parent(".form-group").addClass("has-error");
            $("#id_name").parent(".form-group").find('.help-block').show();
            has_error = true;
        }
        if(surname.length<2){
            $("#id_surname").parent(".form-group").addClass("has-error");
            $("#id_surname").parent(".form-group").find('.help-block').show();
            has_error = true;
        }
        if(phone.length!=17){
            $("#id_fon_number").parent(".form-group").addClass("has-error");
            $("#id_fon_number").parent(".form-group").find('.help-block').show();
            has_error = true;
        }
        console.log(city);
        if (!city){
            console.log('here');
            elem_city.parents(".form-group").addClass("has-error");
            elem_city.parents(".form-group").find('.help-block').show();
            has_error = true;
        }
        if(has_error) return false;
        return true;
    };

    //оформление заказа
    var order_ready = function (event) {
        $('body').scrollTop(0);
        order.delivery = false;
        var name = $("#id_name");
        var surname = $("#id_surname");
        var phone = $("#id_fon_number");


        order.city = city;
        if(!check_data(name.val(), surname.val(), phone.val(), city, 0)) return false;
        var type_delivery = $('.active_delivery_way');

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

        order.name =name.val();
        order.surname = surname.val();
        order.fon_number = phone.val();
        order.fon_number = order.fon_number.replace(/[-() ]+/g,'');
        order.amount = Math.round(korzina.summa*(100-korzina.dop_skidka)/100)+delivery_price;

        //формируем итоговый лист заказа
        $("#order_final_items p").remove();
        $.each(korzina.products, function (index, value) {
            $("#order_final_items").append("<span>"+value.name+" "+value.number+" шт.</span><br>");
        });

        $("#order_final_summ span").text(order.amount+" руб.");
        $("#order_final_fio span").text(order.surname+" "+order.name);
        $("#order_final_dil span").text('доставка по адресу: '+order.adress+' ('+order.delivery_type+')');
        $("#order_final_fon span").text(phone.val());

        //формируем данные для чека
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
        $("#delivery_order, #build_order").hide();
    };

    //изменить количество  товара
    var change_number = function () {
        var summa;
        var el = $(this).closest("li");
        var id = el.attr("id");
        var number_el = el.find(".number_item");
        var number = number_el.data('numberItem');

        if($(this).data('changeNumber')=='reduce' && number > 1) number--;
        else if($(this).data('changeNumber')=='increase') number++;

        number_el.data('numberItem',number).text(number+' шт');
        console.log('sfdsdf');
        change_number_in_mini_korz(id, number);
        $.each(korzina['products'], function(index, value) {
            if(value['id']==parseInt(id)){
                el.find(".order_item_summa").text(format_price(value['price']*number)+" руб.");
                value['number'] = number;
            }
        });
        summa = count_summa();
        set_main_price_korz(summa);
        set_k_oplate(summa);
        save_korzina();
    };

    //заполняем страницу корзины
    var fill_korzina_full = function () {
        if(korzina['products'].length==0) return;
        $("#delivery_order, #build_order").show();
        $("#korzina_blank").hide();
        $.each(korzina['products'], function (index, value) {
            var image_val = value['image'];
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
            new_li.find('.number_item').data('numberItem', value['number']).text(value['number']+' шт');
            new_li.find('.order_item_summa').text(format_price(value['price']*value['number'])+' руб.');
            $('#order_korzina').prepend(new_li);

            if(parseInt(korzina.dop_skidka) != 0){
                var summa_format = Math.round(korzina.summa*(1-korzina.dop_skidka/100));
                $("#total_summ_order").text(format_price(summa_format));
                $('#summ_order_no_skidka').show();
                $('#summ_order_no_skidka').text(format_price(korzina.summa));
            }
            else{
                $("#total_summ_order").text(format_price(korzina.summa));
            }
        });
    };
    //оплата заказа
    var order_pay = function (event) {
        clear_korzina();
        $("form[name='ShopForm']").submit();
        event.stopPropagation();
    };

    //удаляем товар из заказа
    var delete_order_item = function () {
        var el = $(this).closest("li");
        var id = el.attr("id");
        delete_from_korzina(undefined,id);
        delete_order_item_el(el);
        set_main_price_korz(count_summa());
        if(parseInt(korzina.dop_skidka) != 0){
                var summa_format = Math.round(korzina.summa*(1-korzina.dop_skidka/100));
                $("#total_summ_order").text(format_price(summa_format));
                $('#summ_order_no_skidka').show();
                $('#summ_order_no_skidka').text(format_price(korzina.summa));
        }
        else{
            $("#total_summ_order").text(format_price(korzina.summa));
        }
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
        var courier = citys_dost[city]['CourierDelivery'];
        var pickup_point = citys_dost[city]['PickupPoint'];
        $('.delivery_way.active_delivery_way').removeClass('active_delivery_way');
        $('#delivery_pochta_ru').addClass('active_delivery_way');

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
        console.log('1');
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
        if(city){
            elem_city.parents(".form-group").removeClass('has-error');
            elem_city.parents(".form-group").find('.help-block').hide();
        }
        if(!selected_city && city){
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

    //оформление заказа
    $(".next_step_payment").on("click", order_ready);

    //оплата заказа
    $(".order_ready").on("click", order_pay);

    //удалить товар из заказа
    $(".order_delete_item").on("click", delete_order_item);

    //изменяем количество товара в заказе
    $(".btn_change_number_item").on("click", change_number);

    //изменяем способ доставки
    delivery_way_block.on('click', '.delivery_way', delivery_way);

    $("#id_name, #id_surname, #id_fon_number").on('change', function () {
        $(this).parents(".form-group").removeClass('has-error');
        $(this).parents(".form-group").find('.help-block').hide();
    });
});