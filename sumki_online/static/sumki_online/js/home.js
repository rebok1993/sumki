$(function () {
    var width_screen = 1206;
    var index_slide = 0;
    var id;
    var slider = $("#scrolling_elements");
    var slider_ul = slider.find('ul');
    var slider_li = slider.find('li');
    var number_slide = slider_li.length;

    var stop_time = function (event) {
        event.stopPropagation();
        clearTimeout(id);
    };

    var run_time = function (event) {
        event.stopPropagation();
        id = setInterval(select_slide_auto, 7000);
    };

    var select_slide_auto = function (step) {
        step = step || false;
        if(step==1 || !step){
            index_slide++;
        }
        else{
            index_slide--;
        }
        if(index_slide>(number_slide-1)) index_slide=0;
        if(index_slide<0) index_slide=(number_slide-1);

        $("#scroll_main_offer .selected_slide").removeClass("selected_slide");
        var next_el = $("#scroll_main_offer a:eq("+index_slide+")");
        next_el.addClass("selected_slide");
        slider_ul.css("left", "-"+width_screen*index_slide);
    };

    var select_slide = function (event) {
        clearTimeout(id);
        index_slide = $(this).data("index")-1;
        event.stopPropagation();
        $(this).closest("#scroll_main_offer").find(".selected_slide").removeClass("selected_slide");
        $(this).addClass("selected_slide");
        slider_ul.css("left", "-"+width_screen*index_slide);
    };
    //устанавливаем ширину Ul
    slider_ul.css("width",100+number_slide*1206);

    //запускаются при загрузке сайта
    if(number_slide > 1){
        $("#btn_left, #btn_right, #scroll_main_offer").show();
        id = setInterval(select_slide_auto, 5000);
    }

    //перемещение слайда при клики на кнопки снизу
    $(".select_slide").on("click", select_slide);
    //прекращение пролистывания слайда при наведение
    slider.on("mouseover", stop_time).on("mouseout", run_time);

    //перемещение слайда при клики на кнопки слева или права
    $("#btn_left").on("click", function () {
        select_slide_auto(-1);
    });
    $("#btn_right").on("click", function () {
        select_slide_auto(1);
    });
});
