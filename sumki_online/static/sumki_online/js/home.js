$(function () {
    var width_ul = 100;
    var width_screen = $(window).width();
    var index_slide = 0;
    var number_slide = 0;
    var id;

    var number_slide_count = function () {
        $("#scrolling_elements li").each(function () {
            number_slide++;
        });
    };

    var stop_time = function (event) {
        event.stopPropagation();
        clearTimeout(id);
    };

    var run_time = function (event) {
        event.stopPropagation();
        id = setInterval(select_slide_auto, 7000);
    };

    var set_width_el = function () {
        width_ul = 100;
        width_screen = $(window).width();
        $("#scrolling_elements li").each(function () {
            $(this).css("width",width_screen);
            width_ul += width_screen;
        });
        $("#scrolling_elements ul").eq(0).css("width",width_ul);
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
        $("#scrolling_elements ul").css("left", "-"+width_screen*index_slide);
    };

    var select_slide = function (event) {
        clearTimeout(id);
        index_slide = $(this).data("index")-1;
        event.stopPropagation();
        $(this).closest("#scroll_main_offer").find(".selected_slide").removeClass("selected_slide");
        $(this).addClass("selected_slide");
        $("#scrolling_elements ul").css("left", "-"+width_screen*index_slide);
    };

    //запускаются при загрузке сайта
    id = setInterval(select_slide_auto, 7000);
    set_width_el();
    number_slide_count();

    $(window).on("resize", set_width_el);
    $(".select_slide").on("click", select_slide);
    $("#scrolling_elements").on("mouseover", stop_time);
    $("#scrolling_elements").on("mouseout", run_time);
    $("#btn_left").on("click", function () {
        select_slide_auto(-1);
    });
    $("#btn_right").on("click", function () {
        select_slide_auto(1);
    });
});
