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
    var next_step_payment = function (event) {
        event.preventDefault();
        $("#delivery_order").hide();
        $("#payment_method").fadeIn();
        $("#delivery_order_btn").removeClass("active_step");
        $("#payment_method_btn").addClass("active_step");
    };

    var change_method_delivery = function (event) {
        event.stopPropagation();
        $(this).closest("ul").find("li.active_el").toggleClass("active_el inactive_el");
        $(this).toggleClass("active_el inactive_el");
        if($(this).attr("id")=="independent_export"){
            $("#independent_export_el").fadeIn();
            $("#delivery_export_el, #delivery_order .hide_field").hide();
        }
        if($(this).attr("id")=="delivery_export"){
            $("#delivery_export_el,#delivery_order .hide_field").fadeIn();
            $("#independent_export_el").hide();
        }
    };

    var checkout = function () {
        $(this).hide();
        $("#build_order").hide();
        $("#delivery_order").fadeIn();
        $("#order_elements").removeClass("active_step");
        $("#delivery_order_btn").addClass("active_step");
    };

    var change_number = function () {
        var summa;
        var el = $(this).closest("li");
        var id = el.attr("id");
        var number = el.find(".number_item select").val();

        change_number_in_mini_korz(id, number);
        $.each(korzina, function(index, value) {
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
        if(korzina.length==0) return;
        $("#checkout").show();
        $("#korzina_blank").hide();
        $.each(korzina, function (index, value) {
            var select = '';
            for(var i=1;i<=10;i++){
                if(i==value['number'])
                    select+="<option selected>"+i+"</option>";
                else select+="<option>"+i+"</option>";
            }
            var image_val = value['image'].replace("64_on_64", "100_on_100");
            var dop_field = "";
            if(value['size']) dop_field = "<br><span style='color: #aaa; font-size: 12px'>"+value['size']+" размер</span>";
            var el = "<li id='"+value['id']+"'>" +
                "<div class='row item_in_order'>" +
                    "<div class='col-md-6 block_name_item'>" +
                        "<div class='img_item'>" +
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
        event.stopPropagation();
        var csrftoken = $.cookie('csrftoken');
        var data = {};
        var el = $(".active_el:eq(0)");
        var form_el = $("#delivery_order form");
        data['name'] = form_el.find("#id_name").val();
        data['surname'] = form_el.find("#id_surname").val();
        data['fon_number'] = form_el.find("#id_fon_number").val();
        data['city'] = "Нижний Новгород";
        data['adress'] = "Самовывоз";
        if(el.attr("id")=="delivery_export"){
            data['city'] = form_el.find("#id_city").val();
            data['adress'] = form_el.find("#id_adress").val();
        }


        data['items'] = korzina;
        var data_json = JSON.stringify(data);

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
        /*$.get("/checkout/",{"order":data_json}).done(function (data_json) {
            data = $.parseJSON(data_json);
            $("#order_steps").hide();
            $("#success_buy span").text(data['number_order']);
            $("#summa_k_oplate_right").hide();
            $("#payment_method").hide();
            $("#success_buy").show();
        });*/
        $.post("/checkout/",{"order":data_json})
            .done(function (data_json) {
                var data_responce= $.parseJSON(data_json);
                $("#order_steps").hide();
                $("#number_order").text(data_responce['number_order']);
                $("#summa_k_oplate_right").hide();
                $("#payment_method").hide();
                $("#name_buyer").text(data['name']);
                $("#success_buy").show();
                clear_korzina();
            })
            .fail(function (data) {
                console.log(data);
            });
    };

    var delete_order_item = function () {
        var el = $(this).closest("li");
        var id = el.attr("id");
        delete_order_item_el(el);
        delete_from_korzina(undefined,id);
        set_k_oplate(count_summa());
    };
    //main
    fill_korzina_full();
    $(".next_step_payment").on("click", next_step_payment);
    $("#delivery_order").on("click",".inactive_el",change_method_delivery);
    $("#checkout").on("click", checkout);
    $(".order_delete_item").on("click", delete_order_item);
    $(".number_item").on("change", change_number);
    $("#order_ready").on("click", order_ready);
});