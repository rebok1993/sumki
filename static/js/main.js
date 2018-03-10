var korzina ={
    'products':[],
    'dop_skidka':0
};
var window_inf;
var main_price_korz;
var fon_2;
var enter_time;
var get_offer_skidka;
var el_time;
var number_image_tovar = 0;
var index_image_current = 0;

//сохранение корзины в куки
function save_korzina() {
    $.cookie('korzina', JSON.stringify(korzina), {path: '/'});
}

//очищаем корзину
function clear_korzina() {
    $.cookie('korzina', '', {path: '/'});
    $('#name_korz').text('Корзина');
}


//склонение слов
function smart_ending(number, forms) {
    var number_el = number;
    var rest = number % 10;
    if(number >= 100)
        number %= 100;
    if(rest==1 && number != 11)
        return number_el+' '+forms[0];
    else if($.inArray(rest,[2,3,4])!=(-1) && ($.inArray(number, [12,13,14])==(-1)))
        return number_el+' '+forms[1];
    else
        return number_el+' '+forms[2];
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

//изменение изображения в окне товара
function change_image(event) {
    event.stopPropagation();
    var new_li;
    var src_img;

    $('.active_other_image').removeClass('active_other_image');

    if (event.data === undefined) {
        src_img = $(this).find('img').attr('src');
        index_image_current = $(this).data("indexIm");
        $("#other_image li[data-index-im = '" + index_image_current + "']").addClass('active_other_image');
    }
    else{
        if(!number_image_tovar){
            number_image_tovar = $('#other_image li').length;
        }
        if(event.data['change'] == 'left') index_image_current-=1;
        if(event.data['change'] == 'right') index_image_current+=1;

        if(index_image_current<0) index_image_current = number_image_tovar-1;
        if(index_image_current>(number_image_tovar-1)) index_image_current = 0;
        new_li = $("#other_image li[data-index-im = '" + index_image_current + "']")
        src_img = new_li.find('img').attr('src');
        new_li.addClass('active_other_image');
    }
    $('#main_image_el img').attr('src', src_img);
    new_image = true;
}

//форматирования цен
function format_price(numeric) {
    return new Intl.NumberFormat('ru').format(numeric);
}

//меняем количество товара в мини корзине
function change_number_in_mini_korz(id, number) {
    $("#item_in_korzina_"+id+" .number_in_korz").text(number+" шт");
}

//установка суммы корзины в меню
function set_main_price_korz(summa) {
    console.log(summa);
    var forms_word = ['товар','товара','товаров'];
    summa = Number(summa) || 0;

    if(korzina.products.length>0){
        $('#name_korz').text(smart_ending(korzina.products.length, forms_word)+' в корзине');
    }
    if(parseInt(korzina.dop_skidka) != 0){
        var summa_format = Math.round(summa*(1-korzina.dop_skidka/100));


    }
    else{

    }
    main_price_korz.text(format_price(summa)+' руб.');
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
    if(korzina['products'].length==0){
        clear_korzina();
        set_main_price_korz(0);
    }
    else set_main_price_korz(Number(korzina['summa']));

}

//учитываем количество просмотров товара в базе
function add_number_views(id_elem) {
    $.get("/addNumberViews/"+id_elem+"/").done(function (data) {}).fail(function (data) {});
}

//события после загрузки изображений

$(function () {
    var time_id = 0;
    var json;
    var timer_id;
    var fon;

    var init_site = function () {
        fon_2 = $("#fon_wait_2");
        fon_2.hide();
        fon = $("#fon_wait");
        window_inf = $("#more_information_window");
        main_price_korz = $('#korzina_desc_inner_price');
        fill_korzina();
        init_apply_skidka();
    };

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

        korzina_el = $("#korzina_content ul");
        $.each(korzina['products'], function (index, value) {
            var tovar = item(value);
            korzina_el.prepend(tovar);
        });
        set_main_price_korz(korzina['summa']);
    };

    //функция добавления нового товара в корзину
    var add_in_korzina = function () {
        var id,name,price,image,element,number;
        //меняем значки
        var id_elem;
        var korzina_elem = {};
        var size;
        var new_tovar = true;

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
        //устанавливаем сумму в мини корзине
        set_main_price_korz(count_summa());
        hide_more_info(undefined,true);
        $("#add_or_next_window").fadeIn();
        add_number_views(id_elem);
        save_korzina();
    };

    //показываем окно больше информации о товаре
    var show_more_info = function (event) {
        event.stopPropagation();
        var item, id, category;
        var obj = {};
        //показываем серый фон
        $('body').addClass('stop-scrolling');
        fon_2.show();

        if(event.data === undefined){
            item = $(this).closest(".item");
            id = item.attr("id");
            category = item.data("itemCategory");
        }
        else{
            id = $(this).data("itemId");
            category = $(this).data("itemCategory");
        }

        if(typeof all_parametr == 'function'){
            obj = all_parametr();
        }
        obj.item = id;
        $.get("/catalog/"+category+"/", obj).done(function (data_json) {
            fon_2.hide();
            var data = $.parseJSON(data_json);
            more_info_get(data);
        }).fail(function (data) {
            console.log('fail');
        });
    };

    /*//события после загрузки изображений
    var img_loaded = function () {
        console.log('Загрузилось');
        $('.wait_load_image').hide();
        $(this).parent().addClass('loaded');
        flag1=true;
    };*/

    var more_info_get = function (data) {
        flag1 = false;
        $('.wait_load_image').show();
        fon.show();
        if((window.location.pathname+window.location.search) != data['url_path']){
            window.history.pushState(null, '', data['url_path']);
        }
        fon.append(data['more_info_win']);
        fon.find('img').on('load', img_loaded);
        update_el();

        number_image_tovar = $('#other_image li').length; //обновляем количество изображений товара
        index_image_current = 0;
    };

    //скрываем окно больше информации о товаре
    var hide_more_info = function (event, added_item, back_step) {
        $("#more_information_window").remove();
        if(added_item === undefined){
            fon.hide();
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
        fon.hide();
        $("#add_or_next_window").remove();
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

    //действие при наведение на товар
    var hover_item = function (event) {
        event.stopPropagation();
        var img_el = $(this).find('.wrapper_image img');
        var src_el = img_el.attr('src');
        var new_img = new Image();

        if(event.data.hov){
            $(this).css({"border":"1px solid #d4dbe0","z-index":"10"});
            src_el = src_el.replace('.jpg','');

            new_img.addEventListener('load', function () {
                img_el.attr('src', new_img.src);
                img_el.data('itemimgChange','1');
                /*img_el.animate({opacity:0.0},200);
                img_el.animate({opacity:1.0},100);*/
            });
            new_img.src = src_el+'v3.jpg';
            /*img_el.attr('src', new_src);*/
            $(this).find(".hide_element").css("visibility","visible");
        }
        else{
            if(img_el.data('itemimgChange') == '1'){
                src_el = src_el.replace('v3.jpg','');
                var new_src = src_el+'.jpg';
                img_el.attr('src', new_src);
                img_el.data('imgChange','0');
            }
            $(this).css({"border":"","z-index":"1"});
            $(this).find(".hide_element").css("visibility","hidden");
        }
    };

    //время прошедшее с прихода покупателя на сайт
    var elapsed_time = function() {
        if(!enter_time){
            enter_time = $.cookie('time_enter') || false;
            get_offer_skidka = $.cookie('get_offer_skidka') || false;
        }
        if(!enter_time || get_offer_skidka){
            clearTimeout(el_time);
            return false;
        }
        var time = new Date();
        var elapsed = time.getTime()/1000 - enter_time;
        var hour = Math.floor(elapsed/(60*24));
        var minute = Math.floor(elapsed/60) - 60*hour;
        var sec = Math.floor(elapsed) - minute*60;

        if(minute>1){
            if((fon.css('display') == 'none') && (fon_2.css('display') == 'none')){
                $('body').addClass('stop-scrolling');
                $('#special_skidka, #fon_wait').show();
                $.cookie('get_offer_skidka', true, {path: '/'});
                clearTimeout(el_time);
                return false;
            }
        }
    };

    //закрытие окна предложения допскидки
    var dop_skidka_close = function () {
        $('#special_skidka,#fon_wait').hide();
        $('body').removeClass('stop-scrolling');
    };

    //включение таймера на скидку
    var timer_skidka = function () {
        this.time = new Date();
        this.timer_current = this.time.getTime()/1000;
        if(this.start_timer==undefined){
            this.start_timer = true;
            this.need_time = 20;
            this.remain_time = 0;
            if($.cookie('timer_end') == undefined)
                this.timer_end = this.timer_current+this.need_time*60;
            else{
                this.timer_end = parseInt($.cookie('timer_end')) || -1;
            }
            this.minute = 0;
            this.sec = 0;
            this.end_skidka_minute = $('#end_skidka_minute');
            this.end_skidka_sec = $('#end_skidka_sec');
            this.timer_block = $('#time_end_skidka');
            this.timer_block.show();
        }

        this.remain_time = this.timer_end - this.timer_current;
        if(this.remain_time<0){
            clearTimeout(timer_id);
            this.timer_block.hide();
            $.removeCookie('timer_end', {path: '/'});
            korzina.dop_skidka=0;
            save_korzina();
            set_main_price_korz(korzina.summa);
            return;
        }

        this.minute = Math.floor(this.remain_time/60);
        this.sec = Math.floor(this.remain_time) - this.minute*60;

        if(this.minute < 10)
            this.end_skidka_minute.text('0'+this.minute);
        else this.end_skidka_minute.text(this.minute);

        if(this.sec < 10)
            this.end_skidka_sec.text('0'+this.sec);
        else this.end_skidka_sec.text(this.sec);
        $.cookie('timer_end', this.timer_end, {path: '/'});
    };

    var init_apply_skidka = function () {
        /*console.log(korzina);*/
        if(parseInt(korzina.dop_skidka) != 0){
            timer_id = setInterval(timer_skidka,1000);
        }
    };

    //применяем скидку и включаем таймер
    var apply_skidka = function () {
        dop_skidka_close();
        timer_id = setInterval(timer_skidka,1000);

        korzina.dop_skidka = 10;
        save_korzina();
        set_main_price_korz(korzina['summa']);
    };

    //main
    init_site();

    $(window).on("beforeunload", function () {
        fon_2.show();
    });

    //действия при наведении на товар
    $('.main_content .content_items')
        .on('mouseenter','.item',{hov:true},hover_item)
        .on("mouseleave",".item",{hov:false},hover_item);

    $(".block_items").on("click", ".more_information", show_more_info);

    $("body")
        .on("click", "#more_information_close", hide_more_info)
        .on('click', '#special_skidka button', apply_skidka)
        .on("click", "#next_buy", next_buy)
        .on("click", "#next_order", function () {document.location.href="/order";})
        .on("click", ".other_image_item", change_image) //смена фотографии в доп. окне
        .on('click', '.add_in_korzina', add_in_korzina) //добавление товара в корзину
        .on('click', '.item_in_mini_korz',{item_mini:true}, show_more_info) //показываем карточка товара при клике из миини корзины
        .on('click', '#btn_left', {change:'left'},change_image)
        .on('click', '#btn_right', {change:'right'},change_image);

    $('#but_list_menu_mob').on('click', function () {
        $('body').addClass('stop-scrolling');
        $('.wrapper .left_side_bar_menu').addClass('active_left_side_bar');
        $('.fon_wait_5').show();
    });
    $('.fon_wait_5').on('click', function () {
        $('body').removeClass('stop-scrolling');
        $('.wrapper .left_side_bar_menu').removeClass('active_left_side_bar');
        $(this).hide();
    });
    //для активации кнопок вперёд и назад
    $(window).on('popstate', step_back_or_forward);

    $('#special_skidka_close').on('click', dop_skidka_close);
    setTimeout(function () {
        el_time = setInterval(elapsed_time, 1000);
    }, 5000);
});